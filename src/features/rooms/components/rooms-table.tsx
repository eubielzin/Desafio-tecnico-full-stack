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
import { useRole } from '@/hooks/use-role'
import { formatDate } from '@/lib/utils'
import type { Room } from '@/types'

export function RoomsTable({ rooms }: { rooms: Room[] }) {
  const { isAdmin } = useRole()

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Nome</TableHead>
            <TableHead>Capacidade</TableHead>
            <TableHead className="hidden md:table-cell">Disponibilidade</TableHead>
            <TableHead className="hidden sm:table-cell">Criada em</TableHead>
            {isAdmin && <TableHead className="w-12" />}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rooms.map((room) => (
            <TableRow key={room.id}>
              <TableCell className="font-medium">{room.nome}</TableCell>
              <TableCell>
                <Badge variant="secondary">{room.capacidade} pessoa{room.capacidade !== 1 ? 's' : ''}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                <div className="flex flex-wrap gap-1">
                  {room.disponivel_madrugada && (
                    <Badge variant="secondary">Madrugada</Badge>
                  )}
                  {room.disponivel_fim_de_semana && (
                    <Badge variant="secondary">Fim de semana</Badge>
                  )}
                  {!room.disponivel_madrugada && !room.disponivel_fim_de_semana && (
                    <span className="text-muted-foreground text-sm">—</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                {formatDate(room.created_at)}
              </TableCell>
              {isAdmin && (
                <TableCell>
                  <RoomActions room={room} />
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
