import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcrypt';

// Server-side Supabase client with service key (bypasses RLS)
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export const dynamic = 'force-dynamic';

/**
 * POST /api/vendor/register
 * BUZZ: Simplified vendor registration
 *
 * Registers a vendor and sends them WhatsApp QR code
 * Uses phone bridge only (no cloud bridge)
 *
 * Request body:
 * - phone: string (any format, will be normalized)
 * - name?: string (optional, defaults to "New Vendor")
 * - category?: string (optional, defaults to "uncategorized")
 *
 * Response:
 * - vendorId: string (Supabase UUID)
 * - phone: string (normalized +233 format)
 * - qrCode: string (base64 QR code)
 * - expiresIn: number (seconds until QR expires)
 */

export async function POST(request: NextRequest) {
  console.log('📝 Vendor registration started');

  try {
    const body = await request.json();
    const { phone, name, category, password, authMethod } = body;

    console.log('📥 Received data:', {
      phone: phone ? phone.substring(0, 4) + '****' : 'MISSING',
      hasPassword: !!password,
      authMethod
    });

    // Validation
    if (!phone || typeof phone !== 'string') {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    // Password validation for password auth
    if (authMethod === 'password') {
      if (!password || password.length < 8) {
        return NextResponse.json(
          { error: 'Password must be at least 8 characters long' },
          { status: 400 }
        );
      }
    }

    // Normalize phone - now comes in +233XXXXXXXXX format from frontend
    const normalizedPhone = phone.replace(/\D/g, ''); // Remove all non-digits
    console.log('📱 Phone normalization:', {
      original: phone,
      normalized: normalizedPhone,
      length: normalizedPhone.length
    });

    // Validate phone format (should be country code + number)
    if (normalizedPhone.length < 10 || normalizedPhone.length > 15) {
      console.log('❌ Phone validation failed: invalid length');
      return NextResponse.json(
        { error: 'Invalid phone number format. Please include country code.' },
        { status: 400 }
      );
    }

    // Use the normalized phone as-is (already includes country code)
    const fullPhone = '+' + normalizedPhone;
    console.log(`📱 Registering vendor: ${fullPhone}`);

    // Check if vendor already exists
    console.log('🔍 Checking for existing vendor...');
    const { data: existingVendor, error: checkError } = await supabase
      .from('vendors')
      .select('id')
      .eq('phone', fullPhone)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('❌ Database check error:', checkError);
      return NextResponse.json(
        { error: 'Database error during registration' },
        { status: 500 }
      );
    }

    if (existingVendor) {
      console.log('❌ Vendor already exists');
      return NextResponse.json(
        { error: 'This vendor is already registered' },
        { status: 409 }
      );
    }

    console.log('✅ Vendor does not exist, proceeding...');

    // Hash password if provided
    let hashedPassword = null;
    if (authMethod === 'password' && password) {
      console.log('🔐 Hashing password...');
      try {
        const saltRounds = 12;
        hashedPassword = await bcrypt.hash(password, saltRounds);
        console.log('✅ Password hashed successfully');
      } catch (hashError) {
        console.error('❌ Password hashing failed:', hashError);
        return NextResponse.json(
          { error: 'Password processing failed' },
          { status: 500 }
        );
      }
    }

    // Create vendor in Supabase
    console.log('💾 Inserting vendor into database...');
    console.log('Insert payload:', {
      phone: fullPhone,
      name: name || 'New Vendor',
      category: category || 'uncategorized',
      status: 'active',
      hasPasswordHash: !!hashedPassword
    });

    const { data: newVendor, error: insertError } = await supabase
      .from('vendors')
      .insert({
        phone: fullPhone,
        name: name || 'New Vendor',
        category: category || 'uncategorized',
        status: 'active',
        ...(hashedPassword && { password_hash: hashedPassword })
      })
      .select()
      .single();

    if (insertError) {
      console.error('❌ Database insertion error:', {
        message: insertError.message,
        details: insertError.details,
        hint: insertError.hint,
        code: insertError.code,
        fullError: insertError
      });
      return NextResponse.json(
        { error: `Registration failed: ${insertError.message}` },
        { status: 500 }
      );
    }

    console.log('✅ Vendor created successfully:', newVendor.id);

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
