export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const media = await prisma.generatedMedia.findUnique({
      where: { id },
      include: { publishJobs: true },
    });

    if (!media) {
      return NextResponse.json({ error: 'Media not found' }, { status: 404 });
    }

    return NextResponse.json(media);
  } catch (error) {
    console.error('Failed to fetch media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { type, prompt, modelUsed, filePath, thumbnailPath, duration, resolution, status, progress, metadata } = body;

    const data: Record<string, unknown> = {};
    if (type !== undefined) data.type = type;
    if (prompt !== undefined) data.prompt = prompt;
    if (modelUsed !== undefined) data.modelUsed = modelUsed;
    if (filePath !== undefined) data.filePath = filePath;
    if (thumbnailPath !== undefined) data.thumbnailPath = thumbnailPath;
    if (duration !== undefined) data.duration = duration;
    if (resolution !== undefined) data.resolution = resolution;
    if (status !== undefined) data.status = status;
    if (progress !== undefined) data.progress = progress;
    if (metadata !== undefined) data.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

    const media = await prisma.generatedMedia.update({
      where: { id },
      data,
    });

    return NextResponse.json(media);
  } catch (error) {
    console.error('Failed to update media:', error);
    return NextResponse.json({ error: 'Failed to update media' }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await prisma.generatedMedia.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to delete media:', error);
    return NextResponse.json({ error: 'Failed to delete media' }, { status: 500 });
  }
}
