import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import {
  BookOpen, Users, Gamepad2, FileText, Sparkles,
  TrendingUp, Clock, ChevronRight, PlusCircle, Trophy
} from 'lucide-react'
import { analyticsApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Button from '../../components/ui/Button'

function StatCard({ label, value, icon: Icon, color }: {
  label: string; value: number | string; icon: React.ComponentType<any>; color: string
}) {
  return (
    <Card className="flex items-center gap-4">
      <div className={`p-3 rounded-xl ${color}`}>
        <Icon className="w-6 h-6 text-white" />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900">{value}</p>
        <p className="text-sm text-slate-500">{label}</p>
      </div>
    </Card>
  )
}

const STATUS_LABELS: Record<string, string> = {
  waiting: 'Esperando',
  active: 'En curso',
  finished: 'Finalizado',
  draft: 'Borrador',
  ready: 'Lista',
  played: 'Jugada',
}

export default function Dashboard() {
  const navigate = useNavigate()
  const { user } = useAuthStore()

  const { data, isLoading } = useQuery({
    queryKey: ['dashboard'],
    // Backend returns { stats, recent_activities, recent_sessions } at top level
    queryFn: () => analyticsApi.getDashboard().then(r => r.data),
  })

  const firstName = user?.first_name || user?.username || 'Profe'

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">
            ¡Hola, {firstName}! 👋
          </h1>
          <p className="text-slate-500 mt-1">¿Listo para crear la mejor clase de hoy?</p>
        </div>
        <Button
          onClick={() => navigate('/activities/new')}
          size="lg"
          className="gap-2 shadow-lg shadow-primary-500/30"
        >
          <Sparkles className="w-5 h-5" />
          Crear actividad con IA
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" text="Cargando tu panel..." />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <StatCard
              label="Clases"
              value={data?.stats?.total_classrooms ?? 0}
              icon={BookOpen}
              color="bg-primary-600"
            />
            <StatCard
              label="Actividades"
              value={data?.stats?.total_activities ?? 0}
              icon={FileText}
              color="bg-purple-600"
            />
            <StatCard
              label="Partidas"
              value={data?.stats?.total_sessions ?? 0}
              icon={Gamepad2}
              color="bg-emerald-600"
            />
            <StatCard
              label="Alumnos totales"
              value={data?.stats?.total_players ?? 0}
              icon={Users}
              color="bg-amber-500"
            />
          </div>

          <div className="grid lg:grid-cols-2 gap-6">
            {/* Recent Sessions */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary-600" />
                  Partidas recientes
                </h2>
                <Link to="/library" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Ver todas →
                </Link>
              </div>
              {data?.recent_sessions && data.recent_sessions.length > 0 ? (
                <div className="space-y-3">
                  {data.recent_sessions.map((s: any) => (
                    <div key={s.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{s.activity_title}</p>
                        <p className="text-xs text-slate-500">{s.classroom_name || 'Sin clase'} · {s.player_count} alumnos</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={s.status === 'finished' ? 'success' : s.status === 'active' ? 'warning' : 'default'}>
                          {STATUS_LABELS[s.status]}
                        </Badge>
                        {s.status === 'finished' && (
                          <Link to={`/analytics/${s.id}`}>
                            <ChevronRight className="w-4 h-4 text-slate-400 hover:text-primary-600" />
                          </Link>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Gamepad2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No hay partidas todavía</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/activities/new')}>
                    Crear primera actividad
                  </Button>
                </div>
              )}
            </Card>

            {/* Recent Activities */}
            <Card>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-slate-900 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-600" />
                  Mis actividades
                </h2>
                <Link to="/library" className="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  Ver todas →
                </Link>
              </div>
              {data?.recent_activities && data?.recent_activities.length > 0 ? (
                <div className="space-y-3">
                  {data.recent_activities.map((a: any) => (
                    <div key={a.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors">
                      <div>
                        <p className="font-medium text-slate-900 text-sm">{a.title}</p>
                        <p className="text-xs text-slate-500">{a.question_count ?? '?'} preguntas</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={a.status === 'ready' ? 'success' : a.status === 'played' ? 'info' : 'default'}>
                          {STATUS_LABELS[a.status]}
                        </Badge>
                        <Link to={`/activities/${a.id}`}>
                          <ChevronRight className="w-4 h-4 text-slate-400 hover:text-primary-600" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                  <p className="text-slate-500 text-sm">No hay actividades todavía</p>
                  <Button variant="outline" size="sm" className="mt-3" onClick={() => navigate('/activities/new')}>
                    <PlusCircle className="w-4 h-4 mr-1" />
                    Nueva actividad
                  </Button>
                </div>
              )}
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Acciones rápidas</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { icon: Sparkles, label: 'Nueva actividad IA', to: '/activities/new', color: 'bg-primary-50 hover:bg-primary-100 text-primary-700 border-primary-200' },
                { icon: BookOpen, label: 'Nueva clase', to: '/classes/new', color: 'bg-purple-50 hover:bg-purple-100 text-purple-700 border-purple-200' },
                { icon: FileText, label: 'Subir PDF', to: '/materials/upload', color: 'bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border-emerald-200' },
                { icon: Trophy, label: 'Mi biblioteca', to: '/library', color: 'bg-amber-50 hover:bg-amber-100 text-amber-700 border-amber-200' },
              ].map(({ icon: Icon, label, to, color }) => (
                <Link key={to} to={to}>
                  <div className={`flex flex-col items-center gap-3 p-4 rounded-xl border-2 transition-all cursor-pointer ${color}`}>
                    <Icon className="w-8 h-8" />
                    <span className="text-sm font-medium text-center">{label}</span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  )
}
