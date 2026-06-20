import { QueryClient } from '@tanstack/react-query'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 30,
      retry: 1,
    },
  },
})

export const queryKeys = {
  rooms: {
    all: ['rooms'] as const,
    detail: (id: string) => ['rooms', id] as const,
  },
  reservations: {
    all: (salaId?: string) => ['reservations', { salaId }] as const,
    detail: (id: string) => ['reservations', id] as const,
  },
  dashboard: ['dashboard'] as const,
}
