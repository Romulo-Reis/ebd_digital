import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Plus, Pencil, Loader2, X } from 'lucide-react'
import { getClasse } from './classesService'
import { getMatriculasByClasse, cancelarMatricula } from '@/features/matriculas/matriculasService'
import { getAulasByClasse } from '@/features/aulas/aulasService'
import { MatriculaModal } from '@/features/matriculas/MatriculaModal'
import type { Classe, Matricula, Aula } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from '@/hooks/useToast'
import { formatDate } from '@/lib/utils'

export default function ClasseDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const [classe, setClasse] = useState<Classe | null>(null)
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [aulas, setAulas] = useState<Aula[]>([])
  const [loading, setLoading] = useState(true)
  const [matriculaModal, setMatriculaModal] = useState(false)
  const [cancelDialog, setCancelDialog] = useState<{ open: boolean; matricula: Matricula | null }>({
    open: false,
    matricula: null,
  })

  useEffect(() => {
    if (!id) return
    loadData()
  }, [id])

  async function loadData() {
    setLoading(true)
    try {
      const c = await getClasse(id!)
      setClasse(c)
      if (c) {
        const [m, a] = await Promise.all([
          getMatriculasByClasse(id!),
          getAulasByClasse(id!),
        ])
        setMatriculas(m)
        setAulas(a)
      }
    } catch {
      toast({ title: 'Erro ao carregar dados da classe', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleCancelarMatricula() {
    if (!cancelDialog.matricula) return
    try {
      await cancelarMatricula(cancelDialog.matricula.id)
      toast({ title: 'Matrícula cancelada.' })
      await loadData()
    } catch {
      toast({ title: 'Erro ao cancelar matrícula', variant: 'destructive' })
    } finally {
      setCancelDialog({ open: false, matricula: null })
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!classe) return <p className="text-muted-foreground">Classe não encontrada.</p>

  const matriculasAtivas = matriculas.filter((m) => m.ativo)

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{classe.nome}</h2>
          {classe.descricao && (
            <p className="text-muted-foreground text-sm mt-1">{classe.descricao}</p>
          )}
          {classe.professorNome && (
            <p className="text-sm mt-1">Prof.: <span className="font-medium">{classe.professorNome}</span></p>
          )}
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/classes/${id}/editar`}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">
            Alunos Matriculados ({matriculasAtivas.length})
          </CardTitle>
          <Button size="sm" onClick={() => setMatriculaModal(true)}>
            <Plus className="h-4 w-4" />
            Matricular Aluno
          </Button>
        </CardHeader>
        <CardContent>
          {matriculasAtivas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum aluno matriculado.</p>
          ) : (
            <div className="divide-y">
              {matriculasAtivas.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2">
                  <Link
                    to={`/alunos/${m.alunoId}`}
                    className="text-sm font-medium hover:underline text-primary"
                  >
                    {m.alunoNome}
                  </Link>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => setCancelDialog({ open: true, matricula: m })}
                    aria-label="Cancelar matrícula"
                  >
                    <X className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Aulas Realizadas ({aulas.length})</CardTitle>
          <Button asChild size="sm">
            <Link to={`/classes/${id}/aulas/nova`}>
              <Plus className="h-4 w-4" />
              Nova Aula
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {aulas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma aula registrada.</p>
          ) : (
            <div className="divide-y">
              {aulas.map((aula) => (
                <div key={aula.id} className="flex items-center justify-between py-2">
                  <div>
                    <Link
                      to={`/classes/${id}/aulas/${aula.id}`}
                      className="text-sm font-medium hover:underline text-primary"
                    >
                      {formatDate(aula.data)}
                    </Link>
                    <p className="text-xs text-muted-foreground capitalize">{aula.estadoTempo}</p>
                  </div>
                  <div className="text-xs text-muted-foreground text-right">
                    <p>{aula.visitantes} visitantes</p>
                    <p>Oferta: R$ {aula.oferta.toFixed(2)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <MatriculaModal
        open={matriculaModal}
        onOpenChange={setMatriculaModal}
        classeId={id!}
        classeNome={classe.nome}
        onSuccess={loadData}
      />

      <ConfirmDialog
        open={cancelDialog.open}
        onOpenChange={(open) => setCancelDialog((s) => ({ ...s, open }))}
        title="Cancelar matrícula?"
        description={`A matrícula de ${cancelDialog.matricula?.alunoNome} será cancelada.`}
        confirmLabel="Cancelar matrícula"
        variant="destructive"
        onConfirm={handleCancelarMatricula}
      />
    </div>
  )
}
