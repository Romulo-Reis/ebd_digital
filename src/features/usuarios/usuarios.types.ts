import { z } from 'zod'

export const novoUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  email: z.string().email('E-mail inválido'),
  senha: z.string().min(6, 'A senha deve ter no mínimo 6 caracteres'),
  role: z.enum(['admin', 'secretario', 'professor'], {
    required_error: 'Selecione um perfil',
  }),
})

export const editarUsuarioSchema = z.object({
  nome: z.string().min(2, 'Nome deve ter pelo menos 2 caracteres'),
  role: z.enum(['admin', 'secretario', 'professor'], {
    required_error: 'Selecione um perfil',
  }),
})

export type NovoUsuarioFormData = z.infer<typeof novoUsuarioSchema>
export type EditarUsuarioFormData = z.infer<typeof editarUsuarioSchema>
