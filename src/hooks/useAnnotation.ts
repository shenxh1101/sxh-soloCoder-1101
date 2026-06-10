import { useCallback } from 'react'
import { useAnnotationStore } from '@/store/annotationStore'
import type {
  AnnotationKitProps,
  CreateAnnotationData,
  CreateCommentData,
  Annotation,
  Comment,
  User,
  AnnotationStatus,
  Attachment,
  StatusChange,
} from '@/types'
import { DEFAULT_PERMISSION } from '@/types'
import { exportAsJson, exportAsCsv } from '@/utils/export'

let idCounter = 0
function generateId(): string {
  idCounter++
  return `ann_${Date.now()}_${idCounter}`
}

export function useAnnotation(props: AnnotationKitProps) {
  const {
    currentUser,
    users = [],
    permissions = DEFAULT_PERMISSION,
    annotations: externalAnnotations,
    targetId,
    targetType,
    onAnnotationCreate,
    onAnnotationUpdate,
    onAnnotationDelete,
    onAnnotationResolve,
    onAnnotationReopen,
    onCommentAdd,
    onCommentUpdate,
    onCommentDelete,
    onAttachmentUpload,
  } = props

  const store = useAnnotationStore()

  const allAnnotations = externalAnnotations ?? store.annotations
  const unreadCount = store.unreadIds.length

  const getUserById = useCallback(
    (userId: string): User | undefined => {
      if (userId === currentUser.id) return currentUser
      return users.find((u) => u.id === userId)
    },
    [currentUser, users]
  )

  const filteredAnnotations = allAnnotations
    .filter((a) => {
      if (a.targetId !== targetId) return false
      if (store.filterStatus !== 'all' && a.status !== store.filterStatus) return false
      if (store.filterUserIds.length > 0 && !store.filterUserIds.includes(a.createdBy)) return false
      if (store.filterAssignee !== 'all' && a.assignee !== store.filterAssignee) return false
      if (store.filterOverdue) {
        if (!a.dueDate) return false
        if (a.status === 'resolved') return false
        if (new Date(a.dueDate) >= new Date()) return false
      }
      if (store.searchKeyword) {
        const kw = store.searchKeyword.toLowerCase()
        const matchContent = a.content.toLowerCase().includes(kw)
        const matchComments = a.comments.some((c) => c.content.toLowerCase().includes(kw))
        if (!matchContent && !matchComments) return false
      }
      return true
    })

  const processAttachments = useCallback(
    async (files: File[]): Promise<Attachment[]> => {
      const results: Attachment[] = []
      for (const file of files) {
        if (onAttachmentUpload) {
          try {
            const url = await onAttachmentUpload(file)
            results.push({
              id: generateId(),
              url,
              name: file.name,
              type: file.type,
              size: file.size,
            })
          } catch {
            results.push({
              id: generateId(),
              url: URL.createObjectURL(file),
              name: file.name,
              type: file.type,
              size: file.size,
            })
          }
        } else {
          results.push({
            id: generateId(),
            url: URL.createObjectURL(file),
            name: file.name,
            type: file.type,
            size: file.size,
          })
        }
      }
      return results
    },
    [onAttachmentUpload]
  )

  const createAnnotation = useCallback(
    (data: CreateAnnotationData) => {
      const now = new Date().toISOString()
      const annotation: Annotation = {
        id: generateId(),
        targetId,
        targetType,
        content: data.content,
        status: 'pending',
        createdBy: currentUser.id,
        createdAt: now,
        updatedAt: now,
        assignee: data.assignee,
        dueDate: data.dueDate,
        statusHistory: [],
        textRange: data.textRange,
        areaRect: data.areaRect,
        comments: [],
        attachments: [],
      }
      store.addAnnotation(annotation)
      onAnnotationCreate?.(annotation)
      return annotation
    },
    [targetId, targetType, currentUser.id, store, onAnnotationCreate]
  )

  const updateAnnotation = useCallback(
    (id: string, data: Partial<Annotation>) => {
      const updated = { ...data, updatedAt: new Date().toISOString() }
      store.updateAnnotation(id, updated)
      const full = allAnnotations.find((a) => a.id === id)
      if (full) onAnnotationUpdate?.({ ...full, ...updated })
    },
    [allAnnotations, store, onAnnotationUpdate]
  )

  const deleteAnnotation = useCallback(
    (id: string) => {
      store.removeAnnotation(id)
      onAnnotationDelete?.(id)
    },
    [store, onAnnotationDelete]
  )

  const changeStatus = useCallback(
    (id: string, newStatus: AnnotationStatus) => {
      const ann = allAnnotations.find((a) => a.id === id)
      if (!ann || ann.status === newStatus) return
      const now = new Date().toISOString()
      const record: StatusChange = {
        from: ann.status,
        to: newStatus,
        changedBy: currentUser.id,
        changedAt: now,
      }
      const updated = {
        status: newStatus,
        updatedAt: now,
        statusHistory: [...(ann.statusHistory || []), record],
      }
      store.updateAnnotation(id, updated)
      if (newStatus === 'resolved') {
        onAnnotationResolve?.(id)
      } else {
        onAnnotationReopen?.(id)
      }
    },
    [allAnnotations, currentUser.id, store, onAnnotationResolve, onAnnotationReopen]
  )

  const resolveAnnotation = useCallback(
    (id: string) => changeStatus(id, 'resolved'),
    [changeStatus]
  )

  const reopenAnnotation = useCallback(
    (id: string) => changeStatus(id, 'pending'),
    [changeStatus]
  )

  const addComment = useCallback(
    async (annotationId: string, data: CreateCommentData): Promise<Comment> => {
      const now = new Date().toISOString()
      const attachments = data.attachments
        ? await processAttachments(data.attachments)
        : []

      const comment: Comment = {
        id: generateId(),
        annotationId,
        parentId: data.parentId,
        content: data.content,
        createdBy: currentUser.id,
        createdAt: now,
        updatedAt: now,
        attachments,
        mentions: data.mentions,
      }
      store.addComment(annotationId, comment)
      onCommentAdd?.(annotationId, comment)
      return comment
    },
    [currentUser.id, store, onCommentAdd, processAttachments]
  )

  const updateComment = useCallback(
    (commentId: string, content: string) => {
      store.updateComment(commentId, content)
      const annotation = allAnnotations.find((a) =>
        a.comments.some((c) => c.id === commentId)
      )
      const comment = annotation?.comments.find((c) => c.id === commentId)
      if (comment) onCommentUpdate?.({ ...comment, content })
    },
    [allAnnotations, store, onCommentUpdate]
  )

  const deleteComment = useCallback(
    (commentId: string) => {
      store.removeComment(commentId)
      onCommentDelete?.(commentId)
    },
    [store, onCommentDelete]
  )

  const filterByStatus = useCallback(
    (status: AnnotationStatus | 'all') => store.setFilterStatus(status),
    [store]
  )

  const filterByMember = useCallback(
    (userIds: string[]) => store.setFilterUserIds(userIds),
    [store]
  )

  const filterByAssignee = useCallback(
    (assignee: string | 'all') => store.setFilterAssignee(assignee),
    [store]
  )

  const filterByOverdue = useCallback(
    (overdue: boolean) => store.setFilterOverdue(overdue),
    [store]
  )

  const searchAnnotations = useCallback(
    (keyword: string) => store.setSearchKeyword(keyword),
    [store]
  )

  const locateAnnotation = useCallback(
    (id: string): boolean => {
      const annotation = allAnnotations.find((a) => a.id === id)
      if (!annotation) return false

      if (annotation.textRange?.containerSelector) {
        const el = document.querySelector(annotation.textRange.containerSelector)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          store.removeUnreadId(id)
          return true
        }
      }

      if (annotation.areaRect) {
        const el = document.querySelector(`[data-annotation-id="${id}"]`)
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' })
          store.removeUnreadId(id)
          return true
        }
      }

      return false
    },
    [allAnnotations, store]
  )

  const markAsRead = useCallback(
    (id: string) => store.removeUnreadId(id),
    [store]
  )

  const markAllAsRead = useCallback(() => {
    const targetAnnotationIds = filteredAnnotations.map((a) => a.id)
    store.clearUnreadIdsForTarget(targetAnnotationIds)
  }, [store, filteredAnnotations])

  const getMentionNotifications = useCallback(
    (): { annotationId: string; authorName: string; content: string; createdAt: string }[] => {
      return filteredAnnotations.flatMap((a) =>
        a.comments
          .filter((c) => c.mentions?.includes(currentUser.id))
          .map((c) => ({
            annotationId: a.id,
            authorName: getUserById(c.createdBy)?.name || '未知用户',
            content: c.content,
            createdAt: c.createdAt,
          }))
      )
    },
    [filteredAnnotations, currentUser.id, getUserById]
  )

  const exportDiscussions = useCallback(
    (format: 'json' | 'csv') => {
      if (format === 'json') {
        exportAsJson(filteredAnnotations, targetId, users)
      } else {
        exportAsCsv(filteredAnnotations, targetId, users)
      }
    },
    [filteredAnnotations, targetId, users]
  )

  const uploadAttachment = useCallback(
    async (file: File): Promise<string> => {
      if (onAttachmentUpload) return await onAttachmentUpload(file)
      return URL.createObjectURL(file)
    },
    [onAttachmentUpload]
  )

  const removeAttachment = useCallback(
    (annotationId: string, attachmentId: string) => {
      const annotation = allAnnotations.find((a) => a.id === annotationId)
      if (annotation) {
        const updated = {
          attachments: annotation.attachments.filter((att) => att.id !== attachmentId),
        }
        store.updateAnnotation(annotationId, updated)
      }
    },
    [allAnnotations, store]
  )

  return {
    annotations: allAnnotations,
    filteredAnnotations,
    unreadIds: store.unreadIds,
    unreadCount,
    getUserById,
    createAnnotation,
    updateAnnotation,
    deleteAnnotation,
    resolveAnnotation,
    reopenAnnotation,
    addComment,
    updateComment,
    deleteComment,
    filterByStatus,
    filterByMember,
    filterByAssignee,
    filterByOverdue,
    searchAnnotations,
    locateAnnotation,
    markAsRead,
    markAllAsRead,
    getMentionNotifications,
    exportDiscussions,
    uploadAttachment,
    removeAttachment,
    currentUser,
    users,
    permissions,
    targetId,
    filterStatus: store.filterStatus,
    filterUserIds: store.filterUserIds,
    filterAssignee: store.filterAssignee,
    filterOverdue: store.filterOverdue,
    searchKeyword: store.searchKeyword,
  }
}