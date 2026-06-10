export interface User {
  id: string
  name: string
  avatar: string
}

export interface TextRange {
  startOffset: number
  endOffset: number
  text: string
  containerSelector: string
}

export interface AreaRect {
  x: number
  y: number
  width: number
  height: number
  relativeTo: 'image' | 'viewport'
}

export interface Attachment {
  id: string
  url: string
  name: string
  type: string
  size: number
}

export type AnnotationStatus = 'pending' | 'resolved'

export interface StatusChange {
  from: AnnotationStatus
  to: AnnotationStatus
  changedBy: string
  changedAt: string
}

export interface Comment {
  id: string
  annotationId: string
  parentId?: string
  content: string
  createdBy: string
  createdAt: string
  updatedAt: string
  attachments: Attachment[]
  mentions?: string[]
}

export type ActivityType =
  | 'comment_add'
  | 'comment_edit'
  | 'comment_delete'
  | 'status_change'
  | 'assignee_change'
  | 'due_date_change'

export interface ActivityLogEntry {
  id: string
  annotationId: string
  type: ActivityType
  userId: string
  timestamp: string
  detail: string
  commentId?: string
  commentContent?: string
  fromStatus?: AnnotationStatus
  toStatus?: AnnotationStatus
  fromValue?: string
  toValue?: string
}

export interface Annotation {
  id: string
  targetId: string
  targetType: 'document' | 'design' | 'course'
  content: string
  status: AnnotationStatus
  createdBy: string
  createdAt: string
  updatedAt: string
  assignee?: string
  dueDate?: string
  statusHistory: StatusChange[]
  activityLog: ActivityLogEntry[]
  textRange?: TextRange
  areaRect?: AreaRect
  comments: Comment[]
  attachments: Attachment[]
}

export interface Permission {
  canCreate: boolean
  canEdit: boolean
  canDelete: boolean
  canResolve: boolean
  canUpload: boolean
  canExport: boolean
  isAdmin: boolean
}

export interface Notification {
  id: string
  annotationId: string
  type: 'new_annotation' | 'new_comment' | 'status_change' | 'mention'
  message: string
  createdBy: string
  createdAt: string
  read: boolean
}

export interface CreateAnnotationData {
  content: string
  textRange?: TextRange
  areaRect?: AreaRect
  attachments?: File[]
  assignee?: string
  dueDate?: string
}

export interface CreateCommentData {
  content: string
  parentId?: string
  attachments?: File[]
  mentions?: string[]
}

export interface AnnotationKitProps {
  currentUser: User
  users?: User[]
  permissions?: Permission
  annotations?: Annotation[]
  targetType: 'document' | 'design' | 'course'
  targetId: string
  theme?: 'light' | 'dark'
  onAnnotationCreate?: (annotation: Annotation) => void
  onAnnotationUpdate?: (annotation: Annotation) => void
  onAnnotationDelete?: (annotationId: string) => void
  onAnnotationResolve?: (annotationId: string) => void
  onAnnotationReopen?: (annotationId: string) => void
  onCommentAdd?: (annotationId: string, comment: Comment) => void
  onCommentUpdate?: (comment: Comment) => void
  onCommentDelete?: (commentId: string) => void
  onAttachmentUpload?: (file: File) => Promise<string>
}

export const DEFAULT_PERMISSION: Permission = {
  canCreate: true,
  canEdit: true,
  canDelete: true,
  canResolve: true,
  canUpload: true,
  canExport: true,
  isAdmin: false,
}