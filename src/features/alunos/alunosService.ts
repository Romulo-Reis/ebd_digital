import { where, orderBy, writeBatch, collection, getDocs, query, serverTimestamp } from 'firebase/firestore'
import { db } from '@/lib/firebase'
import { fetchCollection, fetchDoc, createDoc, updateDocById } from '@/lib/firestore'
import type { Aluno } from '@/types'
import type { AlunoFormData } from './alunos.types'

export async function getAlunos(apenasAtivos = false): Promise<Aluno[]> {
  const constraints = apenasAtivos
    ? [where('ativo', '==', true), orderBy('nome')]
    : [orderBy('nome')]
  return fetchCollection<Aluno>('alunos', ...constraints)
}

export async function getAluno(id: string): Promise<Aluno | null> {
  return fetchDoc<Aluno>('alunos', id)
}

export async function createAluno(data: AlunoFormData, createdBy: string): Promise<string> {
  return createDoc('alunos', { ...data, ativo: true, createdBy })
}

export async function updateAluno(id: string, data: Partial<AlunoFormData>): Promise<void> {
  await updateDocById('alunos', id, data)

  if (!data.nome) return

  // Propaga o novo nome para os campos desnormalizados em outras coleções
  const novoNome = data.nome
  const updatedAt = serverTimestamp()

  const [matriculasSnap, registrosSnap] = await Promise.all([
    getDocs(query(collection(db, 'matriculas'), where('alunoId', '==', id))),
    getDocs(query(collection(db, 'registrosFrequencia'), where('alunoId', '==', id))),
  ])

  const todosRefs = [
    ...matriculasSnap.docs.map((d) => ({ ref: d.ref })),
    ...registrosSnap.docs.map((d) => ({ ref: d.ref })),
  ]

  // Firestore permite no máximo 500 operações por batch
  const CHUNK = 500
  for (let i = 0; i < todosRefs.length; i += CHUNK) {
    const batch = writeBatch(db)
    for (const { ref } of todosRefs.slice(i, i + CHUNK)) {
      batch.update(ref, { alunoNome: novoNome, updatedAt })
    }
    await batch.commit()
  }
}

export async function toggleAlunoAtivo(id: string, ativo: boolean): Promise<void> {
  return updateDocById('alunos', id, { ativo })
}
