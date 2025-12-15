import { NextRequest, NextResponse } from 'next/server';
import { invalidateSession } from '../../../lib/session';

export const dynamic = 'force-dynamic';

/**
 * Vendor Logout
 * POST /api/auth/logout
 */
export async function POST(request: NextRequest) {
  try {
    const sessionToken = request.cookies.get('beeline_session')?.value;

    if (sessionToken) {
      await invalidateSession(sessionToken);
    }

    const response = NextResponse.json({ success: true });

    // Clear session cookie
    response.cookies.delete('beeline_session');

    return response;

  } catch (error: any) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
