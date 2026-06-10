import { cn } from '@/lib/utils'

interface BadgeProps {
  count?: number
  variant?: 'red' | 'blue' | 'amber' | 'green'
  className?: string
}

const variantMap = {
  red: 'bg-red-500',
  blue: 'bg-blue-500',
  amber: 'bg-amber-500',
  green: 'bg-green-500',
}

export function Badge({ count, variant = 'red', className }: BadgeProps) {
  if (count === undefined || count === 0) return null

  return (
    <span
      className={cn(
        'inline-flex items-center justify-center min-w-[18px] h-[18px]',
        'rounded-full px-1 text-[11px] font-semibold text-white leading-none',
        variantMap[variant],
        className
      )}
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}