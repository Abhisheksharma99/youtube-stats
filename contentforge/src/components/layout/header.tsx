'use client'

import { usePathname } from 'next/navigation'
import { Search, Bell, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { useMemo } from 'react'

function buildBreadcrumbs(pathname: string) {
  const segments = pathname.split('/').filter(Boolean)
  const crumbs: { label: string; href: string }[] = []
  let href = ''
  for (const seg of segments) {
    href += `/${seg}`
    const label = seg.charAt(0).toUpperCase() + seg.slice(1).replace(/-/g, ' ')
    crumbs.push({ label, href })
  }
  return crumbs
}

export function Header() {
  const pathname = usePathname()
  const breadcrumbs = useMemo(() => buildBreadcrumbs(pathname), [pathname])

  return (
    <header className="flex items-center justify-between h-16 px-6 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-sm shrink-0">
      {/* Breadcrumbs */}
      <nav className="flex items-center gap-1.5 text-sm">
        {breadcrumbs.map((crumb, i) => (
          <span key={crumb.href} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="w-3.5 h-3.5 text-zinc-600" />}
            {i === breadcrumbs.length - 1 ? (
              <span className="text-zinc-100 font-medium">{crumb.label}</span>
            ) : (
              <Link
                href={crumb.href}
                className="text-zinc-500 hover:text-zinc-300 transition-colors"
              >
                {crumb.label}
              </Link>
            )}
          </span>
        ))}
      </nav>

      {/* Right side */}
      <div className="flex items-center gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search..."
            className="w-64 h-9 pl-9 pr-4 rounded-lg bg-zinc-900 border border-zinc-800 text-sm text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
          />
        </div>
        <button className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-zinc-800 transition-colors">
          <Bell className="w-5 h-5 text-zinc-400" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full" />
        </button>
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-xs font-bold text-white">
          CF
        </div>
      </div>
    </header>
  )
}
