import { NextRequest, NextResponse } from 'next/server';

/**
 * Initialize Paystack Payment
 *
 * This endpoint creates a Paystack payment and returns the authorization URL
 * for the user to complete payment.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email, amount, metadata } = body;

    // Validate required fields
    if (!email || !amount) {
      return NextResponse.json(
        { error: 'Email and amount are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Initialize Paystack transaction
    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email,
        amount: amount * 100, // Convert to pesewas (Paystack uses smallest currency unit)
        currency: 'GHS',
        metadata: {
          ...metadata,
          cancel_action: `${process.env.NEXT_PUBLIC_SITE_URL}/signup`,
        },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/paystack/callback`,
      }),
    });

    const data = await paystackResponse.json();

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || 'Failed to initialize payment' },
        { status: 400 }
      );
    }

    return NextResponse.json({
      status: true,
      message: 'Authorization URL created',
      data: {
        authorization_url: data.data.authorization_url,
        access_code: data.data.access_code,
        reference: data.data.reference,
      },
    });

  } catch (error) {
    console.error('Paystack initialization error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
