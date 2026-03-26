import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const job = await prisma.crawlJob.findUnique({ where: { id } });

    if (!job) {
      return NextResponse.json({ error: 'Crawl job not found' }, { status: 404 });
    }

    return NextResponse.json(job);
  } catch (error) {
    console.error('Failed to fetch crawl job:', error);
    return NextResponse.json({ error: 'Failed to fetch crawl job' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { status, rawContent, cleanedContent, metadata } = body;

    const data: Record<string, unknown> = {};
    if (status !== undefined) data.status = status;
    if (rawContent !== undefined) data.rawContent = rawContent;
    if (cleanedContent !== undefined) data.cleanedContent = cleanedContent;
    if (metadata !== undefined) data.metadata = typeof metadata === 'string' ? metadata : JSON.stringify(metadata);

    const job = await prisma.crawlJob.update({
      where: { id },
      data,
    });

    return NextResponse.json(job);
  } catch (error) {
    console.error('Failed to update crawl job:', error);
    return NextResponse.json({ error: 'Failed to update crawl job' }, { status: 500 });
  }
}
