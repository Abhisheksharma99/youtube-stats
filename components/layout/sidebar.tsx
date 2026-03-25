'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard,
  FolderOpen,
  Image,
  Share2,
  Settings,
  Wand2,
  ChevronLeft,
  ChevronRight,
  Bug,
  Workflow,
  GalleryHorizontalEnd,
  Send,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { useUIStore } from '@/lib/stores/ui-store'
import { useProjectStore } from '@/lib/stores/project-store'

const navItems = [
  { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { label: 'Projects', href: '/projects', icon: FolderOpen },
  { label: 'Media Gallery', href: '/media', icon: Image },
  { label: 'Social Accounts', href: '/accounts', icon: Share2 },
  { label: 'Settings', href: '/settings', icon: Settings },
]

const projectQuickLinks = [
  { label: 'Crawl', href: 'crawl', icon: Bug },
  { label: 'Pipeline', href: 'pipeline', icon: Workflow },
  { label: 'Gallery', href: 'gallery', icon: GalleryHorizontalEnd },
  { label: 'Publish', href: 'publish', icon: Send },
]

export function Sidebar() {
  const pathname = usePathname()
  const { sidebarOpen, toggleSidebar } = useUIStore()
  const sidebarCollapsed = !sidebarOpen
  const { projects, activeProjectId } = useProjectStore()

  const activeProject = projects.find((p) => p.id === activeProjectId)

  return (
    <motion.aside
      initial={false}
      animate={{ width: sidebarCollapsed ? 64 : 256 }}
      transition={{ duration: 0.2, ease: 'easeInOut' }}
      className={cn(
        'fixed left-0 top-0 z-40 flex h-screen flex-col',
        'bg-zinc-950 border-r border-zinc-800',
        'overflow-hidden'
      )}
    >
      {/* Logo / Brand */}
      <div className="flex h-16 items-center gap-3 border-b border-zinc-800 px-4">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-600">
          <Wand2 className="h-4 w-4 text-white" />
        </div>
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.span
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.15 }}
              className="text-lg font-semibold text-white whitespace-nowrap"
            >
              ContentForge
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 overflow-y-auto px-2 py-4">
        {navItems.map((item) => {
          const isActive = pathname?.startsWith(item.href)
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                'hover:bg-zinc-800/80 hover:text-white',
                isActive
                  ? 'bg-zinc-800 text-white'
                  : 'text-zinc-400'
              )}
            >
              <item.icon className="h-5 w-5 shrink-0" />
              <AnimatePresence>
                {!sidebarCollapsed && (
                  <motion.span
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                    className="whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
          )
        })}
      </nav>

      {/* Active Project Section */}
      <AnimatePresence>
        {activeProject && !sidebarCollapsed && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="border-t border-zinc-800 px-3 py-4"
          >
            <p className="mb-2 truncate text-xs font-semibold uppercase tracking-wider text-zinc-500">
              Active Project
            </p>
            <p className="mb-3 truncate text-sm font-medium text-white">
              {activeProject.name}
            </p>
            <div className="grid grid-cols-2 gap-1.5">
              {projectQuickLinks.map((link) => (
                <Link
                  key={link.href}
                  href={`/projects/${activeProjectId}/${link.href}`}
                  className={cn(
                    'flex items-center gap-1.5 rounded-md px-2 py-1.5 text-xs text-zinc-400',
                    'hover:bg-zinc-800 hover:text-white transition-colors'
                  )}
                >
                  <link.icon className="h-3.5 w-3.5 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Collapse Toggle */}
      <div className="border-t border-zinc-800 p-2">
        <button
          onClick={toggleSidebar}
          className={cn(
            'flex w-full items-center justify-center rounded-lg p-2',
            'text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors'
          )}
          aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
        >
          {sidebarCollapsed ? (
            <ChevronRight className="h-5 w-5" />
          ) : (
            <ChevronLeft className="h-5 w-5" />
          )}
        </button>
      </div>
    </motion.aside>
  )
}
