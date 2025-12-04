import { NextRequest, NextResponse } from 'next/server';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * Create Paystack Subscription Plan
 *
 * This endpoint creates a subscription plan in Paystack.
 * Plans are reusable templates for recurring billing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, amount, interval, description } = body;

    // Validate required fields
    if (!name || !amount || !interval) {
      return NextResponse.json(
        { error: 'Missing required fields: name, amount, interval' },
        { status: 400 }
      );
    }

    // Create plan in Paystack
    const paystackResponse = await fetch('https://api.paystack.co/plan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name,
        amount: amount * 100, // Convert to pesewas
        interval, // 'monthly', 'weekly', 'daily', 'quarterly', 'biannually', 'annually'
        currency: 'GHS',
        description: description || '',
        send_invoices: true,
        send_sms: false,
      }),
    });

    const data = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('Paystack plan creation failed:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to create plan' },
        { status: paystackResponse.status }
      );
    }

    console.log('Subscription plan created:', data.data.plan_code);

    return NextResponse.json({
      status: true,
      message: 'Plan created successfully',
      data: {
        plan_code: data.data.plan_code,
        name: data.data.name,
        amount: data.data.amount / 100,
        interval: data.data.interval,
      },
    });

  } catch (error) {
    console.error('Plan creation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Get all subscription plans
 */
export async function GET(request: NextRequest) {
  try {
    const paystackResponse = await fetch('https://api.paystack.co/plan', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`,
      },
    });

    const data = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('Failed to fetch plans:', data);
      return NextResponse.json(
        { error: data.message || 'Failed to fetch plans' },
        { status: paystackResponse.status }
      );
    }

    return NextResponse.json({
      status: true,
      data: data.data.map((plan: any) => ({
        plan_code: plan.plan_code,
        name: plan.name,
        amount: plan.amount / 100,
        interval: plan.interval,
        currency: plan.currency,
      })),
    });

  } catch (error) {
    console.error('Fetch plans error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
