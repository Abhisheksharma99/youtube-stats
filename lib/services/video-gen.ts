import Replicate from 'replicate'
import { prisma } from './db'
import { getApiKey } from './settings'
import { eventBus } from './event-bus'
import fs from 'fs/promises'
import path from 'path'

const GENERATED_DIR = path.join(process.cwd(), 'generated')

async function ensureDir() {
  await fs.mkdir(GENERATED_DIR, { recursive: true })
}

export async function generateVideo(mediaId: string, pipelineRunId?: string): Promise<void> {
  const media = await prisma.generatedMedia.findUnique({ where: { id: mediaId } })
  if (!media) throw new Error(`Media ${mediaId} not found`)

  await prisma.generatedMedia.update({
    where: { id: mediaId },
    data: { status: 'generating', progress: 0 },
  })

  const emitProgress = (message: string, progress?: number) => {
    if (pipelineRunId) {
      eventBus.emit(pipelineRunId, {
        type: 'stage_progress',
        stage: 'generate',
        progress,
        message,
        timestamp: new Date().toISOString(),
      })
    }
  }

  try {
    const apiToken = await getApiKey('replicateApiToken')
    const replicate = new Replicate({ auth: apiToken })

    emitProgress('Submitting video generation request...', 10)

    // Use Wan 2.1 on Replicate (most accessible open-source video model)
    const modelId = media.modelUsed === 'wan-2.2-14b' || media.modelUsed === 'wan-2.2-1.3b'
      ? 'wan-video/wan2.1-t2v-14b' as `${string}/${string}`
      : 'wan-video/wan2.1-t2v-14b' as `${string}/${string}`

    const input: Record<string, unknown> = {
      prompt: media.prompt,
      num_frames: 81,
      fps: 16,
      width: 1280,
      height: 720,
    }

    // Parse resolution from media record
    if (media.resolution) {
      const [w, h] = media.resolution.split('x').map(Number)
      if (w && h) {
        input.width = w
        input.height = h
      }
    }

    emitProgress('Generating video with AI model...', 20)

    const output = await replicate.run(modelId, { input })

    emitProgress('Downloading generated video...', 80)

    // Output is typically a URL or array of URLs
    const videoUrl = Array.isArray(output) ? output[0] : output

    if (typeof videoUrl === 'string' || videoUrl instanceof URL) {
      await ensureDir()
      const filePath = path.join(GENERATED_DIR, `${mediaId}.mp4`)

      const response = await fetch(videoUrl.toString())
      const buffer = Buffer.from(await response.arrayBuffer())
      await fs.writeFile(filePath, buffer)

      await prisma.generatedMedia.update({
        where: { id: mediaId },
        data: {
          status: 'completed',
          progress: 100,
          filePath: `/generated/${mediaId}.mp4`,
          metadata: JSON.stringify({
            model: modelId,
            generatedAt: new Date().toISOString(),
            fileSize: buffer.length,
          }),
        },
      })

      emitProgress('Video generation complete!', 100)
    } else {
      throw new Error('Unexpected output format from Replicate')
    }
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
