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
      if (store.searchKeyword) {
        const kw = store.searchKeyword.toLowerCase()
        const matchContent = a.content.toLowerCase().includes(kw)
        const matchComments = a.comments.some((c) => c.content.toLowerCase().includes(kw))
        if (!matchContent && !matchComments) return false
      }
      return true
    })

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

  const resolveAnnotation = useCallback(
    (id: string) => {
      store.updateAnnotation(id, { status: 'resolved', updatedAt: new Date().toISOString() })
      onAnnotationResolve?.(id)
    },
    [store, onAnnotationResolve]
  )

  const reopenAnnotation = useCallback(
    (id: string) => {
      store.updateAnnotation(id, { status: 'pending', updatedAt: new Date().toISOString() })
      onAnnotationReopen?.(id)
    },
    [store, onAnnotationReopen]
  )

  const addComment = useCallback(
    (annotationId: string, data: CreateCommentData) => {
      const now = new Date().toISOString()
      const comment: Comment = {
        id: generateId(),
        annotationId,
        parentId: data.parentId,
        content: data.content,
        createdBy: currentUser.id,
        createdAt: now,
        updatedAt: now,
        attachments: [],
      }
      store.addComment(annotationId, comment)
      onCommentAdd?.(annotationId, comment)
      return comment
    },
    [currentUser.id, store, onCommentAdd]
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
    (status: AnnotationStatus | 'all') => {
      store.setFilterStatus(status)
    },
    [store]
  )

  const filterByMember = useCallback(
    (userIds: string[]) => {
      store.setFilterUserIds(userIds)
    },
    [store]
  )

  const searchAnnotations = useCallback(
    (keyword: string) => {
      store.setSearchKeyword(keyword)
    },
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
    (id: string) => {
      store.removeUnreadId(id)
    },
    [store]
  )

  const markAllAsRead = useCallback(() => {
    store.clearUnreadIds()
  }, [store])

  const exportDiscussions = useCallback(
    (format: 'json' | 'csv') => {
      if (format === 'json') {
        exportAsJson(filteredAnnotations, targetId)
      } else {
        exportAsCsv(filteredAnnotations, targetId)
      }
    },
    [filteredAnnotations, targetId]
  )

  const uploadAttachment = useCallback(
    async (annotationId: string, file: File): Promise<void> => {
      if (onAttachmentUpload) {
        await onAttachmentUpload(file)
      }
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
    searchAnnotations,
    locateAnnotation,
    markAsRead,
    markAllAsRead,
    exportDiscussions,
    uploadAttachment,
    removeAttachment,
    currentUser,
    users,
    permissions,
    targetId,
    filterStatus: store.filterStatus,
    filterUserIds: store.filterUserIds,
    searchKeyword: store.searchKeyword,
  }
}