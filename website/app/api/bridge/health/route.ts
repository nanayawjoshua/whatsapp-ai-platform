import { NextRequest, NextResponse } from 'next/server';

/**
 * GET/POST /api/bridge/health
 * 
 * Exposes bridge health to frontend
 * Allows frontend to check if bridge is awake before attempting operations
 * 
 * This solves: Frontend doesn't know if bridge is sleeping on Render
 * Now it can ping this endpoint and get status
 */

export async function GET(request: NextRequest) {
  const bridgeUrl = process.env.CLOUD_BRIDGE_URL;

  if (!bridgeUrl) {
    return NextResponse.json(
      { 
        status: 'unavailable',
        error: 'Bridge URL not configured'
      },
      { status: 503 }
    );
  }

  try {
    // Ping the actual bridge
    const response = await fetch(`${bridgeUrl}/health`, {
      method: 'GET',
      signal: AbortSignal.timeout(5000)
    });

    if (response.ok) {
      const data = await response.json();
      return NextResponse.json({
        status: 'available',
        bridge: data,
        checkedAt: new Date().toISOString()
      });
    } else {
      return NextResponse.json(
        {
          status: 'unavailable',
          statusCode: response.status
        },
        { status: 503 }
      );
    }
  } catch (error) {
    // Bridge is likely sleeping
    return NextResponse.json(
      {
        status: 'sleeping',
        error: error instanceof Error ? error.message : 'Bridge not responding',
        note: 'Bridge may be cold-starting on Render. Please retry in 30-60 seconds.'
      },
      { status: 503 }
    );
  }
}

export async function POST(request: NextRequest) {
  // POST also works - allows polling until bridge wakes
  return GET(request);
}
