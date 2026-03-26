/* eslint-disable @typescript-eslint/no-explicit-any */
export const dynamic = 'force-dynamic';

import { NextResponse } from 'next/server';
import { checkComfyUIStatus } from '@/lib/services/comfyui';

export async function GET() {
  try {
    const status = await checkComfyUIStatus();
    return NextResponse.json(status);
  } catch (error: any) {
    return NextResponse.json(
      { online: false, error: error.message ?? 'Failed to check ComfyUI status' },
      { status: 200 }
    );
  }
}
