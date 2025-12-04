import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Mark route as dynamic
export const dynamic = 'force-dynamic';

/**
 * Paystack Webhook Handler
 *
 * This endpoint receives webhook events from Paystack for:
 * - charge.success (successful payment)
 * - subscription.create (subscription created)
 * - subscription.disable (subscription cancelled)
 * - invoice.create (recurring charge)
 * - invoice.update (recurring charge status change)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.text();
    const signature = request.headers.get('x-paystack-signature');

    // Verify webhook signature (skip in test mode if no webhook secret)
    if (signature && process.env.PAYSTACK_WEBHOOK_SECRET) {
      const hash = crypto
        .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET)
        .update(body)
        .digest('hex');

      if (hash !== signature) {
        console.error('Invalid Paystack webhook signature');
        return NextResponse.json(
          { error: 'Invalid signature' },
          { status: 400 }
        );
      }
    } else {
      console.warn('Webhook signature verification skipped (test mode or no secret configured)');
    }

    // Parse webhook event
    const event = JSON.parse(body);
    console.log('Paystack webhook event:', event.event);

    // Handle different event types
    switch (event.event) {
      case 'charge.success':
        await handleChargeSuccess(event.data);
        break;

      case 'subscription.create':
        await handleSubscriptionCreate(event.data);
        break;

      case 'subscription.disable':
        await handleSubscriptionDisable(event.data);
        break;

      case 'invoice.create':
      case 'invoice.update':
        await handleInvoiceUpdate(event.data);
        break;

      default:
        console.log('Unhandled webhook event:', event.event);
    }

    return NextResponse.json({ status: 'success' });

  } catch (error) {
    console.error('Webhook processing error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * Handle successful charge
 */
async function handleChargeSuccess(data: any) {
  console.log('Charge successful:', {
    reference: data.reference,
    amount: data.amount / 100,
    customer: data.customer.email,
  });

  // Forward to n8n for vendor onboarding
  const metadata = data.metadata || {};

  try {
    const n8nResponse = await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'payment_success',
        reference: data.reference,
        amount: data.amount / 100,
        currency: data.currency,
        customer: {
          email: data.customer.email,
          customer_code: data.customer.customer_code,
        },
        vendorData: {
          name: metadata.name,
          phone: metadata.phone,
          businessType: metadata.businessType,
          personality: metadata.personality,
        },
        paid_at: data.paid_at,
      }),
    });

    if (!n8nResponse.ok) {
      console.error('Failed to notify n8n:', await n8nResponse.text());
    } else {
      console.log('Successfully notified n8n of payment');
    }
  } catch (error) {
    console.error('Error notifying n8n:', error);
  }

  // Auto-subscribe customer to recurring plan after first payment
  await autoSubscribeCustomer(data);
}

/**
 * Automatically subscribe customer to monthly plan with 7-day trial
 */
async function autoSubscribeCustomer(paymentData: any) {
  try {
    console.log('Auto-subscribing customer:', paymentData.customer.email);

    // Calculate start date (7 days from now for free trial)
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 7);
    const startDate = trialEndDate.toISOString();

    // Get the authorization code from the payment
    const authorizationCode = paymentData.authorization?.authorization_code;

    if (!authorizationCode) {
      console.error('No authorization code found in payment data');
      return;
    }

    // Subscribe to monthly plan
    // Note: You need to create a plan first via Paystack dashboard or API
    // Plan code should be stored in environment variable
    const planCode = process.env.PAYSTACK_MONTHLY_PLAN_CODE || 'PLN_beeline_monthly_99';

    const subscriptionPayload = {
      customer: paymentData.customer.email,
      plan: planCode,
      authorization: authorizationCode,
      start_date: startDate,
    };

    console.log('Creating subscription with 7-day trial:', {
      customer: paymentData.customer.email,
      plan: planCode,
      trial_ends: startDate,
    });

    const paystackResponse = await fetch('https://api.paystack.co/subscription', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscriptionPayload),
    });

    const result = await paystackResponse.json();

    if (!paystackResponse.ok) {
      console.error('Failed to create subscription:', result);

      // If plan doesn't exist, try to create it
      if (result.message?.includes('Plan') || result.message?.includes('plan')) {
        console.log('Creating monthly plan...');
        await createMonthlyPlan();

        // Retry subscription after plan creation
        const retryResponse = await fetch('https://api.paystack.co/subscription', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(subscriptionPayload),
        });

        const retryResult = await retryResponse.json();
        if (retryResponse.ok) {
          console.log('Subscription created successfully on retry:', retryResult.data.subscription_code);
          await notifyN8nOfSubscription(retryResult.data, paymentData);
        } else {
          console.error('Subscription retry failed:', retryResult);
        }
      }
      return;
    }

    console.log('Subscription created successfully:', {
      subscription_code: result.data.subscription_code,
      next_payment: result.data.next_payment_date,
    });

    // Notify n8n of subscription creation
    await notifyN8nOfSubscription(result.data, paymentData);

  } catch (error) {
    console.error('Error auto-subscribing customer:', error);
  }
}

