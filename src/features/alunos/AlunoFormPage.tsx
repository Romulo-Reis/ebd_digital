import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { alunoSchema, type AlunoFormData } from './alunos.types'
import { createAluno, getAluno, updateAluno } from './alunosService'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/useToast'

export default function AlunoFormPage() {
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
  } = useForm<AlunoFormData>({ resolver: zodResolver(alunoSchema) })

  useEffect(() => {
    if (!id) return
    getAluno(id).then((aluno) => {
      if (aluno) {
        reset({
          nome: aluno.nome,
          dataNascimento: aluno.dataNascimento,
          telefone: aluno.telefone,
          responsavel: aluno.responsavel,
          observacoes: aluno.observacoes,
        })
      }
      setInitialLoading(false)
    })
  }, [id, reset])

  async function onSubmit(data: AlunoFormData) {
    setLoading(true)
    try {
      if (isEdit && id) {
        await updateAluno(id, data)
        toast({ title: 'Aluno atualizado com sucesso!' })
      } else {
        await createAluno(data, user!.uid)
        toast({ title: 'Aluno cadastrado com sucesso!' })
      }
      navigate('/alunos')
    } catch (error) {
      console.error('Erro ao salvar aluno:', error)
      toast({ title: 'Erro ao salvar aluno', variant: 'destructive' })
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
          <CardTitle>{isEdit ? 'Editar Aluno' : 'Novo Aluno'}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nome">Nome *</Label>
              <Input id="nome" {...register('nome')} />
              {errors.nome && <p className="text-sm text-destructive">{errors.nome.message}</p>}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="dataNascimento">Data de Nascimento</Label>
                <Input id="dataNascimento" type="date" {...register('dataNascimento')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="telefone">Telefone</Label>
                <Input id="telefone" type="tel" placeholder="(00) 00000-0000" {...register('telefone')} />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="responsavel">Responsável (para menores)</Label>
              <Input id="responsavel" {...register('responsavel')} />
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" rows={3} {...register('observacoes')} />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/alunos')}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading || (isEdit && !isDirty)}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Cadastrar aluno'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
