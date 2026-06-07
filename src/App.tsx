import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuthListener } from '@/features/auth/useAuth'
import { AppLayout } from '@/components/layout/AppLayout'
import { ProtectedRoute } from '@/components/shared/ProtectedRoute'
import { LoadingSpinner } from '@/components/shared/LoadingSpinner'
import { Toaster } from '@/components/ui/toaster'

const LoginPage = lazy(() => import('@/features/auth/LoginPage'))
const RecuperarSenhaPage = lazy(() => import('@/features/auth/RecuperarSenhaPage'))
const DashboardPage = lazy(() => import('@/features/dashboard/DashboardPage'))
const AlunosPage = lazy(() => import('@/features/alunos/AlunosPage'))
const AlunoFormPage = lazy(() => import('@/features/alunos/AlunoFormPage'))
const AlunoDetalhePage = lazy(() => import('@/features/alunos/AlunoDetalhePage'))
const ClassesPage = lazy(() => import('@/features/classes/ClassesPage'))
const ClasseFormPage = lazy(() => import('@/features/classes/ClasseFormPage'))
const ClasseDetalhePage = lazy(() => import('@/features/classes/ClasseDetalhePage'))
const AulaFormPage = lazy(() => import('@/features/aulas/AulaFormPage'))
const FrequenciaPage = lazy(() => import('@/features/aulas/FrequenciaPage'))
const RelatorioDomingoPage = lazy(() => import('@/features/relatorios/RelatorioDomingoPage'))
const RelatorioFrequenciaPage = lazy(() => import('@/features/relatorios/RelatorioFrequenciaPage'))
const UsuariosPage = lazy(() => import('@/features/usuarios/UsuariosPage'))

function AppRoutes() {
  useAuthListener()

  return (
    <Suspense fallback={<LoadingSpinner fullScreen />}>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/recuperar-senha" element={<RecuperarSenhaPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/" element={<DashboardPage />} />

            <Route path="/alunos" element={<AlunosPage />} />
            <Route path="/alunos/novo" element={<AlunoFormPage />} />
            <Route path="/alunos/:id" element={<AlunoDetalhePage />} />
            <Route path="/alunos/:id/editar" element={<AlunoFormPage />} />

            <Route path="/classes" element={<ClassesPage />} />
            <Route path="/classes/nova" element={<ClasseFormPage />} />
            <Route path="/classes/:id" element={<ClasseDetalhePage />} />
            <Route path="/classes/:id/editar" element={<ClasseFormPage />} />
            <Route path="/classes/:id/aulas/nova" element={<AulaFormPage />} />
            <Route path="/classes/:id/aulas/:aulaId" element={<FrequenciaPage />} />

            <Route path="/relatorios/domingo" element={<RelatorioDomingoPage />} />
            <Route path="/relatorios/frequencia" element={<RelatorioFrequenciaPage />} />

            <Route
              path="/usuarios"
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <UsuariosPage />
                </ProtectedRoute>
              }
            />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
      <Toaster />
    </BrowserRouter>
  )
}
