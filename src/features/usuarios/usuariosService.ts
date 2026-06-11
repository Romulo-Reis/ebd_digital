import { initializeApp, deleteApp } from 'firebase/app'
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth'
import { orderBy, doc, setDoc, serverTimestamp } from 'firebase/firestore'
import { firebaseConfig, db } from '@/lib/firebase'
import { fetchCollection, updateDocById } from '@/lib/firestore'
import type { AppUser } from '@/types'
import type { NovoUsuarioFormData, EditarUsuarioFormData } from './usuarios.types'

export async function getUsuarios(): Promise<AppUser[]> {
  return fetchCollection<AppUser>('users', orderBy('nome'))
}

export async function createUsuario(data: NovoUsuarioFormData, createdBy: string): Promise<void> {
  // Instância secundária para não encerrar a sessão do admin atual
  const secondaryApp = initializeApp(firebaseConfig, `create-user-${Date.now()}`)
  const secondaryAuth = getAuth(secondaryApp)
  try {
    const { user } = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.senha)
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: data.email,
      nome: data.nome.trim(),
      role: data.role,
      ativo: true,
      createdBy,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    })
  } finally {
    await deleteApp(secondaryApp)
  }
}

export async function updateUsuario(uid: string, data: EditarUsuarioFormData): Promise<void> {
  return updateDocById('users', uid, {
    nome: data.nome.trim(),
    role: data.role,
  })
}

export async function toggleUsuarioAtivo(uid: string, ativo: boolean): Promise<void> {
  return updateDocById('users', uid, { ativo })
}
