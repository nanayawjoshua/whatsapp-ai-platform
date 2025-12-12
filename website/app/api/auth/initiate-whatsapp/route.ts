import { NextRequest, NextResponse } from 'next/server';
import { discoverBridge } from '@/lib/bridge-discovery';

export const dynamic = 'force-dynamic';

/**
 * POST /api/auth/initiate-whatsapp
 *
 * Initiates WhatsApp connection for phone-based signup.
 * Uses bridge discovery to find available bridges (Pi/Phone/Cloud)
 * Falls back to CLOUD_BRIDGE_URL if registry unavailable.
 *
 * Ensures bridge is awake before making request (handles Render sleep)
 *
 * Request body:
 * {
 *   phone: string (e.g., "+233501234567" or "0501234567")
 * }
 *
 * Response:
 * {
 *   qrCode: string (Google Charts URL or base64 data URI),
 *   vendorId: string,
 *   expiresIn: number (seconds)
 * }
 */

async function convertQrToDataUri(qrUrl: string): Promise<string | null> {
  try {
    const response = await fetch(qrUrl, {
      signal: AbortSignal.timeout(5000),
    });
    
    if (!response.ok) {
      console.warn('Failed to fetch QR image:', response.status);
      return null;
    }

    const buffer = await response.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    return `data:image/png;base64,${base64}`;
  } catch (error) {
    console.warn('Failed to convert QR to data URI:', error);
    return null;
  }
}

