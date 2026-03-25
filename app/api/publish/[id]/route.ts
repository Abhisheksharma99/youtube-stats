import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const job = await prisma.publishJob.findUnique({
      where: { id },
      include: { media: true, project: true },
    });

    if (!job) {
      return NextResponse.json(
        { error: "Publish job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...job,
      hashtags: JSON.parse(job.hashtags) as string[],
      metadata: JSON.parse(job.metadata) as Record<string, unknown>,
    });
  } catch (error) {
    console.error("Failed to get publish job:", error);
    return NextResponse.json(
      { error: "Failed to get publish job" },
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
    if (body.publishedUrl !== undefined) data.publishedUrl = body.publishedUrl;
    if (body.platformPostId !== undefined) data.platformPostId = body.platformPostId;
    if (body.caption !== undefined) data.caption = body.caption;
    if (body.hashtags !== undefined) data.hashtags = JSON.stringify(body.hashtags);
    if (body.scheduledAt !== undefined) data.scheduledAt = body.scheduledAt ? new Date(body.scheduledAt) : null;
    if (body.metadata !== undefined) data.metadata = JSON.stringify(body.metadata);
    if (body.status === "published") data.publishedAt = new Date();

    const job = await prisma.publishJob.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ...job,
      hashtags: JSON.parse(job.hashtags) as string[],
      metadata: JSON.parse(job.metadata) as Record<string, unknown>,
    });
  } catch (error) {
    console.error("Failed to update publish job:", error);
    return NextResponse.json(
      { error: "Failed to update publish job" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const job = await prisma.publishJob.findUnique({ where: { id } });

    if (!job) {
      return NextResponse.json(
        { error: "Publish job not found" },
        { status: 404 }
      );
    }

    if (job.status === "published") {
      return NextResponse.json(
        { error: "Cannot cancel an already published job" },
        { status: 400 }
      );
    }

    await prisma.publishJob.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to cancel publish job:", error);
    return NextResponse.json(
      { error: "Failed to cancel publish job" },
      { status: 500 }
    );
  }
}
