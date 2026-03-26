export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get('projectId');
    if (!projectId) {
      return NextResponse.json({ error: 'projectId query param is required' }, { status: 400 });
    }

    const runs = await prisma.pipelineRun.findMany({
      where: { projectId },
      orderBy: { startedAt: 'desc' },
    });

    return NextResponse.json(runs);
  } catch (error) {
    console.error('Failed to fetch pipeline runs:', error);
    return NextResponse.json({ error: 'Failed to fetch pipeline runs' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, stage, input } = body;

    if (!projectId || !stage) {
      return NextResponse.json(
        { error: 'projectId and stage are required' },
        { status: 400 }
      );
    }

    const run = await prisma.pipelineRun.create({
      data: {
        projectId,
        stage,
        input: input ? JSON.stringify(input) : '{}',
      },
    });

    return NextResponse.json(run, { status: 201 });
  } catch (error) {
    console.error('Failed to create pipeline run:', error);
    return NextResponse.json({ error: 'Failed to create pipeline run' }, { status: 500 });
  }
}
