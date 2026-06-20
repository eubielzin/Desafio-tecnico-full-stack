'use client'

import { useState, useMemo } from 'react'
import { format } from 'date-fns'
import { type DateRange } from 'react-day-picker'
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
import { type SortOrder } from '@/features/reservations/components/reservations-filters'

export default function ReservasPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const [selectedSalaId, setSelectedSalaId] = useState('')
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined)
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc')

  const { data: rooms = [] } = useRooms()
  const { data: reservations, isLoading, isError, refetch } = useReservations(
    selectedSalaId || undefined
  )

  const filteredReservations = useMemo(() => {
    if (!reservations) return []
    const dir = sortOrder === 'asc' ? 1 : -1
    let list = [...reservations].sort((a, b) => {
      const dateCmp = a.data.localeCompare(b.data)
      if (dateCmp !== 0) return dateCmp * dir
      return a.horario_inicio.localeCompare(b.horario_inicio) * dir
    })

    if (dateRange?.from) {
      const fromStr = format(dateRange.from, 'yyyy-MM-dd')
      list = list.filter((r) => r.data >= fromStr)
    }
    if (dateRange?.to) {
      const toStr = format(dateRange.to, 'yyyy-MM-dd')
      list = list.filter((r) => r.data <= toStr)
    }

    if (selectedStatus) {
      list = list.filter((r) => getReservationStatus(r) === selectedStatus)
    }

    return list
  }, [reservations, dateRange, selectedStatus, sortOrder])

  const hasFilters = selectedSalaId || dateRange || selectedStatus

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
        dateRange={dateRange}
        onDateRangeChange={setDateRange}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
        sortOrder={sortOrder}
        onSortChange={setSortOrder}
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
