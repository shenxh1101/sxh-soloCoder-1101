import { useRef, useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { useAreaDrawing } from '@/hooks/useAreaDrawing'
import { useAnnotation } from '@/hooks/useAnnotation'
import type { AnnotationKitProps, CreateAnnotationData, Annotation, AreaRect } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { DiscussionList } from '@/components/DiscussionList/DiscussionList'

interface AreaMarkerProps extends AnnotationKitProps {
  children: ReactNode
  className?: string
}

export function AreaMarker({ children, className, ...props }: AreaMarkerProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const annotation = useAnnotation(props)
  const { permissions, users } = annotation
  const { drawing, handleMouseDown, handleMouseMove, handleMouseUp } = useAreaDrawing({
    containerRef,
    enabled: permissions.canCreate,
  })

  const [activeAnnotationId, setActiveAnnotationId] = useState<string | null>(null)
  const [showDiscussion, setShowDiscussion] = useState(false)
  const [showCreateInput, setShowCreateInput] = useState(false)
  const [pendingRect, setPendingRect] = useState<AreaRect | null>(null)
  const [content, setContent] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')

  const onMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!permissions.canCreate) return
    handleMouseDown(e)
  }

  const onMouseUp = () => {
    const rect = handleMouseUp()
    if (rect) {
      setPendingRect(rect)
      setContent('')
      setAssignee('')
      setDueDate('')
      setShowCreateInput(true)
    }
  }

  const handleCreateSubmit = () => {
    if (!content.trim() || !pendingRect) return
    const data: CreateAnnotationData = {
      content: content.trim(),
      areaRect: pendingRect,
      assignee: assignee || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
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

  const assigneeOptions = [
    { label: '不指定', value: '' },
    ...users.map((u) => ({ label: u.name, value: u.id })),
  ]

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
        <div className="p-4 space-y-3">
          {pendingRect && (
            <div className="px-3 py-2 bg-blue-50 border-l-2 border-blue-300 rounded-r-md text-xs text-blue-700">
              已选择区域 ({(pendingRect.width).toFixed(1)}% &times; {(pendingRect.height).toFixed(1)}%)
            </div>
          )}
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="输入批注内容..."
            autoFocus
            rows={2}
            className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-[13px] text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400 transition-colors duration-150"
          />
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
              <span>处理人</span>
              <Dropdown
                options={assigneeOptions}
                value={assignee}
                placeholder="不指定"
                onChange={setAssignee}
              />
            </div>
            <div className="flex items-center gap-1.5 text-[13px] text-slate-500">
              <span>截止日</span>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="border border-slate-200 rounded-md px-2 py-1.5 text-[13px] focus:outline-none focus:ring-1 focus:ring-blue-400"
              />
            </div>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" size="sm" onClick={handleCreateCancel}>取消</Button>
            <Button variant="primary" size="sm" onClick={handleCreateSubmit} disabled={!content.trim()}>创建批注</Button>
          </div>
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
            onAddComment={async (annotationId, content, parentId, files, mentions) => {
              return await annotation.addComment(annotationId, { content, parentId, attachments: files, mentions })
            }}
            onEditComment={annotation.updateComment}
            onDeleteComment={annotation.deleteComment}
            onToggleStatus={handleToggleStatus}
            onDeleteAnnotation={annotation.deleteAnnotation}
            onEditAnnotation={(id, content) => annotation.updateAnnotation(id, { content })}
            onUpdateAssignee={(id, assignee) => annotation.updateAnnotation(id, { assignee: assignee || undefined })}
            onUpdateDueDate={(id, dueDate) => annotation.updateAnnotation(id, { dueDate: dueDate || undefined })}
          />
        )}
      </Modal>
    </>
  )
}