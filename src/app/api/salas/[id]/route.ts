import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@clerk/nextjs/server'
import { requireAdmin } from '@/lib/roles'
import { roomSchema } from '@/schemas/room'
import { getRoomById, updateRoom, deleteRoom } from '@/repositories/rooms'

interface Params {
  params: Promise<{ id: string }>
}

export async function GET(_req: NextRequest, { params }: Params) {
  const { userId } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { id } = await params
    const room = await getRoomById(id)
    if (!room) {
      return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 })
    }
    return NextResponse.json(room)
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao buscar sala.' }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: Params) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const { id } = await params
    const body = await req.json()
    const parsed = roomSchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos.', details: parsed.error.flatten().fieldErrors },
        { status: 422 }
      )
    }

    const existing = await getRoomById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 })
    }

    const room = await updateRoom(id, parsed.data)
    return NextResponse.json(room)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erro ao atualizar sala.'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function DELETE(_req: NextRequest, { params }: Params) {
  const denied = await requireAdmin()
  if (denied) return denied

  try {
    const { id } = await params
    const existing = await getRoomById(id)
    if (!existing) {
      return NextResponse.json({ error: 'Sala não encontrada.' }, { status: 404 })
    }

    await deleteRoom(id)
    return new NextResponse(null, { status: 204 })
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao excluir sala.' }, { status: 500 })
  }
}
