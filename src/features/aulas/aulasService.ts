import { where, orderBy, Timestamp, writeBatch, collection, doc } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { fetchCollection, fetchDoc, createDoc, updateDocById } from '@/lib/firestore'
import { getMatriculasAtivasByClasse } from '@/features/matriculas/matriculasService'
import type { Aula, RegistroFrequencia } from '@/types'
import type { AulaFormData } from './aulas.types'

export async function getAulasByClasse(classeId: string): Promise<Aula[]> {
  return fetchCollection<Aula>(
    'aulas',
    where('classeId', '==', classeId),
    orderBy('data', 'desc')
  )
}

export async function getAula(id: string): Promise<Aula | null> {
  return fetchDoc<Aula>('aulas', id)
}

export async function createAula(
  data: AulaFormData,
  classeId: string,
  classeNome: string,
  createdBy: string
): Promise<string> {
  const aulaId = await createDoc('aulas', {
    ...data,
    classeId,
    classeNome,
    data: Timestamp.fromDate(new Date(data.data + 'T12:00:00')),
    createdBy,
  })

  const matriculas = await getMatriculasAtivasByClasse(classeId)
  if (matriculas.length > 0) {
    const batch = writeBatch(db)
    for (const m of matriculas) {
      const ref = doc(collection(db, 'registrosFrequencia'))
      batch.set(ref, {
        aulaId,
        matriculaId: m.id,
        alunoId: m.alunoId,
        alunoNome: m.alunoNome,
        classeId,
        dataAula: Timestamp.fromDate(new Date(data.data + 'T12:00:00')),
        presente: false,
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
        createdBy,
      })
    }
    await batch.commit()
  }

  return aulaId
}

export async function updateAula(id: string, data: Partial<AulaFormData>): Promise<void> {
  const { data: dataStr, ...rest } = data
  const updateData: Record<string, unknown> = { ...rest }
  if (dataStr) {
    updateData.data = Timestamp.fromDate(new Date(dataStr + 'T12:00:00'))
  }
  return updateDocById('aulas', id, updateData)
}

export async function getFrequenciasByAula(aulaId: string): Promise<RegistroFrequencia[]> {
  return fetchCollection<RegistroFrequencia>(
    'registrosFrequencia',
    where('aulaId', '==', aulaId),
    orderBy('alunoNome')
  )
}

export async function updateFrequencia(id: string, presente: boolean): Promise<void> {
  return updateDocById('registrosFrequencia', id, { presente })
}

export async function getAulasDoMes(classeId: string, inicio: Date, fim: Date): Promise<Aula[]> {
  return fetchCollection<Aula>(
    'aulas',
    where('classeId', '==', classeId),
    where('data', '>=', Timestamp.fromDate(inicio)),
    where('data', '<=', Timestamp.fromDate(fim)),
    orderBy('data')
  )
}
