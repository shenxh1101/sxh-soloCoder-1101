import { useState } from 'react'
import { Link } from 'react-router-dom'
import { AnnotationPanel } from '@/components/AnnotationPanel/AnnotationPanel'
import { TextSelectionComment } from '@/components/TextSelectionComment/TextSelectionComment'
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

const SAMPLE_TEXT = `第一章 引言

在当今信息化时代，软件系统的复杂性与日俱增。软件开发团队面临着如何高效协作、确保代码质量和快速响应需求变化的挑战。

协作批注系统作为一种重要的沟通工具，能够帮助团队成员在文档、设计稿和代码审查过程中进行精准的定点讨论。通过将评论与具体内容位置关联，团队成员可以快速定位问题、交换意见并跟踪解决方案。

传统文档协作工具通常需要频繁切换上下文，导致沟通效率低下。而嵌入式批注组件允许用户在浏览内容的同时直接发起讨论，极大地提升了协作体验。

第二章 核心概念

批注（Annotation）是协作批注系统的基本单元，它关联了评论、用户和内容位置三个核心要素。

每个批注可以包含多条评论（Comment），形成多层次的讨论线程。用户可以在特定文本范围或图片区域发起批注，其他成员可以回复、引用和评价。

批注的状态管理也是重要的一环。开发过程中的批注默认为"待处理"状态，当问题得到解决后可以标记为"已解决"，方便团队追踪未完成的工作项。

第三章 技术架构

本组件库采用 React + TypeScript 技术栈，使用 Zustand 进行状态管理。组件设计遵循"关注点分离"原则，将 UI 渲染、状态管理和业务回调解耦。

组件通过 Props 接收外部传入的用户信息和权限配置，内部维护批注的本地状态。所有增删改查操作均通过回调函数通知业务系统，保持数据的一致性。`;

export default function DocumentDemo() {
  const [callbacks, setCallbacks] = useState<string[]>([])

  const logCallback = (name: string, ...args: unknown[]) => {
    const log = `[${new Date().toLocaleTimeString()}] ${name}: ${JSON.stringify(args).slice(0, 100)}`
    setCallbacks((prev) => [log, ...prev].slice(0, 50))
  }

  const annotationProps = {
    currentUser: MOCK_USER,
    users: MOCK_USERS,
    targetType: 'document' as const,
    targetId: 'doc_demo_1',
    onAnnotationCreate: (ann: unknown) => logCallback('onAnnotationCreate', ann),
    onAnnotationUpdate: (ann: unknown) => logCallback('onAnnotationUpdate', ann),
    onAnnotationDelete: (id: string) => logCallback('onAnnotationDelete', id),
    onAnnotationResolve: (id: string) => logCallback('onAnnotationResolve', id),
    onAnnotationReopen: (id: string) => logCallback('onAnnotationReopen', id),
    onCommentAdd: (id: string, comment: unknown) => logCallback('onCommentAdd', id, comment),
    onCommentUpdate: (comment: unknown) => logCallback('onCommentUpdate', comment),
    onCommentDelete: (id: string) => logCallback('onCommentDelete', id),
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="sticky top-0 z-30 bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link to="/" className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="text-[15px] font-semibold text-slate-900">文档批注演示</h1>
          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">用户: {MOCK_USER.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <NotificationEntry {...annotationProps} />
          <div className="text-[11px] text-slate-400">
            选中文字可添加批注
          </div>
        </div>
      </header>

      <div className="flex">
        <div className="flex-1 min-w-0 pr-80">
          <div className="max-w-3xl mx-auto px-8 py-8">
            <TextSelectionComment {...annotationProps}>
              <div className="prose prose-slate max-w-none">
                {SAMPLE_TEXT.split('\n\n').map((paragraph, i) => {
                  if (paragraph.startsWith('第')) {
                    return (
                      <h2 key={i} className="text-xl font-bold text-slate-900 mt-8 mb-4">
                        {paragraph}
                      </h2>
                    )
                  }
                  return (
                    <p key={i} className="text-[15px] leading-7 text-slate-700 mb-4">
                      {paragraph}
                    </p>
                  )
                })}
              </div>
            </TextSelectionComment>
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