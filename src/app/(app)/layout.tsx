import { Navbar, MobileNav } from '@/components/navbar'

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-full">
      <Navbar />
      <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
        <div className="max-w-6xl mx-auto px-4 py-8">
          {children}
        </div>
      </main>
      <MobileNav />
    </div>
  )
}
