'use client'

import { useState } from 'react'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import {
  Plus,
  FolderKanban,
  Youtube,
  Instagram,
  Video,
  Search,
  Calendar,
} from 'lucide-react'
import type { Project, ProjectStatus } from '@/lib/types'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockProjects: (Project & { progress: number })[] = [
  {
    id: 'proj-1',
    name: 'AI Trends 2026',
    description: 'Deep dive into the latest AI trends shaping content creation in 2026.',
    status: 'processing',
    keywords: ['AI', 'trends', 'machine learning', '2026'],
    targetPlatforms: ['youtube', 'tiktok'],
    createdAt: new Date('2026-03-10'),
    updatedAt: new Date('2026-03-24'),
    progress: 65,
  },
  {
    id: 'proj-2',
    name: 'Product Launch Teaser',
    description: 'Short-form teaser videos for the upcoming product launch campaign.',
    status: 'published',
    keywords: ['product', 'launch', 'teaser', 'marketing'],
    targetPlatforms: ['instagram', 'youtube', 'x'],
    createdAt: new Date('2026-03-05'),
    updatedAt: new Date('2026-03-23'),
    progress: 100,
  },
  {
    id: 'proj-3',
    name: 'Weekly Newsletter Clips',
    description: 'Automated video snippets generated from newsletter content.',
    status: 'ready',
    keywords: ['newsletter', 'automation', 'clips'],
    targetPlatforms: ['linkedin', 'facebook'],
    createdAt: new Date('2026-03-01'),
    updatedAt: new Date('2026-03-22'),
    progress: 90,
  },
  {
    id: 'proj-4',
    name: 'Tutorial Series Ep.5',
    description: 'Episode 5 of the beginner-friendly tutorial series on video editing.',
    status: 'crawling',
    keywords: ['tutorial', 'video editing', 'beginner'],
    targetPlatforms: ['youtube'],
    createdAt: new Date('2026-03-15'),
    updatedAt: new Date('2026-03-22'),
    progress: 25,
  },
  {
    id: 'proj-5',
    name: 'Brand Story Mini-Doc',
    description: 'A mini documentary telling the brand origin story.',
    status: 'draft',
    keywords: ['brand', 'story', 'documentary', 'origin'],
    targetPlatforms: ['youtube', 'instagram'],
    createdAt: new Date('2026-03-20'),
    updatedAt: new Date('2026-03-21'),
    progress: 0,
  },
  {
    id: 'proj-6',
    name: 'Holiday Campaign Reel',
    description: 'Festive promotional reel for the spring holiday season.',
    status: 'draft',
    keywords: ['holiday', 'spring', 'promotional', 'reel'],
    targetPlatforms: ['instagram', 'tiktok', 'facebook'],
    createdAt: new Date('2026-03-18'),
    updatedAt: new Date('2026-03-19'),
    progress: 0,
  },
]

const statusColors: Record<ProjectStatus, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  crawling: 'bg-blue-900/60 text-blue-300',
  processing: 'bg-amber-900/60 text-amber-300',
  ready: 'bg-emerald-900/60 text-emerald-300',
  published: 'bg-purple-900/60 text-purple-300',
}

const progressColors: Record<ProjectStatus, string> = {
  draft: 'bg-zinc-600',
  crawling: 'bg-blue-500',
  processing: 'bg-amber-500',
  ready: 'bg-emerald-500',
  published: 'bg-purple-500',
}

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="h-3.5 w-3.5 text-red-400" />,
  instagram: <Instagram className="h-3.5 w-3.5 text-pink-400" />,
  tiktok: <Video className="h-3.5 w-3.5 text-cyan-400" />,
  x: <span className="text-[10px] font-bold text-zinc-300">𝕏</span>,
  linkedin: <span className="text-[10px] font-bold text-blue-400">in</span>,
  facebook: <span className="text-[10px] font-bold text-blue-300">f</span>,
}

type FilterTab = 'all' | 'active' | 'completed' | 'draft'

const tabs: { label: string; value: FilterTab }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Completed', value: 'completed' },
  { label: 'Draft', value: 'draft' },
]

function filterProjects(projects: typeof mockProjects, tab: FilterTab) {
  switch (tab) {
    case 'active':
      return projects.filter((p) => ['crawling', 'processing'].includes(p.status))
    case 'completed':
      return projects.filter((p) => ['ready', 'published'].includes(p.status))
    case 'draft':
      return projects.filter((p) => p.status === 'draft')
    default:
      return projects
  }
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProjectsPage() {
  const [activeTab, setActiveTab] = useState<FilterTab>('all')
  const filtered = filterProjects(mockProjects, activeTab)

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ── Header ───────────────────────────────────────────── */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Projects</h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Manage your content creation projects
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500">
            <Plus className="h-4 w-4" />
            New Project
          </button>
        </div>

        {/* ── Filter Tabs ──────────────────────────────────────── */}
        <div className="flex gap-1 rounded-lg border border-zinc-800 bg-zinc-900 p-1 w-fit">
          {tabs.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setActiveTab(tab.value)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium transition ${
                activeTab === tab.value
                  ? 'bg-zinc-700 text-zinc-100'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* ── Project Grid / Empty State ───────────────────────── */}
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-zinc-800 bg-zinc-900/50 py-20">
            <FolderKanban className="h-12 w-12 text-zinc-700" />
            <p className="mt-4 text-lg font-medium text-zinc-400">No projects found</p>
            <p className="mt-1 text-sm text-zinc-500">
              {activeTab === 'all'
                ? 'Create your first project to get started.'
                : `No ${activeTab} projects at the moment.`}
            </p>
            <button className="mt-6 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">
              <Plus className="h-4 w-4" />
              New Project
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filtered.map((project) => (
              <Link
                key={project.id}
                href={`/projects/${project.id}`}
                className="group flex flex-col rounded-xl border border-zinc-800 bg-zinc-900 p-5 transition hover:border-zinc-700"
              >
                {/* Title + Status */}
                <div className="flex items-start justify-between">
                  <h3 className="font-semibold text-zinc-100 group-hover:text-white">
                    {project.name}
                  </h3>
                  <span
                    className={`shrink-0 rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[project.status]}`}
                  >
                    {project.status}
                  </span>
                </div>

                {/* Description */}
                <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{project.description}</p>

                {/* Keywords */}
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {project.keywords.map((kw) => (
                    <span
                      key={kw}
                      className="rounded-md bg-zinc-800 px-2 py-0.5 text-xs text-zinc-400"
                    >
                      {kw}
                    </span>
                  ))}
                </div>

                {/* Progress */}
                <div className="mt-4">
                  <div className="flex items-center justify-between text-xs text-zinc-500 mb-1.5">
                    <span>Progress</span>
                    <span>{project.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-zinc-800">
                    <div
                      className={`h-1.5 rounded-full transition-all ${progressColors[project.status]}`}
                      style={{ width: `${project.progress}%` }}
                    />
                  </div>
                </div>

                {/* Footer: Platforms + Date */}
                <div className="mt-4 flex items-center justify-between border-t border-zinc-800 pt-3">
                  <div className="flex gap-2">
                    {project.targetPlatforms.map((p) => (
                      <span key={p}>{platformIcons[p]}</span>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-zinc-500">
                    <Calendar className="h-3 w-3" />
                    {project.createdAt.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  )
}
