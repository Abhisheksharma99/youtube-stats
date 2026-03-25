import { create } from 'zustand'
import type { PipelineStage, PipelineRun } from '@/lib/types'

interface PipelineState {
  currentStage: PipelineStage
  stageProgress: number
  pipelineRuns: PipelineRun[]
  isRunning: boolean
  logs: string[]
}

interface PipelineActions {
  startPipeline: (projectId: string) => void
  advanceStage: () => void
  updateProgress: (progress: number) => void
  addLog: (message: string) => void
  resetPipeline: () => void
}

const STAGE_ORDER: PipelineStage[] = [
  'research',
  'outline',
  'script',
  'prompt',
  'generate',
  'upscale',
]

const initialState: PipelineState = {
  currentStage: 'research',
  stageProgress: 0,
  pipelineRuns: [],
  isRunning: false,
  logs: [],
}

export const usePipelineStore = create<PipelineState & PipelineActions>()((set, get) => ({
  ...initialState,

  startPipeline: (projectId) => {
    const now = new Date()
    const run: PipelineRun = {
      id: crypto.randomUUID(),
      projectId,
      stage: 'research',
      status: 'running',
      input: {},
      output: {},
      logs: '',
      startedAt: now,
      completedAt: null,
    }
    set((state) => ({
      currentStage: 'research',
      stageProgress: 0,
      isRunning: true,
      pipelineRuns: [...state.pipelineRuns, run],
      logs: [...state.logs, `[${now.toISOString()}] Pipeline started for project ${projectId}`],
    }))
  },

  advanceStage: () => {
    const { currentStage, isRunning } = get()
    if (!isRunning) return

    const currentIndex = STAGE_ORDER.indexOf(currentStage)
    const now = new Date().toISOString()

    if (currentIndex >= STAGE_ORDER.length - 1) {
      // Final stage completed
      set((state) => ({
        stageProgress: 100,
        isRunning: false,
        logs: [...state.logs, `[${now}] Pipeline completed`],
      }))
      return
    }

    const nextStage = STAGE_ORDER[currentIndex + 1]
    set((state) => ({
      currentStage: nextStage,
      stageProgress: 0,
      logs: [...state.logs, `[${now}] Advanced to stage: ${nextStage}`],
    }))
  },

  updateProgress: (progress) => {
    const clamped = Math.max(0, Math.min(100, progress))
    set({ stageProgress: clamped })
  },

  addLog: (message) =>
    set((state) => ({
      logs: [...state.logs, `[${new Date().toISOString()}] ${message}`],
    })),

  resetPipeline: () =>
    set({
      currentStage: 'research',
      stageProgress: 0,
      isRunning: false,
      logs: [],
    }),
}))
