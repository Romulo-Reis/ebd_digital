import { where, orderBy } from 'firebase/firestore'
import { fetchCollection, fetchDoc, createDoc, updateDocById } from '@/lib/firestore'
import type { Classe } from '@/types'
import type { ClasseFormData } from './classes.types'

export async function getClasses(): Promise<Classe[]> {
  return fetchCollection<Classe>('classes', orderBy('nome'))
}

export async function getClassesAtivas(): Promise<Classe[]> {
  return fetchCollection<Classe>('classes', where('ativa', '==', true), orderBy('nome'))
}

export async function getClasse(id: string): Promise<Classe | null> {
  return fetchDoc<Classe>('classes', id)
}

export async function createClasse(data: ClasseFormData, createdBy: string): Promise<string> {
  return createDoc('classes', { ...data, ativa: true, createdBy })
}

export async function updateClasse(id: string, data: Partial<ClasseFormData>): Promise<void> {
  return updateDocById('classes', id, data)
}

export async function toggleClasseAtiva(id: string, ativa: boolean): Promise<void> {
  return updateDocById('classes', id, { ativa })
}
