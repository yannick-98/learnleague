import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, Plus, Trash2, Save, Play, GripVertical, CheckCircle, Upload } from 'lucide-react'
import { activitiesApi, gamesApi, unwrapResponse } from '../../lib/api'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Input from '../../components/ui/Input'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

const DIFFICULTY_COLORS = { easy: 'text-green-600', medium: 'text-amber-600', hard: 'text-red-600' }

function QuestionForm({
  question, index, onChange, onDelete,
}: {
  question: any, index: number, onChange: (q: any) => void, onDelete: () => void
}) {
  return (
    <Card className="relative">
      <div className="flex items-start gap-3">
        <div className="flex flex-col items-center gap-2 flex-shrink-0 pt-1">
          <span className="w-7 h-7 rounded-full bg-primary-100 text-primary-700 text-sm font-bold flex items-center justify-center">
            {index + 1}
          </span>
          <GripVertical className="w-4 h-4 text-slate-300" />
        </div>
        <div className="flex-1 space-y-3">
          <textarea
            value={question.text}
            onChange={e => onChange({ ...question, text: e.target.value })}
            placeholder="Escribe la pregunta aquí..."
            rows={2}
            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none font-medium"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
            {['a', 'b', 'c', 'd'].map(letter => (
              <div key={letter} className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChange({ ...question, correct_option: letter.toUpperCase() })}
                  className={`w-7 h-7 rounded-full text-sm font-bold flex-shrink-0 border-2 transition-all ${
                    question.correct_option === letter.toUpperCase()
                      ? 'bg-green-500 border-green-500 text-white'
                      : 'border-slate-300 text-slate-500 hover:border-green-400'
                  }`}
                  title="Marcar como correcta"
                >
                  {letter.toUpperCase()}
                </button>
                <input
                  value={question[`option_${letter}`]}
                  onChange={e => onChange({ ...question, [`option_${letter}`]: e.target.value })}
                  placeholder={`Opción ${letter.toUpperCase()}`}
                  className={`flex-1 px-3 py-2 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 transition-colors ${
                    question.correct_option === letter.toUpperCase()
                      ? 'border-green-400 bg-green-50 text-green-800'
                      : 'border-slate-200 bg-white'
                  }`}
                />
              </div>
            ))}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Dificultad</label>
              <select
                value={question.difficulty}
                onChange={e => onChange({ ...question, difficulty: e.target.value })}
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="easy">Fácil</option>
                <option value="medium">Media</option>
                <option value="hard">Difícil</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Tema</label>
              <input
                value={question.topic || ''}
                onChange={e => onChange({ ...question, topic: e.target.value })}
                placeholder="Ej: Álgebra"
                className="w-full px-3 py-1.5 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">
              Explicación de la respuesta correcta
            </label>
            <textarea
              value={question.explanation || ''}
              onChange={e => onChange({ ...question, explanation: e.target.value })}
              placeholder="¿Por qué esta respuesta es correcta?"
              rows={2}
              className="w-full px-3 py-2 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
            />
          </div>
        </div>
        <button
          onClick={onDelete}
          className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0"
          title="Eliminar pregunta"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </Card>
  )
}

const EMPTY_QUESTION = {
  text: '', option_a: '', option_b: '', option_c: '', option_d: '',
  correct_option: 'A', explanation: '', difficulty: 'medium', topic: '', order: 0,
}

