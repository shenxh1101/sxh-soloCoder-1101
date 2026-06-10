import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useAreaDrawing } from '@/hooks/useAreaDrawing'
import { useAnnotation } from '@/hooks/useAnnotation'
import type { AnnotationKitProps, CreateAnnotationData, Annotation, AreaRect } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { CommentInput } from '@/components/DiscussionList/CommentInput'
import { DiscussionList } from '@/components/DiscussionList/DiscussionList'

interface AreaMarkerProps extends AnnotationKitProps {
  children: ReactNode
  className?: string
}

export function AreaMarker({ children, className, ...props }: AreaMarkerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const annotation = useAnnotation(props)
  const { permissions } = annotation
  const { drawing, handleMouseDown, handleMouseMove, handleMouseUp } = useAreaDrawing({
    containerRef,
    enabled: permissions.canCreate,
  })

  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)
  const [showDiscussion, setShowDiscussion] = useState(false)
  const [showCreateInput, setShowCreateInput] = useState(false)
  const [pendingRect, setPendingRect] = useState<AreaRect | null>(null)

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!permissions.canCreate) return
    handleMouseDown(e)
  }

  const onMouseUp = () => {
    const rect = handleMouseUp()
    if (rect) {
      setPendingRect(rect)
      setShowCreateInput(true)
    }
  }

  const handleCreateSubmit = (content: string, _files: File[]) => {
    if (!content.trim() || !pendingRect) return
    const data: CreateAnnotationData = {
      content: content.trim(),
      areaRect: pendingRect,
    }
    annotation.createAnnotation(data)
    setShowCreateInput(false)
    setPendingRect(null)
  }

  const handleCreateCancel = () => {
    setShowCreateInput(false)
    setPendingRect(null)
  }

  const handleMarkerClick = (ann: Annotation) => {
    setActiveAnnotationId(ann.id)
    setShowDiscussion(true)
    annotation.markAsRead(ann.id)
  }

  const handleToggleStatus = (annotationId: string) => {
    const ann = annotation.annotations.find((a) => a.id === annotationId)
    if (!ann) return
    if (ann.status === 'pending') {
      annotation.resolveAnnotation(annotationId)
    } else {
      annotation.reopenAnnotation(annotationId)
    }
  }

  const activeAnn = annotation.annotations.find((a) => a.id === activeAnnotationId)

  return (
    <>
      <div
        ref={containerRef}
        className={cn('relative select-none', className)}
        onMouseDown={onMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={onMouseUp}
      >
        {children}

        {drawing.currentRect && permissions.canCreate && (
          <div
            className="absolute border-2 border-dashed border-blue-400 bg-blue-400/10 pointer-events-none z-30"
            style={{
              left: `${drawing.currentRect.x}%`,
              top: `${drawing.currentRect.y}%`,
              width: `${drawing.currentRect.width}%`,
              height: `${drawing.currentRect.height}%`,
            }}
          />
        )}

        {annotation.annotations
          .filter((a) => a.areaRect && a.targetId === annotation.targetId)
          .map((ann, index) => (
            <div
              key={ann.id}
              data-annotation-id={ann.id}
              className={cn(
                'absolute border-2 rounded cursor-pointer z-20 transition-colors',
                ann.status === 'pending'
                  ? 'border-amber-400 bg-amber-400/10 hover:bg-amber-400/20'
                  : 'border-emerald-400 bg-emerald-400/10 hover:bg-emerald-400/20',
                ann.id === activeAnnotationId && 'ring-2 ring-blue-400'
              )}
              style={{
                left: `${ann.areaRect!.x}%`,
                top: `${ann.areaRect!.y}%`,
                width: `${ann.areaRect!.width}%`,
                height: `${ann.areaRect!.height}%`,
              }}
              onClick={(e) => {
                e.stopPropagation()
                handleMarkerClick(ann)
              }}
            >
              <span
                className={cn(
                  'absolute -top-2.5 -left-2.5 w-5 h-5 rounded-full flex items-center justify-center',
                  'text-[10px] font-bold text-white shadow-sm',
                  ann.status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500'
                )}
              >
                {index + 1}
              </span>
            </div>
          ))}
      </div>

      <Modal
        open={showCreateInput}
        onClose={handleCreateCancel}
        title="添加区域批注"
        width="420px"
      >
        <div className="p-4">
          {pendingRect && (
            <div className="mb-3 px-3 py-2 bg-blue-50 border-l-2 border-blue-300 rounded-r-md text-xs text-blue-700">
              已选择区域 ({(pendingRect.width).toFixed(1)}% &times; {(pendingRect.height).toFixed(1)}%)
            </div>
          )}
          <CommentInput
            onSubmit={handleCreateSubmit}
            onCancel={handleCreateCancel}
            placeholder="输入批注内容..."
            autoFocus
            canUpload={false}
          />
        </div>
      </Modal>

      <Modal
        open={showDiscussion && !!activeAnn}
        onClose={() => setShowDiscussion(false)}
        title="区域批注详情"
        width="480px"
      >
        {activeAnn && (
          <DiscussionList
            annotation={activeAnn}
            users={annotation.users}
            currentUser={annotation.currentUser}
            permissions={annotation.permissions}
            onAddComment={async (annotationId, content, parentId, files) => {
              return await annotation.addComment(annotationId, { content, parentId, attachments: files })
            }}
            onEditComment={annotation.updateComment}
            onDeleteComment={annotation.deleteComment}
            onToggleStatus={handleToggleStatus}
            onDeleteAnnotation={annotation.deleteAnnotation}
            onEditAnnotation={(id, content) =>
              annotation.updateAnnotation(id, { content })
            }
          />
        )}
      </Modal>
    </>
  )
}