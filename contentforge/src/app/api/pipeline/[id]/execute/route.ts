export const dynamic = 'force-dynamic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';
import { executePipeline } from '@/lib/services/pipeline-executor';

export async function POST(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const run = await prisma.pipelineRun.findUnique({ where: { id } });
    if (!run) {
      return NextResponse.json({ error: 'Pipeline run not found' }, { status: 404 });
    }

    // Parse project info from the run
    const project = await prisma.project.findUnique({ where: { id: run.projectId } });
    const keywords = project ? JSON.parse(project.keywords || '[]') : [];

    // Fire-and-forget pipeline execution
    executePipeline({
      projectId: run.projectId,
      topic: project?.name || '',
      keywords,
    }).catch((err) =>
      console.error(`Pipeline execution failed for run ${id}:`, err)
    );

    return NextResponse.json({ message: 'Pipeline execution started', runId: id });
  } catch (error) {
    console.error('Failed to trigger pipeline execution:', error);
    return NextResponse.json({ error: 'Failed to trigger pipeline execution' }, { status: 500 });
  }
}
