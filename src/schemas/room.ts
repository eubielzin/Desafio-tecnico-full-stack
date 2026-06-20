import { z } from 'zod'

export const roomSchema = z.object({
  nome: z
    .string({ required_error: 'Nome é obrigatório' })
    .min(2, 'Nome deve ter pelo menos 2 caracteres')
    .max(100, 'Nome deve ter no máximo 100 caracteres')
    .trim(),
  capacidade: z
    .number({ required_error: 'Capacidade é obrigatória', invalid_type_error: 'Capacidade deve ser um número' })
    .int('Capacidade deve ser um número inteiro')
    .min(1, 'Capacidade mínima é 1 pessoa')
    .max(1000, 'Capacidade máxima é 1000 pessoas'),
})

export const updateRoomSchema = roomSchema.partial()

export type RoomFormValues = z.infer<typeof roomSchema>
export type UpdateRoomFormValues = z.infer<typeof updateRoomSchema>
