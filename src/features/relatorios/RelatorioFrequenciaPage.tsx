import { useEffect, useState } from 'react'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { Printer, Loader2 } from 'lucide-react'
import { getRelatorioFrequenciaTrimestre, type FrequenciaAluno } from './relatoriosService'
import { getClassesAtivas } from '@/features/classes/classesService'
import type { Classe } from '@/types'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { toast } from '@/hooks/useToast'
import { getCurrentQuarter } from '@/lib/utils'

export default function RelatorioFrequenciaPage() {
  const { quarter: currentQ, year: currentY } = getCurrentQuarter()
  const [classes, setClasses] = useState<Classe[]>([])
  const [classeId, setClasseId] = useState('')
  const [trimestre, setTrimestre] = useState(String(currentQ))
  const [ano, setAno] = useState(String(currentY))
  const [alunos, setAlunos] = useState<FrequenciaAluno[]>([])
  const [datas, setDatas] = useState<Date[]>([])
  const [loading, setLoading] = useState(false)
  const [gerado, setGerado] = useState(false)

  useEffect(() => {
    getClassesAtivas().then(setClasses)
  }, [])

  async function handleGerar() {
    if (!classeId) {
      toast({ title: 'Selecione uma classe', variant: 'destructive' })
      return
    }
    setLoading(true)
    try {
      const { alunos: a, datas: d } = await getRelatorioFrequenciaTrimestre(
        classeId,
        Number(trimestre),
        Number(ano)
      )
      setAlunos(a)
      setDatas(d)
      setGerado(true)
    } catch {
      toast({ title: 'Erro ao gerar relatório', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const classeNome = classes.find((c) => c.id === classeId)?.nome ?? ''
  const anos = [currentY, currentY - 1, currentY - 2].map(String)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 no-print">
        <div className="space-y-1">
          <Label>Classe</Label>
          <Select value={classeId} onValueChange={setClasseId}>
            <SelectTrigger className="w-52">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {classes.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.nome}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Trimestre</Label>
          <Select value={trimestre} onValueChange={setTrimestre}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1º Trimestre</SelectItem>
              <SelectItem value="2">2º Trimestre</SelectItem>
              <SelectItem value="3">3º Trimestre</SelectItem>
              <SelectItem value="4">4º Trimestre</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1">
          <Label>Ano</Label>
          <Select value={ano} onValueChange={setAno}>
            <SelectTrigger className="w-28">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {anos.map((a) => (
                <SelectItem key={a} value={a}>
                  {a}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleGerar} disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Gerar Relatório
        </Button>
        {gerado && (
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        )}
      </div>

      {gerado && (
        <div className="overflow-x-auto">
          <h2 className="font-bold text-lg mb-1 print:text-base">
            Registro de Frequência — {classeNome}
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            {trimestre}º Trimestre de {ano}
          </p>

          {alunos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum registro encontrado neste período.</p>
          ) : (
            <table className="text-xs border-collapse border">
              <thead>
                <tr className="bg-muted">
                  <th className="border p-1 text-left w-6">Nº</th>
                  <th className="border p-1 text-left min-w-[160px]">Nome</th>
                  {datas.map((d) => (
                    <th key={d.toISOString()} className="border p-1 text-center min-w-[40px]">
                      {format(d, 'dd/MM', { locale: ptBR })}
                    </th>
                  ))}
                  <th className="border p-1 text-center">Total</th>
                  <th className="border p-1 text-center">%</th>
                </tr>
              </thead>
              <tbody>
                {alunos.map((aluno, idx) => (
                  <tr key={aluno.alunoId} className="hover:bg-muted/20">
                    <td className="border p-1 text-center">{idx + 1}</td>
                    <td className="border p-1 font-medium">{aluno.alunoNome}</td>
                    {datas.map((d) => {
                      const key = d.toISOString().split('T')[0]
                      const presente = aluno.presencas[key]
                      return (
                        <td
                          key={key}
                          className={`border p-1 text-center font-bold ${
                            presente === undefined
                              ? 'text-muted-foreground'
                              : presente
                              ? 'text-green-700'
                              : 'text-red-600'
                          }`}
                        >
                          {presente === undefined ? '—' : presente ? '●' : 'F'}
                        </td>
                      )
                    })}
                    <td className="border p-1 text-center font-medium">{aluno.totalPresente}</td>
                    <td className="border p-1 text-center">
                      {aluno.totalAulas > 0
                        ? Math.round((aluno.totalPresente / aluno.totalAulas) * 100)
                        : 0}%
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}
    </div>
  )
}
