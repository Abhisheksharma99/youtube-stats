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
  Play,
  SkipForward,
  CheckCircle2,
  Loader2,
  Circle,
  FileText,
  ListOrdered,
  PenTool,
  Sparkles,
  Film,
  Maximize2,
  ChevronDown,
  Settings2,
} from 'lucide-react'
import type { PipelineStage } from '@/lib/types'

// ---------------------------------------------------------------------------
// Mock data
// ---------------------------------------------------------------------------

interface PipelineStep {
  stage: PipelineStage
  label: string
  description: string
  icon: React.ElementType
  status: 'completed' | 'running' | 'pending'
  inputPreview: string
  outputPreview: string
}

const pipelineSteps: PipelineStep[] = [
  {
    stage: 'research',
    label: 'Research',
    description: 'Crawl sources and gather research material from the web.',
    icon: Search,
    status: 'completed',
    inputPreview: '3 keywords, 2 source URLs, max 15 pages',
    outputPreview: '24 sources crawled, 18 articles, 4 videos analyzed',
  },
  {
    stage: 'outline',
    label: 'Outline',
    description: 'Generate a structured content outline from research findings.',
    icon: ListOrdered,
    status: 'completed',
    inputPreview: '24 crawled sources, cleaned and processed',
    outputPreview: '5-section outline: Intro, Key Trends, Deep Dive, Comparison, Conclusion',
  },
  {
    stage: 'script',
    label: 'Script',
    description: 'Write a full video script based on the content outline.',
    icon: PenTool,
    status: 'completed',
    inputPreview: '5-section outline with key talking points',
    outputPreview: '1,847 words, ~8 min read time, 3 versions generated',
  },
  {
    stage: 'prompt',
    label: 'Video Prompt',
    description: 'Generate detailed video generation prompts from the script.',
    icon: Sparkles,
    status: 'running',
    inputPreview: 'Script v3 (final), 5 sections, 8 scenes identified',
    outputPreview: 'Generating prompts for 8 scenes...',
  },
  {
    stage: 'generate',
    label: 'Generate Video',
    description: 'Run AI video generation using the configured model and settings.',
    icon: Film,
    status: 'pending',
    inputPreview: 'Awaiting video prompts...',
    outputPreview: '',
  },
  {
    stage: 'upscale',
    label: 'Upscale',
    description: 'Upscale generated videos to final resolution and quality.',
    icon: Maximize2,
    status: 'pending',
    inputPreview: 'Awaiting generated videos...',
    outputPreview: '',
  },
]

const mockLogs = [
  '[10:30:01] Starting prompt generation pipeline...',
  '[10:30:02] Loading script v3 (1,847 words)',
  '[10:30:03] Identifying scene boundaries from script sections',
  '[10:30:05] Found 8 distinct scenes across 5 sections',
  '[10:30:06] Generating visual prompt for Scene 1: "Opening montage"',
  '[10:30:12] Scene 1 prompt completed (127 tokens)',
  '[10:30:13] Generating visual prompt for Scene 2: "AI landscape overview"',
  '[10:30:19] Scene 2 prompt completed (143 tokens)',
  '[10:30:20] Generating visual prompt for Scene 3: "Diffusion model visualization"',
  '[10:30:28] Scene 3 prompt completed (156 tokens)',
  '[10:30:29] Processing Scene 4 of 8...',
]

const mockPrompt = `A sweeping aerial shot of a futuristic city at dawn, holographic data streams flowing between buildings, soft golden light breaking through clouds. Camera slowly descends toward a central plaza where people interact with floating AR interfaces. Style: cinematic, photorealistic, warm color grading with blue accent lighting. Motion: smooth dolly-in with gentle parallax.`

const modelOptions = [
  { value: 'wan-2.2', label: 'Wan 2.2' },
  { value: 'hunyuan-1.5', label: 'HunyuanVideo 1.5' },
  { value: 'ltx-video', label: 'LTX-Video' },
  { value: 'framepack', label: 'FramePack' },
]

