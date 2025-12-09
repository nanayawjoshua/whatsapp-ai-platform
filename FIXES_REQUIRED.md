# Quick Fix Guide - Critical Issues

## Issue #1: Missing `/api/auth/initiate-whatsapp` Endpoint

**Create file**: `website/app/api/auth/initiate-whatsapp/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { phone } = body;

    // Validate phone number
    if (!phone || !phone.match(/^\+?[0-9\s\-()]{8,}$/)) {
      return NextResponse.json(
        { error: 'Please enter a valid phone number' },
        { status: 400 }
      );
    }

    // Call cloud bridge to generate QR code
    const cloudBridgeUrl = process.env.CLOUD_BRIDGE_URL || 'https://beeline-bridge.onrender.com';
    
    const cloudResponse = await fetch(`${cloudBridgeUrl}/auth/whatsapp/qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    });

    if (!cloudResponse.ok) {
      const error = await cloudResponse.json();
      return NextResponse.json(
        { error: error.message || 'Failed to generate QR code' },
        { status: cloudResponse.status }
      );
    }

    const data = await cloudResponse.json();

    return NextResponse.json({
      success: true,
      qrCode: data.qrCode,
      sessionId: data.sessionId,
      expiresAt: data.expiresAt,
    });

  } catch (error: any) {
    console.error('WhatsApp initiation error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
```

---

## Issue #2: Missing `/api/payments/initiate` Endpoint

**Create file**: `website/app/api/payments/initiate/route.ts`

```typescript
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
```

---

## Issue #3: Add Authentication to Stats Endpoint

**File**: `website/app/api/vendor/stats/route.ts`

Change line 14 from:
```typescript
export async function GET(request: NextRequest) {
  try {
    const vendor = await requireAuth(request); // ← ADD THIS LINE
```

---

## Issue #4: Add Authentication to Admin Metrics

**File**: `website/app/api/admin/metrics/route.ts`

Change:
```typescript
import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() { // ← CHANGE TO
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession();
    
    // Check if user is authenticated and is admin
    if (!session || session.user?.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized - admin access required' },
        { status: 401 }
      );
    }
```

**Import needed**:
```typescript
import { getServerSession } from 'next-auth/next';
```

---

## Issue #5: Fix JWT Token Security

**File**: `website/lib/auth.ts`

Replace the `createSessionToken` and `verifySessionToken` functions:

```typescript
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret';

export function createSessionToken(session: VendorSession): string {
  return jwt.sign(
    {
      sid: session.sessionId,
      vid: session.vendorId,
      email: session.email,
      exp: Math.floor(session.expiresAt.getTime() / 1000)
    },
    JWT_SECRET,
    { algorithm: 'HS256' }
  );
}

export function verifySessionToken(token: string): { sessionId: string; vendorId: string } | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, { algorithms: ['HS256'] }) as any;
    return {
      sessionId: decoded.sid,
      vendorId: decoded.vid
    };
  } catch {
    return null;
  }
}
```

**Install dependency**:
```bash
npm install jsonwebtoken @types/jsonwebtoken
```

---

## Issue #6: Fix SSL Certificate Validation

**File**: `website/lib/db.ts`

Change line 15 from:
```typescript
ssl: {
  rejectUnauthorized: false // ⚠️ INSECURE
}
```

To:
```typescript
ssl: process.env.NODE_ENV === 'production'
  ? true
  : { rejectUnauthorized: false }
```

---

## Issue #7: Fix Webhook Signature Enforcement

**File**: `website/app/api/paystack/webhook/route.ts`

Replace the signature check (around line 19):

```typescript
// Verify webhook signature
const signature = request.headers.get('x-paystack-signature');
const hash = crypto
  .createHmac('sha512', process.env.PAYSTACK_WEBHOOK_SECRET || '')
  .update(body)
  .digest('hex');

// In production, always verify. In test, allow bypass if secret not set
const isProduction = process.env.NODE_ENV === 'production';
const shouldVerify = isProduction || !!process.env.PAYSTACK_WEBHOOK_SECRET;

if (shouldVerify && (!signature || hash !== signature)) {
  console.error('Invalid Paystack webhook signature');
  return NextResponse.json(
    { error: 'Invalid signature' },
    { status: 400 }
  );
}
```

---

## Issue #8: Fix Unvalidated Site URL

**File**: `website/app/api/paystack/initialize/route.ts`

Replace line 47:
```typescript
// Before:
body: JSON.stringify({
  email,
  amount: amount * 100,
  currency: 'GHS',
  metadata: {
    ...metadata,
    cancel_action: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://beeline.works'}/signup`,
  },
  callback_url: `${process.env.NEXT_PUBLIC_SITE_URL || 'https://beeline.works'}/api/paystack/callback`,
}),

// After:
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://beeline.works';
if (!siteUrl.startsWith('http')) {
  throw new Error('Invalid SITE_URL: must be absolute URL');
}

body: JSON.stringify({
  email,
  amount: amount * 100,
  currency: 'GHS',
  metadata: {
    ...metadata,
    cancel_action: `${siteUrl}/signup`,
  },
  callback_url: `${siteUrl}/api/paystack/callback`,
}),
```

---

## Issue #9: Fix Google OAuth Response

**File**: `website/app/api/auth/[...nextauth]/route.ts`

Change line 87 from:
```typescript
return '/signup?error=account_not_found'; // ❌ WRONG
```

To:
```typescript
// Option 1: Auto-create vendor account (recommended)
try {
  const newVendor = await query(
    `INSERT INTO vendors (name, email, phone, account_type, subscription_status, created_at)
     VALUES ($1, $2, $3, $4, $5, NOW())
     RETURNING vendor_id, name, email, phone, business_type, subscription_status`,
    [profile.name || profile.email, profile.email, null, 'personal', 'trial']
  );
  user.id = newVendor.rows[0].vendor_id;
  user.vendorId = newVendor.rows[0].vendor_id;
  return true;
} catch (error) {
  console.error('Auto-signup error:', error);
  return false;
}

// Option 2: Reject and show error
// return false;
```

---

## Testing Checklist After Fixes

- [ ] Test WhatsApp signup flow end-to-end
- [ ] Test payment initiation and callback
- [ ] Test vendor dashboard loads data correctly
- [ ] Test admin metrics page loads
- [ ] Test logout clears session properly
- [ ] Test JWT token expiration
- [ ] Test webhook signature validation
- [ ] Test authentication errors return 401
- [ ] Test SSL connection works in production
- [ ] Monitor error logs for any issues

---

## Priority Order to Fix

1. **Critical** (Do first):
   - Create `/api/auth/initiate-whatsapp`
   - Create `/api/payments/initiate`

2. **High** (Do next):
   - Add authentication to `/api/vendor/stats`
   - Add authentication to `/api/admin/metrics`
   - Fix JWT token security
   - Fix SSL validation

3. **Medium** (After critical):
   - Fix Google OAuth response
   - Fix webhook signature enforcement
   - Fix unvalidated site URL

4. **Low** (Nice to have):
   - Other environment variable validations
   - Code quality improvements
