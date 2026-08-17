import { useState, useEffect, useRef } from 'react'
import { cn } from '@/lib/utils'

interface TimerProps {
  duration: number
  onExpire?: () => void
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export default function Timer({ duration, onExpire, size = 'md', className }: TimerProps) {
  const [timeLeft, setTimeLeft] = useState(duration)
  const onExpireRef = useRef(onExpire)
  onExpireRef.current = onExpire

  useEffect(() => {
    setTimeLeft(duration)
  }, [duration])

  useEffect(() => {
    if (timeLeft <= 0) {
      onExpireRef.current?.()
      return
    }
    const id = setTimeout(() => setTimeLeft(t => t - 1), 1000)
    return () => clearTimeout(id)
  }, [timeLeft])

  const pct = duration > 0 ? (timeLeft / duration) * 100 : 0
  const isUrgent = pct <= 30

  const color = pct > 60 ? { stroke: '#22c55e', text: 'text-green-600' }
    : pct > 30 ? { stroke: '#f59e0b', text: 'text-amber-600' }
    : { stroke: '#ef4444', text: 'text-red-600' }

  const dims = { sm: { s: 52, sw: 5, fs: 'text-base' }, md: { s: 72, sw: 6, fs: 'text-2xl' }, lg: { s: 100, sw: 8, fs: 'text-4xl' } }
  const d = dims[size]
  const r = (d.s - d.sw) / 2
  const circ = r * 2 * Math.PI
  const offset = circ - (pct / 100) * circ

  return (
    <div
      className={cn('relative inline-flex items-center justify-center', isUrgent && 'animate-pulse', className)}
      style={{ width: d.s, height: d.s }}
      role="timer"
      aria-label={`${timeLeft} segundos restantes`}
    >
      <svg width={d.s} height={d.s} className="absolute inset-0 -rotate-90">
        <circle cx={d.s/2} cy={d.s/2} r={r} fill="none" stroke="#e2e8f0" strokeWidth={d.sw} />
        <circle
          cx={d.s/2} cy={d.s/2} r={r} fill="none"
          stroke={color.stroke} strokeWidth={d.sw}
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 0.9s linear, stroke 0.3s' }}
        />
      </svg>
      <span className={cn('font-bold tabular-nums relative z-10', d.fs, color.text)}>
        {timeLeft}
      </span>
    </div>
  )
}
