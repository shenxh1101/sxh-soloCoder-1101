import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useAreaDrawing } from '@/hooks/useAreaDrawing'
import { useAnnotation } from '@/hooks/useAnnotation'
import type { AnnotationKitProps, CreateAnnotationData, Annotation } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { DiscussionList } from '@/components/DiscussionList/DiscussionList'

interface AreaMarkerProps extends AnnotationKitProps {
  children: ReactNode
  enabled?: boolean
  className?: string
}

export function AreaMarker({ children, enabled = true, className, ...props }: AreaMarkerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const annotation = useAnnotation(props)
  const { drawing, handleMouseDown, handleMouseMove, handleMouseUp } = useAreaDrawing({
    containerRef,
    enabled,
  })

  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)
  const [showModal, setShowModal] = useState(false)

  const onMouseUp = () => {
    const rect = handleMouseUp()
    if (rect) {
      const data: CreateAnnotationData = {
        content: '',
        areaRect: rect,
      }
      annotation.createAnnotation(data)
    }
  }

  const handleMarkerClick = (ann: Annotation) => {
    setActiveAnnotationId(ann.id)
    setShowModal(true)
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
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={onMouseUp}
      >
        {children}

        {drawing.currentRect && (
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
        open={showModal && !!activeAnn}
        onClose={() => setShowModal(false)}
        title="区域批注详情"
        width="480px"
      >
        {activeAnn && (
          <DiscussionList
            annotation={activeAnn}
            users={annotation.users}
            currentUser={annotation.currentUser}
            permissions={annotation.permissions}
            onAddComment={(annotationId, content) =>
              annotation.addComment(annotationId, { content })
            }
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