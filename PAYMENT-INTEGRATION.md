# Beeline Payment Integration Guide

## Overview

This document outlines the payment collection strategy for Beeline Ghana. Since you're targeting Ghanaian vendors at GHS 99/month ($9 USD), we need payment methods that work well locally.

## Pricing Model

- **Price**: GHS 99/month (or $9 USD)
- **Free Trial**: 7 days (no credit card required)
- **Billing**: Monthly subscription
- **Cancellation**: Anytime

---

## Recommended Payment Solutions for Ghana

### Option 1: Mobile Money (MoMo) - BEST FOR GHANA 🇬🇭

**Why This is Perfect:**
- 90% of Ghanaians use mobile money
- Vendors already comfortable with MoMo
- No credit cards needed
- Low fees (1-2%)
- Instant confirmation

**Providers:**

#### A. Hubtel Payment Gateway (Recommended) ⭐
**Website**: https://hubtel.com

**Pricing:**
- Integration: Free
- Transaction fee: 1.5% + GHS 0.50
- Monthly cost: ~GHS 2 per vendor

**Supported Methods:**
- MTN Mobile Money
- Vodafone Cash
- AirtelTigo Money
- Visa/Mastercard (backup)

**Integration:**
```typescript
// Install Hubtel SDK
npm install @hubtel/payment-sdk

// Example subscription payment
import { HubtelPayment } from '@hubtel/payment-sdk';

const hubtel = new HubtelPayment({
  clientId: process.env.HUBTEL_CLIENT_ID,
  clientSecret: process.env.HUBTEL_CLIENT_SECRET,
  mode: 'live' // or 'test'
});

async function createSubscription(vendorId: string, phone: string) {
  const payment = await hubtel.receivePayment({
    customerName: vendor.name,
    customerMobileNumber: phone,
    customerEmail: vendor.email,
    amount: 99.00,
    primaryCallbackUrl: 'https://beeline.works/api/payments/webhook',
    description: 'Beeline AI Employee - Monthly Subscription',
    clientReference: `vendor-${vendorId}-${Date.now()}`
  });

  return payment.checkoutUrl; // Redirect vendor here
}
```

**Webhook Handling:**
```typescript
// app/api/payments/webhook/route.ts
export async function POST(req: Request) {
  const data = await req.json();

  if (data.ResponseCode === "0000") {
    // Payment successful
    await activateVendorSubscription(data.clientReference);
    return Response.json({ status: 'success' });
  } else {
    // Payment failed
    await notifyVendorPaymentFailed(data.clientReference);
    return Response.json({ status: 'failed' });
  }
}
```

**Flow:**
1. Vendor completes signup
2. After 7-day trial, show payment page
3. Click "Pay with MoMo"
4. Enter phone number
5. Approve on phone
6. Subscription activated

#### B. Paystack (Alternative)
**Website**: https://paystack.com

**Pricing:**
- Local cards: 1.5% + GHS 0.50
- MoMo: 1.5%
- International cards: 3.9%

**Pros:**
- Well-known in West Africa
- Good documentation
- Supports recurring payments
- Used by Flutterwave, Paystack

**Cons:**
- Slightly higher fees than Hubtel
- Requires company registration

### Option 2: Stripe (For International Customers)

**Why:**
- Accept payments from diaspora
- Ghanaians abroad might want to pay for family business
- Accept credit cards globally

**Integration:**
```bash
npm install stripe
```

```typescript
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

async function createSubscription(vendorEmail: string) {
  // Create customer
  const customer = await stripe.customers.create({
    email: vendorEmail,
    metadata: { vendorId: vendor.id }
  });

  // Create subscription
  const subscription = await stripe.subscriptions.create({
    customer: customer.id,
    items: [{ price: 'price_1234' }], // Create price in Stripe dashboard
    trial_period_days: 7,
    payment_behavior: 'default_incomplete',
  });

  return subscription.latest_invoice.payment_intent.client_secret;
}
```

**Pricing:**
- Ghana cards: 3.5% + GHS 1.50
- International cards: 3.9% + $0.30
- Higher fees but reaches global market

---

## Implementation Plan

