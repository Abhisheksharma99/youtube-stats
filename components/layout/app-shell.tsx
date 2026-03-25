'use client'

import { motion } from 'framer-motion'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/lib/stores/ui-store'
import { Sidebar } from './sidebar'
import { Header } from './header'

export function AppShell({ children }: { children: React.ReactNode }) {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen)

  return (
    <div className="flex h-screen overflow-hidden bg-zinc-950">
      <Sidebar />

      <motion.div
        initial={false}
        animate={{ marginLeft: sidebarOpen ? 256 : 64 }}
        transition={{ duration: 0.2, ease: 'easeInOut' }}
        className="flex flex-1 flex-col overflow-hidden"
      >
        <Header />

        <main
          className={cn(
            'flex-1 overflow-y-auto',
            'px-6 py-6 lg:px-8 lg:py-8'
          )}
        >
          <div className="mx-auto max-w-7xl">
            {children}
          </div>
        </main>
      </motion.div>
    </div>
  )
}
