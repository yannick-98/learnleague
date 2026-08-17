import { useState } from 'react'
import { ExternalLink, Copy, Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import toast from 'react-hot-toast'

interface QRCodeDisplayProps {
  value: string
  size?: number
  className?: string
  showUrl?: boolean
  label?: string
}

export function QRCodeDisplay({ value, size = 200, className, showUrl = true, label }: QRCodeDisplayProps) {
  const [copied, setCopied] = useState(false)
  const [imgError, setImgError] = useState(false)

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(value)}&format=svg&color=1e40af&bgcolor=ffffff&qzone=2`

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setCopied(true)
      toast.success('URL copiada al portapapeles')
      setTimeout(() => setCopied(false), 2000)
    } catch {
      toast.error('No se pudo copiar')
    }
  }

  return (
    <div className={cn('flex flex-col items-center gap-3', className)}>
      {label && (
        <p className="text-sm font-medium text-slate-600">{label}</p>
      )}
      <div
        className="bg-white p-3 rounded-2xl shadow-lg border border-slate-200"
        style={{ width: size + 24, height: size + 24 }}
      >
        {imgError ? (
          <FallbackQR size={size} value={value} />
        ) : (
          <img
            src={qrUrl}
            alt={`Código QR para ${value}`}
            width={size}
            height={size}
            onError={() => setImgError(true)}
            className="rounded-xl"
          />
        )}
      </div>

      {showUrl && (
        <div className="flex items-center gap-2 bg-slate-100 rounded-xl px-3 py-2 max-w-xs">
          <p className="text-xs text-slate-600 truncate flex-1">{value}</p>
          <div className="flex gap-1">
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              aria-label="Copiar URL"
            >
              {copied ? <Check size={14} className="text-green-500" /> : <Copy size={14} />}
            </button>
            <a
              href={value}
              target="_blank"
              rel="noopener noreferrer"
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-200 hover:text-slate-700 transition-colors"
              aria-label="Abrir en nueva pestaña"
            >
              <ExternalLink size={14} />
            </a>
          </div>
        </div>
      )}
    </div>
  )
}

// Simple fallback QR-like display when API fails
function FallbackQR({ size, value }: { size: number; value: string }) {
  const hash = value.split('').reduce((a, c) => a + c.charCodeAt(0), 0)
  const gridSize = 10
  const cellSize = Math.floor(size / gridSize)

  const cells = Array.from({ length: gridSize * gridSize }, (_, i) => {
    const x = i % gridSize
    const y = Math.floor(i / gridSize)
    // Borders always filled (finder patterns)
    if (x === 0 || x === gridSize - 1 || y === 0 || y === gridSize - 1) return true
    if ((x < 3 && y < 3) || (x > gridSize - 4 && y < 3) || (x < 3 && y > gridSize - 4)) return true
    return (hash * (i + 1) * 31) % 100 > 45
  })

  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${gridSize}, ${cellSize}px)`,
        gap: 1,
        width: size,
        height: size,
      }}
    >
      {cells.map((filled, i) => (
        <div
          key={i}
          style={{
            width: cellSize - 1,
            height: cellSize - 1,
            backgroundColor: filled ? '#1e40af' : '#ffffff',
            borderRadius: 1,
          }}
        />
      ))}
    </div>
  )
}
