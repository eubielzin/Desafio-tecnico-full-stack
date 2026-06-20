import { Badge } from '@/components/ui/badge'
import { getReservationStatus, statusLabel, statusVariant } from '@/lib/utils'
import type { ReservationWithRoom } from '@/types'

export function ReservationStatusBadge({ reservation }: { reservation: ReservationWithRoom }) {
  const status = getReservationStatus(reservation)
  return (
    <Badge variant={statusVariant(status)}>
      {statusLabel(status)}
    </Badge>
  )
}
