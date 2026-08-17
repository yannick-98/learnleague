import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { Play, ChevronRight, Users, BarChart2, Trophy, StopCircle } from 'lucide-react'
import { useTeacherGame } from '@/hooks/useGame'
import { useGameStore } from '@/stores/gameStore'
import { useAuthStore } from '@/stores/authStore'
import { gamesApi, unwrapResponse } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import Button from '@/components/ui/Button'
import Timer from '@/components/game/Timer'
import PlayerList from '@/components/game/PlayerList'
import RankingCard from '@/components/game/RankingCard'
import { QRCodeDisplay } from '@/components/shared/QRCodeDisplay'

const OPTION_LABELS = ['A', 'B', 'C', 'D'] as const
const OPTION_KEYS = ['option_a', 'option_b', 'option_c', 'option_d'] as const
const OPTION_COLORS: Record<string, string> = {
  A: 'bg-blue-500',
  B: 'bg-emerald-500',
  C: 'bg-orange-500',
  D: 'bg-purple-500',
}
const CORRECT_COLOR = 'bg-green-500 ring-4 ring-white/50'
const WRONG_COLOR = 'opacity-40'

export default function TeacherGame() {
  const { sessionId } = useParams<{ sessionId: string }>()
  const navigate = useNavigate()
  const { accessToken } = useAuthStore()

  const { data: session, isLoading } = useQuery({
    queryKey: ['session', sessionId],
    queryFn: () => gamesApi.getSession(Number(sessionId)).then((r) => unwrapResponse(r)),
  })

  const gameStore = useGameStore()
  const { nextQuestion, endQuestion, startGame, finishGame, setSession } = useTeacherGame(
    session?.code || '',
    accessToken || ''
  )

  useEffect(() => {
    if (session) setSession(session)
  }, [session, setSession])

  useEffect(() => () => { gameStore.reset() }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900">
        <LoadingSpinner size="xl" color="white" text="Preparando la sala..." />
      </div>
    )
  }

  if (!session) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-900 text-white">
        <p>Sesión no encontrada</p>
      </div>
    )
  }

  const {
    gameStatus, players, currentQuestion, timeLeft, answersReceived,
    totalPlayers, partialRanking, correctOption, explanation,
  } = gameStore

  const joinUrl = `${window.location.origin}/join/${session.code}`
  const activityInfo = (session as any).activity_info ?? session.activity
  const timePerQ = activityInfo?.time_per_question ?? 20
  const activePlayers = totalPlayers || players.length

  return (
    <div className="min-h-screen bg-slate-900 text-white flex flex-col">
      {/* Top bar */}
      <header className="bg-slate-800 border-b border-slate-700 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <BarChart2 size={16} />
          </div>
          <div>
            <p className="font-semibold text-sm">{activityInfo?.title || 'Partida en curso'}</p>
            <p className="text-xs text-slate-400 flex items-center gap-1">
              <Users size={11} /> {activePlayers} jugadores
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-2xl font-black tracking-widest text-indigo-300">{session.code}</div>
          {(gameStatus === 'active' || gameStatus === 'question_ended') && (
            <button
              onClick={finishGame}
              className="flex items-center gap-1.5 text-sm text-red-400 hover:text-red-300 px-3 py-1.5 rounded-lg border border-red-800/50 hover:bg-red-900/30 transition-colors"
            >
              <StopCircle size={14} /> Finalizar
            </button>
          )}
        </div>
      </header>

      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-6 space-y-6">

        {/* ─── WAITING ROOM ─── */}
        {gameStatus === 'waiting' && (
          <div className="space-y-6">
            <div className="text-center">
              <p className="text-slate-400 text-xs uppercase tracking-widest mb-3">Código de partida</p>
              <div className="font-black text-8xl md:text-9xl tracking-widest text-white mb-4 bg-slate-800 rounded-3xl py-8 px-12 inline-block">
                {session.code}
              </div>
              <p className="text-slate-400 text-sm">
                Entra en <span className="text-indigo-300 font-semibold">{window.location.host}/join</span> e introduce el código
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-800 rounded-2xl p-6 flex flex-col items-center gap-4">
                <p className="font-semibold text-slate-300 text-sm">Escanea para unirte</p>
                <QRCodeDisplay value={joinUrl} size={180} showUrl={false} />
                <p className="text-xs text-slate-500 break-all text-center">{joinUrl}</p>
              </div>

              <div className="bg-slate-800 rounded-2xl p-6">
                <div className="flex items-center justify-between mb-4">
                  <p className="font-semibold text-slate-300 text-sm">Jugadores conectados</p>
                  <span className="bg-emerald-500/20 text-emerald-400 text-sm font-bold px-3 py-1 rounded-full">
                    {players.length}
                  </span>
                </div>
                <PlayerList players={players.map(p => ({ alias: p.alias, avatar: p.avatar, id: p.id }))} />
                {players.length === 0 && (
                  <p className="text-slate-500 text-sm text-center py-8">
                    Esperando jugadores...
                  </p>
                )}
              </div>
            </div>

            <div className="flex justify-center">
              <button
                onClick={startGame}
                disabled={players.length === 0}
                className="flex items-center gap-3 px-12 py-4 bg-lime-500 hover:bg-lime-400 disabled:bg-slate-700 disabled:text-slate-500 text-slate-900 font-black text-lg rounded-2xl transition-all shadow-2xl disabled:cursor-not-allowed"
              >
                <Play size={22} />
                {players.length === 0 ? 'Esperando jugadores...' : `Iniciar (${players.length} jugadores)`}
              </button>
            </div>
          </div>
        )}

        {/* ─── ACTIVE QUESTION ─── */}
        {(gameStatus === 'active' || gameStatus === 'question_ended') && currentQuestion && (
          <div className="space-y-5">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="text-slate-400 text-xs uppercase tracking-widest">Pregunta</p>
                <p className="font-black text-3xl text-white">
                  {currentQuestion.question_index + 1}
                  <span className="text-slate-500 text-xl"> / {currentQuestion.total_questions}</span>
                </p>
              </div>

              <Timer
                key={currentQuestion.question_index}
                duration={timePerQ}
                size="lg"
                onExpire={endQuestion}
              />

              <div className="text-right">
                <p className="text-slate-400 text-xs mb-0.5">Respuestas</p>
                <p className="font-black text-2xl text-emerald-400">
                  {answersReceived}<span className="text-slate-500 text-lg">/{activePlayers}</span>
                </p>
              </div>
            </div>

            {/* Question text */}
            <div className="bg-slate-800 rounded-2xl p-6 text-center">
              <p className="text-white text-xl font-bold leading-relaxed">
                {currentQuestion.question.text}
              </p>
              {currentQuestion.question.topic && (
                <span className="mt-3 inline-block text-xs text-slate-400 bg-slate-700 px-3 py-1 rounded-full">
                  {currentQuestion.question.topic}
                </span>
              )}
            </div>

            {/* Answers */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {OPTION_LABELS.map((opt, i) => {
                const key = OPTION_KEYS[i]
                const text = currentQuestion.question[key as keyof typeof currentQuestion.question] as string
                const isCorrect = gameStatus === 'question_ended' && correctOption === opt
                const isWrong = gameStatus === 'question_ended' && correctOption !== opt

                return (
                  <div
                    key={opt}
                    className={`flex items-center gap-3 px-5 py-4 rounded-2xl text-white font-bold transition-all ${
                      isCorrect ? CORRECT_COLOR : isWrong ? `${OPTION_COLORS[opt]} ${WRONG_COLOR}` : OPTION_COLORS[opt]
                    }`}
                  >
                    <span className="w-9 h-9 rounded-full bg-black/20 flex items-center justify-center font-black text-lg flex-shrink-0">
                      {opt}
                    </span>
                    <span className="text-sm leading-tight">{text}</span>
                    {isCorrect && <span className="ml-auto text-xl">✓</span>}
                  </div>
                )
              })}
            </div>

            {/* Explanation */}
            {gameStatus === 'question_ended' && explanation && (
              <div className="bg-blue-900/30 border border-blue-700/50 rounded-2xl p-4">
                <p className="text-xs text-blue-400 font-semibold uppercase tracking-wider mb-1">Explicación</p>
                <p className="text-slate-200 text-sm">{explanation}</p>
              </div>
            )}

            {/* Partial ranking */}
            {gameStatus === 'question_ended' && partialRanking.length > 0 && (
              <div className="bg-slate-800 rounded-2xl p-5">
                <div className="flex items-center gap-2 mb-3">
                  <Trophy size={16} className="text-yellow-400" />
                  <p className="font-semibold text-slate-300 text-sm">Ranking parcial</p>
                </div>
                <div className="space-y-2">
                  {partialRanking.slice(0, 5).map((entry) => (
                    <RankingCard key={entry.alias} entry={entry} compact />
                  ))}
                </div>
              </div>
            )}

            {/* Actions */}
            {gameStatus === 'active' && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={endQuestion}
                  className="flex items-center gap-2 px-10 py-3.5 bg-slate-600 hover:bg-slate-500 text-white font-bold text-base rounded-2xl transition-all"
                >
                  Ver respuestas <ChevronRight size={18} />
                </button>
              </div>
            )}

            {gameStatus === 'question_ended' && (
              <div className="flex justify-center pt-2">
                {currentQuestion.question_index + 1 < currentQuestion.total_questions ? (
                  <button
                    onClick={nextQuestion}
                    className="flex items-center gap-2 px-10 py-3.5 bg-lime-500 hover:bg-lime-400 text-slate-900 font-black text-base rounded-2xl transition-all shadow-xl"
                  >
                    Siguiente pregunta <ChevronRight size={18} />
                  </button>
                ) : (
                  <button
                    onClick={finishGame}
                    className="flex items-center gap-2 px-10 py-3.5 bg-yellow-400 hover:bg-yellow-300 text-slate-900 font-black text-base rounded-2xl transition-all shadow-xl"
                  >
                    <Trophy size={18} /> Ver resultados finales
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {/* ─── FINISHED ─── */}
        {gameStatus === 'finished' && (
          <div className="text-center py-20 space-y-6">
            <div className="text-6xl">🏆</div>
            <h2 className="font-black text-4xl">¡Partida finalizada!</h2>
            <button
              onClick={() => navigate(`/analytics/${session.id}`)}
              className="flex items-center gap-2 px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl transition-colors mx-auto"
            >
              <BarChart2 size={18} /> Ver analítica completa
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
