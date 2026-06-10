import { Link } from 'react-router-dom'
import { FileText, Image, GraduationCap, ArrowRight } from 'lucide-react'

export default function HomePage() {
  const demos = [
    {
      title: '文档批注',
      description: '在文本文档中划词添加批注，支持评论回复、状态管理和导出',
      icon: FileText,
      path: '/demo/document',
      color: 'bg-blue-50 text-blue-600',
      hoverColor: 'hover:bg-blue-100',
    },
    {
      title: '设计稿批注',
      description: '在图片/设计稿上拖拽绘制区域标记，定点讨论评审意见',
      icon: Image,
      path: '/demo/design',
      color: 'bg-purple-50 text-purple-600',
      hoverColor: 'hover:bg-purple-100',
    },
    {
      title: '课程平台批注',
      description: '嵌入课程学习页面，支持师生对课件内容进行协作批注',
      icon: GraduationCap,
      path: '/demo/course',
      color: 'bg-emerald-50 text-emerald-600',
      hoverColor: 'hover:bg-emerald-100',
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-blue-50">
      <div className="max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium mb-6">
            AnnotationKit v1.0
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4 tracking-tight">
            在线协作批注组件库
          </h1>
          <p className="text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
            一套可嵌入文档预览、设计稿评审和课程学习平台的通用批注组件。
            提供批注面板、划词评论、区域标记、讨论列表和通知入口五类能力。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {demos.map((demo) => (
            <Link
              key={demo.path}
              to={demo.path}
              className={`group block p-6 rounded-xl bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-200 ${demo.hoverColor}`}
            >
              <div className={`w-12 h-12 rounded-lg ${demo.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-200`}>
                <demo.icon className="w-6 h-6" />
              </div>
              <h2 className="text-lg font-semibold text-slate-900 mb-2 flex items-center gap-2">
                {demo.title}
                <ArrowRight className="w-4 h-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
              </h2>
              <p className="text-sm text-slate-500 leading-relaxed">{demo.description}</p>
            </Link>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">组件能力</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                批注面板 — 筛选、排序、定位、导出
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                划词评论 — 文本选中添加批注
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                区域标记 — 图片/设计稿定点标记
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                讨论列表 — 评论回复、引用、状态流转
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-red-400" />
                通知入口 — 未读角标、消息汇总
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-xl border border-slate-200 p-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">接入方式</h3>
            <div className="bg-slate-900 rounded-lg p-4 text-xs text-slate-300 font-mono">
              <p className="text-blue-400">import</p>
              <p>{'{ AnnotationPanel, TextSelectionComment, AreaMarker, DiscussionList, NotificationEntry }'} <span className="text-blue-400">from</span> <span className="text-emerald-400">'@annotation-kit/react'</span></p>
              <br />
              <p className="text-slate-500">{'// 传入用户信息、权限和回调，组件内部完成批注的全生命周期管理'}</p>
              <p className="text-slate-500">{'// 通过 onAnnotationCreate 等回调将操作对接业务系统'}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}