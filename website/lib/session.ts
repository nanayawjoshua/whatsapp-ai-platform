/**
 * Session Management
 * Verify and validate vendor sessions
 */

import { NextRequest } from 'next/server';
import { query } from './db';
import { verifySessionToken, VendorSession } from './auth';

export interface AuthenticatedVendor {
  vendorId: string;
  name: string;
  email?: string;
  phone?: string;
  businessType?: string;
  subscriptionStatus: string;
}

/**
 * Get authenticated vendor from request
 * Returns vendor data if authenticated, null otherwise
 */
export async function getAuthenticatedVendor(
  request: NextRequest
): Promise<AuthenticatedVendor | null> {
  try {
    // Get session token from cookie
    const sessionToken = request.cookies.get('beeline_session')?.value;

    if (!sessionToken) {
      return null;
    }

    // Verify token structure
    const tokenData = verifySessionToken(sessionToken);
    if (!tokenData) {
      return null;
    }

    // Verify session exists in database and is still valid
    const sessionResult = await query(
      `SELECT vas.vendor_id, vas.expires_at, vas.is_active,
              v.name, v.email, v.phone, v.business_type, v.subscription_status
       FROM vendor_auth_sessions vas
       JOIN vendors v ON v.vendor_id = vas.vendor_id
       WHERE vas.session_id = $1
       LIMIT 1`,
      [tokenData.sessionId]
    );

    if (sessionResult.rows.length === 0) {
      return null;
    }

    const session = sessionResult.rows[0];

    // Check if session is expired
    if (new Date(session.expires_at) < new Date()) {
      // Mark session as inactive
      await query(
        `UPDATE vendor_auth_sessions
         SET is_active = FALSE
         WHERE session_id = $1`,
        [tokenData.sessionId]
      );
      return null;
    }

    // Check if session is active
    if (!session.is_active) {
      return null;
    }

    // Update last active timestamp
    await query(
      `UPDATE vendor_auth_sessions
       SET last_active = NOW()
       WHERE session_id = $1`,
      [tokenData.sessionId]
    );

    return {
      vendorId: session.vendor_id,
      name: session.name,
      email: session.email,
      phone: session.phone,
      businessType: session.business_type,
      subscriptionStatus: session.subscription_status
    };

  } catch (error) {
    console.error('Session verification error:', error);
    return null;
  }
}

/**
 * Require authentication
 * Returns vendor or throws error with appropriate response
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedVendor> {
  const vendor = await getAuthenticatedVendor(request);

  if (!vendor) {
    throw new Error('UNAUTHORIZED');
  }

  return vendor;
}

/**
 * Invalidate session (logout)
 */
export async function invalidateSession(sessionToken: string): Promise<void> {
  const tokenData = verifySessionToken(sessionToken);

  if (tokenData) {
    await query(
      `UPDATE vendor_auth_sessions
       SET is_active = FALSE
       WHERE session_id = $1`,
      [tokenData.sessionId]
    );
  }
}

/**
 * Clean up expired sessions (run periodically)
 */
export async function cleanupExpiredSessions(): Promise<number> {
  const result = await query(
    `DELETE FROM vendor_auth_sessions
     WHERE expires_at < NOW()
     RETURNING session_id`
  );

  return result.rowCount || 0;
}
