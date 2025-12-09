# Vercel Environment Setup Guide

**🚨 CRITICAL: You Must Do This Now to Fix 500 Error**

The WhatsApp endpoint will fail with 500 until you set `CLOUD_BRIDGE_URL` environment variable.

## ⚡ Quick Fix (5 minutes)

### Step 1: Go to Vercel Dashboard
```
https://vercel.com/dashboard
```

### Step 2: Select Your Beeline Project
Click on "beeline-website" or your project name

### Step 3: Click Settings
Top menu → Settings

### Step 4: Click Environment Variables
Left sidebar → Environment Variables

### Step 5: Add These 6 Variables
For EACH variable, click "Add New" and fill in:

**Variable 1:**
```
Name: CLOUD_BRIDGE_URL
Value: https://beeline-bridge.onrender.com
Environments: ✓ Production  ✓ Preview  ✓ Development
```

**Variable 2:**
```
Name: NEXTAUTH_SECRET
Value: toRMbFTMmaqdl96N/i985MNXqwcEDDrnBTs6+/6xxm8=
Environments: ✓ Production  ✓ Preview  ✓ Development
```

**Variable 3:**
```
Name: NEXTAUTH_URL
Value: https://beeline.works
Environments: ✓ Production  ✓ Preview  ✓ Development
```

**Variable 4:**
```
Name: GOOGLE_CLIENT_ID
Value: 236111634034-8jeeps5grj1qmrm7idm8fmj6fi1didvf.apps.googleusercontent.com
Environments: ✓ Production  ✓ Preview  ✓ Development
```

**Variable 5:**
```
Name: GOOGLE_CLIENT_SECRET
Value: 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
Environments: ✓ Production  ✓ Preview  ✓ Development
```

**Variable 6:**
```
Name: DATABASE_URL
Value: postgresql://neondb_owner:npg_wkI9d3RebGKO@ep-silent-lake-ad3vhsoo-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
Environments: ✓ Production  ✓ Preview  ✓ Development
```

### Step 6: Click Save on Each Variable
After adding all 6, they'll all be saved

### Step 7: Redeploy
1. Go to "Deployments" tab
2. Click the latest deployment
3. Click "Redeploy" button
4. Wait 2-3 minutes for build

### Step 8: Test It
1. Go to: https://beeline.works/signup
2. Enter phone: 0203772824
3. Click "Connect WhatsApp"
4. You should see a QR code (not a 500 error!)

---

## Why This Is Required

| Variable | Purpose | If Missing |
|----------|---------|------------|
| `CLOUD_BRIDGE_URL` | Points to WhatsApp bridge | 500 error |
| `NEXTAUTH_SECRET` | Session encryption | Login fails |
| `NEXTAUTH_URL` | Auth callback domain | OAuth fails |
| `GOOGLE_CLIENT_ID` | Google OAuth | Sign in fails |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Sign in fails |
| `DATABASE_URL` | PostgreSQL connection | Admin/database fails |

---

## Verification

After redeploy, check Vercel logs:
- Go to latest deployment
- Click "Logs"
- Look for: `🔗 Bridge configuration: { ... hasEnv: true ...}`
- If `hasEnv: true` ✅ → Variables are set
- If `hasEnv: false` ❌ → Variables not set (go back to Step 5)

---

## Done! ✅

Once variables are set and deployed:
- ✅ WhatsApp connections will work
- ✅ Google OAuth will work
- ✅ Admin dashboard will work
- ✅ Next: Test with real phone number

---

## Legacy Content Below

(Previous detailed setup information follows...)
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
