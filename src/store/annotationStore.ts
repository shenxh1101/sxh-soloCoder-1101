import { create } from 'zustand'
import type { Annotation, AnnotationStatus, Comment } from '@/types'

interface AnnotationState {
  annotations: Annotation[]
  unreadIds: string[]
  filterStatus: AnnotationStatus | 'all'
  filterUserIds: string[]
  filterAssignee: string | 'all'
  filterOverdue: boolean
  searchKeyword: string

  setAnnotations: (annotations: Annotation[]) => void
  addAnnotation: (annotation: Annotation) => void
  updateAnnotation: (id: string, data: Partial<Annotation>) => void
  removeAnnotation: (id: string) => void
  addComment: (annotationId: string, comment: Comment) => void
  updateComment: (commentId: string, content: string) => void
  removeComment: (commentId: string) => void
  setFilterStatus: (status: AnnotationStatus | 'all') => void
  setFilterUserIds: (userIds: string[]) => void
  setFilterAssignee: (assignee: string | 'all') => void
  setFilterOverdue: (overdue: boolean) => void
  setSearchKeyword: (keyword: string) => void
  addUnreadId: (id: string) => void
  removeUnreadId: (id: string) => void
  clearUnreadIds: () => void
  clearUnreadIdsForTarget: (targetIds: string[]) => void
}

export const useAnnotationStore = create<AnnotationState>((set) => ({
  annotations: [],
  unreadIds: [],
  filterStatus: 'all',
  filterUserIds: [],
  filterAssignee: 'all',
  filterOverdue: false,
  searchKeyword: '',

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
}))