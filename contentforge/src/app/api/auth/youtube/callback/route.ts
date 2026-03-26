/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/services/db';
import { getSetting } from '@/lib/services/settings';

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code');
    const error = request.nextUrl.searchParams.get('error');

    if (error) {
      return NextResponse.json(
        { error: `OAuth denied: ${error}` },
        { status: 400 }
      );
    }

    if (!code) {
      return NextResponse.json(
        { error: 'Missing authorization code' },
        { status: 400 }
      );
    }

    const clientId = await getSetting('youtube_client_id');
    const clientSecret = await getSetting('youtube_client_secret');
    const redirectUri = await getSetting('youtube_redirect_uri');

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.json(
        { error: 'YouTube OAuth is not configured. Set youtube_client_id, youtube_client_secret, and youtube_redirect_uri in settings.' },
        { status: 400 }
      );
    }

    // Exchange authorization code for tokens
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });

    const tokenData = await tokenResponse.json();

    if (!tokenResponse.ok) {
      console.error('Token exchange failed:', tokenData);
      return NextResponse.json(
        { error: 'Failed to exchange authorization code', details: tokenData.error_description ?? tokenData.error },
        { status: 400 }
      );
    }

    const { access_token, refresh_token, expires_in } = tokenData;

    // Fetch the YouTube channel info to get the account name
    const channelResponse = await fetch(
      'https://www.googleapis.com/youtube/v3/channels?part=snippet&mine=true',
      {
        headers: { Authorization: `Bearer ${access_token}` },
      }
    );

    const channelData = await channelResponse.json();
    let accountName = 'youtube-user';

    if (channelData.items && channelData.items.length > 0) {
      accountName = channelData.items[0].snippet?.title ?? channelData.items[0].id;
    }

    // Store tokens in the SocialAccount table
    const expiresAt = expires_in
      ? new Date(Date.now() + expires_in * 1000)
      : null;

    const account = await prisma.socialAccount.upsert({
      where: {
        platform_accountName: { platform: 'youtube', accountName },
      },
      update: {
        accessToken: access_token,
        refreshToken: refresh_token ?? '',
        expiresAt,
        metadata: JSON.stringify({
          channelId: channelData.items?.[0]?.id ?? '',
          tokenType: tokenData.token_type ?? 'Bearer',
        }),
      },
      create: {
        platform: 'youtube',
        accountName,
        accessToken: access_token,
        refreshToken: refresh_token ?? '',
        expiresAt,
        metadata: JSON.stringify({
          channelId: channelData.items?.[0]?.id ?? '',
          tokenType: tokenData.token_type ?? 'Bearer',
        }),
      },
    });

    return NextResponse.json({
      success: true,
      accountName: account.accountName,
      platform: account.platform,
      expiresAt: account.expiresAt,
    });
  } catch (error: any) {
    console.error('YouTube OAuth callback failed:', error);
    return NextResponse.json(
      { error: 'YouTube OAuth callback failed', details: error.message },
      { status: 500 }
    );
  }
}
