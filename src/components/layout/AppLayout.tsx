import { useState } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { Sidebar } from './Sidebar'
import { Header } from './Header'

const pageTitles: Record<string, string> = {
  '/': 'Painel',
  '/alunos': 'Alunos',
  '/alunos/novo': 'Novo Aluno',
  '/classes': 'Classes',
  '/classes/nova': 'Nova Classe',
  '/relatorios/domingo': 'Relatório por Domingo',
  '/relatorios/frequencia': 'Registro de Frequência',
  '/usuarios': 'Usuários',
}

function getTitle(pathname: string): string {
  if (pageTitles[pathname]) return pageTitles[pathname]
  if (pathname.includes('/editar')) return 'Editar'
  if (pathname.includes('/aulas/nova')) return 'Nova Aula'
  if (pathname.includes('/aulas/')) return 'Lista de Presença'
  if (pathname.match(/\/alunos\/[^/]+$/)) return 'Detalhe do Aluno'
  if (pathname.match(/\/classes\/[^/]+$/)) return 'Detalhe da Classe'
  return 'EBD Manager'
}

export function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { pathname } = useLocation()

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <Header onMenuClick={() => setSidebarOpen(true)} title={getTitle(pathname)} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
