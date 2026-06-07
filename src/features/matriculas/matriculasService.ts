import { where, orderBy, Timestamp } from 'firebase/firestore'
import { fetchCollection, createDoc, updateDocById } from '@/lib/firestore'
import type { Matricula } from '@/types'

export async function getMatriculasByClasse(classeId: string): Promise<Matricula[]> {
  return fetchCollection<Matricula>(
    'matriculas',
    where('classeId', '==', classeId),
    orderBy('alunoNome')
  )
}

export async function getMatriculasByAluno(alunoId: string): Promise<Matricula[]> {
  return fetchCollection<Matricula>(
    'matriculas',
    where('alunoId', '==', alunoId),
    orderBy('dataMatricula', 'desc')
  )
}

export async function getMatriculasAtivasByClasse(classeId: string): Promise<Matricula[]> {
  return fetchCollection<Matricula>(
    'matriculas',
    where('classeId', '==', classeId),
    where('ativo', '==', true),
    orderBy('alunoNome')
  )
}

export async function createMatricula(
  alunoId: string,
  alunoNome: string,
  classeId: string,
  classeNome: string,
  createdBy: string
): Promise<string> {
  return createDoc('matriculas', {
    alunoId,
    alunoNome,
    classeId,
    classeNome,
    dataMatricula: Timestamp.now(),
    ativo: true,
    createdBy,
  })
}

export async function cancelarMatricula(id: string): Promise<void> {
  return updateDocById('matriculas', id, { ativo: false })
}

export async function verificarMatriculaDuplicada(
  alunoId: string,
  classeId: string
): Promise<boolean> {
  const existentes = await fetchCollection<Matricula>(
    'matriculas',
    where('alunoId', '==', alunoId),
    where('classeId', '==', classeId),
    where('ativo', '==', true)
  )
  return existentes.length > 0
}
