import { google } from 'googleapis'
import { prisma } from './db'
import fs from 'fs'
import path from 'path'

export async function uploadToYouTube(publishJobId: string): Promise<void> {
  const job = await prisma.publishJob.findUnique({
    where: { id: publishJobId },
    include: { media: true },
  })
  if (!job) throw new Error(`PublishJob ${publishJobId} not found`)

  // Get YouTube account credentials
  const account = await prisma.socialAccount.findFirst({
    where: { platform: 'youtube' },
  })
  if (!account) throw new Error('No YouTube account connected')

  await prisma.publishJob.update({
    where: { id: publishJobId },
    data: { status: 'publishing' },
  })

  try {
    const oauth2Client = new google.auth.OAuth2()
    oauth2Client.setCredentials({
      access_token: account.accessToken,
      refresh_token: account.refreshToken,
    })

    const youtube = google.youtube({ version: 'v3', auth: oauth2Client })

    // Resolve video file path
    const filePath = job.media.filePath.startsWith('/')
      ? path.join(process.cwd(), job.media.filePath)
      : path.join(process.cwd(), job.media.filePath)

    const hashtags = JSON.parse(job.hashtags || '[]') as string[]
    const description = [
      job.caption,
      '',
      hashtags.map((h: string) => h.startsWith('#') ? h : `#${h}`).join(' '),
    ].filter(Boolean).join('\n')

    const response = await youtube.videos.insert({
      part: ['snippet', 'status'],
      requestBody: {
        snippet: {
          title: job.caption.substring(0, 100) || 'ContentForge Video',
          description,
          tags: hashtags.map((h: string) => h.replace('#', '')),
          categoryId: '22', // People & Blogs
        },
        status: {
          privacyStatus: job.scheduledAt ? 'private' : 'public',
          publishAt: job.scheduledAt?.toISOString(),
          selfDeclaredMadeForKids: false,
        },
      },
      media: {
        body: fs.createReadStream(filePath),
      },
    })

    await prisma.publishJob.update({
      where: { id: publishJobId },
      data: {
        status: 'published',
        publishedAt: new Date(),
        publishedUrl: `https://youtube.com/watch?v=${response.data.id}`,
        platformPostId: response.data.id || '',
      },
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    await prisma.publishJob.update({
      where: { id: publishJobId },
      data: {
        status: 'failed',
        metadata: JSON.stringify({ error: message, failedAt: new Date().toISOString() }),
      },
    })
    throw error
  }
}
