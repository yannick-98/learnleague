import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Trophy, BarChart2, RotateCcw } from 'lucide-react'
import { gamesApi, unwrapResponse } from '../../lib/api'
import type { RankingEntry } from '../../types'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { useAuthStore } from '../../stores/authStore'

const POSITION_STYLES: Record<number, string> = {
  1: 'text-yellow-500 bg-yellow-50 border-yellow-200 scale-110',
  2: 'text-slate-500 bg-slate-50 border-slate-200',
  3: 'text-orange-400 bg-orange-50 border-orange-200',
}

const MEDALS: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' }

export default function FinalRanking() {
  const { code } = useParams()
  const navigate = useNavigate()
  const { isAuthenticated } = useAuthStore()

  // Find session by code
  const { data: session } = useQuery({
    queryKey: ['session-by-code', code],
    queryFn: () => gamesApi.getSessionByCode(code || '').then(r => unwrapResponse(r)),
    enabled: !!code,
    retry: false,
  })

  const { data: rankingData, isLoading } = useQuery({
    queryKey: ['ranking', session?.id],
    queryFn: () => gamesApi.getRanking(session!.id).then(r => unwrapResponse(r)),
    enabled: !!session?.id,
  })

  const ranking = rankingData?.ranking || []
  const top3 = ranking.slice(0, 3)
  const rest = ranking.slice(3)

  if (isLoading) return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-purple-900 flex items-center justify-center">
      <LoadingSpinner size="lg" text="Cargando ranking..." className="text-white" />
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-900 to-purple-900 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Trophy className="w-16 h-16 text-yellow-400 mx-auto mb-3" />
          <h1 className="text-4xl font-black text-white">¡Ranking Final!</h1>
          <p className="text-primary-200 mt-2">{session?.activity_title}</p>
        </div>

        {/* Podium */}
        {top3.length > 0 && (
          <div className="flex items-end justify-center gap-3 mb-8">
            {/* 2nd */}
            {top3[1] && (
              <div className="text-center">
                <div className="text-3xl mb-2">{top3[1].avatar}</div>
                <div className="bg-white/20 rounded-t-2xl px-4 pt-4 pb-2" style={{ height: '120px' }}>
                  <p className="text-white font-bold text-sm truncate">{top3[1].alias}</p>
                  <p className="text-primary-200 font-bold">{top3[1].score}</p>
                  <span className="text-2xl">🥈</span>
                </div>
              </div>
            )}
            {/* 1st */}
            {top3[0] && (
              <div className="text-center">
                <div className="text-4xl mb-2 animate-bounce">{top3[0].avatar}</div>
                <div className="bg-yellow-400/30 rounded-t-2xl px-6 pt-4 pb-2" style={{ height: '160px' }}>
                  <p className="text-white font-bold truncate">{top3[0].alias}</p>
                  <p className="text-yellow-200 font-black text-xl">{top3[0].score}</p>
                  <span className="text-3xl">🥇</span>
                </div>
              </div>
            )}
            {/* 3rd */}
            {top3[2] && (
              <div className="text-center">
                <div className="text-3xl mb-2">{top3[2].avatar}</div>
                <div className="bg-white/10 rounded-t-2xl px-4 pt-4 pb-2" style={{ height: '100px' }}>
                  <p className="text-white font-bold text-sm truncate">{top3[2].alias}</p>
                  <p className="text-primary-200 font-bold">{top3[2].score}</p>
                  <span className="text-2xl">🥉</span>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Full ranking */}
        <Card className="mb-6">
          <h2 className="font-bold text-slate-900 mb-4">Clasificación completa</h2>
          <div className="space-y-2">
            {ranking.map((entry: RankingEntry) => (
              <div
                key={entry.position}
                className={`flex items-center gap-3 p-3 rounded-xl border-2 transition-all ${
                  POSITION_STYLES[entry.position] || 'bg-white border-slate-100'
                }`}
              >
                <span className="w-8 text-center font-black text-lg">
                  {MEDALS[entry.position] || `#${entry.position}`}
                </span>
                <span className="text-2xl">{entry.avatar}</span>
                <div className="flex-1">
                  <p className="font-bold text-slate-900">{entry.alias}</p>
                  <p className="text-xs text-slate-500">
                    {entry.correct_answers}/{entry.total_answers} correctas · {entry.avg_response_time}s de media
                  </p>
                </div>
                <span className="font-black text-lg text-slate-800">{entry.score}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* Actions (teacher only) */}
        {isAuthenticated && (
          <div className="flex gap-3 justify-center">
            <Button variant="outline" onClick={() => navigate('/dashboard')} className="gap-2">
              <RotateCcw className="w-4 h-4" />
              Panel
            </Button>
            {session?.id && (
              <Button onClick={() => navigate(`/analytics/${session.id}`)} className="gap-2">
                <BarChart2 className="w-4 h-4" />
                Ver analítica completa
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
