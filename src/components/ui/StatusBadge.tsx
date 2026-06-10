import { cn } from '@/lib/utils'

interface StatusBadgeProps {
  status: 'pending' | 'resolved'
  onClick?: () => void
  clickable?: boolean
}

const config = {
  pending: {
    label: '待处理',
    bg: 'bg-amber-50',
    text: 'text-amber-700',
    border: 'border-amber-200',
  },
  resolved: {
    label: '已解决',
    bg: 'bg-emerald-50',
    text: 'text-emerald-700',
    border: 'border-emerald-200',
  },
}

export function StatusBadge({ status, onClick, clickable = true }: StatusBadgeProps) {
  const { label, bg, text, border } = config[status]

  const Component = clickable && onClick ? 'button' : 'span'

  return (
    <Component
      onClick={onClick}
      className={cn(
        'inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-medium border',
        bg,
        text,
        border,
        clickable && onClick && 'cursor-pointer hover:opacity-80 transition-opacity'
      )}
    >
      <span className={cn('w-1.5 h-1.5 rounded-full mr-1.5', status === 'pending' ? 'bg-amber-500' : 'bg-emerald-500')} />
      {label}
    </Component>
  )
}