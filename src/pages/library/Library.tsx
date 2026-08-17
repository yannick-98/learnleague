import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { Search, Play, Edit, BookOpen, FileText, Gamepad2, Plus, BarChart2, Trash2, Eye } from 'lucide-react'
import toast from 'react-hot-toast'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { Input } from '@/components/ui/Input'
import { ConfirmModal } from '@/components/ui/Modal'
import { activitiesApi, materialsApi, gamesApi, unwrapListResponse } from '@/lib/api'
import { formatRelative, formatFileSize, getStatusLabel, getStatusColor } from '@/lib/utils'
import type { Activity, TeachingMaterial, GameSession } from '@/types'

type Tab = 'activities' | 'materials' | 'sessions'

type DeleteTarget = {
  type: Tab
  id: number
  name: string
}

const DELETE_MESSAGES: Record<Tab, (name: string) => { title: string; message: string }> = {
  activities: (name) => ({
    title: 'Eliminar actividad',
    message: `¿Eliminar la actividad «${name}»? Se borrarán también sus preguntas. Esta acción no se puede deshacer.`,
  }),
  materials: (name) => ({
    title: 'Eliminar material',
    message: `¿Eliminar el material «${name}»? Se borrará el PDF y su contenido extraído. Esta acción no se puede deshacer.`,
  }),
  sessions: (name) => ({
    title: 'Eliminar partida',
    message: `¿Eliminar la partida «${name}»? Se borrarán jugadores, respuestas y resultados. Esta acción no se puede deshacer.`,
  }),
}

