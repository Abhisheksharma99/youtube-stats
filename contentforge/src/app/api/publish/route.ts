export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId query param is required' }, { status: 400 });
    }

    const jobs = await prisma.publishJob.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
      include: { media: true },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Failed to fetch publish jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch publish jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, mediaId, platforms, caption, hashtags, scheduledAt } = body;

    if (!projectId || !mediaId || !platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: 'projectId, mediaId, and platforms (array) are required' },
        { status: 400 }
      );
    }

    const jobs = await Promise.all(
      platforms.map((platform: string) =>
        prisma.publishJob.create({
          data: {
            projectId,
            mediaId,
            platform,
            caption: caption ?? '',
            hashtags: hashtags ? JSON.stringify(hashtags) : '[]',
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          },
        })
      )
    );

    return NextResponse.json(jobs, { status: 201 });
  } catch (error) {
    console.error('Failed to create publish jobs:', error);
    return NextResponse.json({ error: 'Failed to create publish jobs' }, { status: 500 });
  }
}
