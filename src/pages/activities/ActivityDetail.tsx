import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Edit2, Play, Download, Copy, Trash2 } from 'lucide-react'
import { activitiesApi, gamesApi, unwrapResponse } from '../../lib/api'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import { getStatusLabel, getDifficultyLabel } from '../../lib/utils'

const DIFFICULTY_VARIANTS: Record<string, any> = {
  easy: 'success', medium: 'warning', hard: 'error',
}

export default function ActivityDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activitiesApi.get(Number(id)).then(r => unwrapResponse(r)),
  })

  const launchMutation = useMutation({
    mutationFn: () => gamesApi.createSession({ activity_id: Number(id) }),
    onSuccess: (res) => {
      const session = unwrapResponse<{ code: string; id: number }>(res)
      toast.success(`¡Partida creada! Código: ${session.code}`)
      navigate(`/game/${session.id}/control`)
    },
    onError: (err: any) => toast.error(err.response?.data?.message || 'Error al crear la partida'),
  })

  const deleteMutation = useMutation({
    mutationFn: () => activitiesApi.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] })
      toast.success('Actividad eliminada')
      navigate('/library')
    },
  })

  const markReadyMutation = useMutation({
    mutationFn: () => activitiesApi.markReady(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', id] })
      toast.success('Actividad marcada como lista')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.errors?.detail || 'No se pudo marcar como lista')
    },
  })

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!activity) return <div className="text-center py-20"><p>Actividad no encontrada</p></div>

  return (
    <div className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{activity.title}</h1>
          <p className="text-slate-500 text-sm">
            {activity.question_count} preguntas · {activity.time_per_question}s por pregunta
          </p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <Button variant="outline" size="sm" onClick={() => navigate(`/activities/${id}/edit`)} className="gap-1.5">
            <Edit2 className="w-4 h-4" /> Editar
          </Button>
          <Button
            onClick={() => launchMutation.mutate()}
            isLoading={launchMutation.isPending}
            disabled={activity.question_count === 0}
            className="gap-1.5"
          >
            <Play className="w-4 h-4" /> Lanzar partida
          </Button>
        </div>
      </div>

      {/* Info */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Preguntas', value: activity.question_count },
          { label: 'Tiempo/pregunta', value: `${activity.time_per_question}s` },
          { label: 'Clase', value: activity.classroom_name || 'Libre' },
          { label: 'Estado', value: <Badge variant={activity.status === 'ready' ? 'success' : 'default'}>{getStatusLabel(activity.status)}</Badge> },
        ].map(({ label, value }) => (
          <Card key={label} className="text-center">
            <p className="text-lg font-bold text-slate-900">{value}</p>
            <p className="text-xs text-slate-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Questions list */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-slate-900">Preguntas ({activity.question_count})</h2>
          <Button size="sm" variant="outline" onClick={() => navigate(`/activities/${id}/edit`)}>
            <Edit2 className="w-4 h-4 mr-1" /> Editar todas
          </Button>
        </div>
        {activity.questions?.length === 0 ? (
          <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
            <p className="text-slate-500">No hay preguntas todavía</p>
            <Button className="mt-3" size="sm" onClick={() => navigate(`/activities/${id}/edit`)}>
              Añadir preguntas
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {activity.questions?.map((q: any, idx: number) => (
              <Card key={q.id} className="group">
                <div className="flex items-start gap-3">
                  <span className="flex-shrink-0 w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center">
                    {idx + 1}
                  </span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 mb-2">{q.text}</p>
                    <div className="grid grid-cols-2 gap-1.5 mb-2">
                      {['A', 'B', 'C', 'D'].map(letter => (
                        <div
                          key={letter}
                          className={`px-3 py-1.5 rounded-lg text-sm ${
                            q.correct_option === letter
                              ? 'bg-green-100 text-green-800 font-semibold border border-green-300'
                              : 'bg-slate-50 text-slate-700'
                          }`}
                        >
                          <span className="font-bold mr-1">{letter}.</span>
                          {q[`option_${letter.toLowerCase()}`]}
                        </div>
                      ))}
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={DIFFICULTY_VARIANTS[q.difficulty] ?? 'default'} size="sm">
                        {getDifficultyLabel(q.difficulty)}
                      </Badge>
                      {q.topic && <span className="text-xs text-slate-500">{q.topic}</span>}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Actions */}
      <Card>
        <h3 className="font-semibold text-slate-900 mb-3">Acciones</h3>
        <div className="flex flex-wrap gap-3">
          {activity.status !== 'ready' && activity.question_count > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => markReadyMutation.mutate()}
              isLoading={markReadyMutation.isPending}
            >
              Marcar como lista
            </Button>
          )}
          <Button variant="outline" size="sm" onClick={() => activitiesApi.exportJson(Number(id))} className="gap-1.5">
            <Download className="w-4 h-4" /> Exportar JSON
          </Button>
          <Button variant="outline" size="sm" onClick={() => activitiesApi.exportCsv(Number(id))} className="gap-1.5">
            <Download className="w-4 h-4" /> Exportar CSV
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => deleteMutation.mutate()}
            isLoading={deleteMutation.isPending}
            className="text-red-600 hover:bg-red-50 gap-1.5"
          >
            <Trash2 className="w-4 h-4" /> Eliminar
          </Button>
        </div>
      </Card>
    </div>
  )
}
