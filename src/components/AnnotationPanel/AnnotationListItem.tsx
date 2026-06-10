import { cn } from '@/lib/utils'
import { Avatar } from '@/components/ui/Avatar'
import { StatusBadge } from '@/components/ui/StatusBadge'
import type { Annotation, User } from '@/types'
import { MessageCircle, MapPin, Type } from 'lucide-react'

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
  const commentCount = annotation.comments.length

  const StatusBar = (
    <div
      className={cn(
        'w-1 flex-shrink-0 rounded-full',
        annotation.status === 'pending' ? 'bg-amber-400' : 'bg-emerald-400'
      )}
    />
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
      {StatusBar}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 mb-1">
          <Avatar user={author || { name: '?', avatar: '' }} size="sm" />
          <span className="text-[13px] font-medium text-slate-900 truncate">
            {author?.name || '未知用户'}
          </span>
          <StatusBadge status={annotation.status} clickable={false} />
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