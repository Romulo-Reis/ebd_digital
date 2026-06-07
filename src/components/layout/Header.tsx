import { Menu, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { logout } from '@/features/auth/useAuth'
import { toast } from '@/hooks/useToast'

interface HeaderProps {
  onMenuClick: () => void
  title?: string
}

export function Header({ onMenuClick, title }: HeaderProps) {
  async function handleLogout() {
    try {
      await logout()
    } catch {
      toast({ title: 'Erro ao sair', variant: 'destructive' })
    }
  }

  return (
    <header className="h-14 border-b bg-background flex items-center px-4 gap-3 no-print">
      <Button
        variant="ghost"
        size="icon"
        className="lg:hidden"
        onClick={onMenuClick}
        aria-label="Abrir menu"
      >
        <Menu className="h-5 w-5" />
      </Button>

      <h1 className="font-semibold text-lg flex-1">{title}</h1>

      <Button variant="ghost" size="icon" onClick={handleLogout} aria-label="Sair">
        <LogOut className="h-5 w-5" />
      </Button>
    </header>
  )
}
