import { useState, useRef, type KeyboardEvent } from 'react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Avatar } from '@/components/ui/Avatar'
import type { User } from '@/types'
import { Send, Paperclip } from 'lucide-react'

interface CommentInputProps {
  onSubmit: (content: string, files: File[], mentions: string[]) => void
  onCancel?: () => void
  placeholder?: string
  initialContent?: string
  autoFocus?: boolean
  canUpload?: boolean
  users?: User[]
}

function parseMentions(content: string, users: User[]): string[] {
  const matches = content.match(/@([\u4e00-\u9fa5a-zA-Z0-9_-]+)/g)
  if (!matches) return []
  const mentionedIds: string[] = []
  for (const match of matches) {
    const name = match.slice(1)
    const user = users.find((u) => u.name === name)
    if (user && !mentionedIds.includes(user.id)) {
      mentionedIds.push(user.id)
    }
  }
  return mentionedIds
}

export function CommentInput({
  onSubmit,
  onCancel,
  placeholder = '输入评论内容...',
  initialContent = '',
  autoFocus = false,
  canUpload = true,
  users = [],
}: CommentInputProps) {
  const [content, setContent] = useState(initialContent)
  const [files, setFiles] = useState<File[]>([])
  const [mentioning, setMentioning] = useState<{ start: number; query: string } | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  const handleContentChange = (value: string) => {
    setContent(value)

    const textarea = textareaRef.current
    if (!textarea) return

    const cursorPos = textarea.selectionStart
    const textBeforeCursor = value.slice(0, cursorPos)
    const atMatch = textBeforeCursor.match(/@([^\s@]*)$/)

    if (atMatch) {
      setMentioning({ start: cursorPos - atMatch[0].length, query: atMatch[1].toLowerCase() })
    } else {
      setMentioning(null)
    }
  }

  const insertMention = (user: User) => {
    if (!mentioning || !textareaRef.current) return

    const before = content.slice(0, mentioning.start)
    const after = content.slice(textareaRef.current.selectionStart)
    const mentionText = `@${user.name} `

    setContent(before + mentionText + after)
    setMentioning(null)

    setTimeout(() => {
      if (textareaRef.current) {
        const newPos = mentioning.start + mentionText.length
        textareaRef.current.focus()
        textareaRef.current.setSelectionRange(newPos, newPos)
      }
    }, 0)
  }

  const filteredUsers = mentioning
    ? users
        .filter((u) => u.name.toLowerCase().includes(mentioning.query) || !mentioning.query)
        .slice(0, 5)
    : []

  const handleSubmit = () => {
    const trimmed = content.trim()
    if (!trimmed && files.length === 0) return
    const mentionIds = parseMentions(content, users)
    onSubmit(trimmed, files, mentionIds)
    setContent('')
    setFiles([])
  }

  const handleKeyDown = (e: KeyboardEvent) => {
    if (mentioning && filteredUsers.length > 0) {
      if (e.key === 'Enter') {
        e.preventDefault()
        insertMention(filteredUsers[0])
        return
      }
      if (e.key === 'Escape') {
        setMentioning(null)
        return
      }
    }
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
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={content}
          onChange={(e) => handleContentChange(e.target.value)}
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
        {mentioning && users.length > 0 && (
          <div className="absolute left-0 bottom-full mb-1 w-48 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1 max-h-40 overflow-y-auto">
            {filteredUsers.length === 0 ? (
              <div className="px-3 py-2 text-[12px] text-slate-400">无匹配成员</div>
            ) : (
              filteredUsers.map((user) => (
                <button
                  key={user.id}
                  onClick={() => insertMention(user)}
                  className="w-full text-left flex items-center gap-2 px-3 py-1.5 hover:bg-slate-50 text-[13px] transition-colors"
                >
                  <Avatar user={user} size="sm" />
                  <span className="text-slate-700">{user.name}</span>
                </button>
              ))
            )}
          </div>
        )}
      </div>
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
          {canUpload && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => fileInputRef.current?.click()}
            >
              <Paperclip className="w-3.5 h-3.5" />
            </Button>
          )}
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