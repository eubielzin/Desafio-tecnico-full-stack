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
import { getReservationStatus } from '@/lib/utils'

export default function ReservasPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedSalaId, setSelectedSalaId] = useState('')
  const [selectedDate, setSelectedDate] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')

  const { data: rooms = [] } = useRooms()
  const { data: reservations, isLoading, isError, refetch } = useReservations(
    selectedSalaId || undefined
  )

  const filteredReservations = useMemo(() => {
    if (!reservations) return []
    let list = [...reservations].sort((a, b) => {
      if (a.data !== b.data) return a.data.localeCompare(b.data)
      return a.horario_inicio.localeCompare(b.horario_inicio)
    })
    if (selectedDate) list = list.filter((r) => r.data === selectedDate)
    if (selectedStatus) list = list.filter((r) => getReservationStatus(r) === selectedStatus)
    return list
  }, [reservations, selectedDate, selectedStatus])

  const hasFilters = selectedSalaId || selectedDate || selectedStatus

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

      <ReservationsFilters
        rooms={rooms}
        selectedSalaId={selectedSalaId}
        onSalaChange={setSelectedSalaId}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      {isLoading && <TableSkeleton rows={5} cols={5} />}

      {isError && (
        <ErrorState
          message="Não foi possível carregar as reservas."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && filteredReservations.length === 0 && (
        <EmptyState
          icon={CalendarDays}
          title="Nenhuma reserva encontrada"
          description={
            hasFilters
              ? 'Nenhuma reserva corresponde aos filtros selecionados. Tente outros critérios.'
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

      {!isLoading && !isError && filteredReservations.length > 0 && (
        <ReservationsTable reservations={filteredReservations} />
      )}

      <ReservationDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        defaultSalaId={selectedSalaId || undefined}
      />
    </div>
  )
}
