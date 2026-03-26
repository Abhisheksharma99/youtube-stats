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

function buildWanWorkflow(prompt: string, resolution: string = '832x480', steps: number = 25): Record<string, unknown> {
  const [width, height] = resolution.split('x').map(Number)
  return {
    // Load Wan UNet (GGUF quantized for consumer GPUs)
    "1": {
      "class_type": "UnetLoaderGGUF",
      "inputs": { "unet_name": "wan2.1_t2v_14B_Q4_K_M.gguf" }
    },
    // Load T5-XXL text encoder
    "2": {
      "class_type": "CLIPLoader",
      "inputs": {
        "clip_name": "t5xxl_fp8_e4m3fn.safetensors",
        "type": "wan"
      }
    },
    // Positive prompt
    "3": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": prompt,
        "clip": ["2", 0]
      }
    },
    // Negative prompt
    "4": {
      "class_type": "CLIPTextEncode",
      "inputs": {
        "text": "blurry, low quality, distorted, watermark, text, deformed",
        "clip": ["2", 0]
      }
    },
    // Empty latent video
    "5": {
      "class_type": "EmptyWanLatentVideo",
      "inputs": {
        "width": width || 832,
        "height": height || 480,
        "length": 81,
        "batch_size": 1
      }
    },
    // KSampler
    "6": {
      "class_type": "KSampler",
      "inputs": {
        "seed": Math.floor(Math.random() * 2147483647),
        "steps": steps,
        "cfg": 6.0,
        "sampler_name": "euler",
        "scheduler": "normal",
        "denoise": 1.0,
        "model": ["1", 0],
        "positive": ["3", 0],
        "negative": ["4", 0],
        "latent_image": ["5", 0]
      }
    },
    // Load VAE
    "7": {
      "class_type": "VAELoader",
      "inputs": { "vae_name": "wan_2.1_vae.safetensors" }
    },
    // Decode latent to frames
    "8": {
      "class_type": "VAEDecode",
      "inputs": {
        "samples": ["6", 0],
        "vae": ["7", 0]
      }
    },
    // Save as animated WEBP (compatible with ComfyUI core)
    "9": {
      "class_type": "SaveAnimatedWEBP",
      "inputs": {
        "filename_prefix": "contentforge",
        "fps": 16,
        "lossless": false,
        "quality": 85,
        "method": "default",
        "images": ["8", 0]
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
    const resolution = media.resolution || '832x480'
    const steps = 25
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
            type OutputFile = { filename: string; subfolder: string; type: string }
            type NodeOutput = { videos?: OutputFile[]; images?: OutputFile[] }
            const history = await historyRes.json() as Record<string, { outputs?: Record<string, NodeOutput> }>
            const outputs = history[prompt_id]?.outputs

            if (outputs) {
              // Find video/animated output (SaveAnimatedWEBP uses 'images', VHS uses 'videos')
              for (const nodeOutput of Object.values(outputs)) {
                const files = nodeOutput.videos || nodeOutput.images
                if (files && files.length > 0) {
                  const video = files[0]
                  const videoUrl = `${baseUrl}/view?filename=${video.filename}&subfolder=${video.subfolder}&type=${video.type}`

                  // Download video
                  await fs.mkdir(GENERATED_DIR, { recursive: true })
                  const ext = path.extname(video.filename) || '.webp'
                  const filePath = path.join(GENERATED_DIR, `${mediaId}${ext}`)
                  const videoRes = await fetch(videoUrl)
                  const buffer = Buffer.from(await videoRes.arrayBuffer())
                  await fs.writeFile(filePath, buffer)

                  await prisma.generatedMedia.update({
                    where: { id: mediaId },
                    data: {
                      status: 'completed',
                      progress: 100,
                      filePath: `/generated/${mediaId}${ext}`,
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
