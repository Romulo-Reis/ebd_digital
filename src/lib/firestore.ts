import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  serverTimestamp,
  type QueryConstraint,
  type DocumentData,
  type WithFieldValue,
} from 'firebase/firestore'
import { db } from './firebase'

export async function fetchCollection<T>(
  collectionName: string,
  ...constraints: QueryConstraint[]
): Promise<T[]> {
  const q = query(collection(db, collectionName), ...constraints)
  const snapshot = await getDocs(q)
  return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }) as T)
}

export async function fetchDoc<T>(collectionName: string, id: string): Promise<T | null> {
  const ref = doc(db, collectionName, id)
  const snapshot = await getDoc(ref)
  if (!snapshot.exists()) return null
  return { id: snapshot.id, ...snapshot.data() } as T
}

export async function createDoc<T extends DocumentData>(
  collectionName: string,
  data: WithFieldValue<T>
): Promise<string> {
  const ref = await addDoc(collection(db, collectionName), {
    ...data,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  })
  return ref.id
}

export async function updateDocById(
  collectionName: string,
  id: string,
  data: Partial<DocumentData>
): Promise<void> {
  const ref = doc(db, collectionName, id)
  await updateDoc(ref, { ...data, updatedAt: serverTimestamp() })
}

export async function deleteDocById(collectionName: string, id: string): Promise<void> {
  const ref = doc(db, collectionName, id)
  await deleteDoc(ref)
}
