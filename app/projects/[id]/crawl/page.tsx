'use client'

import { useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import { AppShell } from '@/components/layout/app-shell'
import {
  ArrowLeft,
  Search,
  LayoutDashboard,
  GitBranch,
  Images,
  Send,
  Plus,
  X,
  Play,
  Trash2,
  ChevronDown,
  ChevronRight,
  ExternalLink,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Clock,
  FileText,
  Video,
  MessageSquare,
  BookOpen,
  Sparkles,
} from 'lucide-react'
import type { CrawlStatus } from '@/lib/types'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

const initialKeywords = ['AI trends', 'machine learning 2026', 'generative video']
const initialSources = [
  'https://arxiv.org/search/?query=generative+video',
  'https://techcrunch.com/tag/ai/',
]

interface CrawlItem {
  id: string
  sourceUrl: string
  title: string
  status: CrawlStatus
  snippet: string
  fullContent: string
  type: 'article' | 'video' | 'social' | 'paper'
  crawledAt: Date
}

const mockCrawlResults: CrawlItem[] = [
  {
    id: 'c1',
    sourceUrl: 'https://arxiv.org/abs/2026.12345',
    title: 'Advances in Diffusion-Based Video Generation Models',
    status: 'completed',
    snippet: 'This paper presents a comprehensive survey of recent advances in diffusion-based video generation, focusing on temporal coherence and high-resolution synthesis...',
    fullContent: 'This paper presents a comprehensive survey of recent advances in diffusion-based video generation, focusing on temporal coherence and high-resolution synthesis. We analyze the architectural innovations that enable longer video generation while maintaining visual quality. Our findings indicate that recent models achieve 4K resolution at 60fps with significantly reduced computational costs compared to previous approaches.',
    type: 'paper',
    crawledAt: new Date('2026-03-24T10:15:00'),
  },
  {
    id: 'c2',
    sourceUrl: 'https://techcrunch.com/2026/03/20/ai-video-creation-tools/',
    title: 'The Best AI Video Creation Tools in 2026',
    status: 'completed',
    snippet: 'From Wan 2.2 to HunyuanVideo 1.5, the landscape of AI video generation has dramatically shifted. Here are the tools that content creators are actually using...',
    fullContent: 'From Wan 2.2 to HunyuanVideo 1.5, the landscape of AI video generation has dramatically shifted. Here are the tools that content creators are actually using in their daily workflows. The key differentiator this year has been the integration of text-to-video pipelines that maintain brand consistency across generations.',
    type: 'article',
    crawledAt: new Date('2026-03-24T10:20:00'),
  },
  {
    id: 'c3',
    sourceUrl: 'https://youtube.com/watch?v=abc123',
    title: 'How I Use AI to Create 100 Videos a Month',
    status: 'completed',
    snippet: 'In this breakdown, I show my complete workflow for using AI tools to generate, edit, and publish over 100 videos every month across multiple platforms...',
    fullContent: 'In this breakdown, I show my complete workflow for using AI tools to generate, edit, and publish over 100 videos every month across multiple platforms. The key is batching your content pipeline into distinct phases: research, scripting, generation, and publishing.',
    type: 'video',
    crawledAt: new Date('2026-03-24T10:25:00'),
  },
  {
    id: 'c4',
    sourceUrl: 'https://twitter.com/ai_researcher/status/12345',
    title: 'Thread: Why temporal coherence is the next frontier',
    status: 'completed',
    snippet: 'Hot take: the biggest bottleneck in AI video isn\'t resolution or aesthetics anymore, it\'s temporal coherence over long sequences...',
    fullContent: 'Hot take: the biggest bottleneck in AI video isn\'t resolution or aesthetics anymore, it\'s temporal coherence over long sequences. The models that solve this will dominate the next wave of content creation tools.',
    type: 'social',
    crawledAt: new Date('2026-03-24T10:30:00'),
  },
  {
    id: 'c5',
    sourceUrl: 'https://blog.example.com/ml-trends',
    title: 'Machine Learning Trends That Will Define 2026',
    status: 'running',
    snippet: 'Loading content...',
    fullContent: '',
    type: 'article',
    crawledAt: new Date('2026-03-24T10:32:00'),
  },
  {
    id: 'c6',
    sourceUrl: 'https://arxiv.org/abs/2026.67890',
    title: 'FramePack: Efficient Long Video Generation',
    status: 'pending',
    snippet: '',
    fullContent: '',
    type: 'paper',
    crawledAt: new Date('2026-03-24T10:33:00'),
  },
]

const statusConfig: Record<CrawlStatus, { color: string; icon: React.ElementType }> = {
  pending: { color: 'bg-zinc-700 text-zinc-300', icon: Clock },
  running: { color: 'bg-blue-900/60 text-blue-300', icon: Loader2 },
  completed: { color: 'bg-emerald-900/60 text-emerald-300', icon: CheckCircle2 },
  failed: { color: 'bg-red-900/60 text-red-300', icon: AlertCircle },
}

const contentTypeOptions = [
  { label: 'Articles', value: 'articles', icon: FileText },
  { label: 'Videos', value: 'videos', icon: Video },
  { label: 'Social Posts', value: 'social', icon: MessageSquare },
  { label: 'Research Papers', value: 'papers', icon: BookOpen },
]

const typeIcons: Record<string, React.ElementType> = {
  article: FileText,
  video: Video,
  social: MessageSquare,
  paper: BookOpen,
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

export default function CrawlPage() {
  const params = useParams<{ id: string }>()
  const projectId = params?.id ?? ''

  const [keywords, setKeywords] = useState<string[]>(initialKeywords)
  const [keywordInput, setKeywordInput] = useState('')
  const [sources, setSources] = useState<string[]>(initialSources)
  const [sourceInput, setSourceInput] = useState('')
  const [maxPages, setMaxPages] = useState(15)
  const [contentTypes, setContentTypes] = useState<string[]>(['articles', 'videos', 'social', 'papers'])
  const [expandedItem, setExpandedItem] = useState<string | null>(null)
  const [selectedItems, setSelectedItems] = useState<string[]>([])

  const addKeyword = () => {
    const trimmed = keywordInput.trim()
    if (trimmed && !keywords.includes(trimmed)) {
      setKeywords([...keywords, trimmed])
      setKeywordInput('')
    }
  }

  const removeKeyword = (kw: string) => {
    setKeywords(keywords.filter((k) => k !== kw))
  }

  const addSource = () => {
    const trimmed = sourceInput.trim()
    if (trimmed && !sources.includes(trimmed)) {
      setSources([...sources, trimmed])
      setSourceInput('')
    }
  }

  const removeSource = (url: string) => {
    setSources(sources.filter((s) => s !== url))
  }

  const toggleContentType = (type: string) => {
    setContentTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const toggleSelection = (id: string) => {
    setSelectedItems((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    const completedIds = mockCrawlResults.filter((r) => r.status === 'completed').map((r) => r.id)
    if (selectedItems.length === completedIds.length) {
      setSelectedItems([])
    } else {
      setSelectedItems(completedIds)
    }
  }

  return (
    <AppShell>
      <div className="space-y-6">
        {/* ── Back link ───────────────────────────────────────── */}
        <Link
          href={`/projects/${projectId}`}
          className="inline-flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-200 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Project
        </Link>

        {/* ── Header ──────────────────────────────────────────── */}
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Crawl & Research</h1>
          <p className="mt-0.5 text-sm text-zinc-400">
            Configure and run web crawls to gather research material for your project.
          </p>
        </div>

        {/* ── Tab Navigation ──────────────────────────────────── */}
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-800 pb-px">
          {tabs.map((tab) => {
            const isActive = tab.value === 'crawl'
            return (
              <Link
                key={tab.value}
                href={tab.href ? `/projects/${projectId}${tab.href}` : `/projects/${projectId}`}
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

        {/* ── Main Content: Left Config + Right Results ────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* ── Left Panel: Configuration (2/5) ────────────────── */}
          <div className="lg:col-span-2 space-y-5">
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5 space-y-5">
              <h2 className="text-base font-semibold text-zinc-100">Configuration</h2>

              {/* Keywords */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Keywords / Queries</label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {keywords.map((kw) => (
                    <span
                      key={kw}
                      className="inline-flex items-center gap-1 rounded-lg bg-zinc-800 border border-zinc-700 px-2.5 py-1 text-sm text-zinc-300"
                    >
                      {kw}
                      <button
                        onClick={() => removeKeyword(kw)}
                        className="ml-0.5 rounded hover:bg-zinc-700 p-0.5"
                      >
                        <X className="h-3 w-3 text-zinc-500 hover:text-zinc-300" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={keywordInput}
                    onChange={(e) => setKeywordInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addKeyword()}
                    placeholder="Add keyword..."
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={addKeyword}
                    className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Source URLs */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Source URLs</label>
                <div className="space-y-2 mb-2">
                  {sources.map((url) => (
                    <div
                      key={url}
                      className="flex items-center gap-2 rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2"
                    >
                      <ExternalLink className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                      <span className="text-sm text-zinc-300 truncate flex-1">{url}</span>
                      <button
                        onClick={() => removeSource(url)}
                        className="rounded hover:bg-zinc-700 p-0.5 shrink-0"
                      >
                        <X className="h-3.5 w-3.5 text-zinc-500 hover:text-zinc-300" />
                      </button>
                    </div>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={sourceInput}
                    onChange={(e) => setSourceInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && addSource()}
                    placeholder="https://..."
                    className="flex-1 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500"
                  />
                  <button
                    onClick={addSource}
                    className="rounded-lg bg-zinc-800 border border-zinc-700 px-3 py-2 text-sm text-zinc-300 hover:bg-zinc-700 transition"
                  >
                    <Plus className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Max Pages Slider */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">
                  Max Pages: <span className="text-zinc-100 font-semibold">{maxPages}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={50}
                  value={maxPages}
                  onChange={(e) => setMaxPages(Number(e.target.value))}
                  className="w-full accent-blue-500"
                />
                <div className="flex justify-between text-xs text-zinc-500 mt-1">
                  <span>1</span>
                  <span>25</span>
                  <span>50</span>
                </div>
              </div>

              {/* Content Type Checkboxes */}
              <div>
                <label className="block text-sm font-medium text-zinc-300 mb-2">Content Types</label>
                <div className="space-y-2">
                  {contentTypeOptions.map((ct) => (
                    <label
                      key={ct.value}
                      className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-zinc-800/50 cursor-pointer transition"
                    >
                      <input
                        type="checkbox"
                        checked={contentTypes.includes(ct.value)}
                        onChange={() => toggleContentType(ct.value)}
                        className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                      />
                      <ct.icon className="h-4 w-4 text-zinc-400" />
                      <span className="text-sm text-zinc-300">{ct.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Start Crawl Button */}
              <button className="w-full inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-blue-500">
                <Play className="h-4 w-4" />
                Start Crawl
              </button>
            </div>
          </div>

          {/* ── Right Panel: Results (3/5) ─────────────────────── */}
          <div className="lg:col-span-3 space-y-4">
            {/* Bulk Actions Toolbar */}
            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900 px-4 py-3">
              <div className="flex items-center gap-3">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={
                      selectedItems.length > 0 &&
                      selectedItems.length === mockCrawlResults.filter((r) => r.status === 'completed').length
                    }
                    onChange={toggleSelectAll}
                    className="rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0"
                  />
                  <span className="text-sm text-zinc-400">
                    {selectedItems.length > 0
                      ? `${selectedItems.length} selected`
                      : 'Select all'}
                  </span>
                </label>
              </div>
              <div className="flex items-center gap-2">
                {selectedItems.length > 0 && (
                  <>
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600/20 border border-emerald-800 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-600/30 transition">
                      <Sparkles className="h-3.5 w-3.5" />
                      Clean & Process ({selectedItems.length})
                    </button>
                    <button className="inline-flex items-center gap-1.5 rounded-lg bg-red-600/20 border border-red-800 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-600/30 transition">
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete
                    </button>
                  </>
                )}
                <button className="inline-flex items-center gap-1.5 rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-1.5 text-xs font-medium text-zinc-300 hover:bg-zinc-700 transition">
                  <RefreshCw className="h-3.5 w-3.5" />
                  Refresh
                </button>
              </div>
            </div>

            {/* Results List */}
            <div className="space-y-3">
              {mockCrawlResults.map((item) => {
                const isExpanded = expandedItem === item.id
                const StatusIcon = statusConfig[item.status].icon
                const TypeIcon = typeIcons[item.type]

                return (
                  <div
                    key={item.id}
                    className="rounded-xl border border-zinc-800 bg-zinc-900 overflow-hidden"
                  >
                    <div className="flex items-start gap-3 p-4">
                      {/* Checkbox */}
                      {item.status === 'completed' && (
                        <input
                          type="checkbox"
                          checked={selectedItems.includes(item.id)}
                          onChange={() => toggleSelection(item.id)}
                          className="mt-1 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-blue-500 focus:ring-offset-0 shrink-0"
                        />
                      )}

                      {/* Type icon */}
                      <div className="mt-0.5 shrink-0">
                        <TypeIcon className="h-4 w-4 text-zinc-500" />
                      </div>

                      {/* Content */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-zinc-200 truncate">{item.title}</p>
                            <p className="text-xs text-zinc-500 truncate mt-0.5">{item.sourceUrl}</p>
                          </div>
                          <span
                            className={`shrink-0 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusConfig[item.status].color}`}
                          >
                            <StatusIcon className={`h-3 w-3 ${item.status === 'running' ? 'animate-spin' : ''}`} />
                            {item.status}
                          </span>
                        </div>

                        {item.snippet && (
                          <p className="mt-2 text-sm text-zinc-400 line-clamp-2">{item.snippet}</p>
                        )}

                        {/* Expanded full content */}
                        {isExpanded && item.fullContent && (
                          <div className="mt-3 rounded-lg bg-zinc-800/50 border border-zinc-800 p-3">
                            <p className="text-sm text-zinc-300 leading-relaxed">{item.fullContent}</p>
                          </div>
                        )}

                        {/* Footer */}
                        <div className="mt-3 flex items-center gap-3">
                          {item.status === 'completed' && (
                            <>
                              <button
                                onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                                className="inline-flex items-center gap-1 text-xs text-zinc-400 hover:text-zinc-200 transition"
                              >
                                {isExpanded ? (
                                  <ChevronDown className="h-3.5 w-3.5" />
                                ) : (
                                  <ChevronRight className="h-3.5 w-3.5" />
                                )}
                                {isExpanded ? 'Collapse' : 'Expand'}
                              </button>
                              <button className="inline-flex items-center gap-1 text-xs text-emerald-400 hover:text-emerald-300 transition">
                                <Sparkles className="h-3.5 w-3.5" />
                                Clean & Process
                              </button>
                            </>
                          )}
                          <span className="text-xs text-zinc-600 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {item.crawledAt.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
