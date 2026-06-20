'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { RoomForm } from './room-form'
import { useCreateRoom, useUpdateRoom } from '@/hooks/use-rooms'
import type { Room } from '@/types'
import type { RoomFormValues } from '@/schemas/room'

interface RoomDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  room?: Room
}

export function RoomDialog({ open, onOpenChange, room }: RoomDialogProps) {
  const createRoom = useCreateRoom()
  const updateRoom = useUpdateRoom()

  const isLoading = createRoom.isPending || updateRoom.isPending

  function handleSubmit(values: RoomFormValues) {
    if (room) {
      updateRoom.mutate(
        { id: room.id, values },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createRoom.mutate(values, { onSuccess: () => onOpenChange(false) })
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{room ? 'Editar sala' : 'Nova sala'}</DialogTitle>
        </DialogHeader>
        <RoomForm
          defaultValues={room}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
