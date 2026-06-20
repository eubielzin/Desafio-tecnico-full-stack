import type { Room } from '@/types'
import type { RoomFormValues } from '@/schemas/room'

export async function fetchRooms(): Promise<Room[]> {
  const res = await fetch('/api/salas')
  if (!res.ok) throw new Error('Erro ao buscar salas.')
  return res.json()
}

export async function fetchRoom(id: string): Promise<Room> {
  const res = await fetch(`/api/salas/${id}`)
  if (!res.ok) throw new Error('Sala não encontrada.')
  return res.json()
}

export async function createRoom(values: RoomFormValues): Promise<Room> {
  const res = await fetch('/api/salas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao criar sala.')
  return data
}

export async function updateRoom(id: string, values: RoomFormValues): Promise<Room> {
  const res = await fetch(`/api/salas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao atualizar sala.')
  return data
}

export async function deleteRoom(id: string): Promise<void> {
  const res = await fetch(`/api/salas/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? 'Erro ao excluir sala.')
  }
}
