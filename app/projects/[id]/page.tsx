'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import {
  ArrowLeft,
  Edit3,
  LayoutDashboard,
  Search,
  GitBranch,
  Images,
  Send,
  Youtube,
  Instagram,
  Video,
  Globe,
  FileText,
  Film,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react'
import type { ProjectStatus, PlatformType } from '@/lib/types'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const mockProject = {
  id: 'proj-1',
  name: 'AI Trends 2026',
  description: 'Deep dive into the latest AI trends shaping content creation in 2026.',
  status: 'processing' as ProjectStatus,
  keywords: ['AI', 'trends', 'machine learning', '2026', 'generative video'],
  targetPlatforms: ['youtube', 'tiktok'] as PlatformType[],
  createdAt: new Date('2026-03-10'),
  updatedAt: new Date('2026-03-24'),
}

const projectStats = [
  { label: 'Crawled Sources', value: 24, icon: Search, color: 'text-blue-400' },
  { label: 'Scripts Generated', value: 3, icon: FileText, color: 'text-emerald-400' },
  { label: 'Videos Generated', value: 8, icon: Film, color: 'text-purple-400' },
  { label: 'Published', value: 2, icon: Globe, color: 'text-amber-400' },
]

const crawlSummary = {
  totalSources: 24,
  articlesFound: 18,
  videosAnalyzed: 4,
  socialPosts: 2,
  lastCrawled: new Date('2026-03-24T10:30:00'),
}

const latestMedia = [
  { id: 'm1', title: 'AI Revolution Intro Clip', model: 'Wan 2.2', duration: '0:15', resolution: '1080p', status: 'completed' },
  { id: 'm2', title: 'Machine Learning Explainer', model: 'HunyuanVideo 1.5', duration: '0:30', resolution: '4K', status: 'completed' },
  { id: 'm3', title: 'Trend Forecast Montage', model: 'LTX-Video', duration: '0:45', resolution: '1080p', status: 'generating' },
  { id: 'm4', title: 'Neural Network Visualization', model: 'FramePack', duration: '0:20', resolution: '720p', status: 'completed' },
]

const publishingStatus = [
  { platform: 'youtube' as PlatformType, status: 'published', publishedAt: new Date('2026-03-23T14:00:00'), url: '#' },
  { platform: 'tiktok' as PlatformType, status: 'scheduled', scheduledAt: new Date('2026-03-26T12:00:00'), url: '' },
]

const statusColors: Record<ProjectStatus, string> = {
  draft: 'bg-zinc-700 text-zinc-300',
  crawling: 'bg-blue-900/60 text-blue-300',
  processing: 'bg-amber-900/60 text-amber-300',
  ready: 'bg-emerald-900/60 text-emerald-300',
  published: 'bg-purple-900/60 text-purple-300',
}

const platformIcons: Record<string, React.ReactNode> = {
  youtube: <Youtube className="h-4 w-4 text-red-400" />,
  instagram: <Instagram className="h-4 w-4 text-pink-400" />,
  tiktok: <Video className="h-4 w-4 text-cyan-400" />,
  x: <span className="text-xs font-bold text-zinc-300">X</span>,
  linkedin: <span className="text-xs font-bold text-blue-400">in</span>,
  facebook: <span className="text-xs font-bold text-blue-300">f</span>,
}

// ---------------------------------------------------------------------------
// Tab navigation
// ---------------------------------------------------------------------------

