import type { Annotation, User } from '@/types'

function findUserName(userId: string, users: User[]): string {
  return users.find((u) => u.id === userId)?.name || userId
}

function formatAnnotationForExport(annotation: Annotation, users: User[]) {
  return {
    id: annotation.id,
    content: annotation.content,
    status: annotation.status === 'pending' ? '待处理' : '已解决',
    createdBy: findUserName(annotation.createdBy, users),
    createdAt: annotation.createdAt,
    assignee: annotation.assignee ? findUserName(annotation.assignee, users) : null,
    dueDate: annotation.dueDate || null,
    statusHistory: (annotation.statusHistory || []).map((r) => ({
      from: r.from === 'pending' ? '待处理' : '已解决',
      to: r.to === 'pending' ? '待处理' : '已解决',
      changedBy: findUserName(r.changedBy, users),
      changedAt: r.changedAt,
    })),
    comments: annotation.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdBy: findUserName(c.createdBy, users),
      createdAt: c.createdAt,
      parentId: c.parentId || null,
      parentComment: annotation.comments.find((p) => p.id === c.parentId)?.content || null,
      mentions: (c.mentions || []).map((m) => findUserName(m, users)),
      attachments: c.attachments.map((a) => ({ name: a.name, url: a.url })),
    })),
  }
}

export function exportAsJson(annotations: Annotation[], targetId: string, users: User[]) {
  const data = {
    targetId,
    exportedAt: new Date().toISOString(),
    annotations: annotations.map((a) => formatAnnotationForExport(a, users)),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  downloadBlob(blob, `annotations-${targetId}-${Date.now()}.json`)
}

export function exportAsCsv(annotations: Annotation[], targetId: string, users: User[]) {
  const rows: string[][] = [
    ['批注ID', '内容', '状态', '创建者', '处理人', '截止日', '创建时间', '评论数', '状态变更次数', '评论详情'],
  ]

  annotations.forEach((a) => {
    const commentDetails = a.comments
      .map((c, i) => {
        const parentInfo = c.parentId
          ? `(回复 #${a.comments.findIndex((p) => p.id === c.parentId) + 1}) `
          : ''
        const mentionInfo = c.mentions?.length
          ? ` @${c.mentions.map((m) => findUserName(m, users)).join(', ')}`
          : ''
        return `#${i + 1} ${parentInfo}${c.createdBy}: ${c.content.slice(0, 50)}${mentionInfo}`
      })
      .join(' | ')
    rows.push([
      a.id,
      a.content,
      a.status === 'pending' ? '待处理' : '已解决',
      findUserName(a.createdBy, users),
      a.assignee ? findUserName(a.assignee, users) : '',
      a.dueDate ? new Date(a.dueDate).toLocaleDateString('zh-CN') : '',
      a.createdAt,
      String(a.comments.length),
      String((a.statusHistory || []).length),
      commentDetails,
    ])
  })

  const csvContent = '\uFEFF' + rows.map((r) => r.map(escapeCsv).join(',')).join('\n')
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8' })
  downloadBlob(blob, `annotations-${targetId}-${Date.now()}.csv`)
}

function escapeCsv(value: string): string {
  if (value.includes(',') || value.includes('"') || value.includes('\n')) {
    return `"${value.replace(/"/g, '""')}"`
  }
  return value
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}