/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { getAllSettings, setSetting } from '@/lib/services/settings';

const SENSITIVE_KEYS = ['api_key', 'secret', 'token', 'password', 'credential'];

function redactValue(key: string, value: string): string {
  const lower = key.toLowerCase();
  if (SENSITIVE_KEYS.some((k) => lower.includes(k))) {
    if (value.length <= 8) return '••••••••';
    return value.slice(0, 4) + '••••' + value.slice(-4);
  }
  return value;
}

export async function GET() {
  try {
    const settings = await getAllSettings();
    const redacted = settings.map((s: any) => ({
      ...s,
      value: redactValue(s.key, s.value),
    }));
    return NextResponse.json(redacted);
  } catch (error) {
    console.error('Failed to fetch settings:', error);
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json();
    const { key, value } = body;

    if (!key || typeof key !== 'string') {
      return NextResponse.json({ error: 'key is required' }, { status: 400 });
    }

    if (value === undefined || value === null) {
      return NextResponse.json({ error: 'value is required' }, { status: 400 });
    }

    const setting = await setSetting(key, String(value));
    return NextResponse.json(setting);
  } catch (error) {
    console.error('Failed to update setting:', error);
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 });
  }
}
