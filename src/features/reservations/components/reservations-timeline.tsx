'use client'

import { useState, useMemo } from 'react'
import { format, startOfToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { cn } from '@/lib/utils'
import { getReservationStatus } from '@/lib/utils'
import { buttonVariants } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useReservations } from '@/hooks/use-reservations'
import { useRooms } from '@/hooks/use-rooms'
import { TableSkeleton } from '@/components/loading-state'
import type { ReservationWithRoom } from '@/types'

const START_HOUR = 7
const END_HOUR = 23
const HOUR_HEIGHT = 64 // px por hora
const ROOM_COL_WIDTH = 176 // px por coluna de sala

function timeToMinutes(time: string): number {
  const [h, m] = time.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function blockStyle(r: ReservationWithRoom): { top: number; height: number } {
  const startMin = timeToMinutes(r.horario_inicio)
  const endMin = timeToMinutes(r.horario_fim)
  const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 20)
  return { top, height }
}

function blockColor(r: ReservationWithRoom): string {
  const status = getReservationStatus(r)
  if (status === 'em_andamento') return 'bg-primary text-primary-foreground border-primary'
  if (status === 'proxima') return 'bg-blue-500 text-white border-blue-600'
  return 'bg-muted text-muted-foreground border-border line-through'
}

const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT

export function ReservationsTimeline() {
  const [selectedDate, setSelectedDate] = useState(format(startOfToday(), 'yyyy-MM-dd'))

  const { data: rooms = [], isLoading: loadingRooms } = useRooms()
  const { data: reservations = [], isLoading: loadingRes } = useReservations()

  const byRoom = useMemo(() => {
    const map: Record<string, ReservationWithRoom[]> = {}
    for (const r of reservations) {
      if (r.data !== selectedDate) continue
      if (!map[r.sala_id]) map[r.sala_id] = []
      map[r.sala_id].push(r)
    }
    return map
  }, [reservations, selectedDate])

  const now = new Date()
  const todayStr = format(now, 'yyyy-MM-dd')
  const nowTop = ((now.getHours() * 60 + now.getMinutes() - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const showNowLine = selectedDate === todayStr && nowTop >= 0 && nowTop <= TOTAL_HEIGHT

  if (loadingRooms || loadingRes) return <TableSkeleton rows={6} cols={4} />

  return (
    <div className="space-y-4">
      <Popover>
        <PopoverTrigger
          className={cn(
            buttonVariants({ variant: 'outline' }),
            'w-48 justify-start font-normal'
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          {format(new Date(selectedDate + 'T00:00:00'), "dd 'de' MMMM", { locale: ptBR })}
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={new Date(selectedDate + 'T00:00:00')}
            onSelect={(d) => d && setSelectedDate(format(d, 'yyyy-MM-dd'))}
            locale={ptBR}
          />
        </PopoverContent>
      </Popover>

      <div className="overflow-x-auto rounded-lg border">
        <div className="flex" style={{ minWidth: 64 + rooms.length * ROOM_COL_WIDTH }}>
          {/* Coluna de horas */}
          <div className="w-16 shrink-0 border-r bg-background">
            <div className="h-10 border-b" />
            <div className="relative" style={{ height: TOTAL_HEIGHT }}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute w-full flex items-center justify-end pr-2 -translate-y-1/2"
                  style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                >
                  <span className="text-xs text-muted-foreground tabular-nums select-none">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Colunas de salas */}
          {rooms.map((room) => (
            <div
              key={room.id}
              className="shrink-0 border-r last:border-r-0"
              style={{ width: ROOM_COL_WIDTH }}
            >
              {/* Cabeçalho da sala */}
              <div className="h-10 border-b px-2 flex items-center bg-muted/30">
                <span className="text-xs font-semibold truncate" title={room.nome}>
                  {room.nome}
                </span>
              </div>

              {/* Grade de horários */}
              <div className="relative" style={{ height: TOTAL_HEIGHT }}>
                {/* Linhas horizontais por hora */}
                {HOURS.map((h) => (
                  <div
                    key={h}
                    className="absolute w-full border-t border-border/40"
                    style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                  />
                ))}

                {/* Linha do horário atual */}
                {showNowLine && (
                  <div
                    className="absolute w-full border-t-2 border-red-500 z-10 pointer-events-none"
                    style={{ top: nowTop }}
                  >
                    <div className="absolute -top-1.5 -left-1 h-3 w-3 rounded-full bg-red-500" />
                  </div>
                )}

                {/* Blocos de reserva */}
                {(byRoom[room.id] ?? []).map((r) => {
                  const { top, height } = blockStyle(r)
                  return (
                    <div
                      key={r.id}
                      className={cn(
                        'absolute left-1 right-1 rounded border px-1.5 py-1 overflow-hidden z-20',
                        blockColor(r)
                      )}
                      style={{ top: top + 1, height: height - 2 }}
                      title={`${r.titulo}\n${r.participante_responsavel}\n${r.horario_inicio.slice(0, 5)}–${r.horario_fim.slice(0, 5)}`}
                    >
                      <p className="text-xs font-medium leading-tight truncate">{r.titulo}</p>
                      {height >= 36 && (
                        <p className="text-xs leading-tight opacity-80">
                          {r.horario_inicio.slice(0, 5)}–{r.horario_fim.slice(0, 5)}
                        </p>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-5 text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-primary bg-primary" />
          <span>Em andamento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-blue-600 bg-blue-500" />
          <span>Próxima</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-border bg-muted" />
          <span>Encerrada</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-2 w-3 border-t-2 border-red-500" />
          <span>Agora</span>
        </div>
      </div>
    </div>
  )
}
