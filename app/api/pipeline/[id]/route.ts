import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const run = await prisma.pipelineRun.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!run) {
      return NextResponse.json(
        { error: "Pipeline run not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...run,
      input: JSON.parse(run.input),
      output: JSON.parse(run.output),
    });
  } catch (error) {
    console.error("Failed to get pipeline run:", error);
    return NextResponse.json(
      { error: "Failed to get pipeline run" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.stage !== undefined) data.stage = body.stage;
    if (body.status !== undefined) data.status = body.status;
    if (body.output !== undefined) data.output = JSON.stringify(body.output);
    if (body.logs !== undefined) data.logs = body.logs;
    if (body.status === "completed") data.completedAt = new Date();

    const run = await prisma.pipelineRun.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ...run,
      input: JSON.parse(run.input),
      output: JSON.parse(run.output),
    });
  } catch (error) {
    console.error("Failed to update pipeline run:", error);
    return NextResponse.json(
      { error: "Failed to update pipeline run" },
      { status: 500 }
    );
  }
}
