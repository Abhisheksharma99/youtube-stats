export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId query param is required' }, { status: 400 });
    }

    const page = parseInt(request.nextUrl.searchParams.get('page') ?? '1', 10);
    const limit = parseInt(request.nextUrl.searchParams.get('limit') ?? '20', 10);
    const skip = (page - 1) * limit;

    const [items, total] = await Promise.all([
      prisma.generatedMedia.findMany({
        where: { projectId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.generatedMedia.count({ where: { projectId } }),
    ]);

    return NextResponse.json({
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('Failed to fetch media:', error);
    return NextResponse.json({ error: 'Failed to fetch media' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, type, prompt, modelUsed, filePath, thumbnailPath, duration, resolution, status, metadata } = body;

    if (!projectId || !type) {
      return NextResponse.json({ error: 'projectId and type are required' }, { status: 400 });
    }

    const media = await prisma.generatedMedia.create({
      data: {
        projectId,
        type,
        prompt: prompt ?? '',
        modelUsed: modelUsed ?? '',
        filePath: filePath ?? '',
        thumbnailPath: thumbnailPath ?? '',
        duration: duration ?? null,
        resolution: resolution ?? '',
        status: status ?? 'queued',
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : '{}',
      },
    });

    return NextResponse.json(media, { status: 201 });
  } catch (error) {
    console.error('Failed to create media:', error);
    return NextResponse.json({ error: 'Failed to create media' }, { status: 500 });
  }
}
