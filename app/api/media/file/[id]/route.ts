import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/services/db'
import fs from 'fs'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const media = await prisma.generatedMedia.findUnique({ where: { id } })

    if (!media || !media.filePath) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 })
    }

    const filePath = path.join(process.cwd(), media.filePath)

    if (!fs.existsSync(filePath)) {
      return NextResponse.json({ error: 'File not found on disk' }, { status: 404 })
    }

    const stat = fs.statSync(filePath)

    // Determine content type
    const ext = path.extname(filePath).toLowerCase()
    const contentType = ext === '.mp4' ? 'video/mp4'
      : ext === '.webm' ? 'video/webm'
      : ext === '.png' ? 'image/png'
      : ext === '.jpg' || ext === '.jpeg' ? 'image/jpeg'
      : 'application/octet-stream'

    const buffer = fs.readFileSync(filePath)
    return new Response(buffer, {
      headers: {
        'Content-Type': contentType,
        'Content-Length': stat.size.toString(),
        'Content-Disposition': `inline; filename="${id}${ext}"`,
        'Cache-Control': 'public, max-age=31536000',
      },
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500 })
  }
}
