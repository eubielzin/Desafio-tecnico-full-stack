import { auth } from '@clerk/nextjs/server'
import { NextResponse } from 'next/server'

type Metadata = { role?: string }

function extractRole(sessionClaims: Record<string, unknown> | null | undefined): string | undefined {
  return (sessionClaims?.metadata as Metadata | undefined)?.role
}

export async function requireAdmin(): Promise<NextResponse | null> {
  const { userId, sessionClaims } = await auth()
  if (!userId) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }
  if (extractRole(sessionClaims) !== 'admin') {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas administradores podem realizar esta ação.' },
      { status: 403 }
    )
  }
  return null
}
