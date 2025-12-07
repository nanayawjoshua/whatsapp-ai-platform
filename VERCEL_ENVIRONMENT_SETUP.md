# Vercel Environment Setup Guide

This guide shows how to set up different environments (Preview/Development and Production) on Vercel with separate configurations for testing and live payments.

## Environment Strategy

- **Preview/Development**: Test mode (test Paystack keys, test data)
- **Production**: Live mode (live Paystack keys, real payments)

## Step-by-Step Setup

### 1. Deploy to Vercel

1. Go to https://vercel.com and sign in with GitHub
2. Click "Add New" → "Project"
3. Import repository: `nanayawjoshua/whatsapp-ai-platform`
4. Configure project settings:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `website` ⚠️ IMPORTANT - Click "Edit" and set this
   - **Build Command**: `npm run build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)

### 2. Configure Environment Variables

Go to Project Settings → Environment Variables

#### A. Variables for ALL Environments (Production, Preview, Development)

These should be added and applied to **all three checkboxes** (Production, Preview, Development):

```bash
# Database (same for all environments)
DATABASE_URL=postgresql://neondb_owner:npg_wkI9d3RebGKO@ep-silent-lake-ad3vhsoo-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require

# NextAuth Secret (same for all)
NEXTAUTH_SECRET=toRMbFTMmaqdl96N/i985MNXqwcEDDrnBTs6+/6xxm8=

# Google OAuth (same for all)
GOOGLE_CLIENT_ID=236111634034-8jeeps5grj1qmrm7idm8fmj6fi1didvf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

# Cloud Bridge (same for all)
CLOUD_BRIDGE_URL=https://beeline-bridge.onrender.com
```

#### B. Production-Only Variables (LIVE MODE)

Add these and check ONLY **Production**:

```bash
# Paystack LIVE keys
PAYSTACK_SECRET=sk_live_YOUR_LIVE_SECRET_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC=pk_live_f2697bf774330cae809ca0a9135f680b13d95f9e
PAYSTACK_WEBHOOK_SECRET=your_live_webhook_secret

# Production URL (set after first deployment)
NEXTAUTH_URL=https://your-production-domain.vercel.app
NODE_ENV=production
```

#### C. Preview & Development Variables (TEST MODE)

Add these and check ONLY **Preview** and **Development**:

```bash
# Paystack TEST keys
PAYSTACK_SECRET=sk_test_YOUR_TEST_SECRET_KEY
NEXT_PUBLIC_PAYSTACK_PUBLIC=pk_test_YOUR_TEST_PUBLIC_KEY
PAYSTACK_WEBHOOK_SECRET=your_test_webhook_secret

# Preview/Dev URL (Vercel auto-generates preview URLs)
NODE_ENV=development
```

**Note**: `NEXTAUTH_URL` for preview/dev will be auto-detected by NextAuth, so you don't need to set it.

### 3. Get Your Paystack Keys

1. Go to https://dashboard.paystack.com/#/settings/developers
2. Copy your **Test** keys:
   - Test Secret Key (starts with `sk_test_`)
   - Test Public Key (starts with `pk_test_`)
3. Copy your **Live** keys:
   - Live Secret Key (starts with `sk_live_`)
   - Live Public Key (starts with `pk_live_`)

### 4. Update Google OAuth Redirect URIs

After deployment, add your Vercel URLs to Google Cloud Console:

1. Go to https://console.cloud.google.com/apis/credentials
2. Edit your OAuth 2.0 Client ID
3. Add to **Authorized redirect URIs**:
   ```
   https://your-production-domain.vercel.app/api/auth/callback/google
   https://your-preview-url.vercel.app/api/auth/callback/google
   ```

### 5. Set Up Paystack Webhooks (Optional for subscriptions)

1. Go to https://dashboard.paystack.com/#/settings/webhooks
2. Add webhook URL:
   ```
   https://your-production-domain.vercel.app/api/paystack/webhook
   ```
3. Copy the webhook secret and add it to `PAYSTACK_WEBHOOK_SECRET`

## How It Works

### Testing Flow (Preview/Development)
1. Push to any branch (not `main`)
2. Vercel creates a preview deployment
3. Preview uses **TEST** Paystack keys
4. Use test card: `4084084084084081` (CVV: 408, any future expiry)
5. No real money is charged

### Production Flow (Production)
1. Push to `main` branch or deploy to production
2. Production uses **LIVE** Paystack keys
3. Real payments are processed
4. Money goes to your Paystack account

## Quick Reference

| Environment | Branch | Paystack Keys | Payments |
|------------|--------|---------------|----------|
| Development | Any (local) | Test | Fake |
| Preview | Any (not main) | Test | Fake |
| Production | main | Live | Real |

## Verifying Your Setup

After deploying, check the console logs in your browser:

```javascript
// Should show different keys in different environments
console.log('Initializing Paystack with key:', publicKey.substring(0, 15) + '...');

// Test mode: pk_test_...
// Live mode: pk_live_...
```

## Troubleshooting

### Issue: Wrong Paystack keys being used

**Solution**: Check environment variable scope
- Production variables should only have "Production" checked
- Preview/Dev variables should only have "Preview" and "Development" checked

### Issue: Google OAuth not working

**Solution**: Add Vercel URLs to Google Cloud Console authorized redirect URIs

### Issue: NextAuth URL mismatch

**Solution**:
- Production: Set `NEXTAUTH_URL` to your production domain
- Preview/Dev: Don't set it (auto-detected)

## Custom Domain Setup (Production)

1. Go to Project Settings → Domains
2. Add your custom domain (e.g., `beeline.works`)
3. Update `NEXTAUTH_URL` to use custom domain
4. Update Google OAuth redirect URIs
5. Update Paystack webhook URL

---

**Ready for Monday's demo!** 🚀

Preview deployments will use test mode automatically, so you can safely test the full payment flow without charging real money.



redis://default:AVmXAAIncDIzMWYwZjk0NzI5MDc0NWJhYjE3ODdhNDMzODVjOWQ5NnAyMjI5MzU@just-urchin-22935.upstash.io:6379



redis://default:AVmXAAIncDIzMWYwZjk0NzI5MDc0NWJhYjE3ODdhNDMzODVjOWQ5NnAyMjI5MzU@just-urchin-22935.upstash.io:6379
