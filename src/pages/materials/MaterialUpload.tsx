import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { ArrowLeft, CheckCircle, XCircle, Clock, RefreshCw, Sparkles } from 'lucide-react'
import { materialsApi, classesApi, unwrapResponse, unwrapListResponse } from '../../lib/api'
import Button from '../../components/ui/Button'
import Input from '../../components/ui/Input'
import Card from '../../components/ui/Card'
import { FileUpload } from '../../components/shared/FileUpload'
import ProgressBar from '../../components/ui/ProgressBar'

type Status = 'pending' | 'processing' | 'completed' | 'failed'

const STATUS_CONFIG: Record<Status, { icon: React.ComponentType<any>; color: string; label: string }> = {
  pending: { icon: Clock, color: 'text-slate-500', label: 'Pendiente' },
  processing: { icon: RefreshCw, color: 'text-amber-500 animate-spin', label: 'Extrayendo texto...' },
  completed: { icon: CheckCircle, color: 'text-green-500', label: '¡Listo!' },
  failed: { icon: XCircle, color: 'text-red-500', label: 'Error' },
}

export default function MaterialUpload() {
  const navigate = useNavigate()
  const queryClient = useQueryClient()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [materialId, setMaterialId] = useState<number | null>(null)
  const [pollInterval, setPollInterval] = useState(0)

  const { register, handleSubmit, setValue, formState: { errors } } = useForm<{
    title: string
    classroom: string
  }>()

  const { data: classes } = useQuery({
    queryKey: ['classes'],
    queryFn: () => classesApi.list().then(r => unwrapListResponse(r)),
  })

  const { data: material } = useQuery({
    queryKey: ['material', materialId],
    queryFn: () => materialsApi.get(materialId!).then(r => unwrapResponse(r)),
    enabled: !!materialId,
    refetchInterval: pollInterval,
  })

  useEffect(() => {
    if (material?.status === 'processing' || material?.status === 'pending') {
      setPollInterval(2000)
    } else {
      setPollInterval(0)
    }
    if (material?.status === 'completed') {
      toast.success('¡Texto extraído correctamente!')
      queryClient.invalidateQueries({ queryKey: ['materials'] })
    }
    if (material?.status === 'failed') {
      toast.error('Error al extraer el texto del PDF')
    }
  }, [material?.status])

  const uploadMutation = useMutation({
    mutationFn: (formData: FormData) => materialsApi.upload(formData),
    onSuccess: (res) => {
      const id = unwrapResponse<{ id: number }>(res).id
      setMaterialId(id)
      setPollInterval(2000)
      toast.success('PDF subido. Extrayendo texto...')
    },
    onError: (err: any) => {
      const msg = err.response?.data?.pdf_file?.[0]
        || err.response?.data?.message
        || err.response?.data?.detail
        || 'Error al subir el PDF'
      toast.error(msg)
    },
  })

  const sanitizeFilename = (name: string): string => {
    const dot = name.lastIndexOf('.')
    const ext = dot > 0 ? name.slice(dot) : ''
    const base = name.slice(0, dot > 0 ? dot : name.length)
    const clean = base.replace(/[^a-zA-Z0-9._-]/g, '_').slice(0, 75)
    return clean + ext
  }

  const onSubmit = (data: any) => {
    if (!selectedFile) {
      toast.error('Selecciona un archivo PDF')
      return
    }
    const safeName = sanitizeFilename(selectedFile.name)
    const safeFile = new File([selectedFile], safeName, { type: selectedFile.type })
    const formData = new FormData()
    formData.append('title', data.title)
    formData.append('pdf_file', safeFile)
    if (data.classroom) formData.append('classroom', data.classroom)
    uploadMutation.mutate(formData)
  }

  const status = material?.status as Status
  const statusConfig = status ? STATUS_CONFIG[status] : null
  const StatusIcon = statusConfig?.icon

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Subir material PDF</h1>
          <p className="text-slate-500 text-sm">Sube un PDF y la IA extraerá el texto automáticamente</p>
        </div>
      </div>

      {!materialId ? (
        <Card>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <Input
              label="Título del material"
              placeholder="Ej: Álgebra Básica - Unidad 2"
              error={errors.title?.message}
              {...register('title', { required: 'El título es obligatorio' })}
            />

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Clase asociada (opcional)
              </label>
              <select
                {...register('classroom')}
                className="w-full px-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:ring-2 focus:ring-primary-500"
              >
                <option value="">Sin clase asignada</option>
                {classes?.map((c: any) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>

            <FileUpload
              accept=".pdf"
              maxSizeMB={20}
              label="Archivo PDF"
              onFile={setSelectedFile}
              uploadedFile={selectedFile}
              onRemove={() => setSelectedFile(null)}
            />

            <Button
              type="submit"
              isLoading={uploadMutation.isPending}
              disabled={!selectedFile}
              className="w-full"
              size="lg"
            >
              Subir PDF y extraer texto
            </Button>
          </form>
        </Card>
      ) : (
        <Card className="text-center py-8">
          {StatusIcon && (
            <StatusIcon className={`w-16 h-16 mx-auto mb-4 ${statusConfig?.color}`} />
          )}
          <h2 className="text-xl font-bold text-slate-900 mb-2">
            {statusConfig?.label}
          </h2>

          {(status === 'pending' || status === 'processing') && (
            <>
              <p className="text-slate-500 mb-6">
                Estamos extrayendo el texto del PDF. Esto puede tardar unos segundos...
              </p>
              <ProgressBar progress={status === 'processing' ? 60 : 20} animated />
            </>
          )}

          {status === 'completed' && (
            <>
              <p className="text-slate-500 mb-2">
                Se extrajeron <strong>{material?.page_count} páginas</strong> y{' '}
                <strong>{material?.extracted_text?.length?.toLocaleString()} caracteres</strong>.
              </p>
              <p className="text-slate-500 mb-6">
                El texto ya está listo para generar preguntas con IA.
              </p>
              <div className="flex gap-3 justify-center flex-wrap">
                <Button variant="outline" onClick={() => navigate('/materials/upload')}>
                  Subir otro PDF
                </Button>
                <Button
                  variant="outline"
                  onClick={() => navigate(`/materials/${material?.id}`)}
                  className="gap-2"
                >
                  Ver PDF
                </Button>
                <Button
                  onClick={() => navigate('/activities/new', { state: { materialId: material?.id } })}
                  className="gap-2"
                >
                  <Sparkles className="w-4 h-4" />
                  Generar actividad con IA
                </Button>
              </div>
            </>
          )}

          {status === 'failed' && (
            <>
              <p className="text-red-600 mb-6">{material?.error_message || 'No se pudo extraer el texto'}</p>
              <Button onClick={() => setMaterialId(null)}>
                Intentar con otro archivo
              </Button>
            </>
          )}
        </Card>
      )}
    </div>
  )
}
