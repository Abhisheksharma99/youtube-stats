import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const projectId = searchParams.get("projectId");
    const type = searchParams.get("type");
    const status = searchParams.get("status");
    const page = parseInt(searchParams.get("page") ?? "1", 10);
    const limit = parseInt(searchParams.get("limit") ?? "20", 10);

    const where: Record<string, unknown> = {};
    if (projectId) where.projectId = projectId;
    if (type) where.type = type;
    if (status) where.status = status;

    const [media, total] = await Promise.all([
      prisma.generatedMedia.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
        include: { project: true },
      }),
      prisma.generatedMedia.count({ where }),
    ]);

    const parsed = media.map((m) => ({
      ...m,
      metadata: JSON.parse(m.metadata),
    }));

    return NextResponse.json({
      data: parsed,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Failed to list media:", error);
    return NextResponse.json(
      { error: "Failed to list media" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, type, prompt, modelUsed, resolution, duration } = body;

    if (!projectId || !type) {
      return NextResponse.json(
        { error: "projectId and type are required" },
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

    const media = await prisma.generatedMedia.create({
      data: {
        projectId,
        type,
        prompt: prompt ?? "",
        modelUsed: modelUsed ?? "",
        resolution: resolution ?? "",
        duration: duration ?? null,
        status: "queued",
        progress: 0,
      },
    });

    return NextResponse.json(
      {
        ...media,
        metadata: JSON.parse(media.metadata),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create media:", error);
    return NextResponse.json(
      { error: "Failed to create media" },
      { status: 500 }
    );
  }
}
