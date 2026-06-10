import { useRef, useState, type ReactNode } from 'react'
import { useTextSelection } from '@/hooks/useTextSelection'
import { useAnnotation } from '@/hooks/useAnnotation'
import type { AnnotationKitProps, CreateAnnotationData } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { CommentInput } from '@/components/DiscussionList/CommentInput'
import { MessageSquarePlus } from 'lucide-react'

interface TextSelectionCommentProps extends AnnotationKitProps {
  children: ReactNode
  className?: string
}

export function TextSelectionComment({ children, className, ...props }: TextSelectionCommentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { selection, clearSelection } = useTextSelection({ containerRef })
  const annotation = useAnnotation(props)
  const { permissions } = annotation
  const [showInput, setShowInput] = useState(false)
  const [pendingRange, setPendingRange] = useState<CreateAnnotationData['textRange'] | null>(null)

  const handleCreateClick = () => {
    if (!selection.range || !permissions.canCreate) return
    setPendingRange(selection.range)
    setShowInput(true)
  }

  const handleSubmit = (content: string, _files: File[]) => {
    if (!content.trim() || !pendingRange) return
    const data: CreateAnnotationData = {
      content: content.trim(),
      textRange: pendingRange,
    }
    annotation.createAnnotation(data)
    setShowInput(false)
    setPendingRange(null)
    clearSelection()
  }

  const handleCancel = () => {
    setShowInput(false)
    setPendingRange(null)
    clearSelection()
  }

  const selectedText = selection.text

  return (
    <div ref={containerRef} className={`relative ${className || ''}`}>
      {children}

      {selection.position && selection.text && permissions.canCreate && (
        <div
          className="absolute z-50 -translate-x-1/2"
          style={{
            left: `${selection.position.x}px`,
            top: `${selection.position.y}px`,
          }}
        >
          <button
            onClick={handleCreateClick}
            className="flex items-center gap-1.5 px-2.5 py-1.5 bg-blue-600 text-white text-xs font-medium rounded-md shadow-lg hover:bg-blue-700 active:bg-blue-800 transition-colors whitespace-nowrap"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            添加批注
          </button>
        </div>
      )}

      <Modal
        open={showInput}
        onClose={handleCancel}
        title="添加文本批注"
        width="420px"
      >
        <div className="p-4">
          {selectedText && (
            <div className="mb-3 px-3 py-2 bg-blue-50 border-l-2 border-blue-300 rounded-r-md text-xs text-blue-700 italic">
              &ldquo;{selectedText.length > 80 ? selectedText.slice(0, 80) + '...' : selectedText}&rdquo;
            </div>
          )}
          <CommentInput
            onSubmit={handleSubmit}
            onCancel={handleCancel}
            placeholder="输入批注内容..."
            autoFocus
            canUpload={false}
          />
        </div>
      </Modal>
    </div>
  )
}