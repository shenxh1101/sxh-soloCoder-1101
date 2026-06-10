import { useState } from 'react'
import { FilterBar } from './FilterBar'
import { AnnotationListItem } from './AnnotationListItem'
import { ExportButton } from './ExportButton'
import { DiscussionList } from '@/components/DiscussionList/DiscussionList'
import { Modal } from '@/components/ui/Modal'
import { useAnnotation } from '@/hooks/useAnnotation'
import type { AnnotationKitProps } from '@/types'
import { MessageSquareText } from 'lucide-react'

export function AnnotationPanel(props: AnnotationKitProps) {
  const annotation = useAnnotation(props)
  const {
    filteredAnnotations,
    unreadCount,
    unreadIds,
    filterStatus,
    filterUserIds,
    searchKeyword,
    filterByStatus,
    filterByMember,
    searchAnnotations,
    addComment,
    updateComment,
    deleteComment,
    updateAnnotation,
    deleteAnnotation,
    resolveAnnotation,
    reopenAnnotation,
    locateAnnotation,
    markAsRead,
    markAllAsRead,
    exportDiscussions,
    currentUser,
    users,
    permissions,
  } = annotation

  const [activeAnnotation, setActiveAnnotation] = useState<string | null>(null)
  const [showDiscussion, setShowDiscussion] = useState(false)

  const handleItemClick = (ann: { id: string }) => {
    setActiveAnnotation(ann.id)
    setShowDiscussion(true)
    locateAnnotation(ann.id)
    markAsRead(ann.id)
  }

  const handleToggleStatus = (annotationId: string) => {
    const ann = filteredAnnotations.find((a) => a.id === annotationId)
    if (!ann) return
    if (ann.status === 'pending') {
      resolveAnnotation(annotationId)
    } else {
      reopenAnnotation(annotationId)
    }
  }

  const activeAnn = filteredAnnotations.find((a) => a.id === activeAnnotation)

  return (
    <>
      <div className="fixed right-0 top-0 h-full w-80 bg-white border-l border-slate-200 flex flex-col z-40 shadow-lg">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <MessageSquareText className="w-5 h-5 text-blue-600" />
            <h2 className="text-[15px] font-semibold text-slate-900">批注</h2>
            {unreadCount > 0 && (
              <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-blue-500 text-[11px] font-semibold text-white px-1">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={markAllAsRead}
              className="text-[11px] text-slate-400 hover:text-slate-600 transition-colors"
            >
              全部已读
            </button>
          </div>
        </div>

        <div className="px-3 py-2.5 border-b border-slate-100">
          <FilterBar
            users={users}
            filterStatus={filterStatus}
            filterUserIds={filterUserIds}
            onStatusChange={filterByStatus}
            onUserChange={filterByMember}
            onSearch={searchAnnotations}
          />
        </div>

        <div className="flex-1 overflow-y-auto">
          {filteredAnnotations.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <MessageSquareText className="w-8 h-8 text-slate-300 mb-3" />
              <p className="text-[13px] text-slate-400">
                {searchKeyword || filterStatus !== 'all' || filterUserIds.length > 0
                  ? '没有匹配的批注'
                  : '暂无批注'}
              </p>
              <p className="text-[12px] text-slate-300 mt-1">
                选中文本或拖动区域来添加批注
              </p>
            </div>
          ) : (
            <div className="divide-y divide-slate-50">
              {filteredAnnotations.map((ann) => (
                <AnnotationListItem
                  key={ann.id}
                  annotation={ann}
                  users={users}
                  isUnread={unreadIds.includes(ann.id)}
                  isActive={ann.id === activeAnnotation}
                  onClick={handleItemClick}
                />
              ))}
            </div>
          )}
        </div>

        {permissions.canExport && filteredAnnotations.length > 0 && (
          <div className="px-4 py-3 border-t border-slate-100">
            <ExportButton onExport={exportDiscussions} />
          </div>
        )}
      </div>

      <Modal
        open={showDiscussion && !!activeAnn}
        onClose={() => setShowDiscussion(false)}
        title="批注详情"
        width="480px"
      >
        {activeAnn && (
          <DiscussionList
            annotation={activeAnn}
            users={users}
            currentUser={currentUser}
            permissions={permissions}
            onAddComment={async (annotationId, content, parentId, files) => {
              return await addComment(annotationId, { content, parentId, attachments: files })
            }}
            onEditComment={updateComment}
            onDeleteComment={deleteComment}
            onToggleStatus={handleToggleStatus}
            onDeleteAnnotation={deleteAnnotation}
            onEditAnnotation={(id, content) => updateAnnotation(id, { content })}
          />
        )}
      </Modal>
    </>
  )
}