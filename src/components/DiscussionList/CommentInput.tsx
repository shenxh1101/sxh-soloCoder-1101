import { useState, useRef, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Send, Paperclip } from 'lucide-react'

interface CommentInputProps {
  onSubmit: (content: string, files: File[]) => void
  onCancel?: () => void
  placeholder?: string
  initialContent?: string
  autoFocus?: boolean
}

export function CommentInput({
  onSubmit,
  onCancel,
  placeholder = '输入评论内容...',
  initialContent = '',
  autoFocus = false,
}: CommentInputProps) {
  const [content, setContent] = useState(initialContent)
  const [files, setFiles] = useState<File[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleSubmit = () => {
    const trimmed = content.trim()
    if (!trimmed && files.length === 0) return
    onSubmit(trimmed, files)
    setContent('')
    setFiles([])
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = Array.from(e.target.files || [])
    setFiles((prev) => [...prev, ...selected])
  }

  return (
    <div className="space-y-2">
      <textarea
        ref={textareaRef}
        value={content}
        onChange={(e) => setContent(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        rows={2}
        className={cn(
          'w-full resize-none rounded-lg border border-slate-200 px-3 py-2',
          'text-[13px] text-slate-900 placeholder:text-slate-400',
          'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
          'transition-colors duration-150'
        )}
      />
      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((file, i) => (
            <div
              key={i}
              className="flex items-center gap-1.5 px-2 py-1 bg-slate-50 rounded-md text-xs text-slate-600"
            >
              <Paperclip className="w-3 h-3" />
              <span className="max-w-[120px] truncate">{file.name}</span>
              <button
                onClick={() => setFiles((prev) => prev.filter((_, j) => j !== i))}
                className="text-slate-400 hover:text-slate-600"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
      )}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            onChange={handleFileSelect}
            className="hidden"
          />
          <Button
            variant="ghost"
            size="sm"
            onClick={() => fileInputRef.current?.click()}
          >
            <Paperclip className="w-3.5 h-3.5" />
          </Button>
        </div>
        <div className="flex items-center gap-1.5">
          {onCancel && (
            <Button variant="ghost" size="sm" onClick={onCancel}>
              取消
            </Button>
          )}
          <Button
            variant="primary"
            size="sm"
            onClick={handleSubmit}
            disabled={!content.trim() && files.length === 0}
          >
            <Send className="w-3.5 h-3.5" />
            发表
          </Button>
        </div>
      </div>
    </div>
  )
}