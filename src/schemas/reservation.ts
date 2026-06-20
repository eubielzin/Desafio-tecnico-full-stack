import { z } from 'zod'

const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/

export const reservationSchema = z
  .object({
    sala_id: z
      .string({ required_error: 'Sala é obrigatória' })
      .uuid('Sala inválida'),
    titulo: z
      .string({ required_error: 'Título é obrigatório' })
      .min(3, 'Título deve ter pelo menos 3 caracteres')
      .max(150, 'Título deve ter no máximo 150 caracteres')
      .trim(),
    participante_responsavel: z
      .string({ required_error: 'Participante responsável é obrigatório' })
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .trim(),
    quantidade_participantes: z
      .number({
        required_error: 'Quantidade de participantes é obrigatória',
        invalid_type_error: 'Deve ser um número',
      })
      .int('Deve ser um número inteiro')
      .min(1, 'Deve haver pelo menos 1 participante'),
    data: z
      .string({ required_error: 'Data é obrigatória' })
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
    horario_inicio: z
      .string({ required_error: 'Horário de início é obrigatório' })
      .regex(timeRegex, 'Horário inválido (HH:MM)'),
    horario_fim: z
      .string({ required_error: 'Horário de fim é obrigatório' })
      .regex(timeRegex, 'Horário inválido (HH:MM)'),
  })
  .refine(
    (data) => data.horario_fim > data.horario_inicio,
    {
      message: 'Horário de fim deve ser maior que o horário de início',
      path: ['horario_fim'],
    }
  )

export const updateReservationSchema = reservationSchema

export type ReservationFormValues = z.infer<typeof reservationSchema>
