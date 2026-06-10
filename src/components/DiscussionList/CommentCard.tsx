import { useState, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { Button } from '@/components/ui/Button'
import { CommentInput } from './CommentInput'
import type { Comment as CommentType, User } from '@/types'
import { MessageSquareReply, Pencil, Trash2, Quote, FileText } from 'lucide-react'

interface CommentCardProps {
  comment: CommentType
  users: User[]
  currentUserId: string
  isAdmin: boolean
  canEdit: boolean
  canDelete: boolean
  children?: ReactNode
  onReply: (commentId: string, content: string) => void
  onQuote: (commentId: string, content: string) => void
  onEdit: (commentId: string, content: string) => void
  onDelete: (commentId: string) => void
}

export function CommentCard({
  comment,
  users,
  currentUserId,
  isAdmin,
  canEdit,
  canDelete,
  children,
  onReply,
  onQuote,
  onEdit,
  onDelete,
}: CommentCardProps) {
  const [replying, setReplying] = useState(false)
  const [quoting, setQuoting] = useState(false)
  const [editing, setEditing] = useState(false)

  const author = users.find((u) => u.id === comment.createdBy)
  const isOwn = comment.createdBy === currentUserId
  const canModify = isOwn ? (canEdit || canDelete) : isAdmin

  const handleReply = (content: string) => {
    onReply(comment.id, content)
    setReplying(false)
  }

  const handleQuote = (content: string) => {
    onQuote(comment.id, content)
    setQuoting(false)
  }

  const handleEdit = (content: string) => {
    onEdit(comment.id, content)
    setEditing(false)
  }

  const timeStr = formatTime(comment.createdAt)

  if (editing) {
    return (
      <div className="py-2">
        <CommentInput
          onSubmit={handleEdit}
          onCancel={() => setEditing(false)}
          initialContent={comment.content}
          autoFocus
        />
      </div>
    )
  }

  return (
    <div className="group py-2">
      <div className="flex gap-2.5">
        <Avatar user={author || { name: '?', avatar: '' }} size="sm" className="mt-0.5" />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-0.5">
            <span className="text-[13px] font-semibold text-slate-900">
              {author?.name || '未知用户'}
            </span>
            {comment.parentId && (
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Quote className="w-3 h-3" />
                引用
              </span>
            )}
            <span className="text-[11px] text-slate-400">{timeStr}</span>
          </div>

          <p className="text-[13px] text-slate-700 whitespace-pre-wrap break-words">
            {comment.content}
          </p>

          {comment.attachments.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {comment.attachments.map((att) => (
                <a
                  key={att.id}
                  href={att.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 rounded-md text-xs text-blue-600 hover:bg-blue-50 transition-colors"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span className="max-w-[140px] truncate">{att.name}</span>
                </a>
              ))}
            </div>
          )}

          <div className="flex items-center gap-0.5 mt-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
            <Button variant="ghost" size="sm" onClick={() => setReplying(true)}>
              <MessageSquareReply className="w-3.5 h-3.5" />
              回复
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setQuoting(true)}>
              <Quote className="w-3.5 h-3.5" />
              引用
            </Button>
            {isOwn && canEdit && (
              <Button variant="ghost" size="sm" onClick={() => setEditing(true)}>
                <Pencil className="w-3.5 h-3.5" />
                编辑
              </Button>
            )}
            {canModify && canDelete && (
              <Button
                variant="danger"
                size="sm"
                onClick={() => onDelete(comment.id)}
              >
                <Trash2 className="w-3.5 h-3.5" />
                删除
              </Button>
            )}
          </div>
        </div>
      </div>

      {replying && (
        <div className="ml-10 mt-2">
          <CommentInput
            onSubmit={handleReply}
            onCancel={() => setReplying(false)}
            placeholder={`回复 ${author?.name || '...'}...`}
            autoFocus
          />
        </div>
      )}

      {quoting && (
        <div className="ml-10 mt-2">
          <div className="mb-2 px-3 py-2 bg-slate-50 border-l-2 border-slate-300 rounded-r-md text-xs text-slate-500 italic">
            {comment.content.length > 100
              ? comment.content.slice(0, 100) + '...'
              : comment.content}
          </div>
          <CommentInput
            onSubmit={handleQuote}
            onCancel={() => setQuoting(false)}
            placeholder="输入引用评论..."
            autoFocus
          />
        </div>
      )}

      {children}
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