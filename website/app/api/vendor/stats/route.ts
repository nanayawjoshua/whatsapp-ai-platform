import { NextRequest, NextResponse } from 'next/server';
import { requireAuth } from '../../../lib/session';
// import { query } from '../../../lib/db'; // Deprecated in BUZZ - use Supabase instead

export const dynamic = 'force-dynamic';

/**
 * DEPRECATED: Use /api/vendor/dashboard instead
 * This endpoint is kept for backwards compatibility
 */
export async function GET(request: NextRequest) {
  return NextResponse.json(
    {
      error: 'This endpoint is deprecated in BUZZ. Use /api/vendor/dashboard instead.',
      note: 'The dashboard endpoint provides vendor stats, products, transactions, and unread messages.',
    },
    { status: 410 } // Gone
  );
}
