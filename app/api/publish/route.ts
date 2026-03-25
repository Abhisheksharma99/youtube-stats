import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, mediaId, platforms, caption, hashtags, scheduledAt } = body;

    if (!projectId || !mediaId) {
      return NextResponse.json(
        { error: "projectId and mediaId are required" },
        { status: 400 }
      );
    }

    if (!platforms || !Array.isArray(platforms) || platforms.length === 0) {
      return NextResponse.json(
        { error: "platforms array is required and must not be empty" },
        { status: 400 }
      );
    }

    const [project, media] = await Promise.all([
      prisma.project.findUnique({ where: { id: projectId } }),
      prisma.generatedMedia.findUnique({ where: { id: mediaId } }),
    ]);

    if (!project) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }
    if (!media) {
      return NextResponse.json({ error: "Media not found" }, { status: 404 });
    }

    const publishJobs = await prisma.$transaction(
      platforms.map((platform: string) =>
        prisma.publishJob.create({
          data: {
            projectId,
            mediaId,
            platform,
            caption: caption ?? "",
            hashtags: JSON.stringify(hashtags ?? []),
            status: scheduledAt ? "scheduled" : "draft",
            scheduledAt: scheduledAt ? new Date(scheduledAt) : null,
          },
        })
      )
    );

    const parsed = publishJobs.map((j) => ({
      ...j,
      hashtags: JSON.parse(j.hashtags),
    }));

    return NextResponse.json(parsed, { status: 201 });
  } catch (error) {
    console.error("Failed to create publish jobs:", error);
    return NextResponse.json(
      { error: "Failed to create publish jobs" },
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

    const jobs = await prisma.publishJob.findMany({
      where: { projectId },
      include: { media: true },
      orderBy: { createdAt: "desc" },
    });

    const parsed = jobs.map((j) => ({
      ...j,
      hashtags: JSON.parse(j.hashtags),
      metadata: JSON.parse(j.metadata),
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to list publish jobs:", error);
    return NextResponse.json(
      { error: "Failed to list publish jobs" },
      { status: 500 }
    );
  }
}
