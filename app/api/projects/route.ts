import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

export async function GET() {
  try {
    const projects = await prisma.project.findMany({
      orderBy: { updatedAt: "desc" },
    });

    const parsed = projects.map((p: { keywords: string; targetPlatforms: string }) => ({
      ...p,
      keywords: JSON.parse(p.keywords) as string[],
      targetPlatforms: JSON.parse(p.targetPlatforms) as string[],
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to list projects:", error);
    return NextResponse.json(
      { error: "Failed to list projects" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, description, keywords, targetPlatforms } = body as {
      name?: string;
      description?: string;
      keywords?: string[];
      targetPlatforms?: string[];
    };

    if (!name) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    const project = await prisma.project.create({
      data: {
        name,
        description: description ?? "",
        keywords: JSON.stringify(keywords ?? []),
        targetPlatforms: JSON.stringify(targetPlatforms ?? []),
      },
    });

    return NextResponse.json(
      {
        ...project,
        keywords: JSON.parse(project.keywords) as string[],
        targetPlatforms: JSON.parse(project.targetPlatforms) as string[],
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to create project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
