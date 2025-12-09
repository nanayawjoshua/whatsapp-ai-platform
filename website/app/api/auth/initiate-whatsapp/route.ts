import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/auth/initiate-whatsapp
 * 
 * Initiates WhatsApp connection for phone-based signup.
 * Calls the cloud bridge service to generate a QR code.
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
    const { phone } = body;
    
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

    // Generate unique vendor ID from timestamp + random suffix
    const vendorId = `vendor_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Get cloud bridge URL from environment
    const bridgeUrl = process.env.CLOUD_BRIDGE_URL || 'http://localhost:3000';

    console.log('🔗 Bridge configuration:', {
      bridgeUrl,
      hasEnv: !!process.env.CLOUD_BRIDGE_URL,
      vendorId
    });

    console.log('📤 Calling bridge service...');

    // Call cloud bridge service to generate QR code
    const bridgeResponse = await fetch(`${bridgeUrl}/vendor/generate-qr`, {
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

    if (!bridgeResponse.ok) {
      const errorText = await bridgeResponse.text();
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
          { error: 'Server at capacity. Please try again later.' },
          { status: 503 }
        );
      }

      if (bridgeResponse.status === 408) {
        console.error('408: QR generation timeout');
        return NextResponse.json(
          { error: 'QR code generation timed out. The bridge service may be unavailable. Please try again.' },
          { status: 504 }
        );
      }

      if (bridgeResponse.status === 400) {
        console.error('400: Bad request to bridge');
        return NextResponse.json(
          { error: errorText || 'Invalid request to bridge service' },
          { status: 400 }
        );
      }

      console.error(`${bridgeResponse.status}: Unexpected bridge error`);
      return NextResponse.json(
        { error: 'Failed to generate WhatsApp QR code. Bridge service error.' },
        { status: 500 }
      );
    }

    console.log('✅ Bridge response OK');
    const data = await bridgeResponse.json();

    // Validate response contains QR code
    if (!data.qrCode) {
      console.error('❌ No QR code in bridge response:', data);
      return NextResponse.json(
        { error: 'Failed to generate QR code. Please try again.' },
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
