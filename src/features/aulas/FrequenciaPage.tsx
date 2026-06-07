import { useEffect, useState, useCallback } from 'react'
import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, RefreshCw } from 'lucide-react'
import { getAula, getFrequenciasByAula, updateFrequencia } from './aulasService'
import type { Aula, RegistroFrequencia } from '@/types'
import { Button } from '@/components/ui/button'
import { cn, formatDate, formatCurrency } from '@/lib/utils'
import { toast } from '@/hooks/useToast'

type SyncState = 'idle' | 'saving' | 'saved' | 'error'

export default function FrequenciaPage() {
  const { id: classeId, aulaId } = useParams<{ id: string; aulaId: string }>()
  const [aula, setAula] = useState<Aula | null>(null)
  const [registros, setRegistros] = useState<RegistroFrequencia[]>([])
  const [loading, setLoading] = useState(true)
  const [syncState, setSyncState] = useState<SyncState>('idle')
  const [saveTimer, setSaveTimer] = useState<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!aulaId) return
    Promise.all([getAula(aulaId), getFrequenciasByAula(aulaId)])
      .then(([a, r]) => {
        setAula(a)
        setRegistros(r)
      })
      .catch(() => toast({ title: 'Erro ao carregar frequência', variant: 'destructive' }))
      .finally(() => setLoading(false))
  }, [aulaId])

  const saveFrequencia = useCallback(
    async (id: string, presente: boolean) => {
      setSyncState('saving')
      try {
        await updateFrequencia(id, presente)
        setSyncState('saved')
        setTimeout(() => setSyncState('idle'), 2000)
      } catch {
        setSyncState('error')
        toast({ title: 'Erro ao salvar presença', variant: 'destructive' })
      }
    },
    []
  )

  function handleToggle(registro: RegistroFrequencia) {
    const novoValor = !registro.presente

    setRegistros((prev) =>
      prev.map((r) => (r.id === registro.id ? { ...r, presente: novoValor } : r))
    )

    if (saveTimer) clearTimeout(saveTimer)
    const timer = setTimeout(() => saveFrequencia(registro.id, novoValor), 500)
    setSaveTimer(timer)
  }

  const presentes = registros.filter((r) => r.presente).length
  const total = registros.length
  const ausentes = total - presentes

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!aula) return <p className="text-muted-foreground">Aula não encontrada.</p>

  return (
    <div className="max-w-2xl mx-auto space-y-4">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="icon">
          <Link to={`/classes/${classeId}`}>
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h2 className="font-bold text-lg">{formatDate(aula.data)}</h2>
          <p className="text-sm text-muted-foreground capitalize">{aula.estadoTempo}</p>
        </div>
      </div>

      <div className="flex items-center justify-between bg-muted rounded-lg px-4 py-3 sticky top-0 z-10">
        <div className="flex gap-4 text-sm font-medium">
          <span className="text-green-700">{presentes} presentes</span>
          <span className="text-destructive">{ausentes} ausentes</span>
          <span className="text-muted-foreground">{total} total</span>
        </div>
        <div className="text-xs text-muted-foreground flex items-center gap-1">
          {syncState === 'saving' && (
            <>
              <RefreshCw className="h-3 w-3 animate-spin" />
              Salvando…
            </>
          )}
          {syncState === 'saved' && (
            <>
              <Check className="h-3 w-3 text-green-600" />
              <span className="text-green-600">Salvo</span>
            </>
          )}
          {syncState === 'error' && (
            <span className="text-destructive">Erro ao salvar</span>
          )}
        </div>
      </div>

      {registros.length === 0 ? (
        <p className="text-center text-muted-foreground py-8">
          Nenhum aluno matriculado nesta turma.
        </p>
      ) : (
        <div className="divide-y border rounded-lg overflow-hidden">
          {registros.map((registro) => (
            <button
              key={registro.id}
              onClick={() => handleToggle(registro)}
              className={cn(
                'w-full flex items-center justify-between px-4 py-3 text-left transition-colors',
                registro.presente
                  ? 'bg-green-50 hover:bg-green-100'
                  : 'bg-red-50 hover:bg-red-100'
              )}
            >
              <span className={cn('font-medium text-sm', registro.presente ? 'text-green-800' : 'text-red-800')}>
                {registro.alunoNome}
              </span>
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-bold transition-colors',
                  registro.presente ? 'bg-green-600' : 'bg-red-400'
                )}
                aria-label={registro.presente ? 'Presente' : 'Ausente'}
              >
                {registro.presente ? '●' : 'F'}
              </div>
            </button>
          ))}
        </div>
      )}

      <div className="rounded-lg border p-4 grid grid-cols-2 gap-3 text-sm bg-muted/30">
        <div>
          <p className="text-muted-foreground">Bíblias</p>
          <p className="font-medium">{aula.quantidadeBiblia}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Revistas</p>
          <p className="font-medium">{aula.quantidadeRevista}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Visitantes</p>
          <p className="font-medium">{aula.visitantes}</p>
        </div>
        <div>
          <p className="text-muted-foreground">Oferta</p>
          <p className="font-medium">{formatCurrency(aula.oferta)}</p>
        </div>
        {aula.observacoes && (
          <div className="col-span-2">
            <p className="text-muted-foreground">Observações</p>
            <p>{aula.observacoes}</p>
          </div>
        )}
      </div>
    </div>
  )
}
