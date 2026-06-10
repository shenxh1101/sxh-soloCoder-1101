import { useState, useCallback, useEffect, useRef } from 'react'
import type { TextRange } from '@/types'

interface UseTextSelectionOptions {
  containerRef: React.RefObject<HTMLElement>
}

interface SelectionState {
  text: string
  range: TextRange | null
  position: { x: number; y: number } | null
}

export function useTextSelection({ containerRef }: UseTextSelectionOptions) {
  const [selection, setSelection] = useState<SelectionState>({
    text: '',
    range: null,
    position: null,
  })
  const [isSelecting, setIsSelecting] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout>>()

  const handleSelectionChange = useCallback(() => {
    const sel = window.getSelection()
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setSelection({ text: '', range: null, position: null })
      return
    }

    const range = sel.getRangeAt(0)
    const container = containerRef.current
    if (!container) return

    if (!container.contains(range.commonAncestorContainer)) {
      setSelection({ text: '', range: null, position: null })
      return
    }

    const text = sel.toString().trim()
    if (!text) {
      setSelection({ text: '', range: null, position: null })
      return
    }

    const rect = range.getBoundingClientRect()
    const containerRect = container.getBoundingClientRect()

    const textRange: TextRange = {
      startOffset: range.startOffset,
      endOffset: range.endOffset,
      text,
      containerSelector: getElementSelector(range.startContainer as Element, container),
    }

    setSelection({
      text,
      range: textRange,
      position: {
        x: rect.left - containerRect.left + rect.width / 2,
        y: rect.top - containerRect.top - 8,
      },
    })
  }, [containerRef])

  useEffect(() => {
    const container = containerRef.current
    if (!container) return

    const onMouseDown = () => {
      setIsSelecting(true)
      if (timerRef.current) clearTimeout(timerRef.current)
    }

    const onMouseUp = () => {
      timerRef.current = setTimeout(() => {
        handleSelectionChange()
        setIsSelecting(false)
      }, 10)
    }

    document.addEventListener('selectionchange', handleSelectionChange)
    container.addEventListener('mousedown', onMouseDown)
    container.addEventListener('mouseup', onMouseUp)

    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange)
      container.removeEventListener('mousedown', onMouseDown)
      container.removeEventListener('mouseup', onMouseUp)
    }
  }, [containerRef, handleSelectionChange])

  const clearSelection = useCallback(() => {
    setSelection({ text: '', range: null, position: null })
    window.getSelection()?.removeAllRanges()
  }, [])

  return {
    selection,
    isSelecting,
    clearSelection,
  }
}

function getElementSelector(
  node: Element | Node,
  root: HTMLElement
): string {
  if (node.nodeType === Node.TEXT_NODE && node.parentElement) {
    node = node.parentElement
  }
  const el = node as Element
  if (!el || el === root) return ''

  const parts: string[] = []
  let current: Element | null = el

  while (current && current !== root) {
    let selector = current.tagName.toLowerCase()

    if (current.id) {
      selector = `#${current.id}`
      parts.unshift(selector)
      break
    }

    if (current.className && typeof current.className === 'string') {
      const classes = current.className.trim().split(/\s+/).slice(0, 2)
      if (classes.length > 0 && classes[0]) {
        selector += `.${classes[0]}`
      }
    }

    const parent = current.parentElement
    if (parent) {
      const siblings = Array.from(parent.children).filter(
        (c) => c.tagName === current!.tagName
      )
      if (siblings.length > 1) {
        const index = siblings.indexOf(current) + 1
        selector += `:nth-child(${index})`
      }
    }

    parts.unshift(selector)
    current = current.parentElement
  }

  return parts.join(' > ')
}