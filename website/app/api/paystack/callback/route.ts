import { NextRequest, NextResponse } from 'next/server';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

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

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beeline.works';

    if (!paymentReference) {
      // Payment failed or cancelled
      return NextResponse.redirect(
        new URL('/signup?payment=failed', siteUrl)
      );
    }

    // Verify the payment with our API
    const verifyResponse = await fetch(
      `${siteUrl}/api/paystack/verify?reference=${paymentReference}`,
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
        new URL(`/signup?payment=success&reference=${paymentReference}`, siteUrl)
      );
    } else {
      // Payment failed
      return NextResponse.redirect(
        new URL('/signup?payment=failed', siteUrl)
      );
    }

  } catch (error) {
    console.error('Callback error:', error);
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beeline.works';
    return NextResponse.redirect(
      new URL('/signup?payment=error', siteUrl)
    );
  }
}
