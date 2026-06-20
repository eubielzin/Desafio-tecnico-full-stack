'use client'

import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { roomSchema, type RoomFormValues } from '@/schemas/room'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
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
    },
  })

  useEffect(() => {
    if (defaultValues) {
      form.reset({ nome: defaultValues.nome, capacidade: defaultValues.capacidade })
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