### Phase 1: MVP (This Month)
**Use Hubtel for MoMo only**

1. **Setup:**
   - Sign up for Hubtel account
   - Get API credentials
   - Test in sandbox mode

2. **Integration:**
   - Add payment page after signup
   - Implement webhook for confirmation
   - Store subscription status in database

3. **Flow:**
   ```
   Signup → 7-day free trial → Payment reminder (Day 5)
   → Payment page (Day 7) → MoMo payment → Subscription active
   ```

### Phase 2: Scale (Month 2-3)
**Add Stripe for international**

1. Add Stripe alongside Hubtel
2. Auto-detect location (Ghana = Hubtel, Other = Stripe)
3. Support both monthly and annual plans

### Phase 3: Advanced (Month 4+)
**Subscription management**

1. Vendor dashboard
2. Auto-retry failed payments
3. Pause/resume subscriptions
4. Annual discounts (save 2 months)

---

## Payment Page Implementation

Create the payment page:

```typescript
// website/app/payment/page.tsx
'use client';

import { useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PaymentPage() {
  const [paymentMethod, setPaymentMethod] = useState<'momo' | 'card'>('momo');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const searchParams = useSearchParams();
  const vendorId = searchParams.get('vendor');

  const handlePayment = async () => {
    setLoading(true);

    const response = await fetch('/api/payments/initiate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId,
        paymentMethod,
        phone: paymentMethod === 'momo' ? phone : undefined
      })
    });

    const { checkoutUrl } = await response.json();
    window.location.href = checkoutUrl; // Redirect to Hubtel
  };

  return (
    <div className="max-w-md mx-auto p-8 bg-white rounded-2xl shadow-lg">
      <h2 className="text-2xl font-bold mb-4">Complete Payment</h2>
      <p className="text-gray-600 mb-6">
        Your 7-day trial has ended. Continue with Beeline for just GHS 99/month.
      </p>

      <div className="space-y-4 mb-6">
        <button
          onClick={() => setPaymentMethod('momo')}
          className={`w-full p-4 border-2 rounded-lg ${
            paymentMethod === 'momo' ? 'border-beeline-yellow bg-beeline-yellow/10' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">📱</span>
            <div className="text-left">
              <div className="font-bold">Mobile Money</div>
              <div className="text-sm text-gray-600">MTN, Vodafone, AirtelTigo</div>
            </div>
          </div>
        </button>

        <button
          onClick={() => setPaymentMethod('card')}
          className={`w-full p-4 border-2 rounded-lg ${
            paymentMethod === 'card' ? 'border-beeline-yellow bg-beeline-yellow/10' : 'border-gray-200'
          }`}
        >
          <div className="flex items-center gap-3">
            <span className="text-2xl">💳</span>
            <div className="text-left">
              <div className="font-bold">Debit/Credit Card</div>
              <div className="text-sm text-gray-600">Visa, Mastercard</div>
            </div>
          </div>
        </button>
      </div>

      {paymentMethod === 'momo' && (
        <div className="mb-6">
          <label className="block text-sm font-semibold mb-2">
            Mobile Money Number
          </label>
          <input
            type="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="024 123 4567"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg"
          />
        </div>
      )}

      <button
        onClick={handlePayment}
        disabled={loading || (paymentMethod === 'momo' && !phone)}
        className="btn-primary w-full"
      >
        {loading ? 'Processing...' : `Pay GHS 99`}
      </button>

      <p className="text-xs text-gray-500 mt-4 text-center">
        Secure payment powered by Hubtel. Cancel anytime.
      </p>
    </div>
  );
}
```

---

## Backend API Endpoints

### 1. Initiate Payment
```typescript
// app/api/payments/initiate/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { HubtelPayment } from '@hubtel/payment-sdk';

