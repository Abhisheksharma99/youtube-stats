import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/services/db";

export async function GET() {
  try {
    const accounts = await prisma.socialAccount.findMany({
      orderBy: { createdAt: "desc" },
    });

    const parsed = accounts.map((a) => ({
      ...a,
      metadata: JSON.parse(a.metadata),
      // Redact tokens in responses
      accessToken: a.accessToken ? "***" : "",
      refreshToken: a.refreshToken ? "***" : "",
    }));

    return NextResponse.json(parsed);
  } catch (error) {
    console.error("Failed to list social accounts:", error);
    return NextResponse.json(
      { error: "Failed to list social accounts" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, accountName, accessToken, refreshToken, expiresAt } = body;

    if (!platform || !accountName) {
      return NextResponse.json(
        { error: "platform and accountName are required" },
        { status: 400 }
      );
    }

    const account = await prisma.socialAccount.create({
      data: {
        platform,
        accountName,
        accessToken: accessToken ?? "",
        refreshToken: refreshToken ?? "",
        expiresAt: expiresAt ? new Date(expiresAt) : null,
      },
    });

    return NextResponse.json(
      {
        ...account,
        accessToken: "***",
        refreshToken: "***",
        metadata: JSON.parse(account.metadata),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Failed to connect social account:", error);
    return NextResponse.json(
      { error: "Failed to connect social account" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "id query parameter is required" },
        { status: 400 }
      );
    }

    const account = await prisma.socialAccount.findUnique({ where: { id } });

    if (!account) {
      return NextResponse.json(
        { error: "Social account not found" },
        { status: 404 }
      );
    }

    await prisma.socialAccount.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to disconnect social account:", error);
    return NextResponse.json(
      { error: "Failed to disconnect social account" },
      { status: 500 }
    );
  }
}
