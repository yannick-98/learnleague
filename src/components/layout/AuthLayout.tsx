import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { BookOpen } from 'lucide-react'

interface AuthLayoutProps {
  children: ReactNode
  title: string
  subtitle?: string
}

export function AuthLayout({ children, title, subtitle }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-800 via-primary-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-accent/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur flex items-center justify-center">
              <BookOpen size={24} className="text-white" />
            </div>
            <span className="font-display font-bold text-3xl text-white">
              LearnLeague
            </span>
          </Link>
          {subtitle && (
            <p className="mt-2 text-white/70 text-sm">{subtitle}</p>
          )}
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-2xl p-8">
          <h1 className="text-2xl font-bold text-slate-900 mb-6 text-center">{title}</h1>
          {children}
        </div>

        {/* Footer */}
        <p className="text-center text-white/50 text-xs mt-6">
          © 2024 LearnLeague · Todos los derechos reservados
        </p>
      </div>
    </div>
  )
}
