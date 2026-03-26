import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/services/db'
import { executePipeline } from '@/lib/services/pipeline-executor'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const run = await prisma.pipelineRun.findUnique({ where: { id } })
    if (!run) {
      return NextResponse.json({ error: 'Pipeline run not found' }, { status: 404 })
    }
    if (run.status === 'running') {
      return NextResponse.json({ error: 'Pipeline is already running' }, { status: 409 })
    }

    // Fire and forget
    void executePipeline(id).catch((err) => {
      console.error(`Pipeline ${id} execution failed:`, err)
    })

    return NextResponse.json({ message: 'Pipeline execution started', id }, { status: 202 })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to start pipeline' }, { status: 500 })
  }
}
