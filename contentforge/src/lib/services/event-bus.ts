import { EventEmitter } from 'events'

export type PipelineEvent = {
  type: 'stage_start' | 'stage_progress' | 'stage_complete' | 'stage_error' | 'pipeline_complete' | 'log'
  stage?: string
  progress?: number
  message: string
  data?: unknown
  timestamp: string
}

class PipelineEventBus extends EventEmitter {
  private static instance: PipelineEventBus

  private constructor() {
    super()
    this.setMaxListeners(50)
  }

  static getInstance(): PipelineEventBus {
    if (!PipelineEventBus.instance) {
      PipelineEventBus.instance = new PipelineEventBus()
    }
    return PipelineEventBus.instance
  }

  emitPipelineEvent(runId: string, event: PipelineEvent): void {
    this.emit(runId, event)
  }

  onPipelineEvent(runId: string, handler: (event: PipelineEvent) => void): void {
    this.on(runId, handler)
  }

  offPipelineEvent(runId: string, handler: (event: PipelineEvent) => void): void {
    this.off(runId, handler)
  }

  cleanupRun(runId: string): void {
    this.removeAllListeners(runId)
  }
}

export const eventBus = PipelineEventBus.getInstance()
