import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, queries, sources, maxPages } = body;

    if (!projectId) {
      return NextResponse.json(
        { error: "projectId is required" },
        { status: 400 }
      );
    }

    if (!queries || !Array.isArray(queries) || queries.length === 0) {
      return NextResponse.json(
        { error: "queries array is required and must not be empty" },
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

    const crawlJobs = await prisma.$transaction(
      queries.map((query: string) =>
        prisma.crawlJob.create({
          data: {
            projectId,
            query,
            sourceUrl: Array.isArray(sources) ? sources.join(",") : "",
            status: "pending",
            metadata: JSON.stringify({
              maxPages: maxPages ?? 10,
              sources: sources ?? [],
            }),
          },
        })
      )
    );

    // In production, this would trigger actual crawling workers.
    // For now, we just return the created pending jobs.

    return NextResponse.json(crawlJobs, { status: 201 });
  } catch (error) {
    console.error("Failed to create crawl jobs:", error);
    return NextResponse.json(
      { error: "Failed to create crawl jobs" },
      { status: 500 }
    );
  }
}
