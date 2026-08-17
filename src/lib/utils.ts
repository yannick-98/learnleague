import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'
import { format, formatDistanceToNow } from 'date-fns'
import { es } from 'date-fns/locale'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string): string {
  try {
    return format(new Date(dateStr), "d 'de' MMMM, yyyy", { locale: es })
  } catch {
    return dateStr
  }
}

export function formatDateTime(dateStr: string): string {
  try {
    return format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: es })
  } catch {
    return dateStr
  }
}

export function formatRelative(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: es })
  } catch {
    return dateStr
  }
}

export function getDifficultyColor(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'text-green-700 bg-green-100'
    case 'medium': return 'text-yellow-700 bg-yellow-100'
    case 'hard': return 'text-red-700 bg-red-100'
    default: return 'text-gray-700 bg-gray-100'
  }
}

export function getDifficultyLabel(difficulty: string): string {
  switch (difficulty) {
    case 'easy': return 'Fácil'
    case 'medium': return 'Media'
    case 'hard': return 'Difícil'
    case 'mixed': return 'Mixta'
    default: return difficulty
  }
}

export const EDUCATION_LEVELS = [
  { value: 'primary', label: 'Primaria' },
  { value: 'secondary', label: 'Secundaria (ESO)' },
  { value: 'bachillerato', label: 'Bachillerato' },
  { value: 'fp', label: 'Formación Profesional' },
  { value: 'university', label: 'Universidad' },
  { value: 'other', label: 'Otros' },
] as const

export function getEducationLevelLabel(level: string): string {
  return EDUCATION_LEVELS.find((l) => l.value === level)?.label ?? level
}

export function getRoleLabel(role: string): string {
  switch (role) {
    case 'teacher': return 'Profesor'
    case 'admin': return 'Administrador'
    default: return role
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'waiting': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'active': return 'bg-green-100 text-green-700 border-green-200'
    case 'finished': return 'bg-slate-100 text-slate-600 border-slate-200'
    case 'draft': return 'bg-slate-100 text-slate-600 border-slate-200'
    case 'ready': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'played': return 'bg-purple-100 text-purple-700 border-purple-200'
    case 'pending': return 'bg-yellow-100 text-yellow-700 border-yellow-200'
    case 'processing': return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'completed': return 'bg-green-100 text-green-700 border-green-200'
    case 'failed': return 'bg-red-100 text-red-700 border-red-200'
    default: return 'bg-gray-100 text-gray-700 border-gray-200'
  }
}

export function getStatusLabel(status: string): string {
  switch (status) {
    case 'waiting': return 'Esperando'
    case 'active': return 'En curso'
    case 'finished': return 'Finalizada'
    case 'draft': return 'Borrador'
    case 'ready': return 'Lista'
    case 'played': return 'Jugada'
    case 'pending': return 'Pendiente'
    case 'processing': return 'Procesando'
    case 'completed': return 'Completado'
    case 'failed': return 'Error'
    default: return status
  }
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function downloadCSV(data: string, filename: string): void {
  const blob = new Blob(['\uFEFF' + data], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function generateCSV(headers: string[], rows: (string | number)[][]): string {
  const escape = (val: string | number) => `"${String(val).replace(/"/g, '""')}"`
  const csvRows = [
    headers.map(escape).join(','),
    ...rows.map(row => row.map(escape).join(',')),
  ]
  return csvRows.join('\n')
}

export function downloadJSON(data: unknown, filename: string): void {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}

export function getInitials(firstName: string, lastName: string): string {
  return `${firstName?.[0] ?? ''}${lastName?.[0] ?? ''}`.toUpperCase()
}

export function getAvatarBg(alias: string): string {
  const colors = [
    'bg-blue-500', 'bg-purple-500', 'bg-green-500', 'bg-orange-500',
    'bg-pink-500', 'bg-teal-500', 'bg-red-500', 'bg-indigo-500',
  ]
  const index = alias.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return colors[index % colors.length]
}

export function truncate(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return text.slice(0, maxLength) + '...'
}

export const EMOJIS = ['🦊', '🐺', '🦁', '🐯', '🐻', '🐸', '🐧', '🦄', '🐲', '🦋', '🦅', '🐬', '🐼', '🐙', '🦎', '🐝']

export function getClassColors(): string[] {
  return [
    '#3b82f6', '#8b5cf6', '#ec4899', '#10b981',
    '#f59e0b', '#ef4444', '#6366f1', '#14b8a6',
  ]
}
