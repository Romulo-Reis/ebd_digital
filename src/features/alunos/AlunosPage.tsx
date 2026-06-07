import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, Search, UserCheck, UserX } from 'lucide-react'
import { getAlunos, toggleAlunoAtivo } from './alunosService'
import type { Aluno } from '@/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from '@/hooks/useToast'
import { formatDate } from '@/lib/utils'

export default function AlunosPage() {
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filtroAtivo, setFiltroAtivo] = useState<boolean | null>(true)
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; aluno: Aluno | null }>({
    open: false,
    aluno: null,
  })

  useEffect(() => {
    loadAlunos()
  }, [])

  async function loadAlunos() {
    setLoading(true)
    try {
      const data = await getAlunos()
      setAlunos(data)
    } catch {
      toast({ title: 'Erro ao carregar alunos', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    if (!confirmDialog.aluno) return
    try {
      await toggleAlunoAtivo(confirmDialog.aluno.id, !confirmDialog.aluno.ativo)
      toast({
        title: confirmDialog.aluno.ativo ? 'Aluno inativado' : 'Aluno reativado',
        variant: 'success' as never,
      })
      await loadAlunos()
    } catch {
      toast({ title: 'Erro ao atualizar aluno', variant: 'destructive' })
    } finally {
      setConfirmDialog({ open: false, aluno: null })
    }
  }

  const filtered = alunos.filter((a) => {
    const matchSearch = a.nome.toLowerCase().includes(search.toLowerCase())
    const matchAtivo = filtroAtivo === null ? true : a.ativo === filtroAtivo
    return matchSearch && matchAtivo
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          <button
            onClick={() => setFiltroAtivo(true)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filtroAtivo === true
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Ativos
          </button>
          <button
            onClick={() => setFiltroAtivo(false)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filtroAtivo === false
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Inativos
          </button>
          <button
            onClick={() => setFiltroAtivo(null)}
            className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
              filtroAtivo === null
                ? 'bg-primary text-primary-foreground'
                : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
          >
            Todos
          </button>
        </div>

        <Button asChild>
          <Link to="/alunos/novo">
            <Plus className="h-4 w-4" />
            Novo Aluno
          </Link>
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Nascimento</th>
              <th className="text-left p-3 font-medium hidden md:table-cell">Telefone</th>
              <th className="text-left p-3 font-medium">Status</th>
              <th className="p-3" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="p-3 hidden sm:table-cell"><Skeleton className="h-4 w-24" /></td>
                  <td className="p-3 hidden md:table-cell"><Skeleton className="h-4 w-28" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-14 rounded-full" /></td>
                  <td className="p-3"><Skeleton className="h-8 w-20" /></td>
                </tr>
              ))
            ) : filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  {search ? 'Nenhum aluno encontrado.' : 'Nenhum aluno cadastrado.'}
                  {!search && (
                    <div className="mt-2">
                      <Button asChild size="sm">
                        <Link to="/alunos/novo">Cadastrar agora</Link>
                      </Button>
                    </div>
                  )}
                </td>
              </tr>
            ) : (
              filtered.map((aluno) => (
                <tr key={aluno.id} className="border-b hover:bg-muted/30 transition-colors">
                  <td className="p-3 font-medium">
                    <Link to={`/alunos/${aluno.id}`} className="hover:underline text-primary">
                      {aluno.nome}
                    </Link>
                  </td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">
                    {aluno.dataNascimento ? formatDate(aluno.dataNascimento) : '—'}
                  </td>
                  <td className="p-3 text-muted-foreground hidden md:table-cell">
                    {aluno.telefone || '—'}
                  </td>
                  <td className="p-3">
                    <Badge variant={aluno.ativo ? 'success' : 'secondary'}>
                      {aluno.ativo ? 'Ativo' : 'Inativo'}
                    </Badge>
                  </td>
                  <td className="p-3">
                    <div className="flex items-center gap-1 justify-end">
                      <Button asChild size="sm" variant="ghost">
                        <Link to={`/alunos/${aluno.id}/editar`}>Editar</Link>
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setConfirmDialog({ open: true, aluno })}
                        aria-label={aluno.ativo ? 'Inativar aluno' : 'Reativar aluno'}
                      >
                        {aluno.ativo ? (
                          <UserX className="h-4 w-4 text-destructive" />
                        ) : (
                          <UserCheck className="h-4 w-4 text-green-600" />
                        )}
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((s) => ({ ...s, open }))}
        title={confirmDialog.aluno?.ativo ? 'Inativar aluno?' : 'Reativar aluno?'}
        description={
          confirmDialog.aluno?.ativo
            ? `${confirmDialog.aluno?.nome} será marcado como inativo e não aparecerá nas matrículas ativas.`
            : `${confirmDialog.aluno?.nome} será reativado.`
        }
        confirmLabel={confirmDialog.aluno?.ativo ? 'Inativar' : 'Reativar'}
        variant={confirmDialog.aluno?.ativo ? 'destructive' : 'default'}
        onConfirm={handleToggle}
      />
    </div>
  )
}
