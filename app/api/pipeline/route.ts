import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, stages, config } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    if (!stages || !Array.isArray(stages) || stages.length === 0) {
      return NextResponse.json(
        { error: "stages array is required and must not be empty" },
        { status: 400 }
      );
    }

    const project = await prisma.project.findUnique({
      where: { id: projectId },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    const pipelineRun = await prisma.pipelineRun.create({
      data: {
        projectId,
        stage: stages[0],
        status: "pending",
        input: JSON.stringify({ stages, config: config ?? {} }),
        startedAt: new Date(),
      },
    });

    return NextResponse.json(
      {
        ...pipelineRun,
        input: JSON.parse(pipelineRun.input),
        output: JSON.parse(pipelineRun.output),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create pipeline run:", error);
    return NextResponse.json(
      { error: "Failed to create pipeline run" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId query parameter is required" },
        { status: 400 }
      );
    }

    const runs = await prisma.pipelineRun.findMany({
      where: { projectId },
      orderBy: { startedAt: "desc" },
    });

    const parsed = runs.map((r) => ({
      ...r,
      input: JSON.parse(r.input),
      output: JSON.parse(r.output),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to list pipeline runs:", error);
    return NextResponse.json(
      { error: "Failed to list pipeline runs" },
      { status: 500 }
    );
  }
}
