'use client'

import { AppShell } from '@/components/layout/app-shell'
import {
  FolderKanban,
  Video,
  Globe,
  Loader2,
  Plus,
  Images,
  Link2,
  Camera,
  Clock,
  CheckCircle2,
  Upload,
  Zap,
  ArrowRight,
} from 'lucide-react'
import Link from 'next/link'
import type { Project, ProjectStatus } from '@/lib/types'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const stats = [
  { label: 'Total Projects', value: 12, icon: FolderKanban, color: 'text-blue-400' },
  { label: 'Videos Generated', value: 84, icon: Video, color: 'text-purple-400' },
  { label: 'Published', value: 47, icon: Globe, color: 'text-emerald-400' },
  { label: 'Processing', value: 3, icon: Loader2, color: 'text-amber-400' },
]

const statusColors: Record<ProjectStatus, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  crawling: 'bg-blue-900/60 text-blue-300',
  processing: 'bg-amber-900/60 text-amber-300',
  ready: 'bg-emerald-900/60 text-emerald-300',
  published: 'bg-purple-900/60 text-purple-300',
}

const recentProjects: (Pick<Project, 'id' | 'name' | 'status' | 'updatedAt' | 'targetPlatforms'>) [] = [
  {
    id: 'proj-1',
    name: 'AI Trends 2026',
    status: 'processing',
    updatedAt: new Date('2026-03-24T14:30:00'),
    targetPlatforms: ['youtube', 'tiktok'],
  },
  {
    id: 'proj-2',
    name: 'Product Launch Teaser',
    status: 'published',
    updatedAt: new Date('2026-03-23T09:15:00'),
    targetPlatforms: ['instagram', 'youtube', 'x'],
  },
  {
    id: 'proj-3',
    name: 'Weekly Newsletter Clips',
    status: 'ready',
    updatedAt: new Date('2026-03-22T17:00:00'),
    targetPlatforms: ['linkedin', 'facebook'],
  },
  {
    id: 'proj-4',
    name: 'Tutorial Series Ep.5',
    status: 'crawling',
    updatedAt: new Date('2026-03-22T11:45:00'),
    targetPlatforms: ['youtube'],
  },
  {
    id: 'proj-5',
    name: 'Brand Story Mini-Doc',
    status: 'draft',
    updatedAt: new Date('2026-03-21T08:00:00'),
    targetPlatforms: ['youtube', 'instagram'],
  },
]

const activityFeed = [
  { text: 'Video "AI Trends Intro" finished generating', time: '12 min ago', icon: CheckCircle2, color: 'text-emerald-400' },
  { text: 'Published "Product Launch Teaser" to YouTube', time: '2 hours ago', icon: Upload, color: 'text-purple-400' },
  { text: 'Crawl completed for "Weekly Newsletter Clips"', time: '5 hours ago', icon: Zap, color: 'text-blue-400' },
  { text: 'New project "Brand Story Mini-Doc" created', time: '1 day ago', icon: Plus, color: 'text-zinc-400' },
  { text: 'Pipeline run started for "Tutorial Series Ep.5"', time: '1 day ago', icon: Loader2, color: 'text-amber-400' },
]

const quickActions = [
  { label: 'New Project', href: '/projects?new=1', icon: Plus },
  { label: 'Browse Gallery', href: '/projects/proj-1/gallery', icon: Images },
  { label: 'Connect Accounts', href: '/settings', icon: Link2 },
]

// ---------------------------------------------------------------------------
// Platform icon helper
// ---------------------------------------------------------------------------

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <Video className="h-4 w-4 text-red-400" />,
  instagram: <Camera className="h-4 w-4 text-pink-400" />,
  tiktok: <Video className="h-4 w-4 text-cyan-400" />,
  x: <span className="text-xs font-bold text-zinc-300">𝕏</span>,
  linkedin: <span className="text-xs font-bold text-blue-400">in</span>,
  facebook: <span className="text-xs font-bold text-blue-300">f</span>,
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function DashboardPage() {
  return (
    <AppShell>
      <div className="space-y-8">
        {/* ── Header ─────────────────────────────────────────────── */}
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">ContentForge</h1>
          <p className="mt-1 text-zinc-400">
            Your AI-powered content creation pipeline — research, generate, publish.
          </p>
        </div>

        {/* ── Stats Cards ────────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900 p-5"
            >
              <div className={`rounded-lg bg-zinc-800 p-3 ${s.color}`}>
                <s.icon className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-zinc-400">{s.label}</p>
                <p className="text-2xl font-semibold text-zinc-100">{s.value}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* ── Recent Projects (2/3 width) ────────────────────── */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-zinc-100">Recent Projects</h2>
              <Link href="/projects" className="text-sm text-zinc-400 hover:text-zinc-200 flex items-center gap-1">
                View all <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="space-y-3">
              {recentProjects.map((proj) => (
                <Link
                  key={proj.id}
                  href={`/projects/${proj.id}`}
                  className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 p-4 transition hover:border-zinc-700 hover:bg-zinc-900/80"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-zinc-800">
                      <FolderKanban className="h-5 w-5 text-zinc-400" />
                    </div>
                    <div>
                      <p className="font-medium text-zinc-100">{proj.name}</p>
                      <p className="text-xs text-zinc-500">
                        Updated {proj.updatedAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex gap-1.5">
                      {proj.targetPlatforms.map((p) => (
                        <span key={p}>{platformIcons[p]}</span>
                      ))}
                    </div>
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[proj.status]}`}
                    >
                      {proj.status}
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── Right sidebar (1/3 width) ──────────────────────── */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-zinc-100">Quick Actions</h2>
              <div className="space-y-2">
                {quickActions.map((a) => (
                  <Link
                    key={a.label}
                    href={a.href}
                    className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900 p-3.5 text-sm font-medium text-zinc-300 transition hover:border-zinc-700 hover:text-zinc-100"
                  >
                    <a.icon className="h-4 w-4" />
                    {a.label}
                  </Link>
                ))}
              </div>
            </div>

            {/* Activity Feed */}
            <div className="space-y-3">
              <h2 className="text-lg font-semibold text-zinc-100">Activity</h2>
              <div className="space-y-1">
                {activityFeed.map((item, i) => (
                  <div
                    key={i}
                    className="flex gap-3 rounded-lg px-3 py-2.5 transition hover:bg-zinc-900"
                  >
                    <item.icon className={`mt-0.5 h-4 w-4 shrink-0 ${item.color}`} />
                    <div>
                      <p className="text-sm text-zinc-300">{item.text}</p>
                      <p className="text-xs text-zinc-500 flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {item.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
