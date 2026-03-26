import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { getSetting } from '@/lib/services/settings'

export async function GET(request: NextRequest) {
  try {
    const clientId = await getSetting('youtubeClientId')
    const clientSecret = await getSetting('youtubeClientSecret')

    if (!clientId || !clientSecret) {
      return NextResponse.json(
        { error: 'YouTube Client ID and Secret must be configured in Settings' },
        { status: 400 }
      )
    }

    const redirectUri = `${request.nextUrl.origin}/api/auth/youtube/callback`

    const oauth2Client = new google.auth.OAuth2(clientId, clientSecret, redirectUri)

    const authUrl = oauth2Client.generateAuthUrl({
      access_type: 'offline',
      scope: [
        'https://www.googleapis.com/auth/youtube.upload',
        'https://www.googleapis.com/auth/youtube',
        'https://www.googleapis.com/auth/userinfo.profile',
      ],
      prompt: 'consent',
    })

    return NextResponse.redirect(authUrl)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'OAuth setup failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
