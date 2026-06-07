import { z } from 'zod'

export const alunoSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').transform((v) => v.trim()),
  dataNascimento: z.string().optional(),
  telefone: z.string().optional().transform((v) => v?.trim()),
  responsavel: z.string().optional().transform((v) => v?.trim()),
  observacoes: z.string().optional().transform((v) => v?.trim()),
})

export type AlunoFormData = z.infer<typeof alunoSchema>
