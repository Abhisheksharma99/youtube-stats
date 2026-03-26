export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';

export async function GET() {
  try {
    const accounts = await prisma.socialAccount.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        platform: true,
        accountName: true,
        expiresAt: true,
        createdAt: true,
      },
    });
    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Failed to fetch social accounts:', error);
    return NextResponse.json({ error: 'Failed to fetch social accounts' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { platform, accountName, accessToken, refreshToken, expiresAt, metadata } = body;

    if (!platform || !accountName) {
      return NextResponse.json(
        { error: 'platform and accountName are required' },
        { status: 400 }
      );
    }

    const account = await prisma.socialAccount.upsert({
      where: {
        platform_accountName: { platform, accountName },
      },
      update: {
        accessToken: accessToken ?? '',
        refreshToken: refreshToken ?? '',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : '{}',
      },
      create: {
        platform,
        accountName,
        accessToken: accessToken ?? '',
        refreshToken: refreshToken ?? '',
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        metadata: metadata ? (typeof metadata === 'string' ? metadata : JSON.stringify(metadata)) : '{}',
      },
    });

    return NextResponse.json({
      id: account.id,
      platform: account.platform,
      accountName: account.accountName,
      createdAt: account.createdAt,
    }, { status: 201 });
  } catch (error) {
    console.error('Failed to connect social account:', error);
    return NextResponse.json({ error: 'Failed to connect social account' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json({ error: 'id is required' }, { status: 400 });
    }

    await prisma.socialAccount.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Failed to disconnect social account:', error);
    return NextResponse.json({ error: 'Failed to disconnect social account' }, { status: 500 });
  }
}
