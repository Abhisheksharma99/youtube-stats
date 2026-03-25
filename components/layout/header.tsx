'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import {
  Search,
  Bell,
  Plus,
  ChevronRight,
  User,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  return segments.map((segment, index) => {
    const href = '/' + segments.slice(0, index + 1).join('/')
    const label = segment.charAt(0).toUpperCase() + segment.slice(1).replace(/-/g, ' ')
    return { label, href }
  })
}

export function Header() {
  const pathname = usePathname()
  const breadcrumbs = buildBreadcrumbs(pathname ?? '/')

  return (
    <header
      className={cn(
        'sticky top-0 z-30 flex h-16 items-center justify-between gap-4',
        'border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm px-6'
      )}
    >
      {/* Breadcrumb Navigation */}
      <nav className="flex items-center gap-1.5 text-sm">
        <Link
          href="/"
          className="text-zinc-500 hover:text-white transition-colors"
        >
          Home
        </Link>
        {breadcrumbs.map((crumb) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            <ChevronRight className="h-3.5 w-3.5 text-zinc-600" />
            <Link
              href={crumb.href}
              className="text-zinc-400 hover:text-white transition-colors"
            >
              {crumb.label}
            </Link>
          </span>
        ))}
      </nav>

      {/* Right Section */}
      <div className="flex items-center gap-3">
        {/* Search Input */}
        <div className="relative hidden md:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            className={cn(
              'h-9 w-64 rounded-lg border border-zinc-800 bg-zinc-900 pl-9 pr-4 text-sm text-white',
              'placeholder:text-zinc-500 focus:border-violet-600 focus:outline-none focus:ring-1 focus:ring-violet-600',
              'transition-colors'
            )}
          />
        </div>

        {/* New Project Button */}
        <Link
          href="/projects/new"
          className={cn(
            'flex items-center gap-1.5 rounded-lg bg-violet-600 px-3 py-2 text-sm font-medium text-white',
            'hover:bg-violet-500 transition-colors'
          )}
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">New Project</span>
        </Link>

        {/* Notification Bell */}
        <button
          className="relative rounded-lg p-2 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
          aria-label="Notifications"
        >
          <Bell className="h-5 w-5" />
          <span className="absolute right-1 top-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white">
            3
          </span>
        </button>

        {/* User Avatar Dropdown */}
        <button
          className="flex h-8 w-8 items-center justify-center rounded-full bg-zinc-800 text-zinc-400 hover:text-white transition-colors"
          aria-label="User menu"
        >
          <User className="h-4 w-4" />
        </button>
      </div>
    </header>
  )
}
