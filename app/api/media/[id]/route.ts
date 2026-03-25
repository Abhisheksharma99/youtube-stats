import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const media = await prisma.generatedMedia.findUnique({
      where: { id },
      include: { project: true, publishJobs: true },
    });

    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...media,
      metadata: JSON.parse(media.metadata),
      publishJobs: media.publishJobs.map((j) => ({
        ...j,
        hashtags: JSON.parse(j.hashtags),
        metadata: JSON.parse(j.metadata),
      })),
    });
  } catch (error) {
    console.error("Failed to get media:", error);
    return NextResponse.json(
      { error: "Failed to get media" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;
    const body = await request.json();

    const data: Record<string, unknown> = {};
    if (body.status !== undefined) data.status = body.status;
    if (body.filePath !== undefined) data.filePath = body.filePath;
    if (body.thumbnailPath !== undefined) data.thumbnailPath = body.thumbnailPath;
    if (body.progress !== undefined) data.progress = body.progress;
    if (body.prompt !== undefined) data.prompt = body.prompt;
    if (body.resolution !== undefined) data.resolution = body.resolution;
    if (body.duration !== undefined) data.duration = body.duration;
    if (body.metadata !== undefined) data.metadata = JSON.stringify(body.metadata);

    const media = await prisma.generatedMedia.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ...media,
      metadata: JSON.parse(media.metadata),
    });
  } catch (error) {
    console.error("Failed to update media:", error);
    return NextResponse.json(
      { error: "Failed to update media" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const media = await prisma.generatedMedia.findUnique({ where: { id } });

    if (!media) {
      return NextResponse.json(
        { error: "Media not found" },
        { status: 404 }
      );
    }

    await prisma.generatedMedia.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete media:", error);
    return NextResponse.json(
      { error: "Failed to delete media" },
      { status: 500 }
    );
  }
}
