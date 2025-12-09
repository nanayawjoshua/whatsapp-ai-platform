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
 *   qrCode: string (base64 data URI),
 *   vendorId: string,
 *   expiresIn: number (seconds)
 * }
 */

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    // Validate phone input
    if (!phone || typeof phone !== 'string') {
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
      signal: AbortSignal.timeout(30000), // 30 second timeout
    });

    if (!bridgeResponse.ok) {
      const error = await bridgeResponse.text();
      console.error('Bridge service error:', error);

      // Handle specific error cases
      if (bridgeResponse.status === 503) {
        return NextResponse.json(
          { error: 'Server at capacity. Please try again later.' },
          { status: 503 }
        );
      }

      return NextResponse.json(
        { error: 'Failed to generate WhatsApp QR code' },
        { status: 500 }
      );
    }

    const data = await bridgeResponse.json();

    // Validate response contains QR code
    if (!data.qrCode) {
      console.error('No QR code in bridge response:', data);
      return NextResponse.json(
        { error: 'Failed to generate QR code' },
        { status: 500 }
      );
    }

    // Return success response with QR code and metadata
    return NextResponse.json({
      qrCode: data.qrCode, // Base64 data URI
      vendorId: data.vendorId || vendorId,
      expiresIn: data.expiresIn || 60, // QR code expiration in seconds
    });

  } catch (error: any) {
    console.error('WhatsApp initiation error:', error);

    // Handle network/timeout errors gracefully
    if (error.name === 'AbortError') {
      return NextResponse.json(
        { error: 'Request timed out. Please try again.' },
        { status: 504 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function OPTIONS(request: NextRequest) {
  return NextResponse.json({}, { status: 200 });
}