const tabs = [
  { label: 'Overview', value: 'overview', icon: LayoutDashboard, href: '' },
  { label: 'Crawl & Research', value: 'crawl', icon: Search, href: '/crawl' },
  { label: 'Pipeline', value: 'pipeline', icon: GitBranch, href: '/pipeline' },
  { label: 'Gallery', value: 'gallery', icon: Images, href: '/gallery' },
  { label: 'Publish', value: 'publish', icon: Send, href: '/publish' },
]

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function ProjectDetailPage() {
  const params = useParams<{ id: string }>()
  const project = { ...mockProject, id: params.id }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ── Back link ───────────────────────────────────────── */}
        <Link
          href="/projects"
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Projects
        </Link>

        {/* ── Project Header ──────────────────────────────────── */}
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-zinc-100">{project.name}</h1>
              <span
                className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusColors[project.status]}`}
              >
                {project.status}
              </span>
            </div>
            <p className="mt-1 text-sm text-zinc-400">{project.description}</p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100">
            <Edit3 className="h-4 w-4" />
            Edit
          </button>
        </div>

        {/* ── Horizontal Tab Navigation ───────────────────────── */}
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-800 pb-px">
          {tabs.map((tab) => {
            const isActive = tab.value === 'overview'
            return (
              <Link
                key={tab.value}
                href={tab.href ? `/projects/${project.id}${tab.href}` : `/projects/${project.id}`}
                className={`inline-flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? 'border-blue-500 text-blue-400'
                    : 'border-transparent text-zinc-400 hover:border-zinc-700 hover:text-zinc-200'
                }`}
              >
                <tab.icon className="h-4 w-4" />
                {tab.label}
              </Link>
            )
          })}
        </div>

        {/* ── Overview Tab Content ────────────────────────────── */}

        {/* Stats */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {projectStats.map((s) => (
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
          {/* ── Left column (2/3) ──────────────────────────────── */}
          <div className="lg:col-span-2 space-y-6">
            {/* Keywords */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Keywords</h3>
              <div className="flex flex-wrap gap-2">
                {project.keywords.map((kw) => (
                  <span
                    key={kw}
                    className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1 text-sm text-zinc-300"
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            {/* Crawl Summary */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Crawl Summary</h3>
                <Link
                  href={`/projects/${project.id}/crawl`}
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  View Details
                </Link>
              </div>
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <div>
                  <p className="text-2xl font-semibold text-zinc-100">{crawlSummary.totalSources}</p>
                  <p className="text-xs text-zinc-500">Total Sources</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-zinc-100">{crawlSummary.articlesFound}</p>
                  <p className="text-xs text-zinc-500">Articles</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-zinc-100">{crawlSummary.videosAnalyzed}</p>
                  <p className="text-xs text-zinc-500">Videos Analyzed</p>
                </div>
                <div>
                  <p className="text-2xl font-semibold text-zinc-100">{crawlSummary.socialPosts}</p>
                  <p className="text-xs text-zinc-500">Social Posts</p>
                </div>
              </div>
              <p className="mt-3 text-xs text-zinc-500 flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Last crawled {crawlSummary.lastCrawled.toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>

            {/* Latest Generated Media */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Latest Generated Media</h3>
                <Link
                  href={`/projects/${project.id}/gallery`}
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  View Gallery
                </Link>
              </div>
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {latestMedia.map((m) => (
                  <div
                    key={m.id}
                    className="flex items-center gap-3 rounded-lg bg-zinc-800/50 border border-zinc-800 p-3"
                  >
                    <div className="flex h-12 w-16 items-center justify-center rounded bg-zinc-800 text-zinc-600">
                      <Film className="h-5 w-5" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-zinc-200 truncate">{m.title}</p>
                      <div className="flex items-center gap-2 text-xs text-zinc-500">
                        <span>{m.model}</span>
                        <span className="text-zinc-700">|</span>
                        <span>{m.duration}</span>
                        <span className="text-zinc-700">|</span>
                        <span>{m.resolution}</span>
                      </div>
                    </div>
                    {m.status === 'completed' ? (
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-400" />
                    ) : (
                      <div className="h-4 w-4 shrink-0 animate-spin rounded-full border-2 border-amber-400 border-t-transparent" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── Right column (1/3) ─────────────────────────────── */}
          <div className="space-y-6">
            {/* Publishing Status */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider">Publishing</h3>
                <Link
                  href={`/projects/${project.id}/publish`}
                  className="text-xs text-blue-400 hover:text-blue-300 transition"
                >
                  Manage
                </Link>
              </div>
              <div className="space-y-3">
                {publishingStatus.map((ps, i) => (
                  <div key={i} className="flex items-center gap-3 rounded-lg bg-zinc-800/50 border border-zinc-800 p-3">
                    <span>{platformIcons[ps.platform]}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-zinc-200 capitalize">{ps.platform}</p>
                      <p className="text-xs text-zinc-500">
                        {ps.status === 'published'
                          ? `Published ${ps.publishedAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`
                          : `Scheduled ${ps.scheduledAt?.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}`}
                      </p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-0.5 text-xs font-medium capitalize ${
                        ps.status === 'published'
                          ? 'bg-emerald-900/60 text-emerald-300'
                          : 'bg-blue-900/60 text-blue-300'
                      }`}
                    >
                      {ps.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Target Platforms */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Target Platforms</h3>
              <div className="flex flex-wrap gap-2">
                {project.targetPlatforms.map((p) => (
                  <div
                    key={p}
                    className="inline-flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-1.5 text-sm text-zinc-300 capitalize"
                  >
                    {platformIcons[p]}
                    {p}
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Navigation */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="text-sm font-semibold text-zinc-300 uppercase tracking-wider mb-3">Quick Navigation</h3>
              <div className="space-y-1.5">
                {tabs.slice(1).map((tab) => (
                  <Link
                    key={tab.value}
                    href={`/projects/${project.id}${tab.href}`}
                    className="flex items-center gap-2.5 rounded-lg px-3 py-2 text-sm text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                  >
                    <tab.icon className="h-4 w-4" />
                    {tab.label}
                    <TrendingUp className="ml-auto h-3.5 w-3.5 text-zinc-600" />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
