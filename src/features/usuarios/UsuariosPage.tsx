import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Pencil, PowerOff, Power } from 'lucide-react'
import { getUsuarios, toggleUsuarioAtivo } from './usuariosService'
import type { AppUser } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/useToast'

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  secretario: 'Secretário(a)',
  professor: 'Professor(a)',
}

export default function UsuariosPage() {
  const { user: currentUser } = useAuthStore()
  const [usuarios, setUsuarios] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)
  const [togglingId, setTogglingId] = useState<string | null>(null)

  useEffect(() => {
    getUsuarios()
      .then(setUsuarios)
      .catch(() => toast({ title: 'Erro ao carregar usuários', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(u: AppUser) {
    if (u.uid === currentUser?.uid) {
      toast({ title: 'Você não pode desativar sua própria conta.', variant: 'destructive' })
      return
    }
    setTogglingId(u.uid)
    try {
      const novoAtivo = !(u.ativo ?? true)
      await toggleUsuarioAtivo(u.uid, novoAtivo)
      setUsuarios((prev) =>
        prev.map((x) => (x.uid === u.uid ? { ...x, ativo: novoAtivo } : x))
      )
      toast({ title: `Usuário ${novoAtivo ? 'ativado' : 'desativado'} com sucesso.` })
    } catch {
      toast({ title: 'Erro ao alterar status do usuário', variant: 'destructive' })
    } finally {
      setTogglingId(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button asChild>
          <Link to="/usuarios/novo">
            <UserPlus className="h-4 w-4 mr-2" />
            Novo Usuário
          </Link>
        </Button>
      </div>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">E-mail</th>
              <th className="text-left p-3 font-medium">Perfil</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">Status</th>
              <th className="p-3 font-medium w-24 text-right">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="p-3 hidden sm:table-cell"><Skeleton className="h-4 w-48" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                  <td className="p-3 hidden sm:table-cell"><Skeleton className="h-5 w-16 rounded-full" /></td>
                  <td className="p-3"><Skeleton className="h-8 w-16 ml-auto" /></td>
                </tr>
              ))
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-muted-foreground">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => {
                const ativo = u.ativo ?? true
                const isSelf = u.uid === currentUser?.uid
                return (
                  <tr key={u.uid} className="border-b hover:bg-muted/30">
                    <td className="p-3 font-medium">{u.nome}</td>
                    <td className="p-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
                    <td className="p-3">
                      <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                        {roleLabel[u.role] ?? u.role}
                      </Badge>
                    </td>
                    <td className="p-3 hidden sm:table-cell">
                      <Badge variant={ativo ? 'outline' : 'destructive'}>
                        {ativo ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </td>
                    <td className="p-3">
                      <div className="flex items-center gap-1 justify-end">
                        <Button asChild size="icon" variant="ghost" title="Editar">
                          <Link to={`/usuarios/${u.uid}/editar`}>
                            <Pencil className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          title={ativo ? 'Desativar' : 'Ativar'}
                          disabled={togglingId === u.uid || isSelf}
                          onClick={() => handleToggle(u)}
                        >
                          {ativo
                            ? <PowerOff className="h-4 w-4 text-destructive" />
                            : <Power className="h-4 w-4 text-green-600" />
                          }
                        </Button>
                      </div>
                    </td>
                  </tr>
                )
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
