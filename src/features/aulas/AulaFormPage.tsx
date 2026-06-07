import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Loader2 } from 'lucide-react'
import { format } from 'date-fns'
import { aulaSchema, type AulaFormData } from './aulas.types'
import { createAula, getAula, updateAula } from './aulasService'
import { getClasse } from '@/features/classes/classesService'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { toast } from '@/hooks/useToast'

export default function AulaFormPage() {
  const { id: classeId, aulaId } = useParams<{ id: string; aulaId: string }>()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const isEdit = Boolean(aulaId)
  const [loading, setLoading] = useState(false)
  const [classeNome, setClasseNome] = useState('')
  const [estadoTempo, setEstadoTempo] = useState<AulaFormData['estadoTempo']>('bom')

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AulaFormData>({
    resolver: zodResolver(aulaSchema),
    defaultValues: {
      data: format(new Date(), 'yyyy-MM-dd'),
      estadoTempo: 'bom',
      quantidadeBiblia: 0,
      quantidadeRevista: 0,
      oferta: 0,
      visitantes: 0,
    },
  })

  useEffect(() => {
    if (classeId) getClasse(classeId).then((c) => setClasseNome(c?.nome ?? ''))
  }, [classeId])

  useEffect(() => {
    if (!aulaId) return
    getAula(aulaId).then((aula) => {
      if (aula) {
        const tempo = aula.estadoTempo
        reset({
          data: format(aula.data.toDate(), 'yyyy-MM-dd'),
          estadoTempo: tempo,
          quantidadeBiblia: aula.quantidadeBiblia,
          quantidadeRevista: aula.quantidadeRevista,
          oferta: aula.oferta,
          visitantes: aula.visitantes,
          observacoes: aula.observacoes,
        })
        setEstadoTempo(tempo)
      }
    })
  }, [aulaId, reset])

  async function onSubmit(data: AulaFormData) {
    if (!classeId || !user) return
    setLoading(true)
    try {
      if (isEdit && aulaId) {
        await updateAula(aulaId, data)
        toast({ title: 'Aula atualizada!' })
        navigate(`/classes/${classeId}/aulas/${aulaId}`)
      } else {
        const novoAulaId = await createAula(data, classeId, classeNome, user.uid)
        toast({ title: 'Aula criada! Agora registre as presenças.' })
        navigate(`/classes/${classeId}/aulas/${novoAulaId}`)
      }
    } catch {
      toast({ title: 'Erro ao salvar aula', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>{isEdit ? 'Editar Aula' : 'Nova Aula'}</CardTitle>
          {classeNome && <p className="text-sm text-muted-foreground">{classeNome}</p>}
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="data">Data *</Label>
                <Input id="data" type="date" {...register('data')} />
                {errors.data && <p className="text-sm text-destructive">{errors.data.message}</p>}
              </div>

              <div className="space-y-2">
                <Label>Estado do Tempo *</Label>
                <Select
                  value={estadoTempo}
                  onValueChange={(v) => {
                    const val = v as AulaFormData['estadoTempo']
                    setEstadoTempo(val)
                    setValue('estadoTempo', val)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bom">Bom</SelectItem>
                    <SelectItem value="ameacador">Ameaçador</SelectItem>
                    <SelectItem value="chuvoso">Chuvoso</SelectItem>
                    <SelectItem value="tempestuoso">Tempestuoso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="quantidadeBiblia">Bíblias</Label>
                <Input id="quantidadeBiblia" type="number" min="0" {...register('quantidadeBiblia')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="quantidadeRevista">Revistas</Label>
                <Input id="quantidadeRevista" type="number" min="0" {...register('quantidadeRevista')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="visitantes">Visitantes</Label>
                <Input id="visitantes" type="number" min="0" {...register('visitantes')} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="oferta">Oferta (R$)</Label>
                <Input id="oferta" type="number" min="0" step="0.01" {...register('oferta')} />
                {errors.oferta && <p className="text-sm text-destructive">{errors.oferta.message}</p>}
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="observacoes">Observações</Label>
              <Textarea id="observacoes" rows={2} {...register('observacoes')} />
            </div>

            <div className="flex gap-3 justify-end pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate(`/classes/${classeId}`)}
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {isEdit ? 'Salvar alterações' : 'Criar aula e registrar presenças'}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
