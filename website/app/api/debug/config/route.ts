import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check environment configuration
 * Should be removed or protected in production
 */
export async function GET() {
  return NextResponse.json({
    phoneBridgeUrl: process.env.PHONE_BRIDGE_URL || 'NOT SET',
    nodeEnv: process.env.NODE_ENV || 'NOT SET',
    timestamp: new Date().toISOString()
  });
}
