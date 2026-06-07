import { NavLink } from 'react-router-dom'
import {
  LayoutDashboard,
  Users,
  GraduationCap,
  BookOpen,
  BarChart2,
  Settings,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  secretario: 'Secretário(a)',
  professor: 'Professor(a)',
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Painel', end: true },
  { to: '/alunos', icon: Users, label: 'Alunos' },
  { to: '/classes', icon: GraduationCap, label: 'Classes' },
  { to: '/relatorios/domingo', icon: BarChart2, label: 'Rel. Domingo' },
  { to: '/relatorios/frequencia', icon: BookOpen, label: 'Rel. Frequência' },
]

const adminItems = [
  { to: '/usuarios', icon: Settings, label: 'Usuários' },
]

interface SidebarProps {
  open: boolean
  onClose: () => void
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const { user } = useAuthStore()

  return (
    <>
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={cn(
          'fixed top-0 left-0 z-30 h-full w-64 bg-blue-950 text-white flex flex-col transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto',
          open ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex items-center justify-between p-4 border-b border-blue-800">
          <div className="flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-blue-300" />
            <span className="font-bold text-lg">EBD Manager</span>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden text-white hover:bg-blue-800"
            onClick={onClose}
            aria-label="Fechar menu"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {navItems.map(({ to, icon: Icon, label, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              onClick={onClose}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-700 text-white'
                    : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                )
              }
            >
              <Icon className="h-5 w-5 shrink-0" />
              {label}
            </NavLink>
          ))}

          {user?.role === 'admin' && (
            <>
              <Separator className="my-2 bg-blue-800" />
              {adminItems.map(({ to, icon: Icon, label }) => (
                <NavLink
                  key={to}
                  to={to}
                  onClick={onClose}
                  className={({ isActive }) =>
                    cn(
                      'flex items-center gap-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                      isActive
                        ? 'bg-blue-700 text-white'
                        : 'text-blue-200 hover:bg-blue-800 hover:text-white'
                    )
                  }
                >
                  <Icon className="h-5 w-5 shrink-0" />
                  {label}
                </NavLink>
              ))}
            </>
          )}
        </nav>

        <div className="p-4 border-t border-blue-800">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.nome}</p>
              <p className="text-xs text-blue-300 truncate">{user?.email}</p>
            </div>
            <Badge variant="secondary" className="shrink-0 text-xs bg-blue-800 text-blue-200 border-0">
              {user?.role ? roleLabel[user.role] : ''}
            </Badge>
          </div>
        </div>
      </aside>
    </>
  )
}
