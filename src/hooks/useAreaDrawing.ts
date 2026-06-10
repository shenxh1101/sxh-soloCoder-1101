import { useState, useCallback, useRef, type MouseEvent as ReactMouseEvent } from 'react'
import type { AreaRect } from '@/types'
import { getRelativePosition } from '@/utils/position'

interface UseAreaDrawingOptions {
  containerRef: React.RefObject<HTMLElement>
  enabled: boolean
}

interface DrawingState {
  isDrawing: boolean
  startPos: { x: number; y: number } | null
  currentRect: AreaRect | null
}

export function useAreaDrawing({ containerRef, enabled }: UseAreaDrawingOptions) {
  const [drawing, setDrawing] = useState<DrawingState>({
    isDrawing: false,
    startPos: null,
    currentRect: null,
  })

  const drawingRef = useRef(drawing)
  drawingRef.current = drawing

  const handleMouseDown = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      if (!enabled) return
      const container = containerRef.current
      if (!container || e.button !== 0) return

      const pos = getRelativePosition(e.clientX, e.clientY, container)
      setDrawing({
        isDrawing: true,
        startPos: pos,
        currentRect: {
          x: pos.x,
          y: pos.y,
          width: 0,
          height: 0,
          relativeTo: 'viewport',
        },
      })
    },
    [enabled, containerRef]
  )

  const handleMouseMove = useCallback(
    (e: ReactMouseEvent<HTMLElement>) => {
      const current = drawingRef.current
      if (!current.isDrawing || !current.startPos) return

      const container = containerRef.current
      if (!container) return

      const pos = getRelativePosition(e.clientX, e.clientY, container)

      setDrawing({
        ...current,
        currentRect: {
          x: Math.min(current.startPos.x, pos.x),
          y: Math.min(current.startPos.y, pos.y),
          width: Math.abs(pos.x - current.startPos.x),
          height: Math.abs(pos.y - current.startPos.y),
          relativeTo: 'viewport',
        },
      })
    },
    [containerRef]
  )

  const handleMouseUp = useCallback((): AreaRect | null => {
    const current = drawingRef.current
    if (!current.isDrawing) return null

    setDrawing({
      isDrawing: false,
      startPos: null,
      currentRect: null,
    })

    if (current.currentRect && current.currentRect.width > 5 && current.currentRect.height > 5) {
      return current.currentRect
    }

    return null
  }, [])

  return {
    drawing,
    handleMouseDown,
    handleMouseMove,
    handleMouseUp,
  }
}