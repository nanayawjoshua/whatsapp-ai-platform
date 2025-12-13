import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * DEPRECATED: Use Supabase messages API instead
 * This endpoint is kept for backwards compatibility
 *
 * [id] is the conversation_id (format: vendorId:customerId)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  return NextResponse.json(
    {
      error: 'This endpoint is deprecated in BUZZ. Use Supabase messages table instead.',
      note: 'Messages are now managed directly through Supabase database.',
    },
    { status: 410 } // Gone
  );
}
