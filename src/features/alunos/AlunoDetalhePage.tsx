import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Pencil, Loader2 } from 'lucide-react'
import { getAluno } from './alunosService'
import { getMatriculasByAluno } from '@/features/matriculas/matriculasService'
import type { Aluno, Matricula } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatDate } from '@/lib/utils'

export default function AlunoDetalhePage() {
  const { id } = useParams<{ id: string }>()
  const [aluno, setAluno] = useState<Aluno | null>(null)
  const [matriculas, setMatriculas] = useState<Matricula[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!id) return
    Promise.all([getAluno(id), getMatriculasByAluno(id)]).then(([a, m]) => {
      setAluno(a)
      setMatriculas(m)
      setLoading(false)
    })
  }, [id])

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!aluno) {
    return <p className="text-muted-foreground">Aluno não encontrado.</p>
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-2xl font-bold">{aluno.nome}</h2>
          <Badge variant={aluno.ativo ? 'success' : 'secondary'} className="mt-1">
            {aluno.ativo ? 'Ativo' : 'Inativo'}
          </Badge>
        </div>
        <Button asChild size="sm" variant="outline">
          <Link to={`/alunos/${id}/editar`}>
            <Pencil className="h-4 w-4 mr-1" />
            Editar
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Dados cadastrais</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-muted-foreground">Data de Nascimento</p>
            <p>{aluno.dataNascimento ? formatDate(aluno.dataNascimento) : '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Telefone</p>
            <p>{aluno.telefone || '—'}</p>
          </div>
          <div>
            <p className="text-muted-foreground">Responsável</p>
            <p>{aluno.responsavel || '—'}</p>
          </div>
          <div className="sm:col-span-2">
            <p className="text-muted-foreground">Observações</p>
            <p>{aluno.observacoes || '—'}</p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Matrículas</CardTitle>
        </CardHeader>
        <CardContent>
          {matriculas.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhuma matrícula encontrada.</p>
          ) : (
            <div className="space-y-2">
              {matriculas.map((m) => (
                <div key={m.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div>
                    <Link to={`/classes/${m.classeId}`} className="font-medium hover:underline text-primary text-sm">
                      {m.classeNome}
                    </Link>
                    <p className="text-xs text-muted-foreground">
                      Desde {formatDate(m.dataMatricula)}
                    </p>
                  </div>
                  <Badge variant={m.ativo ? 'success' : 'secondary'}>
                    {m.ativo ? 'Ativa' : 'Cancelada'}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
