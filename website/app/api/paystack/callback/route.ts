import { NextRequest, NextResponse } from 'next/server';

/**
 * Paystack Payment Callback
 *
 * This endpoint is called by Paystack after user completes payment.
 * It redirects the user back to the signup page with payment status.
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref'); // Alternative parameter name

    const paymentReference = reference || trxref;

    if (!paymentReference) {
      // Payment failed or cancelled
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/signup?payment=failed`
      );
    }

    // Verify the payment with our API
    const verifyResponse = await fetch(
      `${process.env.NEXT_PUBLIC_SITE_URL}/api/paystack/verify?reference=${paymentReference}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      }
    );

    const verifyData = await verifyResponse.json();

    if (verifyData.status && verifyData.data.status === 'success') {
      // Payment successful - redirect to signup with success status
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/signup?payment=success&reference=${paymentReference}`
      );
    } else {
      // Payment failed
      return NextResponse.redirect(
        `${process.env.NEXT_PUBLIC_SITE_URL}/signup?payment=failed`
      );
    }

  } catch (error) {
    console.error('Callback error:', error);
    return NextResponse.redirect(
      `${process.env.NEXT_PUBLIC_SITE_URL}/signup?payment=error`
    );
  }
}
