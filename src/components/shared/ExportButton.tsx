import { useState } from 'react'
import { Download, ChevronDown, FileText, Code } from 'lucide-react'
import { cn } from '@/lib/utils'

interface ExportButtonProps {
  onExportCSV?: () => void
  onExportJSON?: () => void
  label?: string
  className?: string
  disabled?: boolean
}

export function ExportButton({
  onExportCSV,
  onExportJSON,
  label = 'Exportar',
  className,
  disabled = false,
}: ExportButtonProps) {
  const [open, setOpen] = useState(false)

  if (onExportCSV && !onExportJSON) {
    return (
      <button
        onClick={onExportCSV}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
          'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed',
          className
        )}
      >
        <Download size={15} />
        {label}
      </button>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setOpen((v) => !v)}
        disabled={disabled}
        className={cn(
          'flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium',
          'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 transition-colors',
          disabled && 'opacity-50 cursor-not-allowed'
        )}
      >
        <Download size={15} />
        {label}
        <ChevronDown size={14} className={cn('transition-transform', open && 'rotate-180')} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute right-0 mt-1 w-48 bg-white rounded-xl shadow-lg border border-slate-200 py-1 z-20 animate-slide-up">
            {onExportCSV && (
              <button
                onClick={() => { onExportCSV(); setOpen(false) }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <FileText size={15} className="text-green-600" />
                Exportar CSV
              </button>
            )}
            {onExportJSON && (
              <button
                onClick={() => { onExportJSON(); setOpen(false) }}
                className="flex items-center gap-3 w-full px-4 py-2.5 text-sm text-slate-700 hover:bg-slate-50 transition-colors"
              >
                <Code size={15} className="text-blue-600" />
                Exportar JSON
              </button>
            )}
          </div>
        </>
      )}
    </div>
  )
}
