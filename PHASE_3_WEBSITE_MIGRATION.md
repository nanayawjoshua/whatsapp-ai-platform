# PHASE 3: WEBSITE MIGRATION TO SUPABASE
## Update Next.js to use Supabase (1-2 days)

**Status:** Ready once Phase 2 complete
**Estimated Time:** 1-2 days
**Outcome:** Website works with Supabase instead of Render PostgreSQL

---

## 🎯 WHAT THIS PHASE DOES

Moves website database layer from:
- ❌ Render PostgreSQL + custom connections
- ❌ ioredis (Redis client)

To:
- ✅ Supabase (with @supabase/supabase-js client)
- ✅ Clean API routes that use Supabase directly

---

## 📋 STEP 1: UPDATE WEBSITE DEPENDENCIES

### Install Supabase Client

```bash
cd website
npm install @supabase/supabase-js
```

### Remove Old Dependencies (Optional)

```bash
# Remove ioredis (no longer needed)
npm uninstall ioredis

# Remove pg (if only used for bridge database)
npm uninstall pg
```

---

## 📋 STEP 2: UPDATE ENVIRONMENT VARIABLES

Create/update `website/.env.local`:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_PUBLIC_KEY]

# Phone bridge connection
PHONE_BRIDGE_URL=http://localhost:3001

# For production (Vercel):
# PHONE_BRIDGE_URL=https://your-phone-bridge-tunnel-url.ngrok.io
```

**⚠️ IMPORTANT:**
- Use `NEXT_PUBLIC_*` prefix for client-side variables (safe to expose)
- These are published in browser, so use anon key (read-only)
- Service key stays in backend only (if needed)

---

## 📋 STEP 3: CREATE SUPABASE CLIENT UTILITY

Create `website/lib/supabase.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Helper to get authenticated client (for API routes)
export function getServerSupabase() {
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_KEY!,
    {
      auth: { persistSession: false }
    }
  );
}
```

---

## 📋 STEP 4: UPDATE VENDOR REGISTER API

The API route already exists at `website/app/api/vendor/register/route.ts`

Replace its content with:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: NextRequest) {
  console.log('📝 Vendor registration');

  try {
    const body = await request.json();
    const { phone, name, category } = body;

    // Normalize phone
    const normalizedPhone = phone.replace(/\D/g, '').slice(-9);
    const fullPhone = '+233' + normalizedPhone;

    // Check if exists
    const { data: existing } = await supabase
      .from('vendors')
      .select('id')
      .eq('phone', fullPhone)
      .single();

    if (existing) {
      return NextResponse.json(
        { error: 'Vendor already registered' },
        { status: 409 }
      );
    }

    // Create vendor
    const { data: vendor, error } = await supabase
      .from('vendors')
      .insert({
        phone: fullPhone,
        name: name || 'New Vendor',
        category: category || 'uncategorized'
      })
      .select()
      .single();

    if (error) {
      return NextResponse.json(
        { error: 'Failed to create vendor' },
        { status: 500 }
      );
    }

    // Get QR from phone bridge
    const bridgeUrl = process.env.PHONE_BRIDGE_URL || 'http://localhost:3001';
    const qrResponse = await fetch(`${bridgeUrl}/api/generate-qr`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        vendorId: vendor.id,
        vendorData: {
          phone: fullPhone,
          name: name || 'New Vendor',
          category: category || 'uncategorized'
        }
      }),
      signal: AbortSignal.timeout(30000)
    });

    if (!qrResponse.ok) {
      return NextResponse.json(
        { error: 'QR generation failed' },
        { status: 503 }
      );
    }

    const qrData = await qrResponse.json();

    return NextResponse.json({
      success: true,
      vendorId: vendor.id,
      phone: fullPhone,
      qrCode: qrData.qrCode,
      expiresIn: qrData.expiresIn
    });
  } catch (error: any) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message || 'Registration failed' },
      { status: 500 }
    );
  }
}
```

---

## 📋 STEP 5: UPDATE WEBSITE PACKAGE.JSON

Ensure these dependencies are present:

```json
{
  "dependencies": {
    "@supabase/supabase-js": "^2.38.0",
    "next": "14.2.18",
    "react": "^18.3.1"
  }
}
```