export default function Library() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [activeTab, setActiveTab] = useState<Tab>('activities')
  const [search, setSearch] = useState('')
  const [deleteTarget, setDeleteTarget] = useState<DeleteTarget | null>(null)

  const { data: activitiesRaw = [], isLoading: activitiesLoading } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activitiesApi.list().then((r) => unwrapListResponse(r)),
    enabled: activeTab === 'activities',
  })
  const { data: materialsRaw = [], isLoading: materialsLoading } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialsApi.list().then((r) => unwrapListResponse(r)),
    enabled: activeTab === 'materials',
  })
  const { data: sessionsRaw = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions'],
    queryFn: () => gamesApi.listSessions().then((r) => unwrapListResponse(r)),
    enabled: activeTab === 'sessions',
  })

  const activities = activitiesRaw as Activity[]
  const materials = materialsRaw as TeachingMaterial[]
  const sessions = sessionsRaw as GameSession[]
  const isLoading = activitiesLoading || materialsLoading || sessionsLoading

  const filterSearch = (name: string) => !search || name.toLowerCase().includes(search.toLowerCase())
  const filteredActivities = activities.filter((a) => filterSearch(a.title))
  const filteredMaterials = materials.filter((m) => filterSearch(m.title))
  const filteredSessions = sessions.filter((s) => filterSearch(s.activity?.title || ''))

  const tabs = [
    { key: 'activities' as Tab, label: 'Actividades', icon: <BookOpen size={14} />, count: activities.length },
    { key: 'materials' as Tab, label: 'Materiales', icon: <FileText size={14} />, count: materials.length },
    { key: 'sessions' as Tab, label: 'Partidas', icon: <Gamepad2 size={14} />, count: sessions.length },
  ]

  const deleteMutation = useMutation({
    mutationFn: async (target: DeleteTarget) => {
      if (target.type === 'activities') return activitiesApi.delete(target.id)
      if (target.type === 'materials') return materialsApi.delete(target.id)
      return gamesApi.deleteSession(target.id)
    },
    onSuccess: (_data, target) => {
      queryClient.invalidateQueries({ queryKey: [target.type === 'sessions' ? 'sessions' : target.type] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(
        target.type === 'activities' ? 'Actividad eliminada' :
        target.type === 'materials' ? 'Material eliminado' : 'Partida eliminada'
      )
      setDeleteTarget(null)
    },
    onError: () => toast.error('No se pudo eliminar. Inténtalo de nuevo.'),
  })

  const confirmDialog = deleteTarget ? DELETE_MESSAGES[deleteTarget.type](deleteTarget.name) : null

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-bold text-2xl text-slate-900">Biblioteca</h1>
          <p className="text-slate-500 text-sm mt-1">Tu contenido educativo</p>
        </div>
        <Link
          to="/activities/new"
          className="flex items-center gap-2 bg-primary-800 text-white text-sm font-semibold px-4 py-2.5 rounded-xl hover:bg-primary-700 transition-colors"
        >
          <Plus size={15} />
          Nueva actividad
        </Link>
      </div>

      {/* Tabs + Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 whitespace-nowrap ${
                activeTab === tab.key ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab.icon}
              {tab.label}
              <span className="bg-slate-200 text-slate-600 text-xs px-1.5 py-0.5 rounded-md">{tab.count}</span>
            </button>
          ))}
        </div>
        <div className="flex-1 max-w-xs">
          <Input
            placeholder="Buscar..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            leftIcon={<Search size={14} />}
          />
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" text="Cargando..." />
        </div>
      ) : (
        <>
          {/* Activities */}
          {activeTab === 'activities' && (
            <div className="space-y-3">
              {filteredActivities.length === 0 ? (
                <EmptyState
                  icon={<BookOpen size={40} />}
                  title="Sin actividades"
                  desc="Crea tu primera actividad con IA"
                  action={<Link to="/activities/new" className="inline-flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700"><Plus size={14} />Crear actividad</Link>}
                />
              ) : filteredActivities.map((a) => (
                <div key={a.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-primary-100 flex items-center justify-center flex-shrink-0">
                    <BookOpen size={18} className="text-primary-700" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{a.title}</p>
                    <p className="text-sm text-slate-500">
                      {a.question_count} preguntas · {formatRelative(a.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(a.status)}`}>
                      {getStatusLabel(a.status)}
                    </span>
                    <Link to={`/activities/${a.id}/edit`} className="p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors">
                      <Edit size={14} />
                    </Link>
                    {a.status === 'ready' && (
                      <button
                        onClick={() => navigate(`/activities/${a.id}/launch`)}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-accent text-slate-900 text-sm font-semibold rounded-lg hover:bg-accent-dark transition-colors"
                      >
                        <Play size={13} />
                        Jugar
                      </button>
                    )}
                    <button
                      onClick={() => setDeleteTarget({ type: 'activities', id: a.id, name: a.title })}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar actividad"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Materials */}
          {activeTab === 'materials' && (
            <div className="space-y-3">
              {filteredMaterials.length === 0 ? (
                <EmptyState
                  icon={<FileText size={40} />}
                  title="Sin materiales"
                  desc="Sube un PDF para empezar"
                  action={<Link to="/materials/upload" className="inline-flex items-center gap-2 bg-primary-800 text-white px-4 py-2 rounded-xl text-sm font-medium hover:bg-primary-700"><Plus size={14} />Subir PDF</Link>}
                />
              ) : filteredMaterials.map((m) => (
                <div key={m.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center flex-shrink-0">
                    <FileText size={18} className="text-red-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{m.title}</p>
                    <p className="text-sm text-slate-500">
                      {(m as any).page_count > 0 && `${(m as any).page_count} páginas · `}
                      {(m as any).file_size > 0 && `${formatFileSize((m as any).file_size)} · `}
                      {formatRelative(m.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(m.status)}`}>
                      {getStatusLabel(m.status)}
                    </span>
                    <Link
                      to={`/materials/${m.id}`}
                      className="p-2 text-slate-400 hover:text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      title="Ver PDF"
                    >
                      <Eye size={14} />
                    </Link>
                    {m.status === 'completed' && (
                      <Link
                        to={`/activities/new?material=${m.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-primary-800 text-white text-sm font-medium rounded-lg hover:bg-primary-700 transition-colors"
                      >
                        <Plus size={13} />
                        Generar
                      </Link>
                    )}
                    <button
                      onClick={() => setDeleteTarget({ type: 'materials', id: m.id, name: m.title })}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar material"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Sessions */}
          {activeTab === 'sessions' && (
            <div className="space-y-3">
              {filteredSessions.length === 0 ? (
                <EmptyState
                  icon={<Gamepad2 size={40} />}
                  title="Sin partidas"
                  desc="Lanza una actividad para empezar a jugar"
                />
              ) : filteredSessions.map((s) => (
                <div key={s.id} className="bg-white rounded-xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-100 flex items-center justify-center flex-shrink-0">
                    <Gamepad2 size={18} className="text-purple-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 truncate">{s.activity?.title || 'Partida'}</p>
                    <p className="text-sm text-slate-500">
                      {(s as any).player_count || 0} jugadores · {formatRelative(s.created_at)}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${getStatusColor(s.status)}`}>
                      {getStatusLabel(s.status)}
                    </span>
                    {s.status === 'finished' && (
                      <Link
                        to={`/analytics/${s.id}`}
                        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-primary-700 hover:bg-primary-50 rounded-lg transition-colors"
                      >
                        <BarChart2 size={13} />
                        Ver
                      </Link>
                    )}
                    <button
                      onClick={() => setDeleteTarget({
                        type: 'sessions',
                        id: s.id,
                        name: s.activity?.title || 'Partida',
                      })}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Eliminar partida"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        isOpen={deleteTarget !== null}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteTarget && deleteMutation.mutate(deleteTarget)}
        title={confirmDialog?.title ?? 'Confirmar eliminación'}
        message={confirmDialog?.message ?? ''}
        confirmLabel="Eliminar"
        cancelLabel="Cancelar"
        danger
        isLoading={deleteMutation.isPending}
      />
    </div>
  )
}

function EmptyState({ icon, title, desc, action }: {
  icon: React.ReactNode
  title: string
  desc: string
  action?: React.ReactNode
}) {
  return (
    <div className="text-center py-16 bg-white rounded-2xl border border-slate-100 shadow-sm">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-slate-100 text-slate-400 mb-4">
        {icon}
      </div>
      <h3 className="font-semibold text-slate-700 mb-1">{title}</h3>
      <p className="text-slate-500 text-sm mb-4">{desc}</p>
      {action}
    </div>
  )
}
