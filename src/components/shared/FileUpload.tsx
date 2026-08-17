import { useState, useRef, useCallback } from 'react'
import type { DragEvent, ChangeEvent } from 'react'
import { Upload, FileText, X, CheckCircle, AlertCircle } from 'lucide-react'
import { cn, formatFileSize } from '@/lib/utils'
import { ProgressBar } from '@/components/ui/ProgressBar'

interface FileUploadProps {
  accept?: string
  maxSizeMB?: number
  onFile: (file: File) => void
  uploading?: boolean
  uploadProgress?: number
  uploadedFile?: File | null
  onRemove?: () => void
  label?: string
  hint?: string
  error?: string
  className?: string
}

export function FileUpload({
  accept = '.pdf',
  maxSizeMB = 50,
  onFile,
  uploading = false,
  uploadProgress = 0,
  uploadedFile,
  onRemove,
  label = 'Arrastra tu PDF aquí',
  hint = 'o haz clic para seleccionar',
  error,
  className,
}: FileUploadProps) {
  const [dragging, setDragging] = useState(false)
  const [sizeError, setSizeError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = useCallback(
    (file: File) => {
      setSizeError(null)
      const maxBytes = maxSizeMB * 1024 * 1024
      if (file.size > maxBytes) {
        setSizeError(`El archivo es demasiado grande. Máximo ${maxSizeMB}MB`)
        return
      }
      onFile(file)
    },
    [maxSizeMB, onFile]
  )

  const handleDrop = useCallback(
    (e: DragEvent) => {
      e.preventDefault()
      setDragging(false)
      const file = e.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile]
  )

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) handleFile(file)
    e.target.value = ''
  }

  const combinedError = error || sizeError

  if (uploadedFile) {
    return (
      <div className={cn('rounded-xl border border-slate-200 bg-white p-4', className)}>
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-red-100 flex items-center justify-center flex-shrink-0">
            <FileText size={20} className="text-red-600" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-slate-900 truncate text-sm">{uploadedFile.name}</p>
            <p className="text-xs text-slate-500">{formatFileSize(uploadedFile.size)}</p>
            {uploading && (
              <div className="mt-2">
                <ProgressBar value={uploadProgress} color="blue" animated />
                <p className="text-xs text-slate-500 mt-1">Subiendo... {uploadProgress}%</p>
              </div>
            )}
          </div>
          {!uploading && (
            <div className="flex items-center gap-2">
              {uploadProgress === 100 ? (
                <CheckCircle size={18} className="text-green-500" />
              ) : null}
              <button
                onClick={onRemove}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
                aria-label="Quitar archivo"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => e.key === 'Enter' && inputRef.current?.click()}
        onDragEnter={(e) => { e.preventDefault(); setDragging(true) }}
        onDragLeave={() => setDragging(false)}
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className={cn(
          'relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-200',
          'focus:outline-none focus:ring-2 focus:ring-primary-500',
          dragging
            ? 'border-primary-500 bg-primary-50 scale-[1.01]'
            : combinedError
            ? 'border-red-300 bg-red-50'
            : 'border-slate-300 bg-slate-50 hover:border-primary-400 hover:bg-primary-50/50',
        )}
        aria-label={`${label}. ${hint}`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          onChange={handleChange}
          className="hidden"
          aria-hidden="true"
        />
        <div className="flex flex-col items-center gap-3">
          <div
            className={cn(
              'w-14 h-14 rounded-2xl flex items-center justify-center transition-colors',
              dragging ? 'bg-primary-100 text-primary-700' : 'bg-white text-slate-400 shadow-sm'
            )}
          >
            <Upload size={26} />
          </div>
          <div>
            <p className="font-semibold text-slate-700">{label}</p>
            <p className="text-sm text-slate-500 mt-0.5">{hint}</p>
          </div>
          <div className="flex gap-3 text-xs text-slate-400">
            <span className="bg-white px-2 py-1 rounded-md border border-slate-200">PDF</span>
            <span className="bg-white px-2 py-1 rounded-md border border-slate-200">Máx. {maxSizeMB}MB</span>
          </div>
        </div>
      </div>
      {combinedError && (
        <div className="flex items-center gap-2 mt-2 text-red-600 text-sm">
          <AlertCircle size={14} />
          {combinedError}
        </div>
      )}
    </div>
  )
}
