import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { auth } from '@clerk/nextjs/server'
import { requireAdmin } from '@/lib/roles'
import { roomSchema } from '@/schemas/room'
import { getAllRooms, createRoom } from '@/repositories/rooms'

export async function GET() {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const rooms = await getAllRooms()
    return NextResponse.json(rooms)
  } catch (error) {
    return NextResponse.json(
      { error: 'Erro ao buscar salas.' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const body = await req.json()
    const parsed = roomSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const room = await createRoom(parsed.data)
    return NextResponse.json(room, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao criar sala.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
