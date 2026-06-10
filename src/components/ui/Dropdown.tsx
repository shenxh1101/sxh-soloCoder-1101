import { useState, useRef, useEffect, type ReactNode } from 'react'
import { cn } from '@/lib/utils'
import { ChevronDown } from 'lucide-react'

interface DropdownOption {
  label: string
  value: string
}

interface DropdownProps {
  options: DropdownOption[]
  value?: string
  placeholder?: string
  onChange: (value: string) => void
  className?: string
  trigger?: ReactNode
}

export function Dropdown({
  options,
  value,
  placeholder = '请选择',
  onChange,
  className,
  trigger,
}: DropdownProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const selected = options.find((o) => o.value === value)

  return (
    <div ref={ref} className={cn('relative', className)}>
      {trigger ? (
        <div onClick={() => setOpen(!open)}>{trigger}</div>
      ) : (
        <button
          onClick={() => setOpen(!open)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded-md',
            'border border-slate-200 bg-white hover:bg-slate-50',
            'transition-colors duration-150'
          )}
        >
          <span className={selected ? 'text-slate-900' : 'text-slate-400'}>
            {selected?.label || placeholder}
          </span>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
        </button>
      )}
      {open && (
        <div className="absolute top-full left-0 mt-1 w-40 bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1">
          {options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => {
                onChange(opt.value)
                setOpen(false)
              }}
              className={cn(
                'w-full text-left px-3 py-1.5 text-[13px] hover:bg-slate-50 transition-colors',
                opt.value === value ? 'text-blue-600 bg-blue-50' : 'text-slate-700'
              )}
            >
              {opt.label}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}