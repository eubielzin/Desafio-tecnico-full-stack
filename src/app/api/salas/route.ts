import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { roomSchema } from '@/schemas/room'
import { getAllRooms, createRoom } from '@/repositories/rooms'

export async function GET() {
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
