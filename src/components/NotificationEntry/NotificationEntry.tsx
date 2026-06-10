import { useState, useRef, useEffect, useMemo } from 'react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/Badge'
import { useAnnotation } from '@/hooks/useAnnotation'
import type { AnnotationKitProps } from '@/types'
import { Bell, AtSign, ChevronDown, ChevronRight } from 'lucide-react'

type NotificationTab = 'unread' | 'read' | 'all'

interface MentionItem {
  commentId: string
  authorName: string
  content: string
  createdAt: string
  read: boolean
}

interface MentionGroup {
  annotationId: string
  annotationContent: string
  mentions: MentionItem[]
}

export function NotificationEntry(props: AnnotationKitProps) {
  const [open, setOpen] = useState(false)
  const [tab, setTab] = useState<NotificationTab>('unread')
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set())
  const ref = useRef<HTMLDivElement>(null)
  const annotation = useAnnotation(props)
  const {
    annotations,
    markAsRead,
    markAllAsRead,
    markMentionAsRead,
    locateAnnotation,
    getMentionNotifications,
    setNavigateToComment,
    readMentionIds,
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

  useEffect(() => {
    if (!open) setTab('unread')
  }, [open])

  const targetUnreadAnnotations = annotations.filter(
    (a) => a.targetId === targetId && unreadIds.includes(a.id)
  )

  const allMentionNotifs = useMemo(() => {
    return getMentionNotifications().map((m) => ({
      ...m,
      read: readMentionIds.includes(m.commentId),
    }))
  }, [getMentionNotifications, readMentionIds])

  const mentionGroups: MentionGroup[] = useMemo(() => {
    const groupMap = new Map<string, MentionItem[]>()
    allMentionNotifs.forEach((m) => {
      const existing = groupMap.get(m.annotationId)
      const item: MentionItem = {
        commentId: m.commentId,
        authorName: m.authorName,
        content: m.content,
        createdAt: m.createdAt,
        read: m.read,
      }
      if (existing) {
        existing.push(item)
      } else {
        groupMap.set(m.annotationId, [item])
      }
    })
    return Array.from(groupMap.entries()).map(([annotationId, mentions]) => {
      const ann = annotations.find((a) => a.id === annotationId)
      return {
        annotationId,
        annotationContent: ann?.content || '批注内容',
        mentions,
      }
    })
  }, [allMentionNotifs, annotations])

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

  const filteredGroups = useMemo(() => {
    if (tab === 'all') return mentionGroups
    return mentionGroups
      .map((g) => ({
        ...g,
        mentions: g.mentions.filter((m) => (tab === 'unread' ? !m.read : m.read)),
      }))
      .filter((g) => g.mentions.length > 0)
  }, [mentionGroups, tab])

  const unreadMentionCount = mentionGroups.reduce(
    (sum, g) => sum + g.mentions.filter((m) => !m.read).length,
    0
  )

  const showAnnotationNotifs = tab !== 'read'
  const filteredAnnotationNotifs = tab === 'all' ? annotationNotifs : annotationNotifs

  const targetUnreadCount = targetUnreadAnnotations.length + unreadMentionCount

  const handleMentionClick = (annotationId: string, commentId: string) => {
    markMentionAsRead(commentId)
    setNavigateToComment({ annotationId, commentId })
    setOpen(false)
  }

  const handleAnnotationClick = (notif: typeof annotationNotifs[0]) => {
    locateAnnotation(notif.annotationId)
    markAsRead(notif.annotationId)
    setOpen(false)
  }

  const handleMarkAllRead = () => {
    markAllAsRead()
    setTab('read')
  }

  const toggleGroup = (annotationId: string) => {
    setExpandedGroups((prev) => {
      const next = new Set(prev)
      if (next.has(annotationId)) {
        next.delete(annotationId)
      } else {
        next.add(annotationId)
      }
      return next
    })
  }

  const hasContent = filteredGroups.length > 0 || (showAnnotationNotifs && filteredAnnotationNotifs.length > 0)

  const tabs: { key: NotificationTab; label: string }[] = [
    { key: 'unread', label: '未读' },
    { key: 'read', label: '已读' },
    { key: 'all', label: '全部' },
  ]

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
          <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <h3 className="text-[14px] font-semibold text-slate-900">通知</h3>
            {targetUnreadCount > 0 && (
              <button
                onClick={handleMarkAllRead}
                className="text-[11px] text-blue-600 hover:text-blue-700 font-medium"
              >
                全部已读
              </button>
            )}
          </div>

          <div className="flex border-b border-slate-100">
            {tabs.map((t) => (
              <button
                key={t.key}
                onClick={() => setTab(t.key)}
                className={cn(
                  'flex-1 py-2 text-[12px] font-medium transition-colors',
                  tab === t.key
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-slate-400 hover:text-slate-600'
                )}
              >
                {t.label}
              </button>
            ))}
          </div>

          <div className="max-h-[340px] overflow-y-auto">
            {!hasContent ? (
              <div className="flex flex-col items-center justify-center py-10">
                <Bell className="w-8 h-8 text-slate-200 mb-2" />
                <p className="text-[13px] text-slate-400">
                  {tab === 'unread' ? '没有未读通知' : tab === 'read' ? '没有已读通知' : '暂无通知'}
                </p>
              </div>
            ) : (
              <>
                {filteredGroups.map((group) => (
                  <div key={group.annotationId} className="border-b border-slate-50">
                    <button
                      onClick={() => toggleGroup(group.annotationId)}
                      className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors flex items-center gap-2"
                    >
                      {expandedGroups.has(group.annotationId) ? (
                        <ChevronDown className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      ) : (
                        <ChevronRight className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[11px] font-medium text-slate-500 bg-purple-50 text-purple-600 px-1.5 py-0.5 rounded">
                            {group.mentions.length}条@提醒
                          </span>
                        </div>
                        <p className="text-[12px] text-slate-600 truncate mt-0.5">
                          {group.annotationContent}
                        </p>
                      </div>
                      {group.mentions.some((m) => !m.read) && (
                        <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                      )}
                    </button>
                    {expandedGroups.has(group.annotationId) && (
                      <div className="border-t border-slate-50 bg-slate-50/50">
                        {group.mentions.map((mention) => (
                          <button
                            key={mention.commentId}
                            onClick={() => handleMentionClick(group.annotationId, mention.commentId)}
                            className={cn(
                              'w-full text-left flex items-start gap-2.5 px-4 py-2.5 hover:bg-slate-100/80 transition-colors',
                              !mention.read && 'bg-purple-50/50'
                            )}
                          >
                            <div className="w-7 h-7 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                              <AtSign className="w-3.5 h-3.5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[12px] text-slate-700 line-clamp-2">
                                <span className="font-medium">{mention.authorName}</span>
                                {' 提到了你'}
                              </p>
                              <p className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">
                                {mention.content}
                              </p>
                              <span className="text-[10px] text-slate-300 mt-0.5">
                                {formatTime(mention.createdAt)}
                              </span>
                            </div>
                            {!mention.read && (
                              <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0 mt-2" />
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

                {showAnnotationNotifs &&
                  filteredAnnotationNotifs.map((notif) => (
                    <button
                      key={notif.annotationId}
                      onClick={() => handleAnnotationClick(notif)}
                      className="w-full text-left flex items-start gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50"
                    >
                      <div
                        className={cn(
                          'w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5',
                          notif.type === 'new_comment'
                            ? 'bg-amber-100 text-amber-600'
                            : 'bg-blue-100 text-blue-600'
                        )}
                      >
                        <span className="text-xs font-bold">
                          {notif.type === 'new_annotation' ? '新' : '评'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-[13px] text-slate-700 line-clamp-2">
                          <span className="font-medium">{notif.authorName}</span>
                          {notif.type === 'new_annotation'
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
                  ))}
              </>
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