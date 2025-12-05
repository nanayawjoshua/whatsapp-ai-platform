import { NextResponse } from 'next/server';

const PAYSTACK_SECRET = process.env.PAYSTACK_SECRET;

interface PaystackPlan {
  name: string;
  plan_code: string;
  amount: number;
  interval: string;
  currency: string;
  description: string;
}

const plans: PaystackPlan[] = [
  {
    name: 'Beeline Personal',
    plan_code: 'personal-monthly',
    amount: 4900, // GHS 49 in pesewas
    interval: 'monthly',
    currency: 'GHS',
    description: 'AI assistant for individuals'
  },
  {
    name: 'Beeline Business',
    plan_code: 'business-monthly',
    amount: 9900, // GHS 99 in pesewas
    interval: 'monthly',
    currency: 'GHS',
    description: 'AI employee for single-location vendors'
  },
  {
    name: 'Beeline Enterprise (Up to 5 Locations)',
    plan_code: 'enterprise-5',
    amount: 59900, // GHS 599 in pesewas
    interval: 'monthly',
    currency: 'GHS',
    description: 'Multi-location dashboard + AI for up to 5 branches'
  },
  {
    name: 'Beeline Enterprise (Up to 12 Locations)',
    plan_code: 'enterprise-12',
    amount: 99900, // GHS 999 in pesewas
    interval: 'monthly',
    currency: 'GHS',
    description: 'Multi-location dashboard + AI for up to 12 branches'
  },
  {
    name: 'Beeline Enterprise (Up to 25 Locations)',
    plan_code: 'enterprise-25',
    amount: 149900, // GHS 1,499 in pesewas
    interval: 'monthly',
    currency: 'GHS',
    description: 'Multi-location dashboard + AI for up to 25 branches'
  },
  {
    name: 'Beeline Enterprise (Up to 60 Locations)',
    plan_code: 'enterprise-60',
    amount: 299900, // GHS 2,999 in pesewas
    interval: 'monthly',
    currency: 'GHS',
    description: 'Multi-location dashboard + AI for up to 60 branches'
  }
];

export async function POST() {
  if (!PAYSTACK_SECRET) {
    return NextResponse.json(
      { error: 'PAYSTACK_SECRET not configured' },
      { status: 500 }
    );
  }

  const results = [];
  const errors = [];

  for (const plan of plans) {
    try {
      const response = await fetch('https://api.paystack.co/plan', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${PAYSTACK_SECRET}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(plan)
      });

      const data = await response.json();

      if (response.ok && data.status) {
        results.push({
          success: true,
          plan_code: plan.plan_code,
          name: plan.name,
          amount: plan.amount,
          paystack_plan_code: data.data.plan_code,
          message: 'Plan created successfully'
        });
      } else {
        // Check if plan already exists
        if (data.message?.includes('already exists') || data.message?.includes('duplicate')) {
          results.push({
            success: true,
            plan_code: plan.plan_code,
            name: plan.name,
            amount: plan.amount,
            message: 'Plan already exists (skipped)'
          });
        } else {
          errors.push({
            plan_code: plan.plan_code,
            name: plan.name,
            error: data.message || 'Unknown error',
            response: data
          });
        }
      }
    } catch (error) {
      errors.push({
        plan_code: plan.plan_code,
        name: plan.name,
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json({
    message: 'Paystack plan setup completed',
    results,
    errors,
    summary: {
      total: plans.length,
      successful: results.length,
      failed: errors.length
    },
    env_variables: {
      PAYSTACK_PLAN_PERSONAL: 'personal-monthly',
      PAYSTACK_PLAN_BUSINESS: 'business-monthly',
      PAYSTACK_PLAN_ENTERPRISE_5: 'enterprise-5',
      PAYSTACK_PLAN_ENTERPRISE_12: 'enterprise-12',
      PAYSTACK_PLAN_ENTERPRISE_25: 'enterprise-25',
      PAYSTACK_PLAN_ENTERPRISE_60: 'enterprise-60'
    }
  });
}

export async function GET() {
  if (!PAYSTACK_SECRET) {
    return NextResponse.json(
      { error: 'PAYSTACK_SECRET not configured' },
      { status: 500 }
    );
  }

  try {
    // List all existing plans
    const response = await fetch('https://api.paystack.co/plan', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${PAYSTACK_SECRET}`,
        'Content-Type': 'application/json'
      }
    });

    const data = await response.json();

    if (response.ok && data.status) {
      const beelinePlans = data.data.filter((plan: any) =>
        plan.plan_code?.startsWith('personal-') ||
        plan.plan_code?.startsWith('business-') ||
        plan.plan_code?.startsWith('enterprise-')
      );

      return NextResponse.json({
        message: 'Existing Beeline plans retrieved',
        plans: beelinePlans,
        total: beelinePlans.length
      });
    } else {
      return NextResponse.json(
        { error: data.message || 'Failed to fetch plans' },
        { status: response.status }
      );
    }
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}
