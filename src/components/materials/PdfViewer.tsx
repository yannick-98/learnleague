import { useEffect, useState } from 'react'
import { ExternalLink } from 'lucide-react'
import { materialsApi } from '@/lib/api'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

interface PdfViewerProps {
  materialId: number
  title?: string
  className?: string
}

export default function PdfViewer({ materialId, title = 'PDF', className = '' }: PdfViewerProps) {
  const [blobUrl, setBlobUrl] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let objectUrl: string | null = null
    let cancelled = false

    materialsApi.fetchPdfBlob(materialId)
      .then((blob) => {
        if (cancelled) return
        objectUrl = URL.createObjectURL(blob)
        setBlobUrl(objectUrl)
        setError(null)
      })
      .catch(() => {
        if (!cancelled) setError('No se pudo cargar el PDF.')
      })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [materialId])

  if (error) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 p-8 ${className}`}>
        <p className="text-sm text-slate-500">{error}</p>
      </div>
    )
  }

  if (!blobUrl) {
    return (
      <div className={`flex items-center justify-center bg-slate-50 rounded-xl border border-slate-200 min-h-[480px] ${className}`}>
        <LoadingSpinner size="lg" text="Cargando PDF..." />
      </div>
    )
  }

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-end">
        <a
          href={blobUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1.5 text-sm font-medium text-primary-800 hover:underline"
        >
          <ExternalLink size={14} />
          Abrir en nueva pestaña
        </a>
      </div>
      <iframe
        src={blobUrl}
        title={title}
        className="w-full h-[70vh] min-h-[480px] rounded-xl border border-slate-200 bg-white"
      />
    </div>
  )
}
