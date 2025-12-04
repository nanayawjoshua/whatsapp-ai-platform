import { NextRequest, NextResponse } from 'next/server';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * Generate WhatsApp QR Code for Vendor
 *
 * This endpoint proxies the request to the cloud bridge server
 * which manages Baileys WhatsApp sessions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, vendorData } = body;

    // Validate required fields
    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendorId is required' },
        { status: 400 }
      );
    }

    // Get cloud bridge URL from environment
    const cloudBridgeUrl = process.env.CLOUD_BRIDGE_URL || 'http://localhost:3000';

    console.log('Requesting QR code from cloud bridge:', {
      vendorId,
      cloudBridgeUrl,
    });

    // Call cloud bridge to generate QR
    const cloudResponse = await fetch(`${cloudBridgeUrl}/vendor/generate-qr`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        vendorId,
        vendorData,
      }),
    });

    if (!cloudResponse.ok) {
      const errorData = await cloudResponse.json();
      console.error('Cloud bridge error:', errorData);
      return NextResponse.json(
        { error: errorData.error || 'Failed to generate QR code' },
        { status: cloudResponse.status }
      );
    }

    const qrData = await cloudResponse.json();

    console.log('QR code generated successfully:', {
      vendorId,
      hasQrCode: !!qrData.qrCode,
    });

    return NextResponse.json({
      success: true,
      qrCode: qrData.qrCode, // Raw QR string from Baileys
      vendorId: qrData.vendorId,
      expiresIn: qrData.expiresIn || 60,
    });

  } catch (error: any) {
    console.error('QR generation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Check QR Code Status
 *
 * Returns the current status of a vendor's QR code (scanned or not)
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const vendorId = searchParams.get('vendorId');

    if (!vendorId) {
      return NextResponse.json(
        { error: 'vendorId is required' },
        { status: 400 }
      );
    }

    // TODO: Add status check endpoint to cloud bridge
    // For now, return pending
    return NextResponse.json({
      vendorId,
      status: 'waiting_for_scan',
      connected: false,
    });

  } catch (error: any) {
    console.error('Status check error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
