'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { ptBR } from 'date-fns/locale'
import { AlertCircle, CalendarIcon } from 'lucide-react'
import { reservationSchema, type ReservationFormValues } from '@/schemas/reservation'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { cn } from '@/lib/utils'
import type { ReservationWithRoom, Room } from '@/types'

interface ReservationFormProps {
  rooms: Room[]
  defaultValues?: ReservationWithRoom
  onSubmit: (values: ReservationFormValues) => void
  isLoading?: boolean
  onCancel: () => void
  serverError?: string
}

export function ReservationForm({
  rooms,
  defaultValues,
  onSubmit,
  isLoading,
  onCancel,
  serverError,
}: ReservationFormProps) {
  const form = useForm<ReservationFormValues>({
    resolver: zodResolver(reservationSchema),
    defaultValues: {
      sala_id: defaultValues?.sala_id ?? '',
      titulo: defaultValues?.titulo ?? '',
      participante_responsavel: defaultValues?.participante_responsavel ?? '',
      quantidade_participantes: defaultValues?.quantidade_participantes ?? ('' as unknown as number),
      data: defaultValues?.data ?? '',
      horario_inicio: defaultValues?.horario_inicio?.slice(0, 5) ?? '',
      horario_fim: defaultValues?.horario_fim?.slice(0, 5) ?? '',
    },
  })

  const selectedSalaId = form.watch('sala_id')
  const selectedRoom = rooms.find((r) => r.id === selectedSalaId)

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        sala_id: defaultValues.sala_id,
        titulo: defaultValues.titulo,
        participante_responsavel: defaultValues.participante_responsavel,
        quantidade_participantes: defaultValues.quantidade_participantes,
        data: defaultValues.data,
        horario_inicio: defaultValues.horario_inicio.slice(0, 5),
        horario_fim: defaultValues.horario_fim.slice(0, 5),
      })
    }
  }, [defaultValues, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="sala_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Sala</FormLabel>
              <Select onValueChange={field.onChange} value={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <span className={cn('flex-1 truncate text-left text-sm', !selectedRoom && 'text-muted-foreground')}>
                      {selectedRoom
                        ? `${selectedRoom.nome} — ${selectedRoom.capacidade} pessoa${selectedRoom.capacidade !== 1 ? 's' : ''}`
                        : 'Selecione uma sala'}
                    </span>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {rooms.map((room) => (
                    <SelectItem key={room.id} value={room.id}>
                      {room.nome} — {room.capacidade} pessoa{room.capacidade !== 1 ? 's' : ''}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="titulo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Reunião de planejamento" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="participante_responsavel"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Responsável</FormLabel>
              <FormControl>
                <Input placeholder="Nome do responsável" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="quantidade_participantes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nº de participantes</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  max={selectedRoom?.capacidade}
                  placeholder="Ex: 5"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              {selectedRoom && (
                <FormDescription>
                  Capacidade máxima da sala: <strong>{selectedRoom.capacidade} pessoa{selectedRoom.capacidade !== 1 ? 's' : ''}</strong>
                </FormDescription>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="data"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Data</FormLabel>
              <Popover>
                <FormControl>
                  <PopoverTrigger
                    className={cn(
                      buttonVariants({ variant: 'outline' }),
                      'w-full justify-start text-left font-normal',
                      !field.value && 'text-muted-foreground'
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {field.value
                      ? format(new Date(field.value + 'T00:00:00'), 'dd/MM/yyyy', { locale: ptBR })
                      : 'Selecione uma data'}
                  </PopoverTrigger>
                </FormControl>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={field.value ? new Date(field.value + 'T00:00:00') : undefined}
                    onSelect={(date) =>
                      field.onChange(date ? format(date, 'yyyy-MM-dd') : '')
                    }
                    locale={ptBR}
                  />
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="horario_inicio"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Início</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="horario_fim"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fim</FormLabel>
                <FormControl>
                  <Input type="time" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {serverError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading
              ? 'Salvando...'
              : defaultValues
              ? 'Salvar alterações'
              : 'Criar reserva'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
