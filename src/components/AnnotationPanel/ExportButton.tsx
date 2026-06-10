import { Button } from '@/components/ui/Button'
import { Dropdown } from '@/components/ui/Dropdown'
import { Download } from 'lucide-react'

interface ExportButtonProps {
  onExport: (format: 'json' | 'csv') => void
  disabled?: boolean
}

const FORMAT_OPTIONS = [
  { label: 'JSON 格式', value: 'json' },
  { label: 'CSV 格式', value: 'csv' },
]

export function ExportButton({ onExport, disabled }: ExportButtonProps) {
  return (
    <Dropdown
      options={FORMAT_OPTIONS}
      onChange={(value) => onExport(value as 'json' | 'csv')}
      trigger={
        <Button variant="outline" size="sm" disabled={disabled}>
          <Download className="w-3.5 h-3.5" />
          导出
        </Button>
      }
    />
  )
}