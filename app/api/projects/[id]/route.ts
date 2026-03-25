import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const project = await prisma.project.findUnique({
      where: { id },
      include: {
        _count: {
          select: {
            crawlJobs: true,
            contentPieces: true,
            generatedMedia: true,
          },
        },
      },
    });

    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...project,
      keywords: JSON.parse(project.keywords),
      targetPlatforms: JSON.parse(project.targetPlatforms),
    });
  } catch (error) {
    console.error("Failed to get project:", error);
    return NextResponse.json(
      { error: "Failed to get project" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.name !== undefined) data.name = body.name;
    if (body.description !== undefined) data.description = body.description;
    if (body.status !== undefined) data.status = body.status;
    if (body.keywords !== undefined) data.keywords = JSON.stringify(body.keywords);
    if (body.targetPlatforms !== undefined) data.targetPlatforms = JSON.stringify(body.targetPlatforms);

    const project = await prisma.project.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ...project,
      keywords: JSON.parse(project.keywords),
      targetPlatforms: JSON.parse(project.targetPlatforms),
    });
  } catch (error) {
    console.error("Failed to update project:", error);
    return NextResponse.json(
      { error: "Failed to update project" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    await prisma.project.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete project:", error);
    return NextResponse.json(
      { error: "Failed to delete project" },
      { status: 500 }
    );
  }
}
