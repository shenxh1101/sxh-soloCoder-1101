import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnnotationPanel } from '@/components/AnnotationPanel/AnnotationPanel'
import { AreaMarker } from '@/components/AreaMarker/AreaMarker'
import { NotificationEntry } from '@/components/NotificationEntry/NotificationEntry'
import type { User } from '@/types'
import { ArrowLeft } from 'lucide-react'

const MOCK_USER: User = {
  id: 'user_1',
  name: '张三',
  avatar: '',
}

const MOCK_USERS: User[] = [
  MOCK_USER,
  { id: 'user_2', name: '李四', avatar: '' },
  { id: 'user_3', name: '王五', avatar: '' },
]

export default function DesignDemo() {
  const [callbacks, setCallbacks] = useState<string[]>([])

  const logCallback = (name: string, ...args: unknown[]) => {
    const log = `[${new Date().toLocaleTimeString()}] ${name}: ${JSON.stringify(args).slice(0, 120)}`
    setCallbacks((prev) => [log, ...prev].slice(0, 50))
  }

  const annotationProps = {
    currentUser: MOCK_USER,
    users: MOCK_USERS,
    targetType: 'design' as const,
    targetId: 'design_demo_1',
    onAnnotationCreate: (ann: unknown) => logCallback('onAnnotationCreate', ann),
    onAnnotationUpdate: (ann: unknown) => logCallback('onAnnotationUpdate', ann),
    onAnnotationDelete: (id: string) => logCallback('onAnnotationDelete', id),
    onAnnotationResolve: (id: string) => logCallback('onAnnotationResolve', id),
    onAnnotationReopen: (id: string) => logCallback('onAnnotationReopen', id),
    onCommentAdd: (id: string, comment: unknown) => logCallback('onCommentAdd', id, comment),
    onCommentUpdate: (comment: unknown) => logCallback('onCommentUpdate', comment),
    onCommentDelete: (id: string) => logCallback('onCommentDelete', id),
    onAttachmentUpload: async (file: File) => {
      logCallback('onAttachmentUpload', { name: file.name, size: file.size, type: file.type })
      return URL.createObjectURL(file)
    },
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-[15px] font-semibold text-slate-900">设计稿批注演示</h1>
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">拖拽绘制区域标记</span>
        </div>
        <div className="flex items-center gap-3">
          <NotificationEntry {...annotationProps} />
          <div className="text-[11px] text-slate-400">用户: {MOCK_USER.name}</div>
        </div>
      </header>

      <div className="flex">
        <div className="flex-1 min-w-0 pr-80">
          <div className="max-w-4xl mx-auto px-8 py-8">
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-2">产品原型图 — 用户中心改版</h2>
              <p className="text-sm text-slate-500 mb-6">请对以下设计稿进行评审，拖拽鼠标绘制需要讨论的区域</p>

              <AreaMarker {...annotationProps}>
                <div className="relative w-full aspect-[16/10] bg-gradient-to-br from-slate-100 to-blue-50 rounded-lg border border-dashed border-slate-300 overflow-hidden">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <div className="w-32 h-32 mx-auto mb-4 bg-white rounded-2xl shadow-md flex items-center justify-center">
                        <div className="w-20 h-20 bg-blue-100 rounded-full" />
                      </div>
                      <p className="text-sm text-slate-400">设计稿预览区域</p>
                      <p className="text-xs text-slate-300 mt-1">拖拽鼠标绘制标记区域</p>
                    </div>
                  </div>

                  <div className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 px-4 py-2">
                    <div className="text-xs font-semibold text-slate-900">用户信息卡片</div>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="w-8 h-8 bg-blue-200 rounded-full" />
                      <div>
                        <div className="w-16 h-2 bg-slate-200 rounded" />
                        <div className="w-12 h-1.5 bg-slate-100 rounded mt-1" />
                      </div>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 px-4 py-3">
                    <div className="text-xs font-semibold text-slate-900 mb-2">操作面板</div>
                    <div className="space-y-2">
                      <div className="w-32 h-6 bg-blue-500 rounded-md" />
                      <div className="w-32 h-6 bg-slate-200 rounded-md" />
                    </div>
                  </div>

                  <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm rounded-lg shadow-sm border border-slate-200 px-4 py-2">
                    <div className="text-xs font-semibold text-slate-900">导航菜单</div>
                    <div className="flex gap-1.5 mt-1">
                      <div className="w-10 h-1.5 bg-slate-200 rounded" />
                      <div className="w-10 h-1.5 bg-slate-200 rounded" />
                      <div className="w-10 h-1.5 bg-slate-200 rounded" />
                    </div>
                  </div>
                </div>
              </AreaMarker>
            </div>
          </div>
        </div>

        <AnnotationPanel {...annotationProps} />

        <div className="fixed bottom-4 left-4 z-50 w-80 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg p-3">
          <h3 className="text-[11px] font-semibold text-slate-500 uppercase mb-2">回调日志</h3>
          {callbacks.length === 0 ? (
            <p className="text-[11px] text-slate-300">等待操作...</p>
          ) : (
            <div className="space-y-1">
              {callbacks.map((log, i) => (
                <p key={i} className="text-[11px] text-slate-600 font-mono border-b border-slate-50 pb-1">
                  {log}
                </p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}