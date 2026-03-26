export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { getSetting } from '@/lib/services/settings';

export async function GET() {
  try {
    const clientId = await getSetting('youtube_client_id');
    const redirectUri = await getSetting('youtube_redirect_uri');

    if (!clientId || !redirectUri) {
      return NextResponse.json(
        { error: 'YouTube OAuth is not configured. Set youtube_client_id and youtube_redirect_uri in settings.' },
        { status: 400 }
      );
    }

    const scopes = [
      'https://www.googleapis.com/auth/youtube.upload',
      'https://www.googleapis.com/auth/youtube',
      'https://www.googleapis.com/auth/youtube.readonly',
    ];

    const params = new URLSearchParams({
      client_id: clientId,
      redirect_uri: redirectUri,
      response_type: 'code',
      scope: scopes.join(' '),
      access_type: 'offline',
      prompt: 'consent',
    });

    const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    console.error('Failed to initiate YouTube OAuth:', error);
    return NextResponse.json({ error: 'Failed to initiate YouTube OAuth' }, { status: 500 });
  }
}
