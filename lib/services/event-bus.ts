import { EventEmitter } from 'events'

export type PipelineEvent = {
  type: 'stage_start' | 'stage_progress' | 'stage_complete' | 'stage_error' | 'pipeline_complete' | 'log'
  stage?: string
  progress?: number
  message: string
  data?: unknown
  timestamp: string
}

class PipelineEventBus {
  private emitter: EventEmitter

  constructor() {
    this.emitter = new EventEmitter()
    this.emitter.setMaxListeners(100)
  }

  emit(runId: string, event: PipelineEvent): void {
    this.emitter.emit(`pipeline:${runId}`, event)
  }

  subscribe(runId: string, callback: (event: PipelineEvent) => void): () => void {
    const eventName = `pipeline:${runId}`
    this.emitter.on(eventName, callback)
    return () => {
      this.emitter.off(eventName, callback)
    }
  }
}

// Singleton
const globalForEventBus = globalThis as unknown as { eventBus: PipelineEventBus }
export const eventBus = globalForEventBus.eventBus ?? new PipelineEventBus()
if (process.env.NODE_ENV !== 'production') globalForEventBus.eventBus = eventBus