/**
 * Create the monthly subscription plan if it doesn't exist
 */
async function createMonthlyPlan() {
  try {
    const planResponse = await fetch('https://api.paystack.co/plan', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.PAYSTACK_SECRET}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Beeline Monthly Subscription',
        amount: 9900, // GHS 99 in pesewas
        interval: 'monthly',
        currency: 'GHS',
        description: 'Monthly AI WhatsApp Assistant subscription',
        send_invoices: true,
        send_sms: false,
      }),
    });

    const planData = await planResponse.json();

    if (planResponse.ok) {
      console.log('Monthly plan created:', planData.data.plan_code);
      console.log('⚠️ IMPORTANT: Add this to your .env.local and Vercel:');
      console.log(`PAYSTACK_MONTHLY_PLAN_CODE=${planData.data.plan_code}`);
    } else {
      console.error('Failed to create plan:', planData);
    }
  } catch (error) {
    console.error('Error creating monthly plan:', error);
  }
}

/**
 * Notify n8n of subscription creation
 */
async function notifyN8nOfSubscription(subscriptionData: any, paymentData: any) {
  try {
    await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'subscription_auto_created',
        subscription_code: subscriptionData.subscription_code,
        customer: subscriptionData.customer,
        plan: subscriptionData.plan,
        next_payment_date: subscriptionData.next_payment_date,
        status: subscriptionData.status,
        initial_payment: {
          reference: paymentData.reference,
          amount: paymentData.amount / 100,
        },
      }),
    });
    console.log('Notified n8n of subscription creation');
  } catch (error) {
    console.error('Error notifying n8n of subscription:', error);
  }
}

/**
 * Handle subscription creation
 */
async function handleSubscriptionCreate(data: any) {
  console.log('Subscription created:', {
    code: data.subscription_code,
    customer: data.customer.email,
    plan: data.plan.name,
  });

  // TODO: Store subscription details in database
  // For now, just forward to n8n
  try {
    await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'subscription_created',
        subscription_code: data.subscription_code,
        customer: data.customer,
        plan: data.plan,
        next_payment_date: data.next_payment_date,
      }),
    });
  } catch (error) {
    console.error('Error notifying n8n of subscription:', error);
  }
}

/**
 * Handle subscription cancellation
 */
async function handleSubscriptionDisable(data: any) {
  console.log('Subscription disabled:', {
    code: data.subscription_code,
    customer: data.customer.email,
  });

  // TODO: Update subscription status in database
  // For now, just forward to n8n
  try {
    await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        event: 'subscription_cancelled',
        subscription_code: data.subscription_code,
        customer: data.customer,
      }),
    });
  } catch (error) {
    console.error('Error notifying n8n of cancellation:', error);
  }
}

/**
 * Handle recurring invoice updates
 */
async function handleInvoiceUpdate(data: any) {
  console.log('Invoice update:', {
    id: data.id,
    status: data.status,
    amount: data.amount / 100,
  });

  // Only process successful invoices
  if (data.status === 'success') {
    try {
      await fetch(process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL || '', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event: 'recurring_payment_success',
          invoice_id: data.id,
          amount: data.amount / 100,
          customer: data.customer,
          subscription: data.subscription,
        }),
      });
    } catch (error) {
      console.error('Error notifying n8n of recurring payment:', error);
    }
  }
}
