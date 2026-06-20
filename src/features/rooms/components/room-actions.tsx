'use client'

import { useState } from 'react'
import { MoreHorizontal, Pencil, Trash2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { RoomDialog } from './room-dialog'
import { useDeleteRoom } from '@/hooks/use-rooms'
import type { Room } from '@/types'

export function RoomActions({ room }: { room: Room }) {
  const [editOpen, setEditOpen] = useState(false)
  const [deleteOpen, setDeleteOpen] = useState(false)
  const deleteRoom = useDeleteRoom()

  function handleDelete() {
    deleteRoom.mutate(room.id, { onSuccess: () => setDeleteOpen(false) })
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MoreHorizontal className="h-4 w-4" />
            <span className="sr-only">Ações</span>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setEditOpen(true)}>
            <Pencil className="h-4 w-4 mr-2" />
            Editar
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={() => setDeleteOpen(true)}
            className="text-destructive focus:text-destructive"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Excluir
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <RoomDialog open={editOpen} onOpenChange={setEditOpen} room={room} />

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Excluir sala"
        description={`Tem certeza que deseja excluir "${room.nome}"? Todas as reservas associadas também serão removidas.`}
        onConfirm={handleDelete}
        loading={deleteRoom.isPending}
      />
    </>
  )
}
