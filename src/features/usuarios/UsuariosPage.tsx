import { useEffect, useState } from 'react'
import { where, orderBy } from 'firebase/firestore'
import { fetchCollection } from '@/lib/firestore'
import type { AppUser } from '@/types'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/hooks/useToast'

const roleLabel: Record<string, string> = {
  admin: 'Administrador',
  secretario: 'Secretário(a)',
  professor: 'Professor(a)',
}

export default function UsuariosPage() {
  const [usuarios, setUsuarios] = useState<AppUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchCollection<AppUser>('users', orderBy('nome'))
      .then(setUsuarios)
      .catch(() => toast({ title: 'Erro ao carregar usuários', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [])

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Gerencie os usuários do sistema. Para criar novos usuários, utilize o console do Firebase Authentication e depois registre o documento em Firestore com o UID e o role desejado.
      </p>

      <div className="rounded-md border">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="text-left p-3 font-medium">Nome</th>
              <th className="text-left p-3 font-medium hidden sm:table-cell">E-mail</th>
              <th className="text-left p-3 font-medium">Perfil</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="border-b">
                  <td className="p-3"><Skeleton className="h-4 w-40" /></td>
                  <td className="p-3 hidden sm:table-cell"><Skeleton className="h-4 w-48" /></td>
                  <td className="p-3"><Skeleton className="h-5 w-24 rounded-full" /></td>
                </tr>
              ))
            ) : usuarios.length === 0 ? (
              <tr>
                <td colSpan={3} className="p-8 text-center text-muted-foreground">
                  Nenhum usuário cadastrado.
                </td>
              </tr>
            ) : (
              usuarios.map((u) => (
                <tr key={u.uid} className="border-b hover:bg-muted/30">
                  <td className="p-3 font-medium">{u.nome}</td>
                  <td className="p-3 text-muted-foreground hidden sm:table-cell">{u.email}</td>
                  <td className="p-3">
                    <Badge variant={u.role === 'admin' ? 'default' : 'secondary'}>
                      {roleLabel[u.role] ?? u.role}
                    </Badge>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
