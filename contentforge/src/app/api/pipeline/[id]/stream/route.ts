/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';

import { NextRequest } from 'next/server';
import { eventBus } from '@/lib/services/event-bus';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();

      const send = (event: string, data: unknown) => {
        controller.enqueue(encoder.encode(`event: ${event}\ndata: ${JSON.stringify(data)}\n\n`));
      };

      // Send initial connection event
      send('connected', { runId: id });

      const onProgress = (payload: { runId: string; stage: string; progress: number; message?: string }) => {
        if (payload.runId === id) {
          send('progress', payload);
        }
      };

      const onStageChange = (payload: { runId: string; stage: string; status: string }) => {
        if (payload.runId === id) {
          send('stage', payload);
        }
      };

      const onComplete = (payload: { runId: string; status: string; output?: unknown }) => {
        if (payload.runId === id) {
          send('complete', payload);
          cleanup();
          controller.close();
        }
      };

      const onError = (payload: { runId: string; error: string }) => {
        if (payload.runId === id) {
          send('error', payload);
          cleanup();
          controller.close();
        }
      };

      const cleanup = () => {
        eventBus.off('pipeline:progress', onProgress);
        eventBus.off('pipeline:stage', onStageChange);
        eventBus.off('pipeline:complete', onComplete);
        eventBus.off('pipeline:error', onError);
      };

      eventBus.on('pipeline:progress', onProgress);
      eventBus.on('pipeline:stage', onStageChange);
      eventBus.on('pipeline:complete', onComplete);
      eventBus.on('pipeline:error', onError);

      // Clean up if client disconnects
      _request.signal.addEventListener('abort', () => {
        cleanup();
        try { controller.close(); } catch { /* already closed */ }
      });
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}
