import { useEffect, useState } from 'react'
import { Search, Loader2 } from 'lucide-react'
import { getAlunos } from '@/features/alunos/alunosService'
import {
  createMatricula,
  verificarMatriculaDuplicada,
} from './matriculasService'
import type { Aluno } from '@/types'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { toast } from '@/hooks/useToast'

interface MatriculaModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  classeId: string
  classeNome: string
  onSuccess: () => void
}

export function MatriculaModal({
  open,
  onOpenChange,
  classeId,
  classeNome,
  onSuccess,
}: MatriculaModalProps) {
  const { user } = useAuthStore()
  const [alunos, setAlunos] = useState<Aluno[]>([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState<Aluno | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      getAlunos(true)
        .then(setAlunos)
        .catch(() => toast({ title: 'Erro ao carregar alunos', variant: 'destructive' }))
      setSearch('')
      setSelected(null)
    }
  }, [open])

  const filtered = alunos.filter((a) =>
    a.nome.toLowerCase().includes(search.toLowerCase())
  )

  async function handleMatricular() {
    if (!selected || !user) return
    setLoading(true)
    try {
      const duplicado = await verificarMatriculaDuplicada(selected.id, classeId)
      if (duplicado) {
        toast({
          title: 'Matrícula duplicada',
          description: `${selected.nome} já está matriculado(a) nesta classe.`,
          variant: 'destructive',
        })
        return
      }
      await createMatricula(selected.id, selected.nome, classeId, classeNome, user.uid)
      toast({ title: `${selected.nome} matriculado(a) com sucesso!` })
      onSuccess()
      onOpenChange(false)
    } catch {
      toast({ title: 'Erro ao matricular aluno', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Matricular Aluno</DialogTitle>
        </DialogHeader>

        <div className="space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar aluno..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="max-h-64 overflow-y-auto border rounded-md divide-y">
            {filtered.length === 0 ? (
              <p className="p-4 text-sm text-muted-foreground text-center">
                Nenhum aluno encontrado.
              </p>
            ) : (
              filtered.map((aluno) => (
                <button
                  key={aluno.id}
                  className={`w-full text-left px-3 py-2 text-sm hover:bg-muted transition-colors ${
                    selected?.id === aluno.id ? 'bg-primary/10 font-medium' : ''
                  }`}
                  onClick={() => setSelected(aluno)}
                >
                  {aluno.nome}
                </button>
              ))
            )}
          </div>

          {selected && (
            <p className="text-sm text-muted-foreground">
              Selecionado: <span className="font-medium text-foreground">{selected.nome}</span>
            </p>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleMatricular} disabled={!selected || loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Matricular
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
