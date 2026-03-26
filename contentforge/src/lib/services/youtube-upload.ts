import { google } from 'googleapis'
import fs from 'fs'
import path from 'path'
import { prisma } from './db'
import { getSetting } from './settings'
import { eventBus } from './event-bus'

const GENERATED_DIR = path.join(process.cwd(), 'generated')

async function getOAuth2Client() {
  const clientId = await getSetting('youtubeClientId')
  const clientSecret = await getSetting('youtubeClientSecret')
  const refreshToken = await getSetting('youtubeRefreshToken')

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error(
      'YouTube OAuth credentials not configured. Please set youtubeClientId, youtubeClientSecret, and youtubeRefreshToken in Settings.'
    )
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3000/api/auth/youtube/callback'
  )

  oauth2Client.setCredentials({
    refresh_token: refreshToken,
  })

  // Refresh the access token
  const { credentials } = await oauth2Client.refreshAccessToken()
  oauth2Client.setCredentials(credentials)

  // Store the new access token
  if (credentials.access_token) {
    await import('./settings').then(({ setSetting }) =>
      setSetting('youtubeAccessToken', credentials.access_token!)
    )
  }

  return oauth2Client
}

export async function uploadToYouTube(
  publishJobId: string,
  pipelineRunId?: string
): Promise<{ videoId: string; url: string }> {
  const publishJob = await prisma.publishJob.findUnique({
    where: { id: publishJobId },
    include: { media: true, project: true },
  })

  if (!publishJob) throw new Error(`Publish job ${publishJobId} not found`)
  if (!publishJob.media.filePath) throw new Error('No video file associated with this publish job')

  const emitProgress = (message: string, progress?: number) => {
    if (pipelineRunId) {
      eventBus.emit(pipelineRunId, {
        type: 'stage_progress',
        stage: 'publish',
        progress,
        message,
        timestamp: new Date().toISOString(),
      })
    }
  }

  await prisma.publishJob.update({
    where: { id: publishJobId },
    data: { status: 'publishing' },
  })

  try {
    emitProgress('Authenticating with YouTube...', 10)
    const auth = await getOAuth2Client()
    const youtube = google.youtube({ version: 'v3', auth })

    // Resolve the video file path
    const videoPath = publishJob.media.filePath.startsWith('/')
      ? path.join(process.cwd(), publishJob.media.filePath)
      : path.join(GENERATED_DIR, path.basename(publishJob.media.filePath))

    if (!fs.existsSync(videoPath)) {
      throw new Error(`Video file not found: ${videoPath}`)
    }

    const hashtags = (() => {
      try {
        return JSON.parse(publishJob.hashtags) as string[]
      } catch {
        return []
      }
    })()

    const description = [
      publishJob.caption,
      '',
      hashtags.map((tag: string) => (tag.startsWith('#') ? tag : `#${tag}`)).join(' '),
    ]
      .filter(Boolean)
      .join('\n')

    // Determine visibility
    const metadata = (() => {
      try {
        return JSON.parse(publishJob.metadata) as Record<string, unknown>
      } catch {
        return {}
      }
    })()
    const visibility = (metadata.visibility as string) || 'private'

    emitProgress('Uploading video to YouTube...', 30)

    const fileSize = fs.statSync(videoPath).size
    const fileStream = fs.createReadStream(videoPath)

    const response = await youtube.videos.insert(
      {
        part: ['snippet', 'status'],
        requestBody: {
          snippet: {
            title: publishJob.project.name,
            description,
            tags: hashtags.map((tag: string) => tag.replace(/^#/, '')),
            categoryId: '22', // People & Blogs
          },
          status: {
            privacyStatus: visibility,
            selfDeclaredMadeForKids: false,
          },
        },
        media: {
          body: fileStream,
        },
      },
      {
        onUploadProgress: (evt: { bytesRead: number }) => {
          const progress = Math.round((evt.bytesRead / fileSize) * 60) + 30
          emitProgress(`Uploading: ${Math.round((evt.bytesRead / fileSize) * 100)}%`, progress)
        },
      }
    )

    const videoId = response.data.id
    if (!videoId) throw new Error('YouTube upload succeeded but no video ID returned')

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`

    await prisma.publishJob.update({
      where: { id: publishJobId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        publishedUrl: videoUrl,
        platformPostId: videoId,
        metadata: JSON.stringify({
          ...metadata,
          uploadedAt: new Date().toISOString(),
          fileSize,
        }),
      },
    })

    emitProgress(`Video published: ${videoUrl}`, 100)
    return { videoId, url: videoUrl }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    await prisma.publishJob.update({
      where: { id: publishJobId },
      data: {
        status: 'failed',
        metadata: JSON.stringify({ error: message, failedAt: new Date().toISOString() }),
      },
    })
    emitProgress(`YouTube upload failed: ${message}`)
    throw error
  }
}

export async function getYouTubeAuthUrl(): Promise<string> {
  const clientId = await getSetting('youtubeClientId')
  const clientSecret = await getSetting('youtubeClientSecret')

  if (!clientId || !clientSecret) {
    throw new Error('YouTube OAuth client ID and secret must be configured first.')
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3000/api/auth/youtube/callback'
  )

  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube.readonly',
    ],
    prompt: 'consent',
  })
}

export async function exchangeYouTubeCode(code: string): Promise<void> {
  const clientId = await getSetting('youtubeClientId')
  const clientSecret = await getSetting('youtubeClientSecret')

  if (!clientId || !clientSecret) {
    throw new Error('YouTube OAuth client ID and secret must be configured first.')
  }

  const oauth2Client = new google.auth.OAuth2(
    clientId,
    clientSecret,
    'http://localhost:3000/api/auth/youtube/callback'
  )

  const { tokens } = await oauth2Client.getToken(code)

  const { setSetting } = await import('./settings')

  if (tokens.refresh_token) {
    await setSetting('youtubeRefreshToken', tokens.refresh_token)
  }
  if (tokens.access_token) {
    await setSetting('youtubeAccessToken', tokens.access_token)
  }
}
