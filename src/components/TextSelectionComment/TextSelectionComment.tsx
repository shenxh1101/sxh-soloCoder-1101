import { useRef, useState, type ReactNode } from 'react'
import { useTextSelection } from '@/hooks/useTextSelection'
import { useAnnotation } from '@/hooks/useAnnotation'
import type { AnnotationKitProps, CreateAnnotationData } from '@/types'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { MessageSquarePlus } from 'lucide-react'

interface TextSelectionCommentProps extends AnnotationKitProps {
  children: ReactNode
  className?: string
}

export function TextSelectionComment({ children, className, ...props }: TextSelectionCommentProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const { selection, clearSelection } = useTextSelection({ containerRef })
  const annotation = useAnnotation(props)
  const { permissions, users } = annotation
  const [showInput, setShowInput] = useState(false)
  const [pendingRange, setPendingRange] = useState<CreateAnnotationData['textRange'] | null>(null)
  const [content, setContent] = useState('')
  const [assignee, setAssignee] = useState('')
  const [dueDate, setDueDate] = useState('')

  const handleCreateClick = () => {
    if (!selection.range || !permissions.canCreate) return
    setPendingRange(selection.range)
    setContent('')
    setAssignee('')
    setDueDate('')
    setShowInput(true)
  }

  const handleSubmit = () => {
    if (!content.trim() || !pendingRange) return
    const data: CreateAnnotationData = {
      content: content.trim(),
      textRange: pendingRange,
      assignee: assignee || undefined,
      dueDate: dueDate ? new Date(dueDate).toISOString() : undefined,
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

  const assigneeOptions = [
    { label: '不指定', value: '' },
    ...users.map((u) => ({ label: u.name, value: u.id })),
  ]

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
        <div className="p-4 space-y-3">
          {selectedText && (
            <div className="px-3 py-2 bg-blue-50 border-l-2 border-blue-300 rounded-r-md text-xs text-blue-700 italic">
              &ldquo;{selectedText.length > 80 ? selectedText.slice(0, 80) + '...' : selectedText}&rdquo;
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
            <Button variant="ghost" size="sm" onClick={handleCancel}>取消</Button>
            <Button variant="primary" size="sm" onClick={handleSubmit} disabled={!content.trim()}>创建批注</Button>
          </div>
        </div>
      </Modal>
    </div>
  )
}