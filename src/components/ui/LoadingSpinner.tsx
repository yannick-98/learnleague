import { cn } from '@/lib/utils'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg' | 'xl'
  text?: string
  color?: 'default' | 'white'
  className?: string
}

const sizeMap = {
  sm: 'w-4 h-4 border-2',
  md: 'w-6 h-6 border-[3px]',
  lg: 'w-10 h-10 border-4',
  xl: 'w-14 h-14 border-4',
}

export function LoadingSpinner({ size = 'md', text, color = 'default', className }: LoadingSpinnerProps) {
  const trackColor = color === 'white' ? 'border-white/20 border-t-white' : 'border-slate-200 border-t-primary-600'
  return (
    <div className={cn('flex flex-col items-center justify-center gap-3', className)}>
      <div className={cn('rounded-full animate-spin', sizeMap[size], trackColor)} />
      {text && (
        <p className={cn('text-sm', color === 'white' ? 'text-white/70' : 'text-slate-500')}>
          {text}
        </p>
      )}
    </div>
  )
}

export default LoadingSpinner

export function PageLoader({ text }: { text?: string }) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white z-50">
      <LoadingSpinner size="lg" text={text ?? 'Cargando...'} />
    </div>
  )
}

