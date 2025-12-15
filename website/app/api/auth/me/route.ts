import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedVendor } from '../../../lib/session';

export const dynamic = 'force-dynamic';

/**
 * Get Current Authenticated Vendor
 * GET /api/auth/me
 *
 * Returns vendor data if authenticated
 */
export async function GET(request: NextRequest) {
  try {
    const vendor = await getAuthenticatedVendor(request);

    if (!vendor) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      vendor
    });

  } catch (error: any) {
    console.error('Auth check error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
