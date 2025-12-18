import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '../../../../lib/supabase';

export const dynamic = 'force-dynamic';

/**
 * Vendor Login - Look up vendor by phone number
 */
import bcrypt from 'bcrypt';

export async function POST(request: NextRequest) {
  try {
    const { phone, password } = await request.json();

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      );
    }

    // Normalize phone number (remove spaces, dashes, etc.)
    const normalizedPhone = phone.replace(/[\s\-()]/g, '');

    // Look up vendor in Supabase
    const { data: vendor, error } = await supabase
      .from('vendors')
      .select('id, name, phone, password_hash')
      .eq('phone', normalizedPhone)
      .single();

    if (error || !vendor) {
      return NextResponse.json(
        { error: 'No account found with this phone number. Please sign up first.' },
        { status: 404 }
      );
    }

    // Verify password
    if (!vendor.password_hash) {
      return NextResponse.json(
        { error: 'Account requires password setup. Please contact support.' },
        { status: 400 }
      );
    }

    const isValidPassword = await bcrypt.compare(password, vendor.password_hash);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid password. Please try again.' },
        { status: 401 }
      );
    }

    return NextResponse.json({
      vendorId: vendor.id,
      name: vendor.name,
      phone: vendor.phone,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'Login failed. Please try again.' },
      { status: 500 }
    );
  }
}
