import { z } from 'zod'

export const classeSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter no mínimo 2 caracteres').transform((v) => v.trim()),
  descricao: z.string().optional().transform((v) => v?.trim()),
  professorId: z.string().optional(),
  professorNome: z.string().optional(),
})

export type ClasseFormData = z.infer<typeof classeSchema>
