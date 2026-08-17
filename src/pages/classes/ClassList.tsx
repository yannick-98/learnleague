import { useQuery } from '@tanstack/react-query'
import { Link, useNavigate } from 'react-router-dom'
import { PlusCircle, BookOpen, FileText, Gamepad2, ChevronRight } from 'lucide-react'
import { classesApi, unwrapListResponse } from '../../lib/api'
import { getEducationLevelLabel } from '../../lib/utils'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import Badge from '../../components/ui/Badge'

export default function ClassList() {
  const navigate = useNavigate()
  const { data, isLoading } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list().then(r => unwrapListResponse(r)),
  })

  const classes = data || []

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Mis clases</h1>
          <p className="text-slate-500 mt-1">Gestiona tus grupos y alumnos</p>
        </div>
        <Button onClick={() => navigate('/classes/new')} className="gap-2">
          <PlusCircle className="w-4 h-4" />
          Nueva clase
        </Button>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <LoadingSpinner size="lg" text="Cargando clases..." />
        </div>
      ) : classes.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-2xl border-2 border-dashed border-slate-200">
          <BookOpen className="w-16 h-16 text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-slate-700 mb-2">No tienes clases todavía</h3>
          <p className="text-slate-500 mb-6">Crea tu primera clase para organizar a tus alumnos</p>
          <Button onClick={() => navigate('/classes/new')} className="gap-2">
            <PlusCircle className="w-4 h-4" />
            Crear primera clase
          </Button>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-5">
          {classes.map((cls: any) => (
            <Link key={cls.id} to={`/classes/${cls.id}`}>
              <Card className="hover:shadow-md transition-all hover:-translate-y-1 cursor-pointer group h-full">
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="w-14 h-14 rounded-2xl flex items-center justify-center"
                    style={{ backgroundColor: `${cls.color}20`, border: `2px solid ${cls.color}40` }}
                  >
                    <BookOpen className="w-7 h-7" style={{ color: cls.color }} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-slate-500 transition-colors mt-1" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1 group-hover:text-primary-700 transition-colors">
                  {cls.name}
                </h3>
                <p className="text-slate-500 text-sm mb-4">{cls.subject}</p>
                <div className="flex items-center gap-2 mb-4">
                  <Badge variant="default">{getEducationLevelLabel(cls.education_level)}</Badge>
                </div>
                <div className="grid grid-cols-3 gap-3 pt-3 border-t border-slate-100">
                  {[
                    { icon: FileText, label: 'Materiales', value: cls.materials_count ?? 0 },
                    { icon: Gamepad2, label: 'Partidas', value: cls.sessions_count ?? 0 },
                    { icon: BookOpen, label: 'Actividades', value: cls.activities_count ?? 0 },
                  ].map(({ icon: Icon, label, value }) => (
                    <div key={label} className="text-center">
                      <p className="text-lg font-bold text-slate-800">{value}</p>
                      <p className="text-xs text-slate-500">{label}</p>
                    </div>
                  ))}
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
