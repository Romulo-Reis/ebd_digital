import { z } from 'zod'

export const matriculaSchema = z.object({
  alunoId: z.string().min(1, 'Selecione um aluno'),
  classeId: z.string().min(1, 'Classe obrigatória'),
})

export type MatriculaFormData = z.infer<typeof matriculaSchema>
