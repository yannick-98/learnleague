import { useState } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, BookOpen, FileText, Gamepad2, Edit2, Trash2, PlusCircle } from 'lucide-react'
import { classesApi, activitiesApi, materialsApi, unwrapResponse, unwrapListResponse } from '../../lib/api'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Modal from '../../components/ui/Modal'
import { getEducationLevelLabel } from '../../lib/utils'

const STATUS_VARIANTS: Record<string, any> = {
  waiting: 'default', active: 'warning', finished: 'success',
  draft: 'default', ready: 'success', played: 'info',
  pending: 'default', processing: 'warning', completed: 'success', failed: 'error',
}
const STATUS_LABELS: Record<string, string> = {
  waiting: 'Esperando', active: 'Activa', finished: 'Finalizada',
  draft: 'Borrador', ready: 'Lista', played: 'Jugada',
  pending: 'Pendiente', processing: 'Procesando', completed: 'Completado', failed: 'Error',
}

export default function ClassDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<'activities' | 'materials' | 'sessions'>('activities')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const { data: cls, isLoading } = useQuery({
    queryKey: ['class', id],
    queryFn: () => classesApi.get(Number(id)).then(r => unwrapResponse(r)),
  })

  const { data: activities } = useQuery({
    queryKey: ['class-activities', id],
    queryFn: () => activitiesApi.list({ classroom: id }).then(r => unwrapListResponse(r)),
    enabled: activeTab === 'activities',
  })

  const { data: materials } = useQuery({
    queryKey: ['class-materials', id],
    queryFn: () => materialsApi.list({ classroom: id }).then(r => unwrapListResponse(r)),
    enabled: activeTab === 'materials',
  })

  const { data: sessions } = useQuery({
    queryKey: ['class-sessions', id],
    queryFn: () => classesApi.getSessions(Number(id)).then(r => unwrapListResponse(r)),
    enabled: activeTab === 'sessions',
  })

  const deleteMutation = useMutation({
    mutationFn: () => classesApi.delete(Number(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('Clase eliminada')
      navigate('/classes')
    },
    onError: () => toast.error('Error al eliminar la clase'),
  })

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!cls) return <div className="text-center py-20"><p className="text-slate-500">Clase no encontrada</p></div>

  const tabs = [
    { key: 'activities', label: 'Actividades', icon: BookOpen, count: cls.activities_count },
    { key: 'materials', label: 'Materiales', icon: FileText, count: cls.materials_count },
    { key: 'sessions', label: 'Partidas', icon: Gamepad2, count: cls.sessions_count },
  ]

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/classes')} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0"
          style={{ backgroundColor: `${cls.color}20`, border: `2px solid ${cls.color}40` }}
        >
          <BookOpen className="w-7 h-7" style={{ color: cls.color }} />
        </div>
        <div className="flex-1 min-w-0">
          <h1 className="text-2xl font-bold text-slate-900 truncate">{cls.name}</h1>
          <p className="text-slate-500">{cls.subject} · {getEducationLevelLabel(cls.education_level)}</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => navigate(`/classes/${id}/edit`)} className="gap-1.5">
            <Edit2 className="w-4 h-4" />
            Editar
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setShowDeleteModal(true)} className="text-red-600 hover:bg-red-50">
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {tabs.map(({ key, label, icon: Icon, count }) => (
          <Card key={key} className="text-center">
            <Icon className="w-6 h-6 mx-auto mb-2 text-slate-400" />
            <p className="text-2xl font-bold text-slate-900">{count ?? 0}</p>
            <p className="text-sm text-slate-500">{label}</p>
          </Card>
        ))}
      </div>

      {/* Tabs */}
      <div className="border-b border-slate-200">
        <div className="flex gap-1">
          {tabs.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setActiveTab(key as any)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                activeTab === key
                  ? 'border-primary-600 text-primary-700'
                  : 'border-transparent text-slate-500 hover:text-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div>
        {activeTab === 'activities' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => navigate('/activities/new')} className="gap-1.5">
                <PlusCircle className="w-4 h-4" />
                Nueva actividad
              </Button>
            </div>
            {(!activities || activities.length === 0) ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No hay actividades para esta clase</p>
              </div>
            ) : (
              activities.map((a: any) => (
                <Link key={a.id} to={`/activities/${a.id}`}>
                  <Card className="hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{a.title}</p>
                      <p className="text-sm text-slate-500">{a.question_count} preguntas</p>
                    </div>
                    <Badge variant={STATUS_VARIANTS[a.status] ?? 'default'}>{STATUS_LABELS[a.status]}</Badge>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}

        {activeTab === 'sessions' && (
          <div className="space-y-3">
            {(!sessions || sessions.length === 0) ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <Gamepad2 className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No hay partidas para esta clase</p>
              </div>
            ) : (
              sessions.map((s: any) => (
                <Card key={s.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-900">{s.activity_title}</p>
                    <p className="text-sm text-slate-500">Código: {s.code} · {s.player_count} jugadores</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant={STATUS_VARIANTS[s.status] ?? 'default'}>{STATUS_LABELS[s.status]}</Badge>
                    {s.status === 'finished' && (
                      <Link to={`/analytics/${s.id}`}>
                        <Button size="sm" variant="outline">Ver resultados</Button>
                      </Link>
                    )}
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {activeTab === 'materials' && (
          <div className="space-y-3">
            <div className="flex justify-end">
              <Button size="sm" onClick={() => navigate('/materials/upload')} className="gap-1.5">
                <PlusCircle className="w-4 h-4" />
                Subir PDF
              </Button>
            </div>
            {(!materials || materials.length === 0) ? (
              <div className="text-center py-12 border-2 border-dashed border-slate-200 rounded-xl">
                <FileText className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-slate-500">No hay materiales para esta clase</p>
              </div>
            ) : (
              materials.map((m: any) => (
                <Link key={m.id} to={`/materials/${m.id}`}>
                  <Card className="hover:bg-slate-50 transition-colors cursor-pointer flex items-center justify-between">
                    <div>
                      <p className="font-semibold text-slate-900">{m.title}</p>
                      <p className="text-sm text-slate-500">{m.page_count ?? 0} páginas</p>
                    </div>
                    <Badge variant={STATUS_VARIANTS[m.status] ?? 'default'}>{STATUS_LABELS[m.status]}</Badge>
                  </Card>
                </Link>
              ))
            )}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="¿Eliminar clase?"
        size="sm"
      >
        <p className="text-slate-600 mb-6">
          Se eliminará la clase <strong>"{cls.name}"</strong> y todos sus datos.
          Esta acción no se puede deshacer.
        </p>
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="flex-1">
            Cancelar
          </Button>
          <Button
            variant="danger"
            onClick={() => deleteMutation.mutate()}
            isLoading={deleteMutation.isPending}
            className="flex-1"
          >
            Eliminar
          </Button>
        </div>
      </Modal>
    </div>
  )
}
