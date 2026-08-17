import type { HTMLAttributes, ReactNode } from 'react'
import React from 'react'
import { cn } from '@/lib/utils'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
  padding?: 'none' | 'sm' | 'md' | 'lg'
}

const paddingMap = { none: '', sm: 'p-4', md: 'p-5', lg: 'p-8' }

function Card({ children, padding = 'md', className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        'bg-white rounded-2xl shadow-sm border border-slate-100',
        paddingMap[padding],
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export { Card }
export default Card

interface CardHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, action, className }: CardHeaderProps) {
  return (
    <div className={cn('flex items-start justify-between mb-4', className)}>
      <div>
        <h3 className="text-base font-semibold text-slate-900">{title}</h3>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action && <div className="ml-4">{action}</div>}
    </div>
  )
}

interface StatCardProps {
  label: string
  value: string | number
  icon?: React.ReactNode
  color?: string
  trend?: string
  trendUp?: boolean
  className?: string
}

export function StatCard({ label, value, icon, color = 'bg-primary-500', trend, trendUp, className }: StatCardProps) {
  return (
    <Card className={cn('flex items-center gap-4', className)}>
      {icon && (
        <div className={cn('p-3 rounded-xl flex-shrink-0', color)}>
          <div className="text-white">{icon}</div>
        </div>
      )}
      <div className="min-w-0 flex-1">
        <p className="text-sm text-slate-500 truncate">{label}</p>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        {trend && (
          <p className={cn('text-xs mt-0.5', trendUp ? 'text-green-600' : 'text-slate-400')}>
            {trend}
          </p>
        )}
      </div>
    </Card>
  )
}
