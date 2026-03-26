import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";
import { executeCrawl } from "@/lib/services/crawl";

export async function GET(request: NextRequest) {
  try {
    const projectId = request.nextUrl.searchParams.get("projectId");
    if (!projectId) {
      return NextResponse.json({ error: "projectId is required" }, { status: 400 });
    }
    const jobs = await prisma.crawlJob.findMany({
      where: { projectId },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json(jobs);
  } catch (error) {
    console.error("Failed to fetch crawl jobs:", error);
    return NextResponse.json({ error: "Failed to fetch crawl jobs" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { projectId, queries, sources, maxPages } = body as {
      projectId?: string;
      queries?: string[];
      sources?: string[];
      maxPages?: number;
    };

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

    // Fire-and-forget: trigger crawling for each job
    for (const job of crawlJobs) {
      void executeCrawl(job.id).catch((err) => {
        console.error(`Crawl job ${job.id} failed:`, err);
      });
    }

    // Update project status
    await prisma.project.update({
      where: { id: projectId },
      data: { status: "crawling" },
    });

    return NextResponse.json(crawlJobs, { status: 201 });
  } catch (error) {
    console.error("Failed to create crawl jobs:", error);
    return NextResponse.json(
      { error: "Failed to create crawl jobs" },
      { status: 500 }
    );
  }
}
