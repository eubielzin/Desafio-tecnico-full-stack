'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { ReservationStatus, Room } from '@/types'

const STATUS_OPTIONS: { value: ReservationStatus; label: string }[] = [
  { value: 'em_andamento', label: 'Em andamento' },
  { value: 'proxima', label: 'Próxima' },
  { value: 'encerrada', label: 'Encerrada' },
]

interface ReservationsFiltersProps {
  rooms: Room[]
  selectedSalaId: string
  onSalaChange: (salaId: string) => void
  selectedDate: string
  onDateChange: (date: string) => void
  selectedStatus: string
  onStatusChange: (status: string) => void
}

export function ReservationsFilters({
  rooms,
  selectedSalaId,
  onSalaChange,
  selectedDate,
  onDateChange,
  selectedStatus,
  onStatusChange,
}: ReservationsFiltersProps) {
  const hasFilters = selectedSalaId || selectedDate || selectedStatus

  const selectedRoom = rooms.find((r) => r.id === selectedSalaId)
  const selectedStatusLabel = STATUS_OPTIONS.find((s) => s.value === selectedStatus)?.label

  return (
    <div className="flex flex-wrap items-center gap-2 mb-4">
      <Select value={selectedSalaId} onValueChange={(value) => onSalaChange(value ?? '')}>
        <SelectTrigger className="w-[180px]">
          <span className={cn('flex-1 truncate text-left text-sm', !selectedRoom && 'text-muted-foreground')}>
            {selectedRoom ? selectedRoom.nome : 'Filtrar por sala'}
          </span>
        </SelectTrigger>
        <SelectContent>
          {rooms.map((room) => (
            <SelectItem key={room.id} value={room.id}>
              {room.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Input
        type="date"
        className="w-[160px] h-8"
        value={selectedDate}
        onChange={(e) => onDateChange(e.target.value)}
      />

      <Select value={selectedStatus} onValueChange={(value) => onStatusChange(value ?? '')}>
        <SelectTrigger className="w-[160px]">
          <span className={cn('flex-1 truncate text-left text-sm', !selectedStatus && 'text-muted-foreground')}>
            {selectedStatusLabel ?? 'Filtrar por status'}
          </span>
        </SelectTrigger>
        <SelectContent>
          {STATUS_OPTIONS.map((s) => (
            <SelectItem key={s.value} value={s.value}>
              {s.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => { onSalaChange(''); onDateChange(''); onStatusChange('') }}
          className="h-8 px-2 text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  )
}