const resolutionOptions = ['512x512', '720p', '1080p', '4K']
const durationOptions = [5, 10, 15, 30, 60]
const fpsOptions = [12, 24, 30, 60]

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

export default function PipelinePage() {
  const params = useParams<{ id: string }>()
  const projectId = params?.id ?? ''

  const [selectedModel, setSelectedModel] = useState('wan-2.2')
  const [resolution, setResolution] = useState('1080p')
  const [duration, setDuration] = useState(15)
  const [fps, setFps] = useState(24)
  const [steps, setSteps] = useState(30)
  const [cfgScale, setCfgScale] = useState(7.5)
  const [promptText, setPromptText] = useState(mockPrompt)

  const statusIcon = (status: PipelineStep['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle2 className="h-5 w-5 text-emerald-400" />
      case 'running':
        return (
          <div className="relative">
            <Loader2 className="h-5 w-5 text-blue-400 animate-spin" />
            <div className="absolute inset-0 h-5 w-5 rounded-full animate-ping bg-blue-400/20" />
          </div>
        )
      case 'pending':
        return <Circle className="h-5 w-5 text-zinc-600" />
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
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-zinc-100">Content Pipeline</h1>
            <p className="mt-0.5 text-sm text-zinc-400">
              Step-by-step content generation pipeline from research to final video.
            </p>
          </div>
          <div className="flex gap-2">
            <button className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700">
              <SkipForward className="h-4 w-4" />
              Skip Stage
            </button>
            <button className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-blue-500">
              <Play className="h-4 w-4" />
              Run Pipeline
            </button>
          </div>
        </div>

        {/* ── Tab Navigation ──────────────────────────────────── */}
        <div className="flex gap-1 overflow-x-auto border-b border-zinc-800 pb-px">
          {tabs.map((tab) => {
            const isActive = tab.value === 'pipeline'
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

        {/* ── Main Content ────────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          {/* ── Left: Vertical Stepper (2/5) ───────────────────── */}
          <div className="lg:col-span-2 space-y-0">
            {pipelineSteps.map((step, i) => {
              const isLast = i === pipelineSteps.length - 1

              return (
                <div key={step.stage} className="relative flex gap-4">
                  {/* Vertical line */}
                  {!isLast && (
                    <div className="absolute left-[9px] top-10 bottom-0 w-px bg-zinc-800" />
                  )}

                  {/* Status icon */}
                  <div className="relative z-10 mt-1 shrink-0">
                    {statusIcon(step.status)}
                  </div>

                  {/* Stage content */}
                  <div
                    className={`flex-1 mb-4 rounded-xl border p-4 transition ${
                      step.status === 'running'
                        ? 'border-blue-800 bg-blue-950/30'
                        : step.status === 'completed'
                        ? 'border-zinc-800 bg-zinc-900'
                        : 'border-zinc-800/50 bg-zinc-900/50'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <step.icon className={`h-4 w-4 ${step.status === 'pending' ? 'text-zinc-600' : 'text-zinc-400'}`} />
                      <h3 className={`text-sm font-semibold ${step.status === 'pending' ? 'text-zinc-500' : 'text-zinc-100'}`}>
                        {step.label}
                      </h3>
                      {step.status === 'running' && (
                        <span className="ml-auto rounded-full bg-blue-900/60 px-2 py-0.5 text-xs font-medium text-blue-300">
                          In Progress
                        </span>
                      )}
                    </div>
                    <p className={`mt-1 text-xs ${step.status === 'pending' ? 'text-zinc-600' : 'text-zinc-400'}`}>
                      {step.description}
                    </p>

                    {/* Input / Output */}
                    {step.inputPreview && (
                      <div className="mt-3 space-y-1.5">
                        <div className="flex items-start gap-2">
                          <span className="text-[10px] font-medium uppercase text-zinc-500 mt-0.5 w-10 shrink-0">In</span>
                          <span className="text-xs text-zinc-400">{step.inputPreview}</span>
                        </div>
                        {step.outputPreview && (
                          <div className="flex items-start gap-2">
                            <span className="text-[10px] font-medium uppercase text-emerald-500 mt-0.5 w-10 shrink-0">Out</span>
                            <span className="text-xs text-zinc-300">{step.outputPreview}</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Right: Live Output + Config (3/5) ──────────────── */}
          <div className="lg:col-span-3 space-y-5">
            {/* Live Logs */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
                  <FileText className="h-4 w-4 text-zinc-400" />
                  Live Output
                </h3>
                <span className="inline-flex items-center gap-1.5 text-xs text-blue-400">
                  <Loader2 className="h-3 w-3 animate-spin" />
                  Generating prompts...
                </span>
              </div>
              <div className="rounded-lg bg-zinc-950 border border-zinc-800 p-3 h-52 overflow-y-auto font-mono text-xs">
                {mockLogs.map((line, i) => (
                  <div key={i} className="py-0.5">
                    <span className="text-zinc-600">{line.slice(0, 11)}</span>
                    <span className="text-zinc-300">{line.slice(11)}</span>
                  </div>
                ))}
                <div className="py-0.5">
                  <span className="inline-block w-1.5 h-3.5 bg-blue-400 animate-pulse" />
                </div>
              </div>
            </div>

            {/* Video Prompt Preview */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-purple-400" />
                Video Prompt Preview
              </h3>
              <textarea
                value={promptText}
                onChange={(e) => setPromptText(e.target.value)}
                rows={5}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-blue-500 resize-none"
              />
              <p className="mt-1.5 text-xs text-zinc-500">{promptText.length} characters</p>
            </div>

            {/* Generation Settings */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900 p-5">
              <h3 className="text-sm font-semibold text-zinc-100 mb-4 flex items-center gap-2">
                <Settings2 className="h-4 w-4 text-zinc-400" />
                Generation Settings
              </h3>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                {/* Model Selection */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Model</label>
                  <div className="relative">
                    <select
                      value={selectedModel}
                      onChange={(e) => setSelectedModel(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 pr-8 text-sm text-zinc-200 outline-none focus:border-blue-500"
                    >
                      {modelOptions.map((m) => (
                        <option key={m.value} value={m.value}>{m.label}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* Resolution */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Resolution</label>
                  <div className="relative">
                    <select
                      value={resolution}
                      onChange={(e) => setResolution(e.target.value)}
                      className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 pr-8 text-sm text-zinc-200 outline-none focus:border-blue-500"
                    >
                      {resolutionOptions.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* Duration */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">Duration (seconds)</label>
                  <div className="relative">
                    <select
                      value={duration}
                      onChange={(e) => setDuration(Number(e.target.value))}
                      className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 pr-8 text-sm text-zinc-200 outline-none focus:border-blue-500"
                    >
                      {durationOptions.map((d) => (
                        <option key={d} value={d}>{d}s</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* FPS */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">FPS</label>
                  <div className="relative">
                    <select
                      value={fps}
                      onChange={(e) => setFps(Number(e.target.value))}
                      className="w-full appearance-none rounded-lg border border-zinc-700 bg-zinc-800 px-3 py-2 pr-8 text-sm text-zinc-200 outline-none focus:border-blue-500"
                    >
                      {fpsOptions.map((f) => (
                        <option key={f} value={f}>{f} fps</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                </div>

                {/* Steps */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    Steps: <span className="text-zinc-200">{steps}</span>
                  </label>
                  <input
                    type="range"
                    min={10}
                    max={100}
                    value={steps}
                    onChange={(e) => setSteps(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-0.5">
                    <span>10</span>
                    <span>50</span>
                    <span>100</span>
                  </div>
                </div>

                {/* CFG Scale */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5">
                    CFG Scale: <span className="text-zinc-200">{cfgScale.toFixed(1)}</span>
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={20}
                    step={0.5}
                    value={cfgScale}
                    onChange={(e) => setCfgScale(Number(e.target.value))}
                    className="w-full accent-blue-500"
                  />
                  <div className="flex justify-between text-[10px] text-zinc-600 mt-0.5">
                    <span>1</span>
                    <span>10</span>
                    <span>20</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </AppShell>
  )
}
