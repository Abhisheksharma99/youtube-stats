import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

type RouteContext = { params: Promise<{ id: string }> };

export async function GET(request: NextRequest, context: RouteContext) {
  try {
    const { id } = await context.params;

    const crawlJob = await prisma.crawlJob.findUnique({
      where: { id },
      include: { project: true },
    });

    if (!crawlJob) {
      return NextResponse.json(
        { error: "Crawl job not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({
      ...crawlJob,
      metadata: JSON.parse(crawlJob.metadata),
    });
  } catch (error) {
    console.error("Failed to get crawl job:", error);
    return NextResponse.json(
      { error: "Failed to get crawl job" },
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
    if (body.rawContent !== undefined) data.rawContent = body.rawContent;
    if (body.cleanedContent !== undefined) data.cleanedContent = body.cleanedContent;
    if (body.metadata !== undefined) data.metadata = JSON.stringify(body.metadata);

    const crawlJob = await prisma.crawlJob.update({
      where: { id },
      data,
    });

    return NextResponse.json({
      ...crawlJob,
      metadata: JSON.parse(crawlJob.metadata),
    });
  } catch (error) {
    console.error("Failed to update crawl job:", error);
    return NextResponse.json(
      { error: "Failed to update crawl job" },
      { status: 500 }
    );
  }
}
