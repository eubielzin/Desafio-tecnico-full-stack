import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { toast } from 'sonner'
import { queryKeys } from '@/lib/query-client'
import { fetchRooms, createRoom, updateRoom, deleteRoom } from '@/services/rooms'
import type { RoomFormValues } from '@/schemas/room'

export function useRooms() {
  return useQuery({
    queryKey: queryKeys.rooms.all,
    queryFn: fetchRooms,
  })
}

export function useCreateRoom() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (values: RoomFormValues) => createRoom(values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.rooms.all })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      toast.success('Sala criada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useUpdateRoom() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: ({ id, values }: { id: string; values: RoomFormValues }) =>
      updateRoom(id, values),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.rooms.all })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      toast.success('Sala atualizada com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}

export function useDeleteRoom() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteRoom(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: queryKeys.rooms.all })
      qc.invalidateQueries({ queryKey: queryKeys.dashboard })
      toast.success('Sala excluída com sucesso!')
    },
    onError: (error: Error) => {
      toast.error(error.message)
    },
  })
}
