import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * DEPRECATED: Use Supabase Auth instead
 *
 * In BUZZ MVP, vendors authenticate via WhatsApp
 * This endpoint is kept for backwards compatibility
 */
export async function POST(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'This endpoint is deprecated in BUZZ. Use Supabase Auth or WhatsApp authentication instead.',
      note: 'Vendor authentication is now handled through WhatsApp/Supabase.',
    },
    { status: 410 } // Gone
  );
}
