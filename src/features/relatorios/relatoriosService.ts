import { where, orderBy, Timestamp } from 'firebase/firestore'
import { fetchCollection } from '@/lib/firestore'
import type { Aula, RegistroFrequencia, Classe } from '@/types'

export interface ResumoClasse {
  classeId: string
  classeNome: string
  matriculados: number
  presentes: number
  ausentes: number
  visitantes: number
  total: number
  biblias: number
  revistas: number
  ofertas: number
}

export async function getRelatorioDomingo(data: Date): Promise<ResumoClasse[]> {
  const inicio = new Date(data)
  inicio.setHours(0, 0, 0, 0)
  const fim = new Date(data)
  fim.setHours(23, 59, 59, 999)

  const aulas = await fetchCollection<Aula>(
    'aulas',
    where('data', '>=', Timestamp.fromDate(inicio)),
    where('data', '<=', Timestamp.fromDate(fim))
  )

  const resumos: ResumoClasse[] = []

  for (const aula of aulas) {
    const frequencias = await fetchCollection<RegistroFrequencia>(
      'registrosFrequencia',
      where('aulaId', '==', aula.id)
    )

    const presentes = frequencias.filter((f) => f.presente).length

    resumos.push({
      classeId: aula.classeId,
      classeNome: aula.classeNome,
      matriculados: frequencias.length,
      presentes,
      ausentes: frequencias.length - presentes,
      visitantes: aula.visitantes,
      total: presentes + aula.visitantes,
      biblias: aula.quantidadeBiblia,
      revistas: aula.quantidadeRevista,
      ofertas: aula.oferta,
    })
  }

  return resumos.sort((a, b) => a.classeNome.localeCompare(b.classeNome))
}

export interface FrequenciaAluno {
  alunoId: string
  alunoNome: string
  presencas: Record<string, boolean>
  totalPresente: number
  totalAulas: number
}

export async function getRelatorioFrequenciaTrimestre(
  classeId: string,
  trimestre: number,
  ano: number
): Promise<{ alunos: FrequenciaAluno[]; datas: Date[] }> {
  const mesInicio = (trimestre - 1) * 3
  const inicio = new Date(ano, mesInicio, 1)
  const fim = new Date(ano, mesInicio + 3, 0, 23, 59, 59)

  const registros = await fetchCollection<RegistroFrequencia>(
    'registrosFrequencia',
    where('classeId', '==', classeId),
    where('dataAula', '>=', Timestamp.fromDate(inicio)),
    where('dataAula', '<=', Timestamp.fromDate(fim)),
    orderBy('dataAula'),
    orderBy('alunoNome')
  )

  const datasSet = new Set<string>()
  const alunosMap = new Map<string, FrequenciaAluno>()

  for (const r of registros) {
    const dataStr = r.dataAula.toDate().toISOString().split('T')[0]
    datasSet.add(dataStr)

    if (!alunosMap.has(r.alunoId)) {
      alunosMap.set(r.alunoId, {
        alunoId: r.alunoId,
        alunoNome: r.alunoNome,
        presencas: {},
        totalPresente: 0,
        totalAulas: 0,
      })
    }

    const aluno = alunosMap.get(r.alunoId)!
    aluno.presencas[dataStr] = r.presente
    aluno.totalAulas++
    if (r.presente) aluno.totalPresente++
  }

  const datas = Array.from(datasSet)
    .sort()
    .map((d) => new Date(d + 'T12:00:00'))

  return {
    alunos: Array.from(alunosMap.values()).sort((a, b) =>
      a.alunoNome.localeCompare(b.alunoNome)
    ),
    datas,
  }
}

export async function getDashboardStats(): Promise<{
  totalAlunos: number
  totalClasses: number
  frequenciaMedia: number
  ultimaAula: Date | null
}> {
  const [alunos, classes] = await Promise.all([
    fetchCollection<{ id: string; ativo: boolean }>('alunos', where('ativo', '==', true)),
    fetchCollection<Classe>('classes', where('ativa', '==', true)),
  ])

  const umMesAtras = new Date()
  umMesAtras.setMonth(umMesAtras.getMonth() - 1)

  const registros = await fetchCollection<RegistroFrequencia>(
    'registrosFrequencia',
    where('dataAula', '>=', Timestamp.fromDate(umMesAtras))
  )

  const totalRegistros = registros.length
  const totalPresentes = registros.filter((r) => r.presente).length
  const frequenciaMedia = totalRegistros > 0 ? (totalPresentes / totalRegistros) * 100 : 0

  const aulas = await fetchCollection<Aula>(
    'aulas',
    orderBy('data', 'desc')
  )

  return {
    totalAlunos: alunos.length,
    totalClasses: classes.length,
    frequenciaMedia: Math.round(frequenciaMedia),
    ultimaAula: aulas.length > 0 ? aulas[0].data.toDate() : null,
  }
}
