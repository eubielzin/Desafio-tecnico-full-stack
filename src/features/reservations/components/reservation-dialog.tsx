'use client'

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ReservationForm } from './reservation-form'
import { useCreateReservation, useUpdateReservation } from '@/hooks/use-reservations'
import { useRooms } from '@/hooks/use-rooms'
import type { ReservationWithRoom } from '@/types'
import type { ReservationFormValues } from '@/schemas/reservation'

interface ReservationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  reservation?: ReservationWithRoom
  defaultSalaId?: string
}

export function ReservationDialog({
  open,
  onOpenChange,
  reservation,
  defaultSalaId,
}: ReservationDialogProps) {
  const { data: rooms = [] } = useRooms()
  const createReservation = useCreateReservation()
  const updateReservation = useUpdateReservation()

  const isLoading = createReservation.isPending || updateReservation.isPending

  function handleSubmit(values: ReservationFormValues) {
    if (reservation) {
      updateReservation.mutate(
        { id: reservation.id, values },
        { onSuccess: () => onOpenChange(false) }
      )
    } else {
      createReservation.mutate(values, { onSuccess: () => onOpenChange(false) })
    }
  }

  const defaultValues = reservation
    ?? (defaultSalaId ? ({ sala_id: defaultSalaId } as ReservationWithRoom) : undefined)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {reservation ? 'Editar reserva' : 'Nova reserva'}
          </DialogTitle>
        </DialogHeader>
        <ReservationForm
          rooms={rooms}
          defaultValues={defaultValues}
          onSubmit={handleSubmit}
          isLoading={isLoading}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
