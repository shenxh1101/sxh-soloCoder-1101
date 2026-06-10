import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { Dropdown } from '@/components/ui/Dropdown'
import { CommentInput } from './CommentInput'
import { CommentCard } from './CommentCard'
import type { Annotation, User, Permission, Comment } from '@/types'
import { MessageCircle, ChevronDown, ChevronUp, UserCheck, Calendar, Clock, GitBranch } from 'lucide-react'

interface DiscussionListProps {
  annotation: Annotation
  users: User[]
  currentUser: User
  permissions: Permission
  className?: string
  onAddComment: (annotationId: string, content: string, parentId?: string, files?: File[], mentions?: string[]) => Promise<Comment>
  onEditComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string) => void
  onToggleStatus: (annotationId: string) => void
  onDeleteAnnotation: (annotationId: string) => void
  onEditAnnotation: (annotationId: string, content: string) => void
  onUpdateAssignee: (annotationId: string, assignee: string) => void
  onUpdateDueDate: (annotationId: string, dueDate: string) => void
}

export function DiscussionList({
  annotation,
  users,
  currentUser,
  permissions,
  className,
  onAddComment,
  onEditComment,
  onDeleteComment,
  onToggleStatus,
  onDeleteAnnotation,
  onEditAnnotation,
  onUpdateAssignee,
  onUpdateDueDate,
}: DiscussionListProps) {
  const [expanded, setExpanded] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleContent, setTitleContent] = useState(annotation.content)
  const [editingDueDate, setEditingDueDate] = useState(false)
  const [dueDateValue, setDueDateValue] = useState(annotation.dueDate?.slice(0, 10) || '')

  const author = users.find((u) => u.id === annotation.createdBy)
  const isOwnAnnotation = annotation.createdBy === currentUser.id
  const canModifyStatus = isOwnAnnotation
    ? permissions.canResolve
    : permissions.canResolve && permissions.isAdmin

  const assignee = annotation.assignee ? users.find((u) => u.id === annotation.assignee) : null

  const isOverdue = annotation.dueDate
    && annotation.status === 'pending'
    && new Date(annotation.dueDate) < new Date()

  const handleReply = (commentId: string, content: string, files: File[], mentions: string[]) => {
    onAddComment(annotation.id, content, commentId, files, mentions)
  }

  const handleQuote = (commentId: string, content: string, files: File[], mentions: string[]) => {
    onAddComment(annotation.id, content, commentId, files, mentions)
  }

  const handleTopLevelComment = (_content: string, files: File[], mentions: string[]) => {
    onAddComment(annotation.id, _content, undefined, files, mentions)
  }

  const handleTitleSave = () => {
    const trimmed = titleContent.trim()
    if (trimmed && trimmed !== annotation.content) {
      onEditAnnotation(annotation.id, trimmed)
    }
    setEditingTitle(false)
  }

  const handleDueDateSave = () => {
    onUpdateDueDate(annotation.id, dueDateValue || '')
    setEditingDueDate(false)
  }

  const assigneeOptions = [
    { label: '未分配', value: '' },
    ...users.map((u) => ({ label: u.name, value: u.id })),
  ]

  const topLevelComments = annotation.comments.filter((c) => !c.parentId)

  const getReplies = (parentId: string) =>
    annotation.comments.filter((c) => c.parentId === parentId)

  const statusHistoryRecords = annotation.statusHistory || []

  return (
    <div className={cn('bg-white', className)}>
      <div className="px-4 py-3 border-b border-slate-100">
        <div className="flex items-start gap-2.5">
          <Avatar user={author || { name: '?', avatar: '' }} size="sm" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="text-[13px] font-semibold text-slate-900">
                {author?.name || '未知用户'}
              </span>
              <StatusBadge
                status={annotation.status}
                onClick={canModifyStatus ? () => onToggleStatus(annotation.id) : undefined}
                clickable={canModifyStatus}
              />
              {isOverdue && (
                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-medium">
                  <Clock className="w-2.5 h-2.5" />
                  逾期
                </span>
              )}
            </div>
            {editingTitle ? (
              <div className="mt-1">
                <textarea
                  value={titleContent}
                  onChange={(e) => setTitleContent(e.target.value)}
                  className="w-full resize-none rounded-md border border-slate-200 px-2 py-1 text-[13px] focus:outline-none focus:ring-2 focus:ring-blue-500/20"
                  rows={2}
                  autoFocus
                  onBlur={handleTitleSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleTitleSave()
                    if (e.key === 'Escape') {
                      setTitleContent(annotation.content)
                      setEditingTitle(false)
                    }
                  }}
                />
              </div>
            ) : (
              <p
                className="text-[13px] text-slate-700 whitespace-pre-wrap break-words cursor-pointer hover:bg-slate-50 rounded px-1 -mx-1 py-0.5 transition-colors"
                onClick={() => {
                  if (isOwnAnnotation && permissions.canEdit) setEditingTitle(true)
                }}
              >
                {annotation.content}
              </p>
            )}
          </div>
          <button
            onClick={() => setExpanded(!expanded)}
            className="p-1 rounded-md hover:bg-slate-100 text-slate-400 flex-shrink-0"
          >
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>

        <div className="flex items-center gap-4 mt-2 ml-10 text-[11px] text-slate-400 flex-wrap">
          <div className="flex items-center gap-1.5">
            <UserCheck className="w-3 h-3" />
            {isOwnAnnotation || permissions.isAdmin ? (
              <Dropdown
                options={assigneeOptions}
                value={annotation.assignee || ''}
                placeholder="处理人"
                onChange={(v) => onUpdateAssignee(annotation.id, v)}
              />
            ) : (
              <span className={cn(annotation.assignee && 'text-blue-500')}>
                {assignee?.name || '未分配'}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1.5">
            <Calendar className="w-3 h-3" />
            {isOwnAnnotation || permissions.isAdmin ? (
              editingDueDate ? (
                <input
                  type="date"
                  value={dueDateValue}
                  onChange={(e) => setDueDateValue(e.target.value)}
                  onBlur={handleDueDateSave}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleDueDateSave()
                    if (e.key === 'Escape') {
                      setDueDateValue(annotation.dueDate?.slice(0, 10) || '')
                      setEditingDueDate(false)
                    }
                  }}
                  className="border border-slate-200 rounded px-1 text-[11px] focus:outline-none focus:ring-1 focus:ring-blue-400"
                  autoFocus
                />
              ) : (
                <button
                  onClick={() => {
                    setDueDateValue(annotation.dueDate?.slice(0, 10) || '')
                    setEditingDueDate(true)
                  }}
                  className={cn(
                    'hover:text-slate-600 transition-colors',
                    isOverdue && 'text-red-500 hover:text-red-600'
                  )}
                >
                  {annotation.dueDate
                    ? new Date(annotation.dueDate).toLocaleDateString('zh-CN')
                    : '设置截止日'}
                </button>
              )
            ) : (
              <span className={cn(isOverdue && 'text-red-500')}>
                {annotation.dueDate
                  ? new Date(annotation.dueDate).toLocaleDateString('zh-CN')
                  : '未设置'}
              </span>
            )}
          </div>
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {annotation.comments.length} 条评论
          </span>
          <span>{formatTime(annotation.createdAt)}</span>
          {(isOwnAnnotation || permissions.isAdmin) && permissions.canDelete && (
            <button
              onClick={() => onDeleteAnnotation(annotation.id)}
              className="text-red-400 hover:text-red-600 transition-colors ml-auto"
            >
              删除批注
            </button>
          )}
        </div>
      </div>

      {expanded && (
        <div className="px-4 py-3 space-y-0 max-h-[400px] overflow-y-auto">
          {annotation.comments.length === 0 && (
            <p className="text-[13px] text-slate-400 text-center py-4">暂无评论，来说点什么吧</p>
          )}
          {topLevelComments.map((comment) => {
            const replies = getReplies(comment.id)
            return (
              <CommentCard
                key={comment.id}
                comment={comment}
                users={users}
                currentUserId={currentUser.id}
                isAdmin={permissions.isAdmin}
                canEdit={permissions.canEdit}
                canDelete={permissions.canDelete}
                canCreate={permissions.canCreate}
                canUpload={permissions.canUpload}
                onReply={handleReply}
                onQuote={handleQuote}
                onEdit={onEditComment}
                onDelete={onDeleteComment}
              >
                {replies.length > 0 && (
                  <div className="ml-10 border-l-2 border-slate-200 pl-3 mt-1 space-y-0">
                    {replies.map((reply) => {
                      const parentComment = annotation.comments.find((c) => c.id === reply.parentId)
                      return (
                        <CommentCard
                          key={reply.id}
                          comment={reply}
                          users={users}
                          currentUserId={currentUser.id}
                          isAdmin={permissions.isAdmin}
                          canEdit={permissions.canEdit}
                          canDelete={permissions.canDelete}
                          canCreate={permissions.canCreate}
                          canUpload={permissions.canUpload}
                          onReply={handleReply}
                          onQuote={handleQuote}
                          onEdit={onEditComment}
                          onDelete={onDeleteComment}
                          parentComment={parentComment}
                        />
                      )
                    })}
                  </div>
                )}
              </CommentCard>
            )
          })}
        </div>
      )}

      {expanded && permissions.canCreate && (
        <div className="px-4 py-3 border-t border-slate-100">
          <CommentInput
            onSubmit={handleTopLevelComment}
            placeholder="添加评论..."
            canUpload={permissions.canUpload}
            users={users}
          />
        </div>
      )}

      {expanded && statusHistoryRecords.length > 0 && (
        <div className="px-4 py-3 border-t border-slate-100">
          <div className="flex items-center gap-1.5 mb-2">
            <GitBranch className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-[11px] font-medium text-slate-500 uppercase">状态流转</span>
          </div>
          <div className="space-y-2">
            {statusHistoryRecords.map((record, i) => {
              const changer = users.find((u) => u.id === record.changedBy)
              return (
                <div key={i} className="flex items-center gap-2 text-[11px]">
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
                  <span className="text-slate-500">
                    <span className="font-medium text-slate-700">{changer?.name || record.changedBy}</span>
                    {' 将状态从 '}
                    <span className={cn('font-medium', record.from === 'pending' ? 'text-amber-600' : 'text-emerald-600')}>
                      {record.from === 'pending' ? '待处理' : '已解决'}
                    </span>
                    {' 改为 '}
                    <span className={cn('font-medium', record.to === 'pending' ? 'text-amber-600' : 'text-emerald-600')}>
                      {record.to === 'pending' ? '待处理' : '已解决'}
                    </span>
                  </span>
                  <span className="text-slate-300">{formatTime(record.changedAt)}</span>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

function formatTime(dateStr: string): string {
  const date = new Date(dateStr)
  const now = new Date()
  const diff = now.getTime() - date.getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)

  if (mins < 1) return '刚刚'
  if (mins < 60) return `${mins}分钟前`
  if (hours < 24) return `${hours}小时前`
  if (days < 7) return `${days}天前`
  return date.toLocaleDateString('zh-CN')
}