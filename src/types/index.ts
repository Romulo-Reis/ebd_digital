import type { Timestamp } from 'firebase/firestore'

export type UserRole = 'admin' | 'secretario' | 'professor'

export interface AppUser {
  uid: string
  email: string
  nome: string
  role: UserRole
  ativo?: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy?: string
}

export interface Aluno {
  id: string
  nome: string
  dataNascimento?: string
  telefone?: string
  responsavel?: string
  observacoes?: string
  ativo: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}

export interface Classe {
  id: string
  nome: string
  descricao?: string
  professorId?: string
  professorNome?: string
  ativa: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}

export interface Matricula {
  id: string
  alunoId: string
  classeId: string
  alunoNome: string
  classeNome: string
  dataMatricula: Timestamp
  ativo: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}

export type EstadoTempo = 'bom' | 'ameacador' | 'chuvoso' | 'tempestuoso'

export interface Aula {
  id: string
  classeId: string
  classeNome: string
  data: Timestamp
  estadoTempo: EstadoTempo
  quantidadeBiblia: number
  quantidadeRevista: number
  oferta: number
  visitantes: number
  observacoes?: string
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}

export interface RegistroFrequencia {
  id: string
  aulaId: string
  matriculaId: string
  alunoId: string
  alunoNome: string
  classeId: string
  dataAula: Timestamp
  presente: boolean
  createdAt: Timestamp
  updatedAt: Timestamp
  createdBy: string
}
