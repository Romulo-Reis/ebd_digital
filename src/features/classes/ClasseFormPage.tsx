import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { classeSchema, type ClasseFormData } from './classes.types'
import { createClasse, getClasse, updateClasse } from './classesService'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/useToast'

export default function ClasseFormPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isEdit = Boolean(id)
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(isEdit)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ClasseFormData>({ resolver: zodResolver(classeSchema) })

  useEffect(() => {
    if (!id) return
    getClasse(id).then((classe) => {
      if (classe) {
        reset({
          nome: classe.nome,
          descricao: classe.descricao,
          professorNome: classe.professorNome,
        })
      }
      setInitialLoading(false)
    })
  }, [id, reset])

  async function onSubmit(data: ClasseFormData) {
    setLoading(true)
    try {
      if (isEdit && id) {
        await updateClasse(id, data)
        toast({ title: 'Classe atualizada com sucesso!' })
      } else {
        await createClasse(data, user!.uid)
        toast({ title: 'Classe criada com sucesso!' })
      }
      navigate('/classes')
    } catch {
      toast({ title: 'Erro ao salvar classe', variant: 'destructive' })
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
          <CardTitle>{isEdit ? 'Editar Classe' : 'Nova Classe'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" {...register('nome')} />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="descricao">Descrição</Label>
              <Textarea id="descricao" rows={2} {...register('descricao')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="professorNome">Professor Responsável</Label>
              <Input id="professorNome" placeholder="Nome do professor" {...register('professorNome')} />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/classes')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || (isEdit && !isDirty)}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Criar classe'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
