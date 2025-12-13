import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

/**
 * POST /api/vendor/register
 * BUZZ: Simplified vendor registration
 *
 * Registers a vendor and sends them WhatsApp QR code
 * Uses phone bridge only (no cloud bridge)
 */

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  console.log('📝 Vendor registration started');

  try {
    const body = await request.json();
    const { phone, name, category } = body;

    // Validation
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Normalize phone (Ghana format)
    const normalizedPhone = phone.replace(/\D/g, '').slice(-9);
    if (normalizedPhone.length < 8) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      );
    }

    // Format as +233...
    const fullPhone = '+233' + normalizedPhone;

    console.log(`📱 Registering vendor: ${fullPhone}`);

    // Check if vendor already exists
    const { data: existingVendor } = await supabase
      .from('vendors')
      .select('id')
      .eq('phone', fullPhone)
      .single();

    if (existingVendor) {
      return NextResponse.json(
        { error: 'This vendor is already registered' },
        { status: 409 }
      );
    }

    // Create vendor in Supabase
    const { data: newVendor, error: insertError } = await supabase
      .from('vendors')
      .insert({
        phone: fullPhone,
        name: name || 'New Vendor',
        category: category || 'uncategorized',
        status: 'active'
      })
      .select()
      .single();

    if (insertError) {
      console.error('Database error:', insertError);
      return NextResponse.json(
        { error: 'Failed to register vendor' },
        { status: 500 }
      );
    }

    console.log(`✅ Vendor registered: ${newVendor.id}`);

    // Get QR from phone bridge
    const bridgeUrl = process.env.PHONE_BRIDGE_URL || 'http://localhost:3001';

    try {
      const qrResponse = await fetch(`${bridgeUrl}/api/generate-qr`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          vendorId: newVendor.id,
          vendorData: {
            phone: fullPhone,
            name: name || 'New Vendor',
            category: category || 'uncategorized'
          }
        }),
        signal: AbortSignal.timeout(30000)
      });

      if (!qrResponse.ok) {
        const errorText = await qrResponse.text();
        console.error('QR generation failed:', qrResponse.status, errorText);
        return NextResponse.json(
          { error: 'Failed to generate QR code. Try again.' },
          { status: 503 }
        );
      }

      const qrData = await qrResponse.json();

      return NextResponse.json({
        success: true,
        vendorId: newVendor.id,
        phone: fullPhone,
        qrCode: qrData.qrCode,
        expiresIn: qrData.expiresIn,
        message: 'Scan this QR code with WhatsApp to connect'
      });
    } catch (bridgeError: any) {
      console.error('Bridge error:', bridgeError.message);
      return NextResponse.json(
        { error: 'Phone bridge is temporarily unavailable' },
        { status: 503 }
      );
    }
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({}, { status: 200 });
}
