import { NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { getRoomsCount } from '@/repositories/rooms'
import {
  getReservationsCount,
  getActiveReservationsCount,
  getUpcomingReservations,
} from '@/repositories/reservations'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const [total_salas, total_reservas, reservas_em_andamento, proximas_reservas] =
      await Promise.all([
        getRoomsCount(),
        getReservationsCount(),
        getActiveReservationsCount(),
        getUpcomingReservations(),
      ])

    return NextResponse.json({
      total_salas,
      total_reservas,
      reservas_em_andamento,
      proximas_reservas,
    })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar dados do dashboard.' }, { status: 500 })
  }
}
