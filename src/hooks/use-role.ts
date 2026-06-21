'use client'

import { useUser } from '@clerk/nextjs'

type Metadata = { role?: string }

export function useRole() {
  const { user, isLoaded } = useUser()
  const role = (user?.publicMetadata as Metadata | undefined)?.role
  return { isAdmin: role === 'admin', isLoaded }
}
