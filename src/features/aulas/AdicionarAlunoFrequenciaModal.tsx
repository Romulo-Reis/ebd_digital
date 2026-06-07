import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { getMatriculasAtivasByClasse } from '@/features/matriculas/matriculasService'
import { adicionarAlunosNaFrequencia } from './aulasService'
import type { Aula, Matricula, RegistroFrequencia } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/useToast'

interface Props {
  open: boolean
  onOpenChange: (open: boolean) => void
  aula: Aula
  registros: RegistroFrequencia[]
  onSuccess: () => void
}

export function AdicionarAlunoFrequenciaModal({ open, onOpenChange, aula, registros, onSuccess }: Props) {
  const { user } = useAuthStore()
  const [disponiveis, setDisponiveis] = useState<Matricula[]>([])
  const [selecionados, setSelecionados] = useState<Set<string>>(new Set())
  const [loadingDados, setLoadingDados] = useState(false)
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    if (!open) return
    setSelecionados(new Set())
    setLoadingDados(true)
    getMatriculasAtivasByClasse(aula.classeId)
      .then((matriculas) => {
        const idsExistentes = new Set(registros.map((r) => r.matriculaId))
        setDisponiveis(matriculas.filter((m) => !idsExistentes.has(m.id)))
      })
      .catch(() => toast({ title: 'Erro ao carregar alunos', variant: 'destructive' }))
      .finally(() => setLoadingDados(false))
  }, [open, aula.classeId, registros])

  function toggleSelecionado(id: string) {
    setSelecionados((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  async function handleConfirmar() {
    if (!user || selecionados.size === 0) return
    const matriculasSelecionadas = disponiveis.filter((m) => selecionados.has(m.id))
    setSalvando(true)
    try {
      await adicionarAlunosNaFrequencia(aula, matriculasSelecionadas, user.uid)
      const quantidade = matriculasSelecionadas.length
      toast({ title: `${quantidade} aluno${quantidade > 1 ? 's' : ''} adicionado${quantidade > 1 ? 's' : ''} à lista de presença.` })
      onSuccess()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro ao adicionar alunos', variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Adicionar Aluno à Lista de Presença</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          {loadingDados ? (
            <div className="flex justify-center py-6">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </div>
          ) : disponiveis.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              Todos os alunos matriculados já estão na lista de presença.
            </p>
          ) : (
            <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
              {disponiveis.map((m) => (
                <label
                  key={m.id}
                  className="flex items-center gap-3 px-3 py-2 cursor-pointer hover:bg-muted transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selecionados.has(m.id)}
                    onChange={() => toggleSelecionado(m.id)}
                    className="h-4 w-4 accent-primary"
                  />
                  <span className="text-sm">{m.alunoNome}</span>
                </label>
              ))}
            </div>
          )}

          {selecionados.size > 0 && (
            <p className="text-sm text-muted-foreground">
              {selecionados.size} aluno{selecionados.size > 1 ? 's' : ''} selecionado{selecionados.size > 1 ? 's' : ''}
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={salvando}>
            Cancelar
          </Button>
          <Button
            onClick={handleConfirmar}
            disabled={selecionados.size === 0 || salvando || disponiveis.length === 0}
          >
            {salvando && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Adicionar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
