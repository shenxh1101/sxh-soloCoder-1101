import { create } from 'zustand'
import type { Annotation, AnnotationStatus, Comment, ActivityLogEntry } from '@/types'

interface AnnotationState {
  annotations: Annotation[]
  unreadIds: string[]
  readMentionIds: string[]
  filterStatus: AnnotationStatus | 'all'
  filterUserIds: string[]
  filterAssignee: string | 'all'
  filterOverdue: boolean
  searchKeyword: string
  navigateToComment: { annotationId: string; commentId: string } | null

  setAnnotations: (annotations: Annotation[]) => void
  addAnnotation: (annotation: Annotation) => void
  updateAnnotation: (id: string, data: Partial<Annotation>) => void
  removeAnnotation: (id: string) => void
  addComment: (annotationId: string, comment: Comment) => void
  updateComment: (commentId: string, content: string) => void
  removeComment: (commentId: string) => void
  pushActivityLog: (annotationId: string, entry: ActivityLogEntry) => void
  setFilterStatus: (status: AnnotationStatus | 'all') => void
  setFilterUserIds: (userIds: string[]) => void
  setFilterAssignee: (assignee: string | 'all') => void
  setFilterOverdue: (overdue: boolean) => void
  setSearchKeyword: (keyword: string) => void
  addUnreadId: (id: string) => void
  removeUnreadId: (id: string) => void
  clearUnreadIds: () => void
  clearUnreadIdsForTarget: (targetIds: string[]) => void
  setNavigateToComment: (target: { annotationId: string; commentId: string } | null) => void
  markMentionAsRead: (commentId: string) => void
  markAllMentionsAsRead: (commentIds: string[]) => void
}

export const useAnnotationStore = create<AnnotationState>((set) => ({
  annotations: [],
  unreadIds: [],
  readMentionIds: [],
  filterStatus: 'all',
  filterUserIds: [],
  filterAssignee: 'all',
  filterOverdue: false,
  searchKeyword: '',
  navigateToComment: null,

  setAnnotations: (annotations) => set({ annotations }),

  addAnnotation: (annotation) =>
    set((state) => ({
      annotations: [...state.annotations, annotation],
      unreadIds: [...state.unreadIds, annotation.id],
    })),

  updateAnnotation: (id, data) =>
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === id ? { ...a, ...data } : a
      ),
    })),

  removeAnnotation: (id) =>
    set((state) => ({
      annotations: state.annotations.filter((a) => a.id !== id),
      unreadIds: state.unreadIds.filter((uid) => uid !== id),
    })),

  addComment: (annotationId, comment) =>
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === annotationId
          ? { ...a, comments: [...a.comments, comment] }
          : a
      ),
      unreadIds: state.unreadIds.includes(annotationId)
        ? state.unreadIds
        : [...state.unreadIds, annotationId],
    })),

  updateComment: (commentId, content) =>
    set((state) => ({
      annotations: state.annotations.map((a) => ({
        ...a,
        comments: a.comments.map((c) =>
          c.id === commentId ? { ...c, content, updatedAt: new Date().toISOString() } : c
        ),
      })),
    })),

  removeComment: (commentId) =>
    set((state) => ({
      annotations: state.annotations.map((a) => ({
        ...a,
        comments: a.comments.filter((c) => c.id !== commentId),
      })),
    })),

  pushActivityLog: (annotationId, entry) =>
    set((state) => ({
      annotations: state.annotations.map((a) =>
        a.id === annotationId
          ? { ...a, activityLog: [...(a.activityLog || []), entry] }
          : a
      ),
    })),

  setFilterStatus: (status) => set({ filterStatus: status }),
  setFilterUserIds: (userIds) => set({ filterUserIds: userIds }),
  setFilterAssignee: (assignee) => set({ filterAssignee: assignee }),
  setFilterOverdue: (overdue) => set({ filterOverdue: overdue }),
  setSearchKeyword: (keyword) => set({ searchKeyword: keyword }),

  addUnreadId: (id) =>
    set((state) => ({
      unreadIds: state.unreadIds.includes(id)
        ? state.unreadIds
        : [...state.unreadIds, id],
    })),

  removeUnreadId: (id) =>
    set((state) => ({
      unreadIds: state.unreadIds.filter((uid) => uid !== id),
    })),

  clearUnreadIds: () => set({ unreadIds: [] }),

  clearUnreadIdsForTarget: (annotationIds) =>
    set((state) => ({
      unreadIds: state.unreadIds.filter((uid) => !annotationIds.includes(uid)),
    })),

  setNavigateToComment: (target) => set({ navigateToComment: target }),

  markMentionAsRead: (commentId) =>
    set((state) => ({
      readMentionIds: state.readMentionIds.includes(commentId)
        ? state.readMentionIds
        : [...state.readMentionIds, commentId],
    })),

  markAllMentionsAsRead: (commentIds) =>
    set((state) => {
      const newIds = commentIds.filter((id) => !state.readMentionIds.includes(id))
      return { readMentionIds: [...state.readMentionIds, ...newIds] }
    }),
}))