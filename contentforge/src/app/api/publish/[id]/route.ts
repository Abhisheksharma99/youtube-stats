export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(
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

    return NextResponse.json(job);
  } catch (error) {
    console.error('Failed to fetch publish job:', error);
    return NextResponse.json({ error: 'Failed to fetch publish job' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, caption, hashtags, scheduledAt, publishedAt, publishedUrl, platformPostId, metadata } = body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (caption !== undefined) data.caption = caption;
    if (hashtags !== undefined) data.hashtags = JSON.stringify(hashtags);
    if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;
    if (publishedAt !== undefined) data.publishedAt = publishedAt ? new Date(publishedAt) : null;
    if (publishedUrl !== undefined) data.publishedUrl = publishedUrl;
    if (platformPostId !== undefined) data.platformPostId = platformPostId;
    if (metadata !== undefined) data.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

    const job = await prisma.publishJob.update({
      where: { id },
      data,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Failed to update publish job:', error);
    return NextResponse.json({ error: 'Failed to update publish job' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const job = await prisma.publishJob.findUnique({ where: { id } });
    if (!job) {
      return NextResponse.json({ error: 'Publish job not found' }, { status: 404 });
    }

    if (job.status === 'published') {
      return NextResponse.json({ error: 'Cannot cancel an already published job' }, { status: 400 });
    }

    const updated = await prisma.publishJob.update({
      where: { id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('Failed to cancel publish job:', error);
    return NextResponse.json({ error: 'Failed to cancel publish job' }, { status: 500 });
  }
}
