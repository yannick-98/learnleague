import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { Sparkles, FileText, Settings, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'
import { materialsApi, activitiesApi, classesApi, unwrapResponse, unwrapListResponse } from '../../lib/api'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const STEPS = [
  { id: 1, label: 'Seleccionar material', icon: FileText },
  { id: 2, label: 'Configurar', icon: Settings },
  { id: 3, label: 'Generar', icon: Sparkles },
]

export default function ActivityCreate() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(1)
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null)
  const [selectedClass, setSelectedClass] = useState<string>('')
  const [title, setTitle] = useState('')
  const [numQuestions, setNumQuestions] = useState(10)
  const [difficulty, setDifficulty] = useState('mixed')
  const [timePerQuestion, setTimePerQuestion] = useState(30)
  const [generating, setGenerating] = useState(false)
  const [activityId, setActivityId] = useState<number | null>(null)
  const [pollInterval, setPollInterval] = useState(0)

  const { data: materials, isLoading: loadingMaterials } = useQuery({
    queryKey: ['materials'],
    queryFn: () => materialsApi.list().then(r => unwrapListResponse(r)),
  })

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list().then(r => unwrapListResponse(r)),
  })

  const { data: activity } = useQuery({
    queryKey: ['activity', activityId],
    queryFn: () => activitiesApi.get(activityId!).then(r => unwrapResponse(r)),
    enabled: !!activityId,
    refetchInterval: pollInterval,
  })

  useEffect(() => {
    const state = location.state as any
    if (state?.materialId && materials) {
      const mat = materials.find((m: any) => m.id === state.materialId)
      if (mat) setSelectedMaterial(mat)
    }
  }, [materials, location.state])

  useEffect(() => {
    if (activity?.question_count > 0) {
      setPollInterval(0)
      setGenerating(false)
    }
  }, [activity?.question_count])

  const createActivityMutation = useMutation({
    mutationFn: (data: any) => activitiesApi.create(data),
    onSuccess: async (res) => {
      const newActivityId = unwrapResponse<{ id: number }>(res).id
      setActivityId(newActivityId)
      setStep(3)
      setGenerating(true)
      // Backend supports mixed difficulty natively
      const backendDifficulty = difficulty
      try {
        await activitiesApi.generateQuestions(newActivityId, {
          material_id: selectedMaterial.id,
          num_questions: numQuestions,
          difficulty: backendDifficulty,
          education_level: selectedClass
            ? (classes as any[])?.find((c) => String(c.id) === selectedClass)?.education_level
            : undefined,
        })
      } catch {
        // generation failed but activity was created — still poll so user can edit manually
      }
      setPollInterval(3000)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al crear la actividad')
    },
  })

  const handleGenerate = () => {
    if (!selectedMaterial) { toast.error('Selecciona un material'); return }
    if (!title.trim()) { toast.error('Escribe un título'); return }

    createActivityMutation.mutate({
      title,
      material: selectedMaterial.id,
      classroom: selectedClass || undefined,
      time_per_question: timePerQuestion,
    })
  }

  const completedMaterials = (materials || []).filter((m: any) => m.status === 'completed')

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Crear actividad con IA</h1>
          <p className="text-slate-500 text-sm">Genera preguntas desde un PDF en segundos</p>
        </div>
      </div>

      {/* Steps indicator */}
      <div className="flex items-center justify-between">
        {STEPS.map((s, idx) => (
          <div key={s.id} className="flex items-center">
            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              step === s.id ? 'bg-primary-100 text-primary-700' :
              step > s.id ? 'bg-green-100 text-green-700' :
              'text-slate-400'
            }`}>
              {step > s.id ? <CheckCircle className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
              {s.label}
            </div>
            {idx < STEPS.length - 1 && (
              <div className={`h-0.5 w-12 mx-2 ${step > s.id ? 'bg-green-400' : 'bg-slate-200'}`} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select material */}
      {step === 1 && (
        <Card>
          <h2 className="font-semibold text-slate-900 mb-4">Selecciona el material PDF</h2>
          {loadingMaterials ? (
            <LoadingSpinner text="Cargando materiales..." />
          ) : completedMaterials.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-600 mb-4">No tienes materiales listos todavía</p>
              <Button onClick={() => navigate('/materials/upload')} variant="outline">
                Subir PDF primero
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {completedMaterials.map((m: any) => (
                <button
                  key={m.id}
                  onClick={() => setSelectedMaterial(m)}
                  className={`w-full text-left p-4 rounded-xl border-2 transition-all ${
                    selectedMaterial?.id === m.id
                      ? 'border-primary-500 bg-primary-50'
                      : 'border-slate-200 hover:border-primary-300 hover:bg-slate-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-slate-900">{m.title}</p>
                      <p className="text-sm text-slate-500">{m.page_count} páginas · {m.classroom_name || 'Sin clase'}</p>
                    </div>
                    {selectedMaterial?.id === m.id && (
                      <CheckCircle className="w-5 h-5 text-primary-600" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          )}
          <div className="flex justify-between mt-6">
            <Button variant="outline" onClick={() => navigate('/materials/upload')} className="gap-1.5">
              <FileText className="w-4 h-4" />
              Subir nuevo PDF
            </Button>
            <Button
              onClick={() => setStep(2)}
              disabled={!selectedMaterial}
              className="gap-1.5"
            >
              Siguiente <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </Card>
      )}

      {/* Step 2: Configure */}
      {step === 2 && (
        <Card className="space-y-5">
          <h2 className="font-semibold text-slate-900">Configura tu actividad</h2>
          <div className="p-3 bg-primary-50 rounded-xl flex items-center gap-3">
            <FileText className="w-5 h-5 text-primary-600 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-primary-900">{selectedMaterial.title}</p>
              <p className="text-xs text-primary-600">{selectedMaterial.page_count} páginas</p>
            </div>
          </div>

          <Input
            label="Título de la actividad"
            placeholder="Ej: Quiz - Álgebra Básica"
            value={title}
            onChange={e => setTitle(e.target.value)}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Clase (opcional)</label>
            <select
              value={selectedClass}
              onChange={e => setSelectedClass(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Sin clase asignada</option>
              {classes?.map((c: any) => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Número de preguntas: <span className="text-primary-600 font-bold">{numQuestions}</span>
            </label>
            <input
              type="range" min="5" max="20" step="1"
              value={numQuestions}
              onChange={e => setNumQuestions(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>5 preguntas</span><span>20 preguntas</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Dificultad</label>
            <div className="grid grid-cols-4 gap-2">
              {['easy', 'medium', 'hard', 'mixed'].map(d => (
                <button
                  key={d}
                  type="button"
                  onClick={() => setDifficulty(d)}
                  className={`py-2 px-3 rounded-lg text-sm font-medium border-2 transition-all ${
                    difficulty === d ? 'border-primary-500 bg-primary-50 text-primary-700' : 'border-slate-200 text-slate-600 hover:border-primary-300'
                  }`}
                >
                  {d === 'easy' ? 'Fácil' : d === 'medium' ? 'Media' : d === 'hard' ? 'Difícil' : 'Mixta'}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Tiempo por pregunta: <span className="text-primary-600 font-bold">{timePerQuestion}s</span>
            </label>
            <input
              type="range" min="10" max="60" step="5"
              value={timePerQuestion}
              onChange={e => setTimePerQuestion(Number(e.target.value))}
              className="w-full accent-primary-600"
            />
            <div className="flex justify-between text-xs text-slate-400 mt-1">
              <span>10s</span><span>60s</span>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
              <ArrowLeft className="w-4 h-4 mr-1" /> Atrás
            </Button>
            <Button
              onClick={handleGenerate}
              isLoading={createActivityMutation.isPending}
              disabled={!title.trim()}
              className="flex-1 gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Generar con IA
            </Button>
          </div>
        </Card>
      )}

      {/* Step 3: Generating */}
      {step === 3 && (
        <Card className="text-center py-10">
          {generating ? (
            <>
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 rounded-full bg-primary-100 animate-ping" />
                <div className="relative w-24 h-24 rounded-full bg-primary-600 flex items-center justify-center">
                  <Sparkles className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">IA generando preguntas...</h2>
              <p className="text-slate-500 mb-4">
                Analizando el texto y creando {numQuestions} preguntas de calidad
              </p>
              <div className="flex justify-center gap-1 mb-6">
                {[0,1,2].map(i => (
                  <div key={i} className="w-2 h-2 rounded-full bg-primary-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
              <p className="text-sm text-slate-400">Esto suele tardar entre 10 y 30 segundos</p>
            </>
          ) : (
            <>
              <CheckCircle className="w-20 h-20 text-green-500 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                ¡{activity?.question_count} preguntas generadas!
              </h2>
              <p className="text-slate-500 mb-6">
                Revisa y edita las preguntas antes de lanzar la partida.
              </p>
              <div className="flex gap-3 justify-center">
                <Button variant="outline" onClick={() => navigate(`/activities/${activityId}`)}>
                  Ver actividad
                </Button>
                <Button onClick={() => navigate(`/activities/${activityId}/edit`)} className="gap-2">
                  <Settings className="w-4 h-4" />
                  Editar preguntas
                </Button>
              </div>
            </>
          )}
        </Card>
      )}
    </div>
  )
}
