import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

type BadgeVariant = 'default' | 'success' | 'error' | 'warning' | 'info' | 'purple'

interface BadgeProps {
  children: ReactNode
  variant?: BadgeVariant
  size?: 'sm' | 'md'
  className?: string
}

const variantClasses: Record<BadgeVariant, string> = {
  default: 'bg-slate-100 text-slate-600 border-slate-200',
  success: 'bg-green-100 text-green-700 border-green-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  warning: 'bg-amber-100 text-amber-700 border-amber-200',
  info: 'bg-blue-100 text-blue-700 border-blue-200',
  purple: 'bg-purple-100 text-purple-700 border-purple-200',
}

export function Badge({ children, variant = 'default', size = 'sm', className }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center font-medium border rounded-full whitespace-nowrap',
        size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm',
        variantClasses[variant],
        className
      )}
    >
      {children}
    </span>
  )
}

export default Badge

const difficultyMap: Record<string, BadgeVariant> = {
  easy: 'success',
  medio: 'success',
  medium: 'warning',
  hard: 'error',
  difícil: 'error',
}

export function DifficultyBadge({ difficulty }: { difficulty: string }) {
  const variant = difficultyMap[difficulty?.toLowerCase()] ?? 'default'
  const labels: Record<string, string> = {
    easy: 'Fácil', medio: 'Fácil', medium: 'Media', hard: 'Difícil', difícil: 'Difícil',
  }
  return <Badge variant={variant}>{labels[difficulty?.toLowerCase()] ?? difficulty}</Badge>
}

const statusMap: Record<string, BadgeVariant> = {
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  failed: 'error',
  draft: 'default',
  ready: 'success',
  played: 'purple',
  waiting: 'warning',
  active: 'success',
  finished: 'info',
}

export function StatusBadge({ status }: { status: string }) {
  const variant = statusMap[status?.toLowerCase()] ?? 'default'
  const labels: Record<string, string> = {
    pending: 'Pendiente', processing: 'Procesando', completed: 'Completado',
    failed: 'Error', draft: 'Borrador', ready: 'Lista', played: 'Jugada',
    waiting: 'Esperando', active: 'Activo', finished: 'Finalizado',
  }
  return <Badge variant={variant}>{labels[status?.toLowerCase()] ?? status}</Badge>
}
