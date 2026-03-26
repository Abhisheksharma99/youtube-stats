import { NextRequest, NextResponse } from 'next/server'
import { getAllSettings, setSetting } from '@/lib/services/settings'

export async function GET() {
  try {
    const settings = await getAllSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json() as Record<string, string>
    for (const [key, value] of Object.entries(body)) {
      if (typeof value === 'string' && value && !value.includes('...') && value !== '****') {
        await setSetting(key, value)
      }
    }
    const settings = await getAllSettings()
    return NextResponse.json(settings)
  } catch (error) {
    return NextResponse.json({ error: 'Failed to save settings' }, { status: 500 })
  }
}
