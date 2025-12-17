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
      .select('vendor_id, name, phone')
      .eq('phone', normalizedPhone)
      .single();

    if (error || !vendor) {
      return NextResponse.json(
        { error: 'No account found with this phone number. Please sign up first.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      vendorId: vendor.vendor_id,
      name: vendor.name,
      phone: vendor.phone,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
