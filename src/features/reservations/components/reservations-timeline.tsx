'use client'

import { useState, useMemo, useRef, useEffect } from 'react'
import { format, startOfWeek, addDays, addWeeks, subWeeks, isToday } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { getReservationStatus } from '@/lib/utils'
import { useReservations } from '@/hooks/use-reservations'
import { TableSkeleton } from '@/components/loading-state'
import type { ReservationWithRoom } from '@/types'

const START_HOUR = 7
const END_HOUR = 23
const HOUR_HEIGHT = 56
const TOTAL_HEIGHT = (END_HOUR - START_HOUR) * HOUR_HEIGHT
const HOURS = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
const DAY_LABELS = ['DOM.', 'SEG.', 'TER.', 'QUA.', 'QUI.', 'SEX.', 'SÁB.']

function timeToMinutes(time: string): number {
  const [h, m] = time.slice(0, 5).split(':').map(Number)
  return h * 60 + m
}

function computeLayout(
  reservations: ReservationWithRoom[]
): Map<string, { left: number; width: number }> {
  const result = new Map<string, { left: number; width: number }>()
  const sorted = [...reservations].sort(
    (a, b) => timeToMinutes(a.horario_inicio) - timeToMinutes(b.horario_inicio)
  )

  const clusters: ReservationWithRoom[][] = []
  for (const r of sorted) {
    const rStart = timeToMinutes(r.horario_inicio)
    const rEnd = timeToMinutes(r.horario_fim)
    let placed = false

    for (const cluster of clusters) {
      const overlaps = cluster.some((c) => {
        const cStart = timeToMinutes(c.horario_inicio)
        const cEnd = timeToMinutes(c.horario_fim)
        return rStart < cEnd && rEnd > cStart
      })
      if (overlaps) { cluster.push(r); placed = true; break }
    }

    if (!placed) clusters.push([r])
  }

  for (const cluster of clusters) {
    const n = cluster.length
    cluster.forEach((r, i) => {
      result.set(r.id, { left: (i / n) * 100, width: (1 / n) * 100 })
    })
  }

  return result
}

function blockColors(r: ReservationWithRoom): string {
  const status = getReservationStatus(r)
  if (status === 'em_andamento') return 'bg-emerald-500 border-emerald-600 text-white'
  if (status === 'proxima') return 'bg-blue-500 border-blue-600 text-white'
  return 'bg-slate-100 border-slate-300 text-slate-500'
}

