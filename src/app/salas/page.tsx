'use client'

import { useState } from 'react'
import { Plus, DoorOpen } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { PageHeader } from '@/components/page-header'
import { EmptyState } from '@/components/empty-state'
import { ErrorState } from '@/components/error-state'
import { TableSkeleton } from '@/components/loading-state'
import { RoomsTable } from '@/features/rooms/components/rooms-table'
import { RoomDialog } from '@/features/rooms/components/room-dialog'
import { useRooms } from '@/hooks/use-rooms'

export default function SalasPage() {
  const [createOpen, setCreateOpen] = useState(false)
  const { data: rooms, isLoading, isError, refetch } = useRooms()

  return (
    <div>
      <PageHeader
        title="Salas"
        description="Gerencie as salas de reunião disponíveis."
        action={
          <Button onClick={() => setCreateOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Nova sala
          </Button>
        }
      />

      {isLoading && <TableSkeleton rows={4} cols={3} />}

      {isError && (
        <ErrorState
          message="Não foi possível carregar as salas."
          onRetry={() => refetch()}
        />
      )}

      {!isLoading && !isError && rooms?.length === 0 && (
        <EmptyState
          icon={DoorOpen}
          title="Nenhuma sala cadastrada"
          description="Crie sua primeira sala de reunião para começar a fazer reservas."
          action={
            <Button onClick={() => setCreateOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nova sala
            </Button>
          }
        />
      )}

      {!isLoading && !isError && rooms && rooms.length > 0 && (
        <RoomsTable rooms={rooms} />
      )}

      <RoomDialog open={createOpen} onOpenChange={setCreateOpen} />
    </div>
  )
}
