'use client'

import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Room } from '@/types'

interface ReservationsFiltersProps {
  rooms: Room[]
  selectedSalaId: string
  onSalaChange: (salaId: string) => void
}

export function ReservationsFilters({
  rooms,
  selectedSalaId,
  onSalaChange,
}: ReservationsFiltersProps) {
  return (
    <div className="flex items-center gap-2 mb-4">
      <Select
        value={selectedSalaId}
        onValueChange={onSalaChange}
      >
        <SelectTrigger className="w-[220px]">
          <SelectValue placeholder="Filtrar por sala" />
        </SelectTrigger>
        <SelectContent>
          {rooms.map((room) => (
            <SelectItem key={room.id} value={room.id}>
              {room.nome}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {selectedSalaId && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onSalaChange('')}
          className="h-9 px-2 text-muted-foreground"
        >
          <X className="h-4 w-4 mr-1" />
          Limpar
        </Button>
      )}
    </div>
  )
}
