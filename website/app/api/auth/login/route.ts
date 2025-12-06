import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import {
  verifyPassword,
  generateSessionId,
  createSessionToken,
  isValidEmail,
  normalizeGhanaPhone,
  isSuspiciousLoginAttempt,
  sanitizeInput
} from '@/lib/auth';

export const dynamic = 'force-dynamic';

/**
 * Vendor Login
 * POST /api/auth/login
 *
 * Body: { identifier: string, password: string }
 * identifier can be email or phone number
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { identifier, password } = body;

    // Validate input
    if (!identifier || !password) {
      return NextResponse.json(
        { error: 'Email/phone and password are required' },
        { status: 400 }
      );
    }

    const cleanIdentifier = sanitizeInput(identifier);

    // Determine if identifier is email or phone
    const isEmail = isValidEmail(cleanIdentifier);
    const searchField = isEmail ? 'email' : 'phone';
    const searchValue = isEmail ? cleanIdentifier : normalizeGhanaPhone(cleanIdentifier);

    // Check login attempts (rate limiting)
    const attemptsResult = await query(
      `SELECT success, attempted_at
       FROM login_attempts
       WHERE identifier = $1
       ORDER BY attempted_at DESC
       LIMIT 10`,
      [searchValue]
    );

    if (isSuspiciousLoginAttempt(attemptsResult.rows)) {
      return NextResponse.json(
        { error: 'Too many failed login attempts. Please try again in 15 minutes.' },
        { status: 429 }
      );
    }

    // Get client IP for logging
    const clientIp = request.headers.get('x-forwarded-for') ||
                     request.headers.get('x-real-ip') ||
                     'unknown';

    // Find vendor by email or phone
    const vendorResult = await query(
      `SELECT vendor_id, name, email, phone, business_type,
              password_hash, subscription_status
       FROM vendors
       WHERE ${searchField} = $1
       LIMIT 1`,
      [searchValue]
    );

    if (vendorResult.rows.length === 0) {
      // Log failed attempt
      await query(
        `INSERT INTO login_attempts (identifier, ip_address, success)
         VALUES ($1, $2, FALSE)`,
        [searchValue, clientIp]
      );

      return NextResponse.json(
        { error: 'Invalid email/phone or password' },
        { status: 401 }
      );
    }

    const vendor = vendorResult.rows[0];

    // Check if password is set
    if (!vendor.password_hash) {
      return NextResponse.json(
        {
          error: 'Password not set. Please use the password reset link sent to your email.',
          needsPasswordSetup: true
        },
        { status: 401 }
      );
    }

    // Verify password
    const passwordValid = verifyPassword(password, vendor.password_hash);

    if (!passwordValid) {
      // Log failed attempt
      await query(
        `INSERT INTO login_attempts (identifier, ip_address, success)
         VALUES ($1, $2, FALSE)`,
        [searchValue, clientIp]
      );

      return NextResponse.json(
        { error: 'Invalid email/phone or password' },
        { status: 401 }
      );
    }

    // Log successful attempt
    await query(
      `INSERT INTO login_attempts (identifier, ip_address, success)
       VALUES ($1, $2, TRUE)`,
      [searchValue, clientIp]
    );

    // Create session
    const sessionId = generateSessionId();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    await query(
      `INSERT INTO vendor_auth_sessions
       (session_id, vendor_id, ip_address, user_agent, expires_at)
       VALUES ($1, $2, $3, $4, $5)`,
      [
        sessionId,
        vendor.vendor_id,
        clientIp,
        request.headers.get('user-agent') || 'unknown',
        expiresAt
      ]
    );

    // Create session token
    const sessionToken = createSessionToken({
      sessionId,
      vendorId: vendor.vendor_id,
      email: vendor.email,
      phone: vendor.phone,
      name: vendor.name,
      businessType: vendor.business_type,
      expiresAt
    });

    // Return success with session token
    const response = NextResponse.json({
      success: true,
      vendor: {
        vendorId: vendor.vendor_id,
        name: vendor.name,
        email: vendor.email,
        phone: vendor.phone,
        businessType: vendor.business_type,
        subscriptionStatus: vendor.subscription_status
      }
    });

    // Set session cookie
    response.cookies.set('beeline_session', sessionToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    });

    return response;

  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
