import { cn } from '@/lib/utils'

interface ProgressBarProps {
  /** 0-100 percentage (alias: value) */
  progress?: number
  value?: number
  animated?: boolean
  color?: 'blue' | 'green' | 'yellow' | 'red' | 'purple'
  className?: string
}

const colorMap = {
  blue: 'bg-primary-600',
  green: 'bg-green-500',
  yellow: 'bg-amber-500',
  red: 'bg-red-500',
  purple: 'bg-purple-500',
}

export function ProgressBar({
  progress, value, animated = true, color = 'blue', className,
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, progress ?? value ?? 0))

  return (
    <div className={cn('w-full h-2.5 bg-slate-100 rounded-full overflow-hidden', className)}>
      <div
        className={cn('h-full rounded-full', colorMap[color], animated && 'transition-all duration-500')}
        style={{ width: `${pct}%` }}
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
      />
    </div>
  )
}

export default ProgressBar
