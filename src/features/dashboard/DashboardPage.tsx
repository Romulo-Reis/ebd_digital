import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Users, GraduationCap, TrendingUp, Calendar, Plus } from 'lucide-react'
import { getDashboardStats } from '@/features/relatorios/relatoriosService'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { formatDate, getNextSunday } from '@/lib/utils'
import { useAuthStore } from '@/store/authStore'

interface Stats {
  totalAlunos: number
  totalClasses: number
  frequenciaMedia: number
  ultimaAula: Date | null
}

export default function DashboardPage() {
  const { user } = useAuthStore()
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    getDashboardStats()
      .then(setStats)
      .finally(() => setLoading(false))
  }, [])

  const proximoDomingo = getNextSunday()

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold">Bom dia, {user?.nome?.split(' ')[0]}!</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Próximo domingo: {formatDate(proximoDomingo, 'EEEE, dd/MM/yyyy')}
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Alunos Ativos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats?.totalAlunos ?? 0}</p>
            )}
            <Button asChild variant="link" className="p-0 h-auto text-xs mt-1">
              <Link to="/alunos">Ver todos</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Classes Ativas</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats?.totalClasses ?? 0}</p>
            )}
            <Button asChild variant="link" className="p-0 h-auto text-xs mt-1">
              <Link to="/classes">Ver todas</Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Frequência Média (30 dias)
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {loading ? (
              <Skeleton className="h-8 w-16" />
            ) : (
              <p className="text-3xl font-bold">{stats?.frequenciaMedia ?? 0}%</p>
            )}
            <Button asChild variant="link" className="p-0 h-auto text-xs mt-1">
              <Link to="/relatorios/frequencia">Ver relatório</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Ações rápidas
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/alunos/novo">
                <Plus className="h-4 w-4 mr-2" />
                Novo Aluno
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/classes/nova">
                <Plus className="h-4 w-4 mr-2" />
                Nova Classe
              </Link>
            </Button>
            <Button asChild className="w-full justify-start" variant="outline">
              <Link to="/relatorios/domingo">
                <TrendingUp className="h-4 w-4 mr-2" />
                Relatório do Domingo
              </Link>
            </Button>
          </CardContent>
        </Card>

        {stats?.ultimaAula && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Última Aula Registrada</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatDate(stats.ultimaAula)}</p>
              <Button asChild variant="link" className="p-0 h-auto text-xs mt-2">
                <Link to="/relatorios/domingo">Ver relatório deste domingo</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
