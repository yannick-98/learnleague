import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { useState } from 'react'
import { ArrowLeft, Users, Target, Clock, Star, ChevronDown, ChevronUp, Lightbulb, Download } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { analyticsApi, gamesApi, unwrapResponse } from '@/lib/api'
import { generateCSV, downloadCSV, downloadJSON, formatDateTime, getDifficultyLabel } from '@/lib/utils'
import type { GameAnalytics, RankingEntry, PlayerReport, QuestionAnalysis } from '@/types'

export default function Analytics() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const [expandedPlayer, setExpandedPlayer] = useState<number | null>(null)

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics', sessionId],
    queryFn: async () => {
      const param = sessionId || ''
      if (/^\d+$/.test(param)) {
        const res = await analyticsApi.getSession(Number(param))
        return unwrapResponse<GameAnalytics>(res)
      }
      const session = unwrapResponse<{ id: number }>(
        await gamesApi.getSessionByCode(param)
      )
      const res = await analyticsApi.getSession(session.id)
      return unwrapResponse<GameAnalytics>(res)
    },
    enabled: !!sessionId,
  })

  const handleExportCSV = () => {
    if (!analytics) return
    const headers = ['Posición', 'Alias', 'Puntuación', 'Correctas', 'Total', 'Tiempo promedio']
    const rows = analytics.ranking.map((r: RankingEntry) => [
      r.position, r.alias, r.score, r.correct_answers, r.total_answers,
      r.avg_response_time.toFixed(1),
    ])
    downloadCSV(generateCSV(headers, rows as (string | number)[][]), `ranking-${sessionId}.csv`)
  }

  const handleExportJSON = () => {
    if (!analytics) return
    downloadJSON(analytics, `analytics-${sessionId}.json`)
  }

  if (isLoading) return (
    <div className="flex justify-center py-20">
      <LoadingSpinner size="xl" text="Cargando analítica..." />
    </div>
  )

  if (!analytics) return (
    <div className="text-center py-20">
      <p className="text-slate-500">Analítica no disponible</p>
    </div>
  )

  const { summary, ranking, questions_analysis, recommendations, player_reports, activity_title, started_at } = analytics as GameAnalytics

  const statCards = [
    { label: 'Jugadores', value: summary.total_players, icon: <Users size={18} />, bg: 'bg-blue-100', text: 'text-blue-700' },
    { label: 'Puntuación media', value: Math.round(summary.avg_score).toLocaleString(), icon: <Star size={18} />, bg: 'bg-yellow-100', text: 'text-yellow-700' },
    { label: 'Precisión media', value: `${Math.round(summary.avg_accuracy)}%`, icon: <Target size={18} />, bg: 'bg-green-100', text: 'text-green-700' },
    { label: 'Tiempo promedio', value: `${summary.avg_response_time?.toFixed(1)}s`, icon: <Clock size={18} />, bg: 'bg-purple-100', text: 'text-purple-700' },
  ]

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="font-bold text-2xl text-slate-900">Analítica de la partida</h1>
            <p className="text-slate-500 text-sm">
              {activity_title} · {started_at ? formatDateTime(started_at) : 'Sin fecha'}
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <Download size={14} /> Exportar CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200 transition-colors"
          >
            <Download size={14} /> Exportar JSON
          </button>
        </div>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((s) => (
          <div key={s.label} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-3">
            <div className={`p-2.5 rounded-xl flex-shrink-0 ${s.bg}`}>
              <span className={s.text}>{s.icon}</span>
            </div>
            <div>
              <p className="font-bold text-slate-900 text-xl leading-none">{s.value}</p>
              <p className="text-slate-500 text-xs mt-0.5">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Ranking table */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Clasificación final</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                    <th className="px-4 py-3 text-left">#</th>
                    <th className="px-4 py-3 text-left">Jugador</th>
                    <th className="px-4 py-3 text-right">Puntos</th>
                    <th className="px-4 py-3 text-right">Correctas</th>
                    <th className="px-4 py-3 text-right">Tiempo</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {ranking.map((entry: RankingEntry) => (
                    <tr key={entry.alias} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3">
                        <span className={`font-bold ${entry.position <= 3 ? 'text-yellow-600' : 'text-slate-400'}`}>
                          #{entry.position}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{entry.avatar}</span>
                          <span className="font-medium text-slate-900">{entry.alias}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        {entry.score.toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className="text-green-700 font-medium">{entry.correct_answers}</span>
                        <span className="text-slate-400">/{entry.total_answers}</span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-500">
                        {entry.avg_response_time?.toFixed(1)}s
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Questions Analysis */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-100">
              <h2 className="font-semibold text-slate-900">Análisis por pregunta</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {(questions_analysis || []).map((qa: QuestionAnalysis, idx: number) => (
                <div key={qa.question_id} className="p-5">
                  <div className="flex items-start gap-3">
                    <span className="w-6 h-6 rounded-lg bg-slate-100 text-slate-600 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-slate-800 mb-2">{qa.text}</p>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          qa.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                          qa.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-red-100 text-red-700'
                        }`}>
                          {getDifficultyLabel(qa.difficulty)}
                        </span>
                        <span className="text-xs text-slate-500">{qa.avg_response_time?.toFixed(1)}s promedio</span>
                      </div>

                      <div className="mb-2">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-500">Aciertos</span>
                          <span className={`font-semibold ${qa.correct_percentage >= 60 ? 'text-green-700' : 'text-red-600'}`}>
                            {Math.round(qa.correct_percentage)}%
                          </span>
                        </div>
                        <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full ${qa.correct_percentage >= 60 ? 'bg-green-500' : 'bg-red-500'}`}
                            style={{ width: `${qa.correct_percentage}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Player reports accordion */}
          {player_reports?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-slate-100">
                <h2 className="font-semibold text-slate-900">Informes individuales</h2>
              </div>
              <div className="divide-y divide-slate-50">
                {player_reports.map((report: PlayerReport) => (
                  <div key={report.player_id}>
                    <button
                      onClick={() => setExpandedPlayer(expandedPlayer === report.player_id ? null : report.player_id)}
                      className="w-full flex items-center gap-3 px-5 py-4 hover:bg-slate-50 transition-colors text-left"
                    >
                      <span className="text-xl">{report.avatar}</span>
                      <div className="flex-1">
                        <p className="font-medium text-slate-900">{report.alias}</p>
                        <p className="text-sm text-slate-500">
                          #{report.position} · {report.score?.toLocaleString('es-ES')} puntos · {Math.round(report.accuracy)}% de precisión
                        </p>
                      </div>
                      {expandedPlayer === report.player_id ? <ChevronUp size={16} className="text-slate-400" /> : <ChevronDown size={16} className="text-slate-400" />}
                    </button>
                    {expandedPlayer === report.player_id && (
                      <div className="px-5 pb-4 bg-slate-50">
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-slate-500 text-xs">Respuestas correctas</p>
                            <p className="font-semibold text-slate-900">{report.correct_answers}/{report.total_answers}</p>
                          </div>
                          <div className="bg-white rounded-xl p-3">
                            <p className="text-slate-500 text-xs">Tiempo medio</p>
                            <p className="font-semibold text-slate-900">{report.avg_response_time?.toFixed(1)}s</p>
                          </div>
                          {report.strongest_topic && (
                            <div className="bg-green-50 rounded-xl p-3 col-span-2">
                              <p className="text-green-700 text-xs font-medium">Mejor tema</p>
                              <p className="font-semibold text-green-900">{report.strongest_topic}</p>
                            </div>
                          )}
                          {report.weakest_topic && (
                            <div className="bg-red-50 rounded-xl p-3 col-span-2">
                              <p className="text-red-700 text-xs font-medium">Tema a reforzar</p>
                              <p className="font-semibold text-red-900">{report.weakest_topic}</p>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          {recommendations?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb size={18} className="text-yellow-500" />
                <h2 className="font-semibold text-slate-900 text-sm">Recomendaciones</h2>
              </div>
              <ul className="space-y-3">
                {recommendations.map((rec: string, idx: number) => (
                  <li key={idx} className="flex items-start gap-2 text-sm text-slate-700 bg-yellow-50 rounded-xl p-3">
                    <span className="text-yellow-600 font-bold flex-shrink-0">{idx + 1}.</span>
                    <span>{rec}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {questions_analysis?.length > 0 && (
            <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5">
              <h2 className="font-semibold text-slate-900 mb-3 text-sm">Preguntas más difíciles</h2>
              <div className="space-y-2">
                {[...questions_analysis]
                  .sort((a, b) => a.correct_percentage - b.correct_percentage)
                  .slice(0, 3)
                  .map((qa, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2.5 bg-red-50 rounded-xl">
                      <span className="text-xs font-bold text-red-700 w-8 text-center">
                        {Math.round(qa.correct_percentage)}%
                      </span>
                      <p className="text-xs text-slate-700 flex-1 line-clamp-2">{qa.text}</p>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
