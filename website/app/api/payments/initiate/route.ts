import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { vendorId, paymentMethod, phone, email } = body;

    if (!vendorId) {
      return NextResponse.json(
        { error: 'Vendor ID is required' },
        { status: 400 }
      );
    }

    // Determine amount and description
    const amount = 99; // GHS 99/month
    const description = 'Beeline Monthly Subscription';

    // For now, all payments go through Paystack
    // In future, can route to different providers based on paymentMethod

    const paystackResponse = await fetch('https://api.paystack.co/transaction/initialize', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: email || `vendor-${vendorId}@beeline.works`,
        amount: amount * 100, // Convert to pesewas
        currency: 'GHS',
        metadata: {
          vendorId,
          paymentMethod,
          phone,
        },
        callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://beeline.works'}/api/paystack/callback`,
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
      success: true,
      checkoutUrl: data.data.authorization_url,
      reference: data.data.reference,
      accessCode: data.data.access_code,
    });

  } catch (error: any) {
    console.error('Payment initiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}