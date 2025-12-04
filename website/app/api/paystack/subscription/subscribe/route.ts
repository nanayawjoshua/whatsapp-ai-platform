import { NextRequest, NextResponse } from 'next/server';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * Subscribe a Customer to a Plan
 *
 * This endpoint subscribes a customer to a recurring billing plan.
 * The customer must have an existing authorization (i.e., completed a payment before).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { customer, plan, authorization, start_date } = body;

    // Validate required fields
    if (!customer || !plan) {
      return NextResponse.json(
        { error: 'Missing required fields: customer (email or code), plan (plan_code)' },
        { status: 400 }
      );
    }

    // Build request payload
    const payload: any = {
      customer,
      plan,
    };

    // Optional: specify which authorization to use (if customer has multiple cards)
    if (authorization) {
      payload.authorization = authorization;
    }

    // Optional: set start date for first charge (useful for free trials)
    if (start_date) {
      payload.start_date = start_date;
    }

    console.log('Creating subscription:', {
      customer,
      plan,
      start_date: start_date || 'immediate',
    });

    // Create subscription in Paystack
    const paystackResponse = await fetch('https://api.paystack.co/subscription', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('Paystack subscription creation failed:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to create subscription' },
        { status: paystackResponse.status }
      );
    }

    console.log('Subscription created:', {
      subscription_code: data.data.subscription_code,
      email_token: data.data.email_token,
      next_payment_date: data.data.next_payment_date,
    });

    return NextResponse.json({
      status: true,
      message: 'Subscription created successfully',
      data: {
        subscription_code: data.data.subscription_code,
        customer: data.data.customer,
        plan: data.data.plan,
        status: data.data.status,
        amount: data.data.amount / 100,
        next_payment_date: data.data.next_payment_date,
        email_token: data.data.email_token,
      },
    });

  } catch (error) {
    console.error('Subscription creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get subscription details
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const subscription_code = searchParams.get('subscription_code');

    if (!subscription_code) {
      return NextResponse.json(
        { error: 'subscription_code is required' },
        { status: 400 }
      );
    }

    const paystackResponse = await fetch(
      `https://api.paystack.co/subscription/${subscription_code}`,
      {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`,
        },
      }
    );

    const data = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('Failed to fetch subscription:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to fetch subscription' },
        { status: paystackResponse.status }
      );
    }

    return NextResponse.json({
      status: true,
      data: {
        subscription_code: data.data.subscription_code,
        customer: data.data.customer,
        plan: data.data.plan,
        status: data.data.status,
        amount: data.data.amount / 100,
        next_payment_date: data.data.next_payment_date,
        invoices_history: data.data.invoices_history,
      },
    });

  } catch (error) {
    console.error('Fetch subscription error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
