import { cn } from '@/lib/utils'

interface RankingEntry {
  position: number
  player_id?: number
  alias: string
  avatar: string
  score: number
  correct_answers: number
  total_answers: number
  avg_response_time?: number
}

interface RankingCardProps {
  entry: RankingEntry
  compact?: boolean
  isMe?: boolean
  className?: string
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function RankingCard({ entry, compact, isMe, className }: RankingCardProps) {
  const medal = MEDALS[entry.position]

  if (compact) {
    return (
      <div className={cn(
        'flex items-center gap-2 py-1.5 px-2 rounded-lg',
        isMe ? 'bg-yellow-50' : '',
        className
      )}>
        <span className="text-sm font-bold text-slate-500 w-5">
          {medal || `#${entry.position}`}
        </span>
        <span className="text-lg">{entry.avatar}</span>
        <span className={cn('flex-1 text-sm font-medium truncate', isMe ? 'text-yellow-700' : 'text-slate-900')}>
          {entry.alias}
        </span>
        <span className="font-bold text-primary-700 text-sm">{entry.score}</span>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex items-center gap-3 p-3 rounded-xl border-2 transition-all',
      entry.position === 1 ? 'border-yellow-300 bg-yellow-50' :
      entry.position === 2 ? 'border-slate-300 bg-slate-50' :
      entry.position === 3 ? 'border-orange-200 bg-orange-50' :
      'border-transparent bg-white hover:bg-slate-50',
      isMe ? 'ring-2 ring-primary-400' : '',
      className
    )}>
      <span className="text-2xl w-8 text-center flex-shrink-0">
        {medal || <span className="text-sm font-bold text-slate-500">#{entry.position}</span>}
      </span>
      <span className="text-2xl flex-shrink-0">{entry.avatar}</span>
      <div className="flex-1 min-w-0">
        <p className="font-bold text-slate-900 truncate">{entry.alias}</p>
        <p className="text-xs text-slate-500">
          {entry.correct_answers}/{entry.total_answers} correctas · {entry.avg_response_time?.toFixed(1)}s
        </p>
      </div>
      <span className={cn('font-black text-xl', entry.position === 1 ? 'text-yellow-600' : 'text-slate-800')}>
        {entry.score}
      </span>
    </div>
  )
}
