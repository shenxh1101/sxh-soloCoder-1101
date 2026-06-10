import type { Annotation } from '@/types'

function formatAnnotationForExport(annotation: Annotation) {
  return {
    id: annotation.id,
    content: annotation.content,
    status: annotation.status,
    createdBy: annotation.createdBy,
    createdAt: annotation.createdAt,
    comments: annotation.comments.map((c) => ({
      id: c.id,
      content: c.content,
      createdBy: c.createdBy,
      createdAt: c.createdAt,
      parentId: c.parentId || null,
      attachments: c.attachments.map((a) => a.name),
    })),
  }
}

export function exportAsJson(annotations: Annotation[], targetId: string) {
  const data = {
    targetId,
    exportedAt: new Date().toISOString(),
    annotations: annotations.map(formatAnnotationForExport),
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: 'application/json',
  })
  downloadBlob(blob, `annotations-${targetId}-${Date.now()}.json`)
}

export function exportAsCsv(annotations: Annotation[], targetId: string) {
  const rows: string[][] = [
    ['批注ID', '内容', '状态', '创建者', '创建时间', '评论数'],
  ]

  annotations.forEach((a) => {
    rows.push([
      a.id,
      a.content,
      a.status === 'pending' ? '待处理' : '已解决',
      a.createdBy,
      a.createdAt,
      String(a.comments.length),
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