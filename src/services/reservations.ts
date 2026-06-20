import type { ReservationWithRoom, DashboardStats } from '@/types'
import type { ReservationFormValues } from '@/schemas/reservation'

export async function fetchReservations(salaId?: string): Promise<ReservationWithRoom[]> {
  const url = salaId ? `/api/reservas?sala_id=${salaId}` : '/api/reservas'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Erro ao buscar reservas.')
  return res.json()
}

export async function fetchReservation(id: string): Promise<ReservationWithRoom> {
  const res = await fetch(`/api/reservas/${id}`)
  if (!res.ok) throw new Error('Reserva não encontrada.')
  return res.json()
}

export async function createReservation(values: ReservationFormValues): Promise<ReservationWithRoom> {
  const res = await fetch('/api/reservas', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao criar reserva.')
  return data
}

export async function updateReservation(
  id: string,
  values: ReservationFormValues
): Promise<ReservationWithRoom> {
  const res = await fetch(`/api/reservas/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(values),
  })
  const data = await res.json()
  if (!res.ok) throw new Error(data.error ?? 'Erro ao atualizar reserva.')
  return data
}

export async function deleteReservation(id: string): Promise<void> {
  const res = await fetch(`/api/reservas/${id}`, { method: 'DELETE' })
  if (!res.ok) {
    const data = await res.json()
    throw new Error(data.error ?? 'Erro ao excluir reserva.')
  }
}

export async function fetchDashboard(): Promise<DashboardStats> {
  const res = await fetch('/api/dashboard')
  if (!res.ok) throw new Error('Erro ao buscar dados do dashboard.')
  return res.json()
}
