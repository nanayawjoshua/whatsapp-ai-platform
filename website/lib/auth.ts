/**
 * Authentication Utilities for Vendor Dashboard
 * Handles login, session management, and password hashing
 */

import { randomBytes, createHash } from 'crypto';

// Use bcrypt-compatible hashing for passwords
// In production, install bcryptjs: npm install bcryptjs
// For now, using built-in crypto with salt

export interface VendorSession {
  sessionId: string;
  vendorId: string;
  email?: string;
  phone?: string;
  name: string;
  businessType?: string;
  expiresAt: Date;
}

/**
 * Hash password with salt
 */
export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString('hex');
  const hash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return `${salt}:${hash}`;
}

/**
 * Verify password against hash
 */
export function verifyPassword(password: string, storedHash: string): boolean {
  const [salt, hash] = storedHash.split(':');
  const testHash = createHash('sha256')
    .update(password + salt)
    .digest('hex');
  return hash === testHash;
}

/**
 * Generate session ID
 */
export function generateSessionId(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Generate verification code (6 digits)
 */
export function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Generate reset token
 */
export function generateResetToken(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate Ghana phone number
 */
export function isValidGhanaPhone(phone: string): boolean {
  // Ghana phone: 233XXXXXXXXX or 0XXXXXXXXX
  const cleanPhone = phone.replace(/\s+/g, '');
  return /^(233|0)\d{9}$/.test(cleanPhone);
}

/**
 * Normalize Ghana phone to international format
 */
export function normalizeGhanaPhone(phone: string): string {
  const cleanPhone = phone.replace(/\s+/g, '');
  if (cleanPhone.startsWith('0')) {
    return '233' + cleanPhone.substring(1);
  }
  return cleanPhone;
}

/**
 * Create session token for client
 * In production, use JWT library
 */
export function createSessionToken(session: VendorSession): string {
  // Simple base64 encoding for now
  // TODO: Replace with JWT in production
  const payload = JSON.stringify({
    sid: session.sessionId,
    vid: session.vendorId,
    exp: session.expiresAt.getTime()
  });
  return Buffer.from(payload).toString('base64');
}

/**
 * Verify session token
 */
export function verifySessionToken(token: string): { sessionId: string; vendorId: string } | null {
  try {
    const payload = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    const expiresAt = new Date(payload.exp);

    if (expiresAt < new Date()) {
      return null; // Expired
    }

    return {
      sessionId: payload.sid,
      vendorId: payload.vid
    };
  } catch {
    return null;
  }
}

/**
 * Check if login attempts are suspicious (rate limiting)
 */
export function isSuspiciousLoginAttempt(
  attempts: Array<{ attempted_at: Date; success: boolean }>
): boolean {
  const recentAttempts = attempts.filter(a => {
    const diff = Date.now() - new Date(a.attempted_at).getTime();
    return diff < 15 * 60 * 1000; // Last 15 minutes
  });

  // More than 5 failed attempts in 15 minutes
  const failedAttempts = recentAttempts.filter(a => !a.success);
  return failedAttempts.length >= 5;
}

/**
 * Sanitize user input
 */
export function sanitizeInput(input: string): string {
  return input.trim().replace(/[<>]/g, '');
}
