export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';
import { executeCrawl } from '@/lib/services/crawl';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId query param is required' }, { status: 400 });
    }

    const jobs = await prisma.crawlJob.findMany({
      where: { projectId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json(jobs);
  } catch (error) {
    console.error('Failed to fetch crawl jobs:', error);
    return NextResponse.json({ error: 'Failed to fetch crawl jobs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, queries } = body;

    if (!projectId || !queries || !Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json(
        { error: 'projectId and queries (array) are required' },
        { status: 400 }
      );
    }

    const jobs = await Promise.all(
      queries.map((q: { query: string; sourceUrl?: string }) =>
        prisma.crawlJob.create({
          data: {
            projectId,
            query: q.query,
            sourceUrl: q.sourceUrl ?? '',
          },
        })
      )
    );

    // Fire-and-forget crawl execution
    for (const job of jobs) {
      executeCrawl(job.id).catch((err) =>
        console.error(`Crawl execution failed for job ${job.id}:`, err)
      );
    }

    return NextResponse.json(jobs, { status: 201 });
  } catch (error) {
    console.error('Failed to create crawl jobs:', error);
    return NextResponse.json({ error: 'Failed to create crawl jobs' }, { status: 500 });
  }
}
