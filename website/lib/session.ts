/**
 * Session Management (DEPRECATED)
 *
 * NOTE: In BUZZ, authentication is handled by Supabase Auth
 * This file is deprecated but kept to prevent build errors from old imports
 */

import { NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../app/api/auth/[...nextauth]/route';

/**
 * DEPRECATED: Use Supabase Auth instead
 */
export interface AuthenticatedVendor {
  vendorId: string;
  name: string;
  email?: string;
  phone?: string;
  businessType?: string;
  subscriptionStatus: string;
}

/**
 * DEPRECATED: Use Supabase Auth instead
 */
export async function getAuthenticatedVendor(
  request: NextRequest
): Promise<AuthenticatedVendor | null> {
  return null; // Always return null - deprecated in BUZZ
}

/**
 * Get vendor ID from NextAuth session
 */
export async function getVendorFromSession(request: NextRequest): Promise<string | null> {
  const session = await getServerSession(authOptions);
  return session?.user?.id || null;
}

/**
 * DEPRECATED: Use Supabase Auth instead
 */
export async function requireAuth(request: NextRequest): Promise<AuthenticatedVendor> {
  throw new Error('UNAUTHORIZED - Use Supabase Auth instead');
}

/**
 * DEPRECATED: Use Supabase Auth instead
 */
export async function invalidateSession(sessionToken: string): Promise<void> {
  // No-op - deprecated
}

/**
 * DEPRECATED: Use Supabase Auth instead
 */
export async function cleanupExpiredSessions(): Promise<number> {
  return 0; // No-op - deprecated
}
