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

export interface Comment {
  id: string
  annotationId: string
  parentId?: string
  content: string
  createdBy: string
  createdAt: string
  updatedAt: string
  attachments: Attachment[]
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
  type: 'new_annotation' | 'new_comment' | 'status_change'
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
}

export interface CreateCommentData {
  content: string
  parentId?: string
  attachments?: File[]
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