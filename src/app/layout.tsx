import type { Metadata } from 'next'
import { Geist } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers'
import { Navbar, MobileNav } from '@/components/navbar'

const geist = Geist({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'ReservaFácil — Gerenciamento de Salas',
  description: 'Sistema de reservas de salas de reunião',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className="h-full">
      <body className={`${geist.className} h-full antialiased bg-background text-foreground`}>
        <Providers>
          <div className="flex h-full">
            <Navbar />
            <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
              <div className="max-w-6xl mx-auto px-4 py-8">
                {children}
              </div>
            </main>
          </div>
          <MobileNav />
        </Providers>
      </body>
    </html>
  )
}
