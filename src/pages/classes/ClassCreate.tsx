import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { BookOpen, ArrowLeft } from 'lucide-react'
import { classesApi } from '../../lib/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { EDUCATION_LEVELS, getClassColors } from '../../lib/utils'

const schema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  subject: z.string().min(2, 'La asignatura es obligatoria'),
  education_level: z.string().min(1, 'Selecciona un nivel educativo'),
  description: z.string().optional(),
  color: z.string().default('#6366f1'),
})

type FormData = z.infer<typeof schema>

const COLORS = getClassColors()

export default function ClassCreate() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedColor, setSelectedColor] = useState(COLORS[0])

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { color: COLORS[0] },
  })

  const mutation = useMutation({
    mutationFn: (data: FormData) => classesApi.create(data),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['classes'] })
      toast.success('¡Clase creada con éxito!')
      navigate(`/classes/${res.data.id}`)
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Error al crear la clase')
    },
  })

  const onSubmit = (data: FormData) => {
    mutation.mutate({ ...data, color: selectedColor })
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate('/classes')} className="p-2 hover:bg-slate-100 rounded-lg transition-colors">
          <ArrowLeft className="w-5 h-5 text-slate-600" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Nueva clase</h1>
          <p className="text-slate-500 text-sm">Crea un grupo para tus alumnos</p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            label="Nombre de la clase"
            placeholder="Ej: Matemáticas 1°ESO A"
            error={errors.name?.message}
            {...register('name')}
          />

          <Input
            label="Asignatura"
            placeholder="Ej: Matemáticas, Historia, Física..."
            error={errors.subject?.message}
            {...register('subject')}
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Nivel educativo <span className="text-red-500">*</span>
            </label>
            <select
              {...register('education_level')}
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            >
              <option value="">Selecciona un nivel...</option>
              {EDUCATION_LEVELS.map(l => (
                <option key={l.value} value={l.value}>{l.label}</option>
              ))}
            </select>
            {errors.education_level && (
              <p className="mt-1 text-sm text-red-600">{errors.education_level.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Descripción (opcional)
            </label>
            <textarea
              {...register('description')}
              rows={3}
              placeholder="Descripción del grupo, objetivos del curso..."
              className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            />
          </div>

          {/* Color picker */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Color de la clase
            </label>
            <div className="flex flex-wrap gap-3">
              {COLORS.map(color => (
                <button
                  key={color}
                  type="button"
                  onClick={() => { setSelectedColor(color); setValue('color', color) }}
                  className={`w-10 h-10 rounded-xl transition-all ${selectedColor === color ? 'scale-125 ring-2 ring-offset-2 ring-slate-400' : 'hover:scale-110'}`}
                  style={{ backgroundColor: color }}
                  aria-label={`Color ${color}`}
                />
              ))}
            </div>
          </div>

          {/* Preview */}
          <div className="p-4 rounded-xl border-2 flex items-center gap-4" style={{ borderColor: `${selectedColor}40`, backgroundColor: `${selectedColor}10` }}>
            <div className="w-12 h-12 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${selectedColor}20` }}>
              <BookOpen className="w-6 h-6" style={{ color: selectedColor }} />
            </div>
            <div>
              <p className="font-semibold text-slate-900">Vista previa</p>
              <p className="text-sm" style={{ color: selectedColor }}>Así se verá tu clase</p>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => navigate('/classes')} className="flex-1">
              Cancelar
            </Button>
            <Button type="submit" isLoading={mutation.isPending} className="flex-1">
              Crear clase
            </Button>
          </div>
        </form>
      </Card>
    </div>
  )
}
