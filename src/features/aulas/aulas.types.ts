import { z } from 'zod'

export const aulaSchema = z.object({
  data: z.string().min(1, 'Data é obrigatória'),
  estadoTempo: z.enum(['bom', 'ameacador', 'chuvoso', 'tempestuoso']),
  quantidadeBiblia: z.coerce.number().min(0),
  quantidadeRevista: z.coerce.number().min(0),
  oferta: z.coerce.number().min(0).multipleOf(0.01, 'Máximo 2 casas decimais'),
  visitantes: z.coerce.number().min(0),
  observacoes: z.string().optional().transform((v) => v?.trim()),
})

export type AulaFormData = z.infer<typeof aulaSchema>