export default function QuestionEditor() {
  const { id } = useParams()
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [questions, setQuestions] = useState<any[]>([])
  const [isDirty, setIsDirty] = useState(false)

  const { data: activity, isLoading } = useQuery({
    queryKey: ['activity', id],
    queryFn: () => activitiesApi.get(Number(id)).then(r => unwrapResponse(r)),
  })

  useEffect(() => {
    if (activity?.questions) setQuestions(activity.questions)
  }, [activity])

  const saveMutation = useMutation({
    mutationFn: async () => {
      // Delete all existing questions and re-create
      const promises = questions.map((q, idx) => {
        const data = { ...q, order: idx }
        if (q.id) {
          return activitiesApi.updateQuestion(Number(id), q.id, data)
        } else {
          return activitiesApi.createQuestion(Number(id), data)
        }
      })
      await Promise.all(promises)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', id] })
      toast.success('¡Preguntas guardadas!')
      setIsDirty(false)
    },
    onError: (err: any) => toast.error('Error al guardar'),
  })

  const markReadyMutation = useMutation({
    mutationFn: async () => {
      if (isDirty) await saveMutation.mutateAsync()
      return activitiesApi.markReady(Number(id))
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activity', id] })
      toast.success('Actividad marcada como lista')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.errors?.detail || 'No se pudo marcar como lista')
    },
  })

  const importCsvMutation = useMutation({
    mutationFn: (file: File) => activitiesApi.importCsv(Number(id), file),
    onSuccess: (res) => {
      const data = unwrapResponse<{ imported: number; questions: any[] }>(res)
      setQuestions(data.questions || [])
      setIsDirty(false)
      queryClient.invalidateQueries({ queryKey: ['activity', id] })
      toast.success(`${data.imported} preguntas importadas`)
    },
    onError: (err: any) => {
      const msg = err.response?.data?.errors?.file || err.response?.data?.errors?.detail
      toast.error(msg || 'Error al importar CSV')
    },
  })

  const launchMutation = useMutation({
    mutationFn: async () => {
      await saveMutation.mutateAsync()
      return gamesApi.createSession({ activity_id: Number(id) })
    },
    onSuccess: (res: any) => {
      const session = unwrapResponse<{ id: number }>(res)
      navigate(`/game/${session.id}/control`)
    },
    onError: () => toast.error('Error al lanzar la partida'),
  })

  const addQuestion = () => {
    setQuestions(prev => [...prev, { ...EMPTY_QUESTION, order: prev.length }])
    setIsDirty(true)
  }

  const updateQuestion = (idx: number, q: any) => {
    setQuestions(prev => prev.map((item, i) => i === idx ? q : item))
    setIsDirty(true)
  }

  const deleteQuestion = (idx: number) => {
    setQuestions(prev => prev.filter((_, i) => i !== idx))
    setIsDirty(true)
  }

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>

  return (
    <div className="max-w-3xl mx-auto space-y-4 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(`/activities/${id}`)} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-xl font-bold text-slate-900 truncate">{activity?.title}</h1>
          <div className="flex items-center gap-2 mt-0.5">
            <p className="text-slate-500 text-sm">{questions.length} preguntas</p>
            {activity?.status === 'ready' && <Badge variant="success" size="sm">Lista</Badge>}
          </div>
        </div>
        <div className="flex items-center gap-2">
          <label className="cursor-pointer">
            <input
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) importCsvMutation.mutate(file)
                e.target.value = ''
              }}
            />
            <span className="inline-flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-slate-700 border border-slate-200 rounded-xl hover:bg-slate-50 transition-colors">
              <Upload className="w-4 h-4" />
              Importar CSV
            </span>
          </label>
          <Button
            variant="outline"
            size="sm"
            onClick={() => markReadyMutation.mutate()}
            isLoading={markReadyMutation.isPending}
            disabled={questions.length === 0 || activity?.status === 'ready'}
            className="gap-1.5"
          >
            <CheckCircle className="w-4 h-4" />
            Marcar lista
          </Button>
        </div>
      </div>

      {/* Questions */}
      {questions.map((q, idx) => (
        <QuestionForm
          key={q.id || `new-${idx}`}
          question={q}
          index={idx}
          onChange={updated => updateQuestion(idx, updated)}
          onDelete={() => deleteQuestion(idx)}
        />
      ))}

      {/* Add button */}
      <button
        onClick={addQuestion}
        className="w-full py-4 border-2 border-dashed border-slate-300 rounded-xl text-slate-500 hover:border-primary-400 hover:text-primary-600 hover:bg-primary-50 transition-all flex items-center justify-center gap-2 font-medium"
      >
        <Plus className="w-5 h-5" />
        Añadir pregunta
      </button>

      {/* Sticky bottom bar */}
      <div className="sticky bottom-4 bg-white border border-slate-200 rounded-2xl shadow-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-slate-700">{questions.length} preguntas</span>
          {isDirty && <Badge variant="warning" size="sm">Sin guardar</Badge>}
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={() => saveMutation.mutate()}
            isLoading={saveMutation.isPending}
            className="gap-1.5"
          >
            <Save className="w-4 h-4" />
            Guardar
          </Button>
          <Button
            onClick={() => launchMutation.mutate()}
            isLoading={launchMutation.isPending}
            disabled={questions.length === 0}
            className="gap-1.5"
          >
            <Play className="w-4 h-4" />
            Guardar y jugar
          </Button>
        </div>
      </div>
    </div>
  )
}
