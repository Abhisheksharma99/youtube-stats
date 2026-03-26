import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/services/db'
import { uploadToYouTube } from '@/lib/services/youtube-upload'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const job = await prisma.publishJob.findUnique({ where: { id } })
    if (!job) {
      return NextResponse.json({ error: 'Publish job not found' }, { status: 404 })
    }
    if (job.status === 'publishing') {
      return NextResponse.json({ error: 'Already publishing' }, { status: 409 })
    }
    if (job.status === 'published') {
      return NextResponse.json({ error: 'Already published' }, { status: 409 })
    }

    // Route to platform-specific upload
    switch (job.platform) {
      case 'youtube':
        void uploadToYouTube(id).catch((err) => {
          console.error(`YouTube upload ${id} failed:`, err)
        })
        break
      default:
        return NextResponse.json(
          { error: `Publishing to ${job.platform} is not yet supported` },
          { status: 501 }
        )
    }

    return NextResponse.json({ message: 'Publishing started', id }, { status: 202 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start publishing' }, { status: 500 })
  }
}
