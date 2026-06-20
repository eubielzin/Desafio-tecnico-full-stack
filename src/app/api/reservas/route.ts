import { NextRequest, NextResponse } from 'next/server'
import { reservationSchema } from '@/schemas/reservation'
import { getAllReservations, createReservation, findConflicts } from '@/repositories/reservations'
import { getRoomById } from '@/repositories/rooms'

export async function GET(req: NextRequest) {
  try {
    const salaId = req.nextUrl.searchParams.get('sala_id') ?? undefined
    const reservations = await getAllReservations(salaId)
    return NextResponse.json(reservations)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar reservas.' }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const parsed = reservationSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const { sala_id, quantidade_participantes, data, horario_inicio, horario_fim } = parsed.data

    // Regra 2 — Capacidade da sala
    const sala = await getRoomById(sala_id)
    if (!sala) {
      return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 })
    }
    if (quantidade_participantes > sala.capacidade) {
      return NextResponse.json(
        {
          error: `A sala "${sala.nome}" comporta no máximo ${sala.capacidade} participante(s). Você informou ${quantidade_participantes}.`,
        },
        { status: 409 }
      )
    }

    // Regra 1 — Conflito de horário
    const conflicts = await findConflicts(sala_id, data, horario_inicio, horario_fim)
    if (conflicts.length > 0) {
      const c = conflicts[0]
      return NextResponse.json(
        {
          error: `Conflito de horário: já existe uma reserva nesta sala das ${c.horario_inicio.slice(0, 5)} às ${c.horario_fim.slice(0, 5)}.`,
        },
        { status: 409 }
      )
    }

    const reservation = await createReservation(parsed.data)
    return NextResponse.json(reservation, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar reserva.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
