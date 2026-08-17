import { cn, getAvatarBg } from '@/lib/utils'

interface AvatarProps {
  emoji?: string
  alias?: string
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl'
  className?: string
}

const sizeMap = {
  xs: 'w-6 h-6 text-xs',
  sm: 'w-8 h-8 text-sm',
  md: 'w-10 h-10 text-base',
  lg: 'w-12 h-12 text-xl',
  xl: 'w-16 h-16 text-3xl',
  '2xl': 'w-24 h-24 text-5xl',
}

export function Avatar({ emoji, alias = '', size = 'md', className }: AvatarProps) {
  const bgColor = getAvatarBg(alias)

  return (
    <div
      className={cn(
        'rounded-full flex items-center justify-center flex-shrink-0 font-medium select-none',
        bgColor,
        sizeMap[size],
        className
      )}
      title={alias}
      aria-label={`Avatar de ${alias}`}
    >
      {emoji || alias[0]?.toUpperCase() || '?'}
    </div>
  )
}

interface AvatarGroupProps {
  players: { alias: string; avatar?: string }[]
  max?: number
  size?: AvatarProps['size']
}

export function AvatarGroup({ players, max = 5, size = 'sm' }: AvatarGroupProps) {
  const shown = players.slice(0, max)
  const extra = players.length - max

  return (
    <div className="flex -space-x-2">
      {shown.map((p, i) => (
        <div key={i} className="ring-2 ring-white rounded-full">
          <Avatar emoji={p.avatar} alias={p.alias} size={size} />
        </div>
      ))}
      {extra > 0 && (
        <div
          className={cn(
            'rounded-full bg-slate-200 text-slate-600 flex items-center justify-center ring-2 ring-white text-xs font-semibold',
            sizeMap[size]
          )}
        >
          +{extra}
        </div>
      )}
    </div>
  )
}
