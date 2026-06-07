import { where, orderBy } from 'firebase/firestore'
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
  return updateDocById('alunos', id, data)
}

export async function toggleAlunoAtivo(id: string, ativo: boolean): Promise<void> {
  return updateDocById('alunos', id, { ativo })
}