export function ReservationsTimeline() {
  const [baseDate, setBaseDate] = useState(() => new Date())
  const scrollRef = useRef<HTMLDivElement>(null)
  const { data: reservations = [], isLoading } = useReservations()

  const weekStart = startOfWeek(baseDate, { weekStartsOn: 0 })
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  const now = new Date()
  const nowTop = ((now.getHours() * 60 + now.getMinutes() - START_HOUR * 60) / 60) * HOUR_HEIGHT
  const showNowLine = nowTop >= 0 && nowTop <= TOTAL_HEIGHT

  // Scroll para o horário atual ao montar
  useEffect(() => {
    if (scrollRef.current && showNowLine) {
      scrollRef.current.scrollTop = Math.max(0, nowTop - 80)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading])

  const byDay = useMemo(() => {
    const map: Record<string, ReservationWithRoom[]> = {}
    for (const r of reservations) {
      if (!map[r.data]) map[r.data] = []
      map[r.data].push(r)
    }
    return map
  }, [reservations])

  const monthLabel = (() => {
    const startMonth = format(weekStart, 'MMMM', { locale: ptBR })
    const endMonth = format(days[6], 'MMMM', { locale: ptBR })
    const year = format(weekStart, 'yyyy')
    return startMonth === endMonth
      ? `${startMonth} de ${year}`
      : `${startMonth} – ${endMonth} de ${year}`
  })()

  if (isLoading) return <TableSkeleton rows={6} cols={7} />

  return (
    <div className="rounded-lg border overflow-hidden">
      {/* Navegação */}
      <div className="flex items-center gap-3 px-4 py-3 border-b bg-background sticky top-0 z-40">
        <Button variant="outline" size="sm" onClick={() => setBaseDate(new Date())}>
          Hoje
        </Button>
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setBaseDate((d) => subWeeks(d, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={() => setBaseDate((d) => addWeeks(d, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <h2 className="text-sm font-medium capitalize">{monthLabel}</h2>
      </div>

      <div className="overflow-x-auto">
        {/* Cabeçalho dos dias (fixo) */}
        <div className="flex sticky top-[57px] z-30 bg-background border-b" style={{ minWidth: 56 + 7 * 120 }}>
          <div className="w-14 shrink-0 border-r" />
          {days.map((day) => {
            const today = isToday(day)
            const dayOfWeek = day.getDay()
            return (
              <div
                key={format(day, 'yyyy-MM-dd')}
                className="flex-1 min-w-[120px] border-r last:border-r-0 flex flex-col items-center justify-center py-2 gap-0.5"
              >
                <span className="text-[11px] font-medium text-muted-foreground tracking-wider">
                  {DAY_LABELS[dayOfWeek]}
                </span>
                <div className={cn(
                  'h-8 w-8 flex items-center justify-center rounded-full text-sm font-semibold',
                  today ? 'bg-blue-600 text-white' : 'text-foreground'
                )}>
                  {format(day, 'd')}
                </div>
              </div>
            )
          })}
        </div>

        {/* Grade com scroll vertical */}
        <div
          ref={scrollRef}
          className="overflow-y-auto"
          style={{ maxHeight: '70dvh', minWidth: 56 + 7 * 120 }}
        >
          <div className="flex">
            {/* Coluna de horas */}
            <div className="w-14 shrink-0 border-r relative" style={{ height: TOTAL_HEIGHT }}>
              {HOURS.map((h) => (
                <div
                  key={h}
                  className="absolute w-full pr-2 flex justify-end -translate-y-1/2"
                  style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}
                >
                  <span className="text-[11px] text-muted-foreground tabular-nums select-none">
                    {String(h).padStart(2, '0')}:00
                  </span>
                </div>
              ))}
            </div>

            {/* Colunas dos dias */}
            {days.map((day) => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayReservations = byDay[dateStr] ?? []
              const layout = computeLayout(dayReservations)
              const today = isToday(day)

              return (
                <div
                  key={dateStr}
                  className={cn(
                    'flex-1 min-w-[120px] border-r last:border-r-0 relative',
                    today && 'bg-blue-50/40'
                  )}
                  style={{ height: TOTAL_HEIGHT }}
                >
                  {/* Linhas de hora */}
                  {HOURS.map((h) => (
                    <div key={h} className="absolute w-full" style={{ top: (h - START_HOUR) * HOUR_HEIGHT }}>
                      <div className="border-t border-border/50 w-full" />
                      <div
                        className="border-t border-border/20 border-dashed w-full"
                        style={{ marginTop: HOUR_HEIGHT / 2 - 1 }}
                      />
                    </div>
                  ))}

                  {/* Linha do horário atual */}
                  {today && showNowLine && (
                    <div
                      className="absolute w-full z-30 pointer-events-none"
                      style={{ top: nowTop }}
                    >
                      <div className="relative flex items-center">
                        <div className="absolute -left-1 h-2.5 w-2.5 rounded-full bg-red-500 -translate-y-1/2 z-10" />
                        <div className="w-full border-t-2 border-red-500" />
                      </div>
                    </div>
                  )}

                  {/* Blocos de reserva */}
                  {dayReservations.map((r) => {
                    const startMin = timeToMinutes(r.horario_inicio)
                    const endMin = timeToMinutes(r.horario_fim)
                    const top = ((startMin - START_HOUR * 60) / 60) * HOUR_HEIGHT
                    const height = Math.max(((endMin - startMin) / 60) * HOUR_HEIGHT, 22)
                    const { left, width } = layout.get(r.id) ?? { left: 0, width: 100 }

                    return (
                      <div
                        key={r.id}
                        className={cn(
                          'absolute rounded-md border px-1.5 py-0.5 overflow-hidden z-20 select-none',
                          blockColors(r)
                        )}
                        style={{
                          top: top + 1,
                          height: height - 2,
                          left: `calc(2px + ${left}%)`,
                          width: `calc(${width}% - 4px)`,
                        }}
                        title={`${r.titulo}\n${r.sala.nome}\n${r.horario_inicio.slice(0, 5)}–${r.horario_fim.slice(0, 5)}`}
                      >
                        <p className="text-[11px] font-semibold leading-tight truncate">{r.titulo}</p>
                        {height >= 34 && (
                          <p className="text-[10px] leading-tight opacity-90 truncate">{r.sala.nome}</p>
                        )}
                        {height >= 48 && (
                          <p className="text-[10px] leading-tight opacity-75">
                            {r.horario_inicio.slice(0, 5)}–{r.horario_fim.slice(0, 5)}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* Legenda */}
      <div className="flex items-center gap-5 px-4 py-2.5 border-t text-xs text-muted-foreground">
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-emerald-600 bg-emerald-500" />
          <span>Em andamento</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-blue-600 bg-blue-500" />
          <span>Próxima</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="h-3 w-3 rounded border border-slate-300 bg-slate-100" />
          <span>Encerrada</span>
        </div>
      </div>
    </div>
  )
}
