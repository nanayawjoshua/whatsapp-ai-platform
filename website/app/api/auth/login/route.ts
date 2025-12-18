import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Vendor Login - Look up vendor by phone number
 */
export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-()]/g, '');

    // Look up vendor in Supabase
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('id, name, phone')
      .eq('phone', normalizedPhone)
      .single();

    if (error || !vendor) {
      return NextResponse.json(
        { error: 'No account found with this phone number. Please sign up first.' },
        { status: 404 }
      );
    }

    // Generate QR code for login verification
    const bridgeUrl = process.env.PHONE_BRIDGE_URL || 'http://localhost:3001';

    try {
      const qrResponse = await fetch(`${bridgeUrl}/api/generate-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: vendor.id,
          vendorData: {
            phone: vendor.phone,
            name: vendor.name,
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!qrResponse.ok) {
        const errorText = await qrResponse.text();
        console.error('QR generation failed:', qrResponse.status, errorText);
        return NextResponse.json(
          { error: 'Failed to generate verification code. Please try again.' },
          { status: 503 }
        );
      }

      const qrData = await qrResponse.json();

      return NextResponse.json({
        vendorId: vendor.id,
        qrCode: qrData.qrCode,
        expiresIn: qrData.expiresIn,
        message: 'Scan this QR code with WhatsApp to verify your identity'
      });
    } catch (bridgeError: any) {
      console.error('Bridge error:', bridgeError.message);
      return NextResponse.json(
        { error: 'Verification service is temporarily unavailable' },
        { status: 503 }
      );
    }
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
