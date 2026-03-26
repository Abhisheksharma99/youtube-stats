import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';
import { uploadToYouTube } from '@/lib/services/youtube-upload';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.publishJob.findUnique({
      where: { id },
      include: { media: true },
    });

    if (!job) {
      return NextResponse.json({ error: 'Publish job not found' }, { status: 404 });
    }

    if (job.status === 'published') {
      return NextResponse.json({ error: 'Job is already published' }, { status: 400 });
    }

    // Update status to uploading
    await prisma.publishJob.update({
      where: { id },
      data: { status: 'uploading' },
    });

    // Fire-and-forget YouTube upload
    uploadToYouTube(id).catch((err) =>
      console.error(`YouTube upload failed for job ${id}:`, err)
    );

    return NextResponse.json({ message: 'Upload started', jobId: id });
  } catch (error) {
    console.error('Failed to trigger publish execution:', error);
    return NextResponse.json({ error: 'Failed to trigger publish execution' }, { status: 500 });
  }
}
