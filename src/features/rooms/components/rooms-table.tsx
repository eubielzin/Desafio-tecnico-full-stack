'use client'

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { RoomActions } from './room-actions'
import { formatDate } from '@/lib/utils'
import type { Room } from '@/types'

export function RoomsTable({ rooms }: { rooms: Room[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Capacidade</TableHead>
            <TableHead className="hidden sm:table-cell">Criada em</TableHead>
            <TableHead className="w-12" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell className="font-medium">{room.nome}</TableCell>
              <TableCell>
                <Badge variant="secondary">{room.capacidade} pessoa{room.capacidade !== 1 ? 's' : ''}</Badge>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                {formatDate(room.created_at)}
              </TableCell>
              <TableCell>
                <RoomActions room={room} />
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
