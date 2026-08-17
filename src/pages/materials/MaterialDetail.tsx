import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, FileText, Sparkles, Eye } from 'lucide-react'
import { materialsApi, unwrapResponse } from '../../lib/api'
import Button from '../../components/ui/Button'
import Card from '../../components/ui/Card'
import Badge from '../../components/ui/Badge'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import PdfViewer from '../../components/materials/PdfViewer'
import { getStatusLabel } from '../../lib/utils'

type ViewTab = 'pdf' | 'text'

export default function MaterialDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<ViewTab>('pdf')

  const { data: material, isLoading } = useQuery({
    queryKey: ['material', id],
    queryFn: () => materialsApi.get(Number(id)).then(r => unwrapResponse(r)),
  })

  if (isLoading) return <div className="flex justify-center py-20"><LoadingSpinner size="lg" /></div>
  if (!material) return <div className="text-center py-20"><p className="text-slate-500">Material no encontrado</p></div>

  const hasPdf = Boolean(material.pdf_file || material.file_url)

  return (
    <div className="max-w-4xl mx-auto space-y-6 animate-fade-in">
      <div className="flex items-center gap-4">
        <button onClick={() => navigate(-1)} className="p-2 hover:bg-slate-100 rounded-lg">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">{material.title}</h1>
          <p className="text-slate-500 text-sm">
            {material.page_count} páginas · {(material.file_size / 1024).toFixed(0)} KB
          </p>
        </div>
        <Badge variant={
          material.status === 'completed' ? 'success' :
          material.status === 'failed' ? 'error' :
          material.status === 'processing' ? 'warning' : 'default'
        }>
          {getStatusLabel(material.status)}
        </Badge>
      </div>

      {material.status === 'completed' && (
        <div className="flex justify-end">
          <Button
            onClick={() => navigate('/activities/new', { state: { materialId: material.id } })}
            className="gap-2"
          >
            <Sparkles className="w-4 h-4" />
            Generar actividad con IA
          </Button>
        </div>
      )}

      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('pdf')}
          disabled={!hasPdf}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'pdf' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700 disabled:opacity-40'
          }`}
        >
          <Eye size={14} />
          Ver PDF
        </button>
        <button
          onClick={() => setActiveTab('text')}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            activeTab === 'text' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'
          }`}
        >
          <FileText size={14} />
          Texto extraído
        </button>
      </div>

      {activeTab === 'pdf' && (
        hasPdf ? (
          <PdfViewer materialId={material.id} title={material.title} />
        ) : (
          <Card>
            <p className="text-slate-500 text-sm">No hay archivo PDF asociado a este material.</p>
          </Card>
        )
      )}

      {activeTab === 'text' && (
        <Card>
          <div className="flex items-center gap-2 mb-4">
            <FileText className="w-5 h-5 text-slate-500" />
            <h2 className="font-semibold text-slate-900">Texto extraído</h2>
            <span className="text-sm text-slate-500">({material.extracted_text?.length?.toLocaleString('es-ES') ?? 0} caracteres)</span>
          </div>
          {material.extracted_text ? (
            <div className="bg-slate-50 rounded-xl p-4 max-h-96 overflow-y-auto">
              <pre className="text-sm text-slate-700 whitespace-pre-wrap font-sans leading-relaxed">
                {material.extracted_text}
              </pre>
            </div>
          ) : (
            <p className="text-slate-500 text-sm">
              {material.status === 'pending' ? 'Procesando...' :
               material.status === 'failed' ? material.error_message || 'Error al extraer el texto' :
               'Sin texto disponible'}
            </p>
          )}
        </Card>
      )}
    </div>
  )
}