Run:
```bash
npm install
npm run build
```

---

## 📋 STEP 6: CREATE VENDOR DASHBOARD API

Create `website/app/api/vendor/[vendorId]/dashboard/route.ts`:

```typescript
import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(
  request: NextRequest,
  { params }: { params: { vendorId: string } }
) {
  try {
    const vendorId = params.vendorId;

    // Get vendor info
    const { data: vendor, error: vendorError } = await supabase
      .from('vendors')
      .select('*')
      .eq('id', vendorId)
      .single();

    if (vendorError || !vendor) {
      return NextResponse.json(
        { error: 'Vendor not found' },
        { status: 404 }
      );
    }

    // Get today's sales
    const today = new Date().toISOString().split('T')[0];
    const { data: todaySales } = await supabase
      .from('transactions')
      .select('net_amount')
      .eq('vendor_id', vendorId)
      .gte('created_at', `${today}T00:00:00`)
      .eq('payment_status', 'paid');

    const todayEarnings = todaySales?.reduce((sum, t) => sum + t.net_amount, 0) || 0;

    // Get product count
    const { count: productCount } = await supabase
      .from('products')
      .select('id', { count: 'exact' })
      .eq('vendor_id', vendorId)
      .eq('status', 'active');

    return NextResponse.json({
      vendor,
      todayEarnings,
      productCount,
      totalEarnings: vendor.total_earned,
      walletBalance: vendor.wallet_balance
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
```

---

## 📋 STEP 7: TEST LOCALLY

```bash
cd website

# Start development server
npm run dev

# In another terminal, test vendor registration:
curl -X POST http://localhost:3000/api/vendor/register \
  -H "Content-Type: application/json" \
  -d '{"phone": "0501234567", "name": "Test Vendor", "category": "electronics"}'

# Expected response:
# {
#   "success": true,
#   "vendorId": "uuid...",
#   "phone": "+233501234567",
#   "qrCode": "data:image/png;base64...",
#   "expiresIn": 60
# }
```

---

## 📋 STEP 8: DEPLOY TO VERCEL

```bash
# Set environment variables in Vercel dashboard:
# Settings → Environment Variables

NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_KEY]
PHONE_BRIDGE_URL=https://your-phone-bridge-url.ngrok.io

# Then deploy:
cd website
vercel deploy --prod
```

Or push to GitHub and Vercel auto-deploys.

---

## ✅ VERIFICATION CHECKLIST

After Phase 3 complete:

- [ ] Website builds without errors: `npm run build`
- [ ] No more ioredis imports in code
- [ ] No more "pg" imports in code
- [ ] Supabase client configured in `lib/supabase.ts`
- [ ] Vendor registration API works locally
- [ ] Can register vendor and get QR code
- [ ] Phone bridge URL configured in `.env`
- [ ] Deployed to Vercel
- [ ] Vercel logs show no connection errors
- [ ] Can register vendor from deployed website

---

## 🔧 COMMON ISSUES

### "NEXT_PUBLIC_SUPABASE_URL is not set"
- Make sure you used `NEXT_PUBLIC_*` prefix in `.env.local`
- Rebuild with `npm run build`

### "Vendor not found" when registering
- Check that Supabase project is initialized (Phase 2)
- Verify schema was imported (tables exist)
- Check API key is correct (anon key, not service key)

### "Phone bridge connection refused"
- Make sure phone bridge is running: `node phone_bridge/phone-bridge-server.js`
- Check `PHONE_BRIDGE_URL` matches actual URL
- For local dev: `http://localhost:3001`
- For production: Use ngrok tunnel or actual server URL

### "RLS policy denies" error
- This happens when using service key in client-side code
- Always use anon key for `NEXT_PUBLIC_*` variables
- Service key only in API routes with `getServerSupabase()`

---

## 🚀 NEXT STEPS

Once Phase 3 complete:

1. **Phase 4:** Deploy phone bridge
2. **Phase 5:** Add Grok API integration
3. **Phase 6:** Jiji lead generation
4. **Phase 7:** Launch MVP

---

*BUZZ Phase 3 | Website Migration | Ready to Execute*
