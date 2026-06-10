import { cn } from '@/lib/utils'
import { Dropdown } from '@/components/ui/Dropdown'
import { Button } from '@/components/ui/Button'
import type { AnnotationStatus, User } from '@/types'
import { Search, X, Clock } from 'lucide-react'
import { useState } from 'react'

interface FilterBarProps {
  users: User[]
  filterStatus: AnnotationStatus | 'all'
  filterUserIds: string[]
  filterAssignee: string | 'all'
  filterOverdue: boolean
  onStatusChange: (status: AnnotationStatus | 'all') => void
  onUserChange: (userIds: string[]) => void
  onAssigneeChange: (assignee: string | 'all') => void
  onOverdueChange: (overdue: boolean) => void
  onSearch: (keyword: string) => void
}

const STATUS_OPTIONS = [
  { label: '全部状态', value: 'all' },
  { label: '待处理', value: 'pending' },
  { label: '已解决', value: 'resolved' },
]

export function FilterBar({
  users,
  filterStatus,
  filterUserIds,
  filterAssignee,
  filterOverdue,
  onStatusChange,
  onUserChange,
  onAssigneeChange,
  onOverdueChange,
  onSearch,
}: FilterBarProps) {
  const [searchValue, setSearchValue] = useState('')

  const handleSearch = (value: string) => {
    setSearchValue(value)
    onSearch(value)
  }

  const assigneeOptions = [
    { label: '全部处理人', value: 'all' },
    ...users.map((u) => ({ label: u.name, value: u.id })),
  ]

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Dropdown
          options={STATUS_OPTIONS}
          value={filterStatus}
          onChange={onStatusChange}
        />
        <Dropdown
          options={assigneeOptions}
          value={filterAssignee}
          placeholder="处理人"
          onChange={onAssigneeChange}
        />
        <button
          onClick={() => onOverdueChange(!filterOverdue)}
          className={cn(
            'flex items-center gap-1.5 px-3 py-1.5 text-[13px] rounded-md border transition-colors',
            filterOverdue
              ? 'bg-red-50 border-red-200 text-red-700'
              : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-600'
          )}
        >
          <Clock className="w-3.5 h-3.5" />
          逾期
        </button>
        <div className="relative flex-1">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            value={searchValue}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="搜索批注..."
            className={cn(
              'w-full pl-8 pr-2 py-1.5 text-[13px] rounded-md',
              'border border-slate-200 bg-white',
              'focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-400',
              'placeholder:text-slate-400'
            )}
          />
          {searchValue && (
            <button
              onClick={() => handleSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>
      {users.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {users.map((user) => {
            const isActive = filterUserIds.includes(user.id)
            return (
              <button
                key={user.id}
                onClick={() => {
                  const next = isActive
                    ? filterUserIds.filter((id) => id !== user.id)
                    : [...filterUserIds, user.id]
                  onUserChange(next)
                }}
                className={cn(
                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] transition-colors',
                  isActive
                    ? 'bg-blue-100 text-blue-700'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                )}
              >
                {user.name}
              </button>
            )
          })}
          {filterUserIds.length > 0 && (
            <Button variant="ghost" size="sm" onClick={() => onUserChange([])}>
              <X className="w-3 h-3" />
              清除
            </Button>
          )}
        </div>
      )}
    </div>
  )
}