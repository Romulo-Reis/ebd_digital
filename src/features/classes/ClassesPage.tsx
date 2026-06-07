import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Plus, GraduationCap } from 'lucide-react'
import { getClasses, toggleClasseAtiva } from './classesService'
import type { Classe } from '@/types'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { ConfirmDialog } from '@/components/shared/ConfirmDialog'
import { toast } from '@/hooks/useToast'

export default function ClassesPage() {
  const [classes, setClasses] = useState<Classe[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroAtiva, setFiltroAtiva] = useState<boolean | null>(true)
  const [confirmDialog, setConfirmDialog] = useState<{ open: boolean; classe: Classe | null }>({
    open: false,
    classe: null,
  })

  useEffect(() => {
    loadClasses()
  }, [])

  async function loadClasses() {
    setLoading(true)
    try {
      const data = await getClasses()
      setClasses(data)
    } catch {
      toast({ title: 'Erro ao carregar classes', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  async function handleToggle() {
    if (!confirmDialog.classe) return
    try {
      await toggleClasseAtiva(confirmDialog.classe.id, !confirmDialog.classe.ativa)
      toast({ title: confirmDialog.classe.ativa ? 'Classe inativada' : 'Classe reativada' })
      await loadClasses()
    } catch {
      toast({ title: 'Erro ao atualizar classe', variant: 'destructive' })
    } finally {
      setConfirmDialog({ open: false, classe: null })
    }
  }

  const filtered = classes.filter((c) =>
    filtroAtiva === null ? true : c.ativa === filtroAtiva
  )

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
        <div className="flex gap-2">
          {[
            { label: 'Ativas', value: true },
            { label: 'Inativas', value: false },
            { label: 'Todas', value: null },
          ].map(({ label, value }) => (
            <button
              key={label}
              onClick={() => setFiltroAtiva(value)}
              className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filtroAtiva === value
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button asChild>
          <Link to="/classes/nova">
            <Plus className="h-4 w-4" />
            Nova Classe
          </Link>
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          <GraduationCap className="h-12 w-12 mx-auto mb-3 opacity-30" />
          <p>Nenhuma classe encontrada.</p>
          <Button asChild size="sm" className="mt-3">
            <Link to="/classes/nova">Criar primeira classe</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((classe) => (
            <div
              key={classe.id}
              className="rounded-lg border bg-card p-4 flex flex-col gap-3 hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-2">
                <Link
                  to={`/classes/${classe.id}`}
                  className="font-semibold hover:underline text-primary leading-tight"
                >
                  {classe.nome}
                </Link>
                <Badge variant={classe.ativa ? 'success' : 'secondary'}>
                  {classe.ativa ? 'Ativa' : 'Inativa'}
                </Badge>
              </div>

              {classe.descricao && (
                <p className="text-sm text-muted-foreground line-clamp-2">{classe.descricao}</p>
              )}

              {classe.professorNome && (
                <p className="text-xs text-muted-foreground">
                  Prof.: {classe.professorNome}
                </p>
              )}

              <div className="flex gap-2 mt-auto pt-2 border-t">
                <Button asChild size="sm" variant="outline" className="flex-1">
                  <Link to={`/classes/${classe.id}`}>Ver detalhes</Link>
                </Button>
                <Button asChild size="sm" variant="ghost">
                  <Link to={`/classes/${classe.id}/editar`}>Editar</Link>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => setConfirmDialog({ open: true, classe })}
                >
                  {classe.ativa ? 'Inativar' : 'Ativar'}
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((s) => ({ ...s, open }))}
        title={confirmDialog.classe?.ativa ? 'Inativar classe?' : 'Reativar classe?'}
        description={`Classe "${confirmDialog.classe?.nome}" será ${confirmDialog.classe?.ativa ? 'inativada' : 'reativada'}.`}
        confirmLabel={confirmDialog.classe?.ativa ? 'Inativar' : 'Reativar'}
        variant={confirmDialog.classe?.ativa ? 'destructive' : 'default'}
        onConfirm={handleToggle}
      />
    </div>
  )
}
