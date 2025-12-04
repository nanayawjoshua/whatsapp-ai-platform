import { NextRequest, NextResponse } from 'next/server';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * Verify Paystack Payment
 *
 * This endpoint verifies a Paystack payment using the reference code.
 * Called after user completes payment to confirm transaction status.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');

    if (!reference) {
      return NextResponse.json(
        { error: 'Payment reference is required' },
        { status: 400 }
      );
    }

    // Verify transaction with Paystack
    const paystackResponse = await fetch(
      `https://api.paystack.co/transaction/verify/${reference}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const data = await paystackResponse.json();

    if (!data.status) {
      return NextResponse.json(
        { error: data.message || 'Failed to verify payment' },
        { status: 400 }
      );
    }

    const transaction = data.data;

    // Check if payment was successful
    if (transaction.status !== 'success') {
      return NextResponse.json(
        {
          status: false,
          message: 'Payment not successful',
          data: {
            status: transaction.status,
            reference: transaction.reference,
          },
        },
        { status: 400 }
      );
    }

    // Payment verified successfully
    return NextResponse.json({
      status: true,
      message: 'Payment verified successfully',
      data: {
        reference: transaction.reference,
        amount: transaction.amount / 100, // Convert from pesewas to GHS
        currency: transaction.currency,
        customer: {
          email: transaction.customer.email,
          customer_code: transaction.customer.customer_code,
        },
        metadata: transaction.metadata,
        paid_at: transaction.paid_at,
        channel: transaction.channel,
      },
    });

  } catch (error) {
    console.error('Paystack verification error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
