import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation } from '@tanstack/react-query'
import { ArrowLeft, Play, Users, Clock, BookOpen } from 'lucide-react'
import toast from 'react-hot-toast'
import Button from '@/components/ui/Button'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { activitiesApi, gamesApi, classesApi, unwrapResponse, unwrapListResponse } from '@/lib/api'
import { getDifficultyLabel } from '@/lib/utils'
import type { Question } from '@/types'

export default function GameLaunch() {
  const { id } = useParams<{ id: string }>()
  const activityId = Number(id)
  const navigate = useNavigate()
  const [timePerQuestion, setTimePerQuestion] = useState(20)
  const [selectedClass, setSelectedClass] = useState('')

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => activitiesApi.get(activityId).then((r) => unwrapResponse(r)),
  })

  const { data: classes = [] } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list().then((r) => unwrapListResponse(r)),
  })

  const launchMutation = useMutation({
    mutationFn: () =>
      // Backend expects { activity_id } — classroom is taken from the activity itself
      gamesApi.createSession({ activity_id: activityId }),
    onSuccess: (res) => {
      toast.success('¡Partida creada! Comparte el código con tus alumnos.')
      const session = unwrapResponse<{ id: number }>(res)
      navigate(`/game/${session.id}/control`)
    },
    onError: () => toast.error('Error al crear la partida'),
  })

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <LoadingSpinner size="xl" text="Cargando actividad..." />
      </div>
    )
  }

  if (!activity) {
    return (
      <div className="text-center py-20">
        <p className="text-slate-500">Actividad no encontrada</p>
      </div>
    )
  }

  const questions = (activity.questions ?? []) as Question[]
  const difficultyMap: Record<string, number> = {}
  questions.forEach(q => { difficultyMap[q.difficulty] = (difficultyMap[q.difficulty] || 0) + 1 })

  return (
    <div className="max-w-2xl">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate(-1)}
          className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Volver"
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className="font-bold text-2xl text-slate-900">Lanzar partida</h1>
          <p className="text-slate-500 text-sm">Configura y empieza el quiz en vivo</p>
        </div>
      </div>

      <div className="grid gap-5">
        {/* Activity summary */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
          <h2 className="font-semibold text-slate-800 mb-4 flex items-center gap-2 text-sm uppercase tracking-wide">
            <BookOpen size={16} className="text-primary-700" />
            Actividad
          </h2>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
              <BookOpen size={24} className="text-primary-700" />
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-slate-900">{activity.title}</h3>
              <p className="text-sm text-slate-500">{questions.length} preguntas</p>
            </div>
          </div>

          {Object.keys(difficultyMap).length > 0 && (
            <div className="flex gap-2 mt-4 flex-wrap">
              {Object.entries(difficultyMap).map(([d, count]) => (
                <span key={d} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
                  d === 'easy' ? 'bg-green-100 text-green-700' :
                  d === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                  'bg-red-100 text-red-700'
                }`}>
                  {getDifficultyLabel(d)} ×{count}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Configuration */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <h2 className="font-semibold text-slate-800 flex items-center gap-2 text-sm uppercase tracking-wide">
            <Clock size={16} className="text-primary-700" />
            Configuración
          </h2>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-2">
              Tiempo por pregunta:{' '}
              <span className="text-primary-800 font-bold">{timePerQuestion}s</span>
            </label>
            <input
              type="range"
              min={10}
              max={60}
              step={5}
              value={timePerQuestion}
              onChange={(e) => setTimePerQuestion(Number(e.target.value))}
              className="w-full h-2 bg-slate-200 rounded-full appearance-none cursor-pointer accent-primary-800"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>10s</span><span>30s</span><span>60s</span>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-slate-700 block mb-1.5">
              Clase (opcional)
            </label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sin clase asignada</option>
              {(classes as { id: number; name: string; subject: string }[]).map((c) => (
                <option key={c.id} value={c.id}>{c.name} — {c.subject}</option>
              ))}
            </select>
          </div>
        </div>

        {/* How it works */}
        <div className="bg-blue-50 border border-blue-200 rounded-2xl p-5">
          <h3 className="font-semibold text-blue-900 mb-2 flex items-center gap-2 text-sm">
            <Users size={15} />
            ¿Cómo funciona?
          </h3>
          <ol className="space-y-1 text-sm text-blue-800 list-none">
            <li>1. Se crea una sala de espera con código único</li>
            <li>2. Comparte el código — los alumnos entran desde cualquier dispositivo</li>
            <li>3. Cuando todos estén listos, tú inicias la partida</li>
            <li>4. Al finalizar, ves ranking y analítica completa</li>
          </ol>
        </div>

        <Button
          size="xl"
          fullWidth
          leftIcon={<Play size={20} />}
          onClick={() => launchMutation.mutate()}
          isLoading={launchMutation.isPending}
          className="bg-accent hover:bg-accent-dark text-slate-900 shadow-xl"
        >
          ¡Lanzar partida!
        </Button>
      </div>
    </div>
  )
}
