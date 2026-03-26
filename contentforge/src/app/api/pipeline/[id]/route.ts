import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const run = await prisma.pipelineRun.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!run) {
      return NextResponse.json({ error: 'Pipeline run not found' }, { status: 404 });
    }

    return NextResponse.json(run);
  } catch (error) {
    console.error('Failed to fetch pipeline run:', error);
    return NextResponse.json({ error: 'Failed to fetch pipeline run' }, { status: 500 });
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { stage, status, output, logs, startedAt, completedAt } = body;

    const data: Record<string, unknown> = {};
    if (stage !== undefined) data.stage = stage;
    if (status !== undefined) data.status = status;
    if (output !== undefined) data.output = typeof output === 'string' ? output : JSON.stringify(output);
    if (logs !== undefined) data.logs = logs;
    if (startedAt !== undefined) data.startedAt = new Date(startedAt);
    if (completedAt !== undefined) data.completedAt = new Date(completedAt);

    const run = await prisma.pipelineRun.update({
      where: { id },
      data,
    });

    return NextResponse.json(run);
  } catch (error) {
    console.error('Failed to update pipeline run:', error);
    return NextResponse.json({ error: 'Failed to update pipeline run' }, { status: 500 });
  }
}