export async function POST(request: NextRequest) {
  console.log('📞 WhatsApp initiate-whatsapp endpoint called');
  
  try {
    const body = await request.json();
    const { phone, vendorId: providedVendorId } = body;
    
    console.log('📝 Received request:', {
      phone: phone ? phone.slice(-4) : 'MISSING',
      bodyKeys: Object.keys(body)
    });

    // Validate phone input
    if (!phone || typeof phone !== 'string') {
      console.warn('❌ Phone validation failed: empty or not string');
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Normalize phone number (basic validation)
    // Accept formats like +233501234567, 0501234567, 233501234567
    const normalizedPhone = phone.replace(/\D/g, '').slice(-9); // Last 9 digits
    if (normalizedPhone.length < 8) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Use provided vendor ID or generate new one
    const vendorId = providedVendorId || `vendor_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

    // PROJECT OS - Phase 2: Use bridge discovery to find available bridge
    // This automatically discovers Pi/Phone/Cloud bridges via Redis registry
    // Falls back to CLOUD_BRIDGE_URL env var if discovery unavailable
    console.log('🔍 Discovering available bridge...');
    const bridgeUrl = await discoverBridge();

    if (!bridgeUrl) {
      console.error('❌ No bridges available');
      return NextResponse.json(
        { error: 'No WhatsApp bridges available. Please try again later.' },
        { status: 503 }
      );
    }

    console.log('🔗 Bridge selected:', {
      bridgeUrl,
      vendorId,
      discoveryUsed: !bridgeUrl.includes('localhost')
    });

    console.log('📤 Calling bridge service...');

    // STEP 1: Ensure bridge is awake (handles Render cold start)
    console.log('🌐 Ensuring bridge is awake before request...');
    let bridgeAwake = false;
    let pingAttempt = 0;
    const maxPingAttempts = 3;
    let pingDelay = 2000; // Start with 2 second delay

    while (pingAttempt < maxPingAttempts && !bridgeAwake) {
      pingAttempt++;
      try {
        console.log(`  Ping attempt ${pingAttempt}/${maxPingAttempts}...`);
        const healthResponse = await fetch(`${bridgeUrl}/health`, {
          method: 'GET',
          signal: AbortSignal.timeout(5000) // 5 second timeout per ping
        });

        if (healthResponse.ok) {
          console.log('✅ Bridge is awake!');
          bridgeAwake = true;
          break;
        }
      } catch (pingError: any) {
        console.log(`  Ping failed: ${pingError.message}`);

        if (pingAttempt < maxPingAttempts) {
          console.log(`  Waiting ${pingDelay}ms before retry...`);
          await new Promise(r => setTimeout(r, pingDelay));
          pingDelay = Math.min(pingDelay * 2, 10000); // Exponential backoff
        }
      }
    }

    if (!bridgeAwake) {
      console.error('❌ Bridge did not wake up after retries');
      return NextResponse.json(
        { error: 'WhatsApp service is temporarily unavailable. Please try again in a few seconds.' },
        { status: 503 }
      );
    }

    // STEP 2: Call cloud bridge service to generate QR code
    console.log('📤 Sending QR generation request to bridge...');
    let bridgeResponse;
    try {
      bridgeResponse = await fetch(`${bridgeUrl}/vendor/generate-qr`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          vendorId,
          vendorData: {
            phone: phone,
            name: 'New Vendor',
            businessType: 'retail',
            accountType: 'personal', // Default to personal tier for phone signup
          },
        }),
        // Add timeout to prevent hanging requests
        signal: AbortSignal.timeout(35000), // 35 second timeout (bridge has 30s polling)
      });
    } catch (fetchError: any) {
      console.error('❌ Network error calling bridge:', fetchError.message);
      return NextResponse.json(
        { error: 'Cannot reach WhatsApp bridge service. Check your internet connection.' },
        { status: 503 }
      );
    }

    if (!bridgeResponse.ok) {
      const errorText = await bridgeResponse.text().catch(() => 'No error details');
      console.error('🚨 Bridge service returned error:', {
        status: bridgeResponse.status,
        statusText: bridgeResponse.statusText,
        errorPreview: errorText.slice(0, 200),
        vendorId,
        bridgeUrl
      });

      // Handle specific error cases
      if (bridgeResponse.status === 503) {
        console.error('503: Server at capacity');
        return NextResponse.json(
          { error: 'Bridge server at capacity. Please try again in 1 minute.' },
          { status: 503 }
        );
      }

      if (bridgeResponse.status === 408) {
        console.error('408: QR generation timeout');
        return NextResponse.json(
          { error: 'QR generation timed out. Bridge may be overloaded. Try again.' },
          { status: 504 }
        );
      }

      if (bridgeResponse.status === 400) {
        console.error('400: Bad request to bridge:', errorText);
        return NextResponse.json(
          { error: `Invalid request: ${errorText || 'Bad request to bridge'}` },
          { status: 400 }
        );
      }

      if (bridgeResponse.status === 500) {
        console.error('500: Bridge internal error:', errorText);
        return NextResponse.json(
          { error: 'Bridge service error. Try again later.' },
          { status: 503 }
        );
      }

      console.error(`${bridgeResponse.status}: Unexpected bridge error`);
      return NextResponse.json(
        { error: `Bridge error (${bridgeResponse.status}): ${errorText.slice(0, 100)}` },
        { status: 500 }
      );
    }

    console.log('✅ Bridge response OK, parsing JSON...');
    let data;
    try {
      data = await bridgeResponse.json();
    } catch (jsonError) {
      console.error('❌ Failed to parse bridge response as JSON');
      return NextResponse.json(
        { error: 'Bridge returned invalid response format.' },
        { status: 500 }
      );
    }

    // Validate response contains QR code
    if (!data || !data.qrCode) {
      console.error('❌ No QR code in bridge response:', {
        hasData: !!data,
        keys: data ? Object.keys(data) : 'no data',
        data
      });
      return NextResponse.json(
        { error: 'Bridge did not generate QR code. Try again.' },
        { status: 500 }
      );
    }

    console.log('🎉 Success! QR code generated', {
      vendorId,
      qrLength: data.qrCode?.length,
      expiresIn: data.expiresIn
    });

    // Return success response with QR code and metadata
    // QR code might be a Google Charts URL or base64 data URI
    return NextResponse.json({
      qrCode: data.qrCode,
      vendorId: data.vendorId || vendorId,
      expiresIn: data.expiresIn || 60, // QR code expiration in seconds
    });

  } catch (error: any) {
    console.error('❌ WhatsApp initiation error:', {
      message: error.message,
      name: error.name,
      code: error.code,
      cause: error.cause,
      stack: error.stack?.split('\n').slice(0, 5)
    });

    // Handle network/timeout errors gracefully
    if (error.name === 'AbortError') {
      console.error('Abort error - request timed out');
      return NextResponse.json(
        { error: 'Request timed out. Bridge service may be overloaded. Please try again.' },
        { status: 504 }
      );
    }

    if (error.message?.includes('ECONNREFUSED')) {
      console.error('Connection refused - bridge not accessible');
      return NextResponse.json(
        { error: 'Cannot connect to WhatsApp bridge service. Please check your connection.' },
        { status: 503 }
      );
    }

    if (error.message?.includes('TypeError')) {
      console.error('TypeError caught:', error.message);
      return NextResponse.json(
        { error: `Type error: ${error.message}` },
        { status: 500 }
      );
    }

    console.error('Unknown error type:', error.toString());
    return NextResponse.json(
      { error: `Internal server error: ${error.message || 'Unknown error'}` },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