export async function POST(req: NextRequest) {
  const { vendorId, paymentMethod, phone } = await req.json();

  // Get vendor from database
  const vendor = await db.vendor.findUnique({ where: { id: vendorId } });

  if (!vendor) {
    return NextResponse.json({ error: 'Vendor not found' }, { status: 404 });
  }

  // Check if trial expired
  const trialEnd = new Date(vendor.trialEndsAt);
  if (trialEnd > new Date()) {
    return NextResponse.json({ error: 'Trial still active' }, { status: 400 });
  }

  if (paymentMethod === 'momo') {
    // Hubtel payment
    const hubtel = new HubtelPayment({
      clientId: process.env.HUBTEL_CLIENT_ID,
      clientSecret: process.env.HUBTEL_CLIENT_SECRET,
      mode: 'live'
    });

    const payment = await hubtel.receivePayment({
      customerName: vendor.name,
      customerMobileNumber: phone,
      amount: 99.00,
      primaryCallbackUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/api/payments/webhook`,
      description: 'Beeline Monthly Subscription',
      clientReference: `${vendorId}-${Date.now()}`
    });

    return NextResponse.json({ checkoutUrl: payment.checkoutUrl });
  } else {
    // Stripe payment (future)
    return NextResponse.json({ error: 'Card payments coming soon' }, { status: 501 });
  }
}
```

### 2. Payment Webhook
```typescript
// app/api/payments/webhook/route.ts
export async function POST(req: NextRequest) {
  const data = await req.json();

  // Verify webhook signature (important for security)
  const signature = req.headers.get('x-hubtel-signature');
  if (!verifyHubtelSignature(data, signature)) {
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // Extract vendor ID from reference
  const [vendorId] = data.clientReference.split('-');

  if (data.ResponseCode === "0000") {
    // Payment successful
    await db.vendor.update({
      where: { id: vendorId },
      data: {
        subscriptionStatus: 'active',
        subscriptionEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
        lastPaymentAt: new Date(),
        lastPaymentAmount: data.Amount
      }
    });

    // Log transaction
    await db.transaction.create({
      data: {
        vendorId,
        amount: data.Amount,
        currency: 'GHS',
        provider: 'hubtel',
        reference: data.TransactionId,
        status: 'success'
      }
    });

    // Send confirmation WhatsApp message
    await sendWhatsAppConfirmation(vendorId, 'Payment successful! Your AI employee is active for 30 days.');

    return NextResponse.json({ status: 'success' });
  } else {
    // Payment failed
    await db.vendor.update({
      where: { id: vendorId },
      data: { subscriptionStatus: 'payment_failed' }
    });

    // Notify vendor
    await sendWhatsAppNotification(vendorId, 'Payment failed. Please try again.');

    return NextResponse.json({ status: 'failed' });
  }
}
```

### 3. Subscription Status Check
```typescript
// app/api/vendor/subscription/route.ts
export async function GET(req: NextRequest) {
  const vendorId = req.nextUrl.searchParams.get('vendorId');

  const vendor = await db.vendor.findUnique({
    where: { id: vendorId },
    select: {
      subscriptionStatus: true,
      subscriptionEndsAt: true,
      trialEndsAt: true
    }
  });

  return NextResponse.json(vendor);
}
```

---

## Database Schema Updates

Add payment-related fields:

```sql
-- Add to vendor table
ALTER TABLE vendors ADD COLUMN subscription_status VARCHAR(20) DEFAULT 'trial';
-- Values: 'trial', 'active', 'expired', 'payment_failed', 'cancelled'

ALTER TABLE vendors ADD COLUMN trial_ends_at TIMESTAMP;
ALTER TABLE vendors ADD COLUMN subscription_ends_at TIMESTAMP;
ALTER TABLE vendors ADD COLUMN last_payment_at TIMESTAMP;
ALTER TABLE vendors ADD COLUMN last_payment_amount DECIMAL(10, 2);

-- Create transactions table
CREATE TABLE transactions (
  id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(100) REFERENCES vendors(id),
  amount DECIMAL(10, 2),
  currency VARCHAR(3) DEFAULT 'GHS',
  provider VARCHAR(50), -- 'hubtel', 'stripe', etc.
  reference VARCHAR(255) UNIQUE,
  status VARCHAR(20), -- 'success', 'failed', 'pending'
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_transactions_vendor ON transactions(vendor_id);
CREATE INDEX idx_transactions_status ON transactions(status);
```

---

## Subscription Lifecycle Management

### Auto-Reminder System (n8n Workflow)

Create n8n workflow that runs daily:

```yaml
Workflow: Subscription Management
Trigger: Schedule (daily at 8am)

1. Query Database:
   - Find vendors where trial_ends_at = today + 2 days
   - Find vendors where subscription_ends_at = today + 3 days

2. Send Reminders:
   - Trial ending soon: "Your 7-day trial ends in 2 days. Click here to subscribe: https://beeline.works/payment?vendor={id}"
   - Subscription ending: "Your subscription ends in 3 days. Renew now: https://beeline.works/payment?vendor={id}"

3. Auto-Deactivate:
   - Find vendors where subscription_ends_at < today
   - Update status to 'expired'
   - Disconnect WhatsApp session (but keep data for 30 days)
   - Send: "Your subscription has expired. Your AI is offline. Renew: https://beeline.works/payment?vendor={id}"
```

### Grace Period

Give 3-day grace period:
- Day 1-3: AI still works, but shows "Subscription expired" banner
- Day 4+: AI stops responding, sends "Renew your subscription" message

---

## Revenue Tracking Dashboard

Create simple admin dashboard:

```typescript
// app/admin/revenue/page.tsx
export default async function RevenueDashboard() {
  const stats = await db.transaction.aggregate({
    where: { status: 'success' },
    _sum: { amount: true },
    _count: true
  });

  const activeVendors = await db.vendor.count({
    where: { subscriptionStatus: 'active' }
  });

  return (
    <div>
      <h1>Revenue Dashboard</h1>
      <div className="grid grid-cols-3 gap-6">
        <Card title="Total Revenue" value={`GHS ${stats._sum.amount}`} />
        <Card title="Active Vendors" value={activeVendors} />
        <Card title="MRR" value={`GHS ${activeVendors * 99}`} />
      </div>
    </div>
  );
}
```

---

## Cost Analysis

### With Hubtel (50 vendors)
- Monthly revenue: 50 × GHS 99 = **GHS 4,950**
- Transaction fees: 50 × (1.5% × 99 + 0.50) = **GHS 99**
- Infrastructure: **GHS 45** ($38 backend + $7 Vercel)
- Net profit: **GHS 4,806** (~$550 USD)

**Profit margin: 97%** 🚀

### Break-even with payments
- Infrastructure: GHS 45/month
- Payment fees: ~GHS 2/vendor
- Break-even: 5 vendors (was 4.2 without payment fees)

---

## Security Checklist

- [ ] Verify webhook signatures (prevent fake payments)
- [ ] Store payment credentials in environment variables
- [ ] Use HTTPS only (enforced by Vercel)
- [ ] Log all transactions to database
- [ ] Implement rate limiting on payment endpoints
- [ ] Never store credit card numbers (Hubtel/Stripe handles this)
- [ ] PCI compliance (automatic with Hubtel/Stripe)

---

## Testing

### Hubtel Sandbox
```typescript
const hubtel = new HubtelPayment({
  clientId: 'test_client_id',
  clientSecret: 'test_client_secret',
  mode: 'test' // Sandbox mode
});

// Test numbers
// Success: 0243123456
// Failed: 0243111111
```

### Stripe Test Mode
```
Test card: 4242 4242 4242 4242
Expiry: Any future date
CVC: Any 3 digits
```

---

## Next Steps

1. **Today:**
   - [ ] Sign up for Hubtel account
   - [ ] Get sandbox credentials
   - [ ] Test MoMo payment flow

2. **This Week:**
   - [ ] Build payment page
   - [ ] Implement webhook handler
   - [ ] Test end-to-end with real MoMo

3. **Before Launch:**
   - [ ] Go live with Hubtel production credentials
   - [ ] Test with 3 real vendors
   - [ ] Set up auto-reminder system in n8n

---

## Support

**Hubtel Support:**
- Email: developers@hubtel.com
- Phone: +233 30 281 8181
- Docs: https://developers.hubtel.com

**Stripe Support:**
- Email: support@stripe.com
- Docs: https://stripe.com/docs

---

Built with 🐝 in Ghana
Payment integration designed for local success!
