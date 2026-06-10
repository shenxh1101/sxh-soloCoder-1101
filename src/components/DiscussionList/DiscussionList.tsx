import { useState } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { StatusBadge } from '@/components/ui/StatusBadge'
import { CommentInput } from './CommentInput'
import { CommentCard } from './CommentCard'
import type { Annotation, User, Permission } from '@/types'
import { MessageCircle, ChevronDown, ChevronUp } from 'lucide-react'

interface DiscussionListProps {
  annotation: Annotation
  users: User[]
  currentUser: User
  permissions: Permission
  className?: string
  onAddComment: (annotationId: string, content: string, parentId?: string) => void
  onEditComment: (commentId: string, content: string) => void
  onDeleteComment: (commentId: string) => void
  onToggleStatus: (annotationId: string) => void
  onDeleteAnnotation: (annotationId: string) => void
  onEditAnnotation: (annotationId: string, content: string) => void
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
}: DiscussionListProps) {
  const [expanded, setExpanded] = useState(true)
  const [editingTitle, setEditingTitle] = useState(false)
  const [titleContent, setTitleContent] = useState(annotation.content)

  const author = users.find((u) => u.id === annotation.createdBy)
  const isOwnAnnotation = annotation.createdBy === currentUser.id
  const canModifyStatus = isOwnAnnotation
    ? permissions.canResolve
    : permissions.canResolve && permissions.isAdmin

  const handleReply = (_commentId: string, content: string) => {
    onAddComment(annotation.id, content)
  }

  const handleQuote = (_commentId: string, content: string) => {
    onAddComment(annotation.id, content)
  }

  const handleTitleSave = () => {
    const trimmed = titleContent.trim()
    if (trimmed && trimmed !== annotation.content) {
      onEditAnnotation(annotation.id, trimmed)
    }
    setEditingTitle(false)
  }

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

        <div className="flex items-center gap-4 mt-2 ml-10 text-[11px] text-slate-400">
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
          {annotation.comments.map((comment) => (
            <CommentCard
              key={comment.id}
              comment={comment}
              users={users}
              currentUserId={currentUser.id}
              isAdmin={permissions.isAdmin}
              canEdit={permissions.canEdit}
              canDelete={permissions.canDelete}
              onReply={handleReply}
              onQuote={handleQuote}
              onEdit={onEditComment}
              onDelete={onDeleteComment}
            />
          ))}
        </div>
      )}

      {expanded && permissions.canCreate && (
        <div className="px-4 py-3 border-t border-slate-100">
          <CommentInput
            onSubmit={(_content, _files) => {
              onAddComment(annotation.id, _content)
            }}
            placeholder="添加评论..."
          />
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