'use client'

import { useState, useMemo } from 'react'
import { Plus, CalendarDays } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { TableSkeleton } from '@/components/loading-state'
import { ReservationsTable } from '@/features/reservations/components/reservations-table'
import { ReservationsFilters } from '@/features/reservations/components/reservations-filters'
import { ReservationDialog } from '@/features/reservations/components/reservation-dialog'
import { useReservations } from '@/hooks/use-reservations'
import { useRooms } from '@/hooks/use-rooms'

export default function ReservasPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedSalaId, setSelectedSalaId] = useState('')

  const { data: rooms = [] } = useRooms()
  const {
    data: reservations,
    isLoading,
    isError,
    refetch,
  } = useReservations(selectedSalaId || undefined)

  const sortedReservations = useMemo(() => {
    if (!reservations) return []
    return [...reservations].sort((a, b) => {
      if (a.data !== b.data) return a.data.localeCompare(b.data)
      return a.horario_inicio.localeCompare(b.horario_inicio)
    })
  }, [reservations])

  return (
    <div>
      <PageHeader
        title="Reservas"
        description="Gerencie as reservas de salas de reunião."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova reserva
          </Button>
        }
      />

      {rooms.length > 0 && (
        <ReservationsFilters
          rooms={rooms}
          selectedSalaId={selectedSalaId}
          onSalaChange={setSelectedSalaId}
        />
      )}

      {isLoading && <TableSkeleton rows={5} cols={5} />}

      {isError && (
        <ErrorState
          message="Não foi possível carregar as reservas."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && sortedReservations.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="Nenhuma reserva encontrada"
          description={
            selectedSalaId
              ? 'Não há reservas para a sala selecionada. Tente outro filtro ou crie uma nova reserva.'
              : 'Crie sua primeira reserva para começar.'
          }
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova reserva
            </Button>
          }
        />
      )}

      {!isLoading && !isError && sortedReservations.length > 0 && (
        <ReservationsTable reservations={sortedReservations} />
      )}

      <ReservationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultSalaId={selectedSalaId || undefined}
      />
    </div>
  )
}
