import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { Avatar } from '@/components/ui/Avatar'
import { useAnnotation } from '@/hooks/useAnnotation'
import type { AnnotationKitProps } from '@/types'
import { Bell, AtSign } from 'lucide-react'

export function NotificationEntry(props: AnnotationKitProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const annotation = useAnnotation(props)
  const {
    annotations,
    markAsRead,
    markAllAsRead,
    locateAnnotation,
    getMentionNotifications,
    setNavigateToComment,
    users,
    targetId,
    unreadIds,
  } = annotation

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const targetUnreadAnnotations = annotations.filter(
    (a) => a.targetId === targetId && unreadIds.includes(a.id)
  )

  const mentionNotifs = useMemo(() => {
    return getMentionNotifications().map((m) => ({
      ...m,
      type: 'mention' as const,
    }))
  }, [getMentionNotifications])

  const annotationNotifs = targetUnreadAnnotations.map((a) => {
    const author = users.find((u) => u.id === a.createdBy)
    return {
      id: a.id,
      annotationId: a.id,
      commentId: null as string | null,
      authorName: author?.name || '未知用户',
      content: a.content,
      createdAt: a.createdAt,
      type: (a.comments.length > 0 ? 'new_comment' : 'new_annotation') as 'new_annotation' | 'new_comment',
    }
  })

  const allNotifications = [...mentionNotifs, ...annotationNotifs]

  const targetUnreadCount = targetUnreadAnnotations.length + mentionNotifs.length

  const handleNotificationClick = (notif: typeof allNotifications[0]) => {
    if (notif.type === 'mention' && notif.commentId) {
      setNavigateToComment({ annotationId: notif.annotationId, commentId: notif.commentId })
    } else {
      locateAnnotation(notif.annotationId)
    }
    markAsRead(notif.annotationId)
    setOpen(false)
  }

  return (
    <div ref={ref} className="relative inline-block">
      <button
        onClick={() => setOpen(!open)}
        className={cn(
          'relative p-2 rounded-lg transition-colors duration-150',
          'text-slate-500 hover:text-slate-700 hover:bg-slate-100',
          open && 'bg-slate-100 text-slate-700'
        )}
      >
        <Bell className="w-5 h-5" />
        <Badge count={targetUnreadCount} className="absolute -top-0.5 -right-0.5" />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-white border border-slate-200 rounded-xl shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
            <h3 className="text-[14px] font-semibold text-slate-900">通知</h3>
            {targetUnreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
              >
                全部已读
              </button>
            )}
          </div>

          <div className="max-h-[360px] overflow-y-auto">
            {allNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Bell className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-[13px] text-slate-400">没有未读通知</p>
              </div>
            ) : (
              allNotifications.map((notif, i) => (
                <button
                  key={`${notif.annotationId}_${notif.type}_${i}`}
                  onClick={() => handleNotificationClick(notif)}
                  className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50"
                >
                  <div
                    className={cn(
                      'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                      notif.type === 'mention'
                        ? 'bg-purple-100 text-purple-600'
                        : notif.type === 'new_comment'
                        ? 'bg-amber-100 text-amber-600'
                        : 'bg-blue-100 text-blue-600'
                    )}
                  >
                    {notif.type === 'mention' ? (
                      <AtSign className="w-4 h-4" />
                    ) : (
                      <span className="text-xs font-bold">
                        {notif.type === 'new_annotation' ? '新' : '评'}
                      </span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] text-slate-700 line-clamp-2">
                      <span className="font-medium">{notif.authorName}</span>
                      {notif.type === 'mention'
                        ? ' 在评论中提到了你'
                        : notif.type === 'new_annotation'
                        ? ' 添加了新批注'
                        : ' 添加了新评论'}
                    </p>
                    <p className="text-[12px] text-slate-400 mt-0.5 line-clamp-1">
                      {notif.content}
                    </p>
                    <span className="text-[11px] text-slate-300 mt-1">
                      {formatTime(notif.createdAt)}
                    </span>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                </button>
              ))
            )}
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