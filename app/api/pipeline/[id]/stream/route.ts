import { NextRequest } from 'next/server'
import { eventBus } from '@/lib/services/event-bus'

export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  const encoder = new TextEncoder()

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(encoder.encode(`data: ${JSON.stringify({ type: 'connected', message: 'SSE connected', timestamp: new Date().toISOString() })}\n\n`))

      const unsubscribe = eventBus.subscribe(id, (event) => {
        try {
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(event)}\n\n`))

          // Close stream when pipeline completes or fails
          if (event.type === 'pipeline_complete' || (event.type === 'stage_error' && !event.stage)) {
            setTimeout(() => {
              unsubscribe()
              controller.close()
            }, 1000)
          }
        } catch {
          // Stream may have been closed by client
          unsubscribe()
        }
      })

      // Clean up on client disconnect
      request.signal.addEventListener('abort', () => {
        unsubscribe()
        try { controller.close() } catch {}
      })
    },
  })

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  })
}
