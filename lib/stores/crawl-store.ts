import { create } from 'zustand'
import type { CrawlJob, CrawlConfig } from '@/lib/types'

interface CrawlState {
  crawlJobs: CrawlJob[]
  activeCrawls: Map<string, CrawlJob>
  crawlConfig: CrawlConfig
}

interface CrawlActions {
  setCrawlConfig: (config: Partial<CrawlConfig>) => void
  addQuery: (query: string) => void
  removeQuery: (query: string) => void
  startCrawl: (projectId: string) => Promise<CrawlJob | null>
  updateCrawlStatus: (jobId: string, updates: Partial<CrawlJob>) => void
  getCrawlsByProject: (projectId: string) => CrawlJob[]
}

const defaultCrawlConfig: CrawlConfig = {
  queries: [],
  maxPages: 10,
  sources: [],
}

export const useCrawlStore = create<CrawlState & CrawlActions>()((set, get) => ({
  crawlJobs: [],
  activeCrawls: new Map(),
  crawlConfig: { ...defaultCrawlConfig },

  setCrawlConfig: (config) =>
    set((state) => ({
      crawlConfig: { ...state.crawlConfig, ...config },
    })),

  addQuery: (query) =>
    set((state) => {
      if (state.crawlConfig.queries.includes(query)) return state
      return {
        crawlConfig: {
          ...state.crawlConfig,
          queries: [...state.crawlConfig.queries, query],
        },
      }
    }),

  removeQuery: (query) =>
    set((state) => ({
      crawlConfig: {
        ...state.crawlConfig,
        queries: state.crawlConfig.queries.filter((q) => q !== query),
      },
    })),

  startCrawl: async (projectId) => {
    const { crawlConfig } = get()
    try {
      const res = await fetch('/api/crawl', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ projectId, config: crawlConfig }),
      })
      if (!res.ok) {
        throw new Error(`Failed to start crawl: ${res.statusText}`)
      }
      const job: CrawlJob = await res.json()
      set((state) => {
        const newActiveCrawls = new Map(state.activeCrawls)
        newActiveCrawls.set(job.id, job)
        return {
          crawlJobs: [...state.crawlJobs, job],
          activeCrawls: newActiveCrawls,
        }
      })
      return job
    } catch {
      return null
    }
  },

  updateCrawlStatus: (jobId, updates) =>
    set((state) => {
      const updatedJobs = state.crawlJobs.map((j) =>
        j.id === jobId ? { ...j, ...updates } : j
      )
      const newActiveCrawls = new Map(state.activeCrawls)
      const activeJob = newActiveCrawls.get(jobId)
      if (activeJob) {
        const updated = { ...activeJob, ...updates }
        if (updated.status === 'completed' || updated.status === 'failed') {
          newActiveCrawls.delete(jobId)
        } else {
          newActiveCrawls.set(jobId, updated)
        }
      }
      return { crawlJobs: updatedJobs, activeCrawls: newActiveCrawls }
    }),

  getCrawlsByProject: (projectId) =>
    get().crawlJobs.filter((j) => j.projectId === projectId),
}))
