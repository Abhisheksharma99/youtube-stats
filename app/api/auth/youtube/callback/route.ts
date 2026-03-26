import { NextRequest, NextResponse } from 'next/server'
import { google } from 'googleapis'
import { prisma } from '@/lib/services/db'
import { getSetting } from '@/lib/services/settings'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const code = request.nextUrl.searchParams.get('code')
    if (!code) {
      return NextResponse.json({ error: 'No authorization code' }, { status: 400 })
    }

    const clientId = await getSetting('youtubeClientId')
    const clientSecret = await getSetting('youtubeClientSecret')
    const redirectUri = `${request.nextUrl.origin}/api/auth/youtube/callback`

    const oauth2Client = new google.auth.OAuth2(clientId ?? undefined, clientSecret ?? undefined, redirectUri)
    const { tokens } = await oauth2Client.getToken(code)

    oauth2Client.setCredentials(tokens)

    // Get user info for account name
    const oauth2 = google.oauth2({ version: 'v2', auth: oauth2Client })
    const userInfo = await oauth2.userinfo.get()
    const accountName = userInfo.data.name || userInfo.data.email || 'YouTube Account'

    // Upsert social account
    await prisma.socialAccount.upsert({
      where: {
        platform_accountName: {
          platform: 'youtube',
          accountName,
        },
      },
      update: {
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || '',
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
      create: {
        platform: 'youtube',
        accountName,
        accessToken: tokens.access_token || '',
        refreshToken: tokens.refresh_token || '',
        expiresAt: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      },
    })

    // Redirect back to settings or publish page
    return NextResponse.redirect(new URL('/settings', request.url))
  } catch (error) {
    console.error('YouTube OAuth callback error:', error)
    return NextResponse.redirect(new URL('/settings?error=youtube_auth_failed', request.url))
  }
}
