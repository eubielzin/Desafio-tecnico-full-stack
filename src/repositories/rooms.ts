import { createServerClient } from '@/lib/supabase'
import type { Room } from '@/types'
import type { RoomFormValues } from '@/schemas/room'

export async function getAllRooms(): Promise<Room[]> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('salas')
    .select('*')
    .order('nome', { ascending: true })

  if (error) throw new Error(error.message)
  return data as Room[]
}

export async function getRoomById(id: string): Promise<Room | null> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('salas')
    .select('*')
    .eq('id', id)
    .single()

  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data as Room
}

export async function createRoom(values: RoomFormValues): Promise<Room> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('salas')
    .insert(values)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Já existe uma sala com este nome.')
    throw new Error(error.message)
  }
  return data as Room
}

export async function updateRoom(id: string, values: Partial<RoomFormValues>): Promise<Room> {
  const supabase = createServerClient()
  const { data, error } = await supabase
    .from('salas')
    .update(values)
    .eq('id', id)
    .select()
    .single()

  if (error) {
    if (error.code === '23505') throw new Error('Já existe uma sala com este nome.')
    throw new Error(error.message)
  }
  return data as Room
}

export async function deleteRoom(id: string): Promise<void> {
  const supabase = createServerClient()
  const { error } = await supabase.from('salas').delete().eq('id', id)
  if (error) throw new Error(error.message)
}

export async function getRoomsCount(): Promise<number> {
  const supabase = createServerClient()
  const { count, error } = await supabase
    .from('salas')
    .select('*', { count: 'exact', head: true })

  if (error) throw new Error(error.message)
  return count ?? 0
}
