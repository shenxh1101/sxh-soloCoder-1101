import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Annotation, User } from '@/types'
import { MessageCircle, MapPin, Type, UserCheck, Clock } from 'lucide-react'

interface AnnotationListItemProps {
  annotation: Annotation
  users: User[]
  isUnread: boolean
  isActive: boolean
  onClick: (annotation: Annotation) => void
}

export function AnnotationListItem({
  annotation,
  users,
  isUnread,
  isActive,
  onClick,
}: AnnotationListItemProps) {
  const author = users.find((u) => u.id === annotation.createdBy)
  const assignee = annotation.assignee ? users.find((u) => u.id === annotation.assignee) : null
  const commentCount = annotation.comments.length

  const isOverdue = annotation.dueDate
    && annotation.status === 'pending'
    && new Date(annotation.dueDate) < new Date()

  const statusColor = cn(
    'w-1 flex-shrink-0 rounded-full',
    annotation.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-400'
  )

  return (
    <button
      onClick={() => onClick(annotation)}
      className={cn(
        'w-full text-left flex gap-2.5 px-3 py-2.5 transition-colors duration-150',
        'hover:bg-slate-50',
        isActive && 'bg-blue-50 hover:bg-blue-50'
      )}
    >
      <div className={statusColor} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Avatar user={author || { name: '?', avatar: '' }} size="sm" />
          <span className="text-[13px] font-medium text-slate-900 truncate">
            {author?.name || '未知用户'}
          </span>
          <StatusBadge status={annotation.status} clickable={false} />
          {isOverdue && (
            <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 bg-red-100 text-red-600 rounded-full text-[10px] font-medium">
              <Clock className="w-2.5 h-2.5" />
              逾期
            </span>
          )}
          {isUnread && (
            <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 ml-auto" />
          )}
        </div>

        <p className="text-[12px] text-slate-600 line-clamp-2 mb-1.5 break-words">
          {annotation.content}
        </p>

        <div className="flex items-center gap-3 text-[11px] text-slate-400">
          {annotation.textRange && (
            <span className="flex items-center gap-1">
              <Type className="w-3 h-3" />
              文本标注
            </span>
          )}
          {annotation.areaRect && (
            <span className="flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              区域标注
            </span>
          )}
          {assignee && (
            <span className="flex items-center gap-1 text-blue-500">
              <UserCheck className="w-3 h-3" />
              {assignee.name}
            </span>
          )}
          {annotation.dueDate && (
            <span className={cn('flex items-center gap-1', isOverdue && 'text-red-500')}>
              <Clock className="w-3 h-3" />
              {formatDate(annotation.dueDate)}
            </span>
          )}
          <span className="flex items-center gap-1">
            <MessageCircle className="w-3 h-3" />
            {commentCount}
          </span>
          <span>{formatTime(annotation.createdAt)}</span>
        </div>
      </div>
    </button>
  )
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr)
  return `${d.getMonth() + 1}/${d.getDate()}`
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