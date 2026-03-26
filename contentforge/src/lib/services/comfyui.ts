import { prisma } from './db'
import { getSetting } from './settings'
import { eventBus } from './event-bus'
import WebSocket from 'ws'
import fs from 'fs/promises'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'

const GENERATED_DIR = path.join(process.cwd(), 'generated')

async function getComfyUIUrl(): Promise<string> {
  const host = await getSetting('comfyuiHost') || 'localhost'
  const port = await getSetting('comfyuiPort') || '8188'
  return `http://${host}:${port}`
}

function buildWanWorkflow(prompt: string, resolution: string = '1280x720', steps: number = 30): Record<string, unknown> {
  const [width, height] = resolution.split('x').map(Number)
  return {
    "1": {
      "class_type": "WanVideoModelLoader",
      "inputs": { "model_name": "wan2.1_t2v_14B_fp16.safetensors" }
    },
    "2": {
      "class_type": "WanVideoTextEncode",
      "inputs": {
        "text": prompt,
        "model": ["1", 0]
      }
    },
    "3": {
      "class_type": "WanVideoSampler",
      "inputs": {
        "model": ["1", 0],
        "positive": ["2", 0],
        "width": width || 1280,
        "height": height || 720,
        "num_frames": 81,
        "steps": steps,
        "cfg": 6.0,
        "seed": Math.floor(Math.random() * 2147483647),
        "scheduler": "euler",
      }
    },
    "4": {
      "class_type": "WanVideoVAEDecode",
      "inputs": {
        "samples": ["3", 0],
        "model": ["1", 0]
      }
    },
    "5": {
      "class_type": "SaveVideo",
      "inputs": {
        "filename_prefix": "contentforge",
        "video": ["4", 0]
      }
    }
  }
}

export async function checkComfyUIStatus(): Promise<{ online: boolean; error?: string }> {
  try {
    const baseUrl = await getComfyUIUrl()
    const response = await fetch(`${baseUrl}/system_stats`, { signal: AbortSignal.timeout(5000) })
    if (response.ok) return { online: true }
    return { online: false, error: `HTTP ${response.status}` }
  } catch (error) {
    return { online: false, error: error instanceof Error ? error.message : 'Connection failed' }
  }
}

export async function generateVideoWithComfyUI(
  mediaId: string,
  pipelineRunId?: string
): Promise<void> {
  const media = await prisma.generatedMedia.findUnique({ where: { id: mediaId } })
  if (!media) throw new Error(`Media ${mediaId} not found`)

  await prisma.generatedMedia.update({
    where: { id: mediaId },
    data: { status: 'generating', progress: 0 },
  })

  const emitProgress = (message: string, progress?: number) => {
    if (pipelineRunId) {
      eventBus.emit(pipelineRunId, {
        type: 'stage_progress', stage: 'generate', progress, message,
        timestamp: new Date().toISOString(),
      })
    }
  }

  try {
    const baseUrl = await getComfyUIUrl()
    const clientId = uuidv4()

    // Build workflow
    const resolution = media.resolution || '1280x720'
    const steps = 30
    const workflow = buildWanWorkflow(media.prompt, resolution, steps)

    emitProgress('Submitting workflow to ComfyUI...', 5)

    // Queue the prompt
    const queueResponse = await fetch(`${baseUrl}/prompt`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: workflow,
        client_id: clientId,
      }),
    })

    if (!queueResponse.ok) {
      const errorText = await queueResponse.text()
      throw new Error(`ComfyUI queue failed: ${errorText}`)
    }

    const { prompt_id } = await queueResponse.json() as { prompt_id: string }
    emitProgress('Workflow queued, waiting for generation...', 10)

    // Connect WebSocket for progress
    const wsUrl = `ws://${(await getComfyUIUrl()).replace('http://', '')}/ws?clientId=${clientId}`

    await new Promise<void>((resolve, reject) => {
      const ws = new WebSocket(wsUrl)
      const timeout = setTimeout(() => {
        ws.close()
        reject(new Error('ComfyUI generation timed out (30 min)'))
      }, 30 * 60 * 1000)

      ws.on('message', async (data: Buffer) => {
        try {
          const msg = JSON.parse(data.toString())

          if (msg.type === 'progress') {
            const pct = Math.round((msg.data.value / msg.data.max) * 100)
            emitProgress(`Generating: ${pct}%`, 10 + Math.round(pct * 0.7))
            await prisma.generatedMedia.update({
              where: { id: mediaId },
              data: { progress: 10 + Math.round(pct * 0.7) },
            })
          }

          if (msg.type === 'executed' && msg.data?.prompt_id === prompt_id) {
            emitProgress('Generation complete, downloading output...', 85)

            // Get the output
            const historyRes = await fetch(`${baseUrl}/history/${prompt_id}`)
            const history = await historyRes.json() as Record<string, { outputs?: Record<string, { videos?: Array<{ filename: string; subfolder: string; type: string }> }> }>
            const outputs = history[prompt_id]?.outputs

            if (outputs) {
              // Find video output
              for (const nodeOutput of Object.values(outputs)) {
                if (nodeOutput.videos && nodeOutput.videos.length > 0) {
                  const video = nodeOutput.videos[0]
                  const videoUrl = `${baseUrl}/view?filename=${video.filename}&subfolder=${video.subfolder}&type=${video.type}`

                  // Download video
                  await fs.mkdir(GENERATED_DIR, { recursive: true })
                  const filePath = path.join(GENERATED_DIR, `${mediaId}.mp4`)
                  const videoRes = await fetch(videoUrl)
                  const buffer = Buffer.from(await videoRes.arrayBuffer())
                  await fs.writeFile(filePath, buffer)

                  await prisma.generatedMedia.update({
                    where: { id: mediaId },
                    data: {
                      status: 'completed',
                      progress: 100,
                      filePath: `/generated/${mediaId}.mp4`,
                      metadata: JSON.stringify({
                        comfyui_prompt_id: prompt_id,
                        generatedAt: new Date().toISOString(),
                        fileSize: buffer.length,
                      }),
                    },
                  })

                  emitProgress('Video saved successfully!', 100)
                  clearTimeout(timeout)
                  ws.close()
                  resolve()
                  return
                }
              }
            }

            throw new Error('No video output found in ComfyUI response')
          }

          if (msg.type === 'execution_error') {
            clearTimeout(timeout)
            ws.close()
            reject(new Error(`ComfyUI execution error: ${JSON.stringify(msg.data)}`))
          }
        } catch (err) {
          if (err instanceof Error && err.message.includes('ComfyUI')) {
            clearTimeout(timeout)
            ws.close()
            reject(err)
          }
        }
      })

      ws.on('error', (err) => {
        clearTimeout(timeout)
        reject(new Error(`WebSocket error: ${err.message}`))
      })
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    await prisma.generatedMedia.update({
      where: { id: mediaId },
      data: {
        status: 'failed',
        metadata: JSON.stringify({ error: message, failedAt: new Date().toISOString() }),
      },
    })
    emitProgress(`Video generation failed: ${message}`)
    throw error
  }
}
