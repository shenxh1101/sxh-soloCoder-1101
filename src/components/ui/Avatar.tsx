import { cn } from '@/lib/utils'
import type { User } from '@/types'

interface AvatarProps {
  user: Pick<User, 'name' | 'avatar'>
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  sm: 'w-6 h-6 text-[10px]',
  md: 'w-8 h-8 text-xs',
  lg: 'w-10 h-10 text-sm',
}

export function Avatar({ user, size = 'md', className }: AvatarProps) {
  if (user.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.name}
        className={cn('rounded-full object-cover flex-shrink-0', sizeMap[size], className)}
      />
    )
  }

  const initials = user.name
    .split(/\s+/)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center font-semibold flex-shrink-0',
        'bg-blue-100 text-blue-700',
        sizeMap[size],
        className
      )}
    >
      {initials}
    </div>
  )
}