import { NavLink, Link } from 'react-router-dom'
import {
  LayoutDashboard, BookOpen, Library, BarChart2, Settings,
  GraduationCap, Upload
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { label: 'Panel', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Mis Clases', href: '/classes', icon: GraduationCap },
  { label: 'Subir PDF', href: '/materials/upload', icon: Upload },
  { label: 'Biblioteca', href: '/library', icon: Library },
  { label: 'Ajustes', href: '/settings', icon: Settings },
]

interface SidebarProps {
  onClose?: () => void
}

export default function Sidebar({ onClose }: SidebarProps) {
  return (
    <aside className="h-full w-60 bg-white border-r border-slate-200 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center gap-3 px-5 border-b border-slate-100 flex-shrink-0">
        <div className="w-8 h-8 rounded-xl bg-primary-700 flex items-center justify-center flex-shrink-0">
          <BookOpen size={16} className="text-white" />
        </div>
        <span className="font-bold text-primary-800 text-lg">LearnLeague</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ label, href, icon: Icon }) => (
          <NavLink
            key={href}
            to={href}
            onClick={onClose}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                isActive
                  ? 'bg-primary-50 text-primary-700 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
              )
            }
          >
            <Icon size={18} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Bottom: create activity CTA */}
      <div className="p-3 border-t border-slate-100">
        <Link
          to="/activities/new"
          onClick={onClose}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-primary-700 hover:bg-primary-600 text-white text-sm font-semibold rounded-xl transition-colors"
        >
          ✨ Nueva actividad IA
        </Link>
      </div>
    </aside>
  )
}
