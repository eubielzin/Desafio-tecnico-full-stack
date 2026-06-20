'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ReservationStatusBadge } from './reservation-status-badge'
import { ReservationActions } from './reservation-actions'
import { formatDate, formatTime } from '@/lib/utils'
import type { ReservationWithRoom } from '@/types'

export function ReservationsTable({ reservations }: { reservations: ReservationWithRoom[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Título</TableHead>
            <TableHead className="hidden md:table-cell">Sala</TableHead>
            <TableHead>Data</TableHead>
            <TableHead>Horário</TableHead>
            <TableHead className="hidden lg:table-cell">Responsável</TableHead>
            <TableHead className="hidden lg:table-cell">Participantes</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {reservations.map((reservation) => (
            <TableRow key={reservation.id}>
              <TableCell className="font-medium max-w-[160px] truncate">
                {reservation.titulo}
              </TableCell>
              <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                {reservation.sala.nome}
              </TableCell>
              <TableCell className="text-sm">{formatDate(reservation.data)}</TableCell>
              <TableCell className="text-sm whitespace-nowrap">
                {formatTime(reservation.horario_inicio)} – {formatTime(reservation.horario_fim)}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                {reservation.participante_responsavel}
              </TableCell>
              <TableCell className="hidden lg:table-cell text-sm text-muted-foreground">
                {reservation.quantidade_participantes} / {reservation.sala.capacidade}
              </TableCell>
              <TableCell>
                <ReservationStatusBadge reservation={reservation} />
              </TableCell>
              <TableCell>
                <ReservationActions reservation={reservation} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
