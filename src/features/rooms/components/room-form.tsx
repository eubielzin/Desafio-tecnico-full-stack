'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { roomSchema, type RoomFormValues } from '@/schemas/room'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form'
import type { Room } from '@/types'

interface RoomFormProps {
  defaultValues?: Room
  onSubmit: (values: RoomFormValues) => void
  isLoading?: boolean
  onCancel: () => void
}

export function RoomForm({ defaultValues, onSubmit, isLoading, onCancel }: RoomFormProps) {
  const form = useForm<RoomFormValues>({
    resolver: zodResolver(roomSchema),
    defaultValues: {
      nome: defaultValues?.nome ?? '',
      capacidade: defaultValues?.capacidade ?? ('' as unknown as number),
      disponivel_madrugada: defaultValues?.disponivel_madrugada ?? false,
      disponivel_fim_de_semana: defaultValues?.disponivel_fim_de_semana ?? false,
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({
        nome: defaultValues.nome,
        capacidade: defaultValues.capacidade,
        disponivel_madrugada: defaultValues.disponivel_madrugada,
        disponivel_fim_de_semana: defaultValues.disponivel_fim_de_semana,
      })
    }
  }, [defaultValues, form])

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="nome"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Nome da sala</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Sala de Reunião A" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="capacidade"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacidade (pessoas)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  min={1}
                  placeholder="Ex: 10"
                  {...field}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="disponivel_madrugada"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 py-1">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer leading-tight">
                Disponível na madrugada (00:00–06:59)
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="disponivel_fim_de_semana"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 py-1">
              <FormControl>
                <Checkbox
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  disabled={isLoading}
                />
              </FormControl>
              <FormLabel className="font-normal cursor-pointer leading-tight">
                Disponível no fim de semana
              </FormLabel>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="outline" onClick={onCancel} disabled={isLoading}>
            Cancelar
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Salvando...' : defaultValues ? 'Salvar alterações' : 'Criar sala'}
          </Button>
        </div>
      </form>
    </Form>
  )
}
