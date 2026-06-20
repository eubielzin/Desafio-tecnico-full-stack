import { z } from 'zod'

const timeRegex = /^([0-1]\d|2[0-3]):([0-5]\d)$/
const HORA_ABERTURA = '07:00'

export const reservationSchema = z
  .object({
    sala_id: z
      .string()
      .min(1, 'Sala é obrigatória')
      .regex(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i,
        'Sala inválida'
      ),
    titulo: z
      .string()
      .min(3, 'Título deve ter pelo menos 3 caracteres')
      .max(150, 'Título deve ter no máximo 150 caracteres')
      .trim(),
    participante_responsavel: z
      .string()
      .min(2, 'Nome deve ter pelo menos 2 caracteres')
      .max(100, 'Nome deve ter no máximo 100 caracteres')
      .trim(),
    quantidade_participantes: z
      .number()
      .int('Deve ser um número inteiro')
      .min(1, 'Deve haver pelo menos 1 participante'),
    data: z
      .string()
      .min(1, 'Data é obrigatória')
      .regex(/^\d{4}-\d{2}-\d{2}$/, 'Data inválida (YYYY-MM-DD)'),
    horario_inicio: z
      .string()
      .min(1, 'Horário de início é obrigatório')
      .regex(timeRegex, 'Horário inválido (HH:MM)'),
    horario_fim: z
      .string()
      .min(1, 'Horário de fim é obrigatório')
      .regex(timeRegex, 'Horário inválido (HH:MM)'),
  })
  .refine(
    (data) => data.horario_inicio >= HORA_ABERTURA,
    {
      message: 'Reservas só podem começar a partir das 07:00',
      path: ['horario_inicio'],
    }
  )
  .refine(
    (data) => data.horario_fim > data.horario_inicio,
    {
      message: 'Horário de fim deve ser maior que o horário de início',
      path: ['horario_fim'],
    }
  )

export const updateReservationSchema = reservationSchema

export type ReservationFormValues = z.infer<typeof reservationSchema>
