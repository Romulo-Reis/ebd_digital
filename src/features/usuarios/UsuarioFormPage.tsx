import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import {
  novoUsuarioSchema,
  editarUsuarioSchema,
  type NovoUsuarioFormData,
  type EditarUsuarioFormData,
} from './usuarios.types'
import { createUsuario, updateUsuario } from './usuariosService'
import { fetchDoc } from '@/lib/firestore'
import type { AppUser, UserRole } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/hooks/useToast'

export default function UsuarioFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)
  const [role, setRole] = useState<UserRole>('professor')

  const {
    register: registerCreate,
    handleSubmit: handleCreate,
    formState: { errors: createErrors },
    setValue: setCreateValue,
  } = useForm<NovoUsuarioFormData>({
    resolver: zodResolver(novoUsuarioSchema),
    defaultValues: { role: 'professor' },
  })

  const {
    register: registerEdit,
    handleSubmit: handleEdit,
    reset: resetEdit,
    formState: { errors: editErrors, isDirty },
    setValue: setEditValue,
  } = useForm<EditarUsuarioFormData>({
    resolver: zodResolver(editarUsuarioSchema),
    defaultValues: { role: 'professor' },
  })

  useEffect(() => {
    if (!id) return
    fetchDoc<AppUser>('users', id)
      .then((u) => {
        if (u) {
          resetEdit({ nome: u.nome, role: u.role })
          setRole(u.role)
        }
        setInitialLoading(false)
      })
      .catch(() => {
        toast({ title: 'Erro ao carregar usuário', variant: 'destructive' })
        setInitialLoading(false)
      })
  }, [id, resetEdit])

  async function onCreateSubmit(data: NovoUsuarioFormData) {
    setLoading(true)
    try {
      await createUsuario(data, user!.uid)
      toast({ title: 'Usuário cadastrado com sucesso!' })
      navigate('/usuarios')
    } catch (error) {
      const code = (error as { code?: string }).code
      if (code === 'auth/email-already-in-use') {
        toast({ title: 'Este e-mail já está em uso.', variant: 'destructive' })
      } else {
        toast({ title: 'Erro ao cadastrar usuário', variant: 'destructive' })
      }
    } finally {
      setLoading(false)
    }
  }

  async function onEditSubmit(data: EditarUsuarioFormData) {
    if (!id) return
    setLoading(true)
    try {
      await updateUsuario(id, data)
      toast({ title: 'Usuário atualizado com sucesso!' })
      navigate('/usuarios')
    } catch {
      toast({ title: 'Erro ao atualizar usuário', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  if (initialLoading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar Usuário' : 'Novo Usuário'}</CardTitle>
        </CardHeader>
        <CardContent>
          {isEdit ? (
            <form onSubmit={handleEdit(onEditSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome-edit">Nome *</Label>
                <Input id="nome-edit" {...registerEdit('nome')} />
                {editErrors.nome && (
                  <p className="text-sm text-destructive">{editErrors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Perfil *</Label>
                <Select
                  value={role}
                  onValueChange={(v) => {
                    const val = v as UserRole
                    setRole(val)
                    setEditValue('role', val, { shouldDirty: true })
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="secretario">Secretário(a)</SelectItem>
                    <SelectItem value="professor">Professor(a)</SelectItem>
                  </SelectContent>
                </Select>
                {editErrors.role && (
                  <p className="text-sm text-destructive">{editErrors.role.message}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/usuarios')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading || !isDirty}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Salvar alterações
                </Button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleCreate(onCreateSubmit)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="nome-create">Nome *</Label>
                <Input id="nome-create" {...registerCreate('nome')} />
                {createErrors.nome && (
                  <p className="text-sm text-destructive">{createErrors.nome.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">E-mail *</Label>
                <Input id="email" type="email" autoComplete="off" {...registerCreate('email')} />
                {createErrors.email && (
                  <p className="text-sm text-destructive">{createErrors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="senha">Senha temporária *</Label>
                <Input id="senha" type="password" autoComplete="new-password" {...registerCreate('senha')} />
                {createErrors.senha && (
                  <p className="text-sm text-destructive">{createErrors.senha.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Perfil *</Label>
                <Select
                  value={role}
                  onValueChange={(v) => {
                    const val = v as UserRole
                    setRole(val)
                    setCreateValue('role', val)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Administrador</SelectItem>
                    <SelectItem value="secretario">Secretário(a)</SelectItem>
                    <SelectItem value="professor">Professor(a)</SelectItem>
                  </SelectContent>
                </Select>
                {createErrors.role && (
                  <p className="text-sm text-destructive">{createErrors.role.message}</p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/usuarios')}
                  disabled={loading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Cadastrar usuário
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
