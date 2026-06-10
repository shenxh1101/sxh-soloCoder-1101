import { useRef, type ReactNode } from 'react'
import { useTextSelection } from '@/hooks/useTextSelection'
import { useAnnotation } from '@/hooks/useAnnotation'
import type { AnnotationKitProps, CreateAnnotationData } from '@/types'
import { MessageSquarePlus } from 'lucide-react'

interface TextSelectionCommentProps extends AnnotationKitProps {
  children: ReactNode
  className?: string
}

export function TextSelectionComment({ children, className, ...props }: TextSelectionCommentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { selection, clearSelection } = useTextSelection({ containerRef })
  const annotation = useAnnotation(props)

  const handleCreate = () => {
    if (!selection.range) return
    const data: CreateAnnotationData = {
      content: '',
      textRange: selection.range,
    }
    annotation.createAnnotation(data)
    clearSelection()
  }

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      {children}

      {selection.position && selection.text && (
        <div
          className="absolute z-50 -translate-x-1/2"
          style={{
            left: `${selection.position.x}px`,
            top: `${selection.position.y}px`,
          }}
        >
          <button
            onClick={handleCreate}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors whitespace-nowrap"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            添加批注
          </button>
        </div>
      )}
    </div>
  )
}