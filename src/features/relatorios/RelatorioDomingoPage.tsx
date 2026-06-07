import { useState } from 'react'
import { format, subDays } from 'date-fns'
import { Printer, Loader2 } from 'lucide-react'
import { getRelatorioDomingo, type ResumoClasse } from './relatoriosService'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/useToast'

export default function RelatorioDomingoPage() {
  const [data, setData] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [resumos, setResumos] = useState<ResumoClasse[]>([])
  const [resumosAnt, setResumosAnt] = useState<ResumoClasse[]>([])
  const [loading, setLoading] = useState(false)
  const [gerado, setGerado] = useState(false)

  async function handleGerar() {
    setLoading(true)
    try {
      const dataSelecionada = new Date(data + 'T12:00:00')
      const [atual, anterior] = await Promise.all([
        getRelatorioDomingo(dataSelecionada),
        getRelatorioDomingo(subDays(dataSelecionada, 7)),
      ])
      setResumos(atual)
      setResumosAnt(anterior)
      setGerado(true)
    } catch {
      toast({ title: 'Erro ao gerar relatório', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const totais = {
    matriculados: resumos.reduce((s, r) => s + r.matriculados, 0),
    ausentes: resumos.reduce((s, r) => s + r.ausentes, 0),
    presentes: resumos.reduce((s, r) => s + r.presentes, 0),
    visitantes: resumos.reduce((s, r) => s + r.visitantes, 0),
    total: resumos.reduce((s, r) => s + r.total, 0),
    biblias: resumos.reduce((s, r) => s + r.biblias, 0),
    revistas: resumos.reduce((s, r) => s + r.revistas, 0),
    ofertas: resumos.reduce((s, r) => s + r.ofertas, 0),
  }

  const totaisAnt = {
    matriculados: resumosAnt.reduce((s, r) => s + r.matriculados, 0),
    ausentes: resumosAnt.reduce((s, r) => s + r.ausentes, 0),
    presentes: resumosAnt.reduce((s, r) => s + r.presentes, 0),
    visitantes: resumosAnt.reduce((s, r) => s + r.visitantes, 0),
    total: resumosAnt.reduce((s, r) => s + r.total, 0),
    biblias: resumosAnt.reduce((s, r) => s + r.biblias, 0),
    revistas: resumosAnt.reduce((s, r) => s + r.revistas, 0),
    ofertas: resumosAnt.reduce((s, r) => s + r.ofertas, 0),
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-4 no-print">
        <div className="space-y-1">
          <Label htmlFor="data">Data (domingo)</Label>
          <Input
            id="data"
            type="date"
            value={data}
            onChange={(e) => setData(e.target.value)}
            className="w-44"
          />
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
          <h2 className="font-bold text-lg mb-3 print:text-base">
            Relatório da EBD — {format(new Date(data + 'T12:00:00'), 'dd/MM/yyyy')}
          </h2>
          <table className="w-full text-sm border-collapse border">
            <thead>
              <tr className="bg-muted">
                <th className="border p-2 text-left">Classe</th>
                <th className="border p-2">Matric.</th>
                <th className="border p-2">Ausentes</th>
                <th className="border p-2">Presentes</th>
                <th className="border p-2">Visitan.</th>
                <th className="border p-2">Total</th>
                <th className="border p-2">Bíblias</th>
                <th className="border p-2">Revistas</th>
                <th className="border p-2">Ofertas</th>
              </tr>
            </thead>
            <tbody>
              {resumos.length === 0 ? (
                <tr>
                  <td colSpan={9} className="border p-4 text-center text-muted-foreground">
                    Nenhuma aula registrada nesta data.
                  </td>
                </tr>
              ) : (
                resumos.map((r) => (
                  <tr key={r.classeId} className="hover:bg-muted/20">
                    <td className="border p-2 font-medium">{r.classeNome}</td>
                    <td className="border p-2 text-center">{r.matriculados}</td>
                    <td className="border p-2 text-center text-destructive">{r.ausentes}</td>
                    <td className="border p-2 text-center text-green-700">{r.presentes}</td>
                    <td className="border p-2 text-center">{r.visitantes}</td>
                    <td className="border p-2 text-center font-medium">{r.total}</td>
                    <td className="border p-2 text-center">{r.biblias}</td>
                    <td className="border p-2 text-center">{r.revistas}</td>
                    <td className="border p-2 text-right">{formatCurrency(r.ofertas)}</td>
                  </tr>
                ))
              )}
              <tr className="bg-muted font-bold">
                <td className="border p-2">Total Geral</td>
                <td className="border p-2 text-center">{totais.matriculados}</td>
                <td className="border p-2 text-center">{totais.ausentes}</td>
                <td className="border p-2 text-center">{totais.presentes}</td>
                <td className="border p-2 text-center">{totais.visitantes}</td>
                <td className="border p-2 text-center">{totais.total}</td>
                <td className="border p-2 text-center">{totais.biblias}</td>
                <td className="border p-2 text-center">{totais.revistas}</td>
                <td className="border p-2 text-right">{formatCurrency(totais.ofertas)}</td>
              </tr>
              {resumosAnt.length > 0 && (
                <tr className="bg-muted/50 text-muted-foreground">
                  <td className="border p-2 italic">Domingo Anterior</td>
                  <td className="border p-2 text-center">{totaisAnt.matriculados}</td>
                  <td className="border p-2 text-center">{totaisAnt.ausentes}</td>
                  <td className="border p-2 text-center">{totaisAnt.presentes}</td>
                  <td className="border p-2 text-center">{totaisAnt.visitantes}</td>
                  <td className="border p-2 text-center">{totaisAnt.total}</td>
                  <td className="border p-2 text-center">{totaisAnt.biblias}</td>
                  <td className="border p-2 text-center">{totaisAnt.revistas}</td>
                  <td className="border p-2 text-right">{formatCurrency(totaisAnt.ofertas)}</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
