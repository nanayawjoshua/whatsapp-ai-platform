# Vercel Environment Variables Setup - Dashboard Method

**Status:** Ready to Configure
**Time Required:** 2-3 minutes
**Date:** December 13, 2025

---

## Quick Summary

Your Vercel deployment is configured and ready to build. You just need to add 5 environment variables in the Vercel Dashboard to enable:
- Supabase database connection
- WhatsApp bridge connectivity
- Production environment settings

---

## Step 1: Open Vercel Dashboard

**URL:** https://vercel.com/dashboard

1. Sign in with your Vercel account
2. Look for project: **whatsapp-ai-platform** (or beeline-website if renamed)
3. Click the project name to open it

---

## Step 2: Navigate to Environment Variables

**Path:** Project Settings → Environment Variables

1. Click the **Settings** button (top menu)
2. Click **Environment Variables** (left sidebar)
3. You should see an empty list (or existing variables from manual CLI setup)

---

## Step 3: Add 5 Environment Variables

Add each variable below with **Production** scope selected.

### Variable 1: NEXT_PUBLIC_SUPABASE_URL

```
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: https://jwwuggvkjivrnbrlhpbc.supabase.co
Scope: Production
```

Click **Add** after entering

---

### Variable 2: NEXT_PUBLIC_SUPABASE_KEY

```
Name:  NEXT_PUBLIC_SUPABASE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d3VnZ3Zraml2cm5icmxocGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NzQ1NzksImV4cCI6MjA4MTE1MDU3OX0.DMGcj35QqJEDNTXpjfBJoNgSFNa_yiz82lWzyQko-XU
Scope: Production
```

Click **Add** after entering

---

### Variable 3: SUPABASE_SERVICE_KEY

```
Name:  SUPABASE_SERVICE_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d3VnZ3Zraml2cm5icmxocGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU3NDU3OSwiZXhwIjoyMDgxMTUwNTc5fQ.z9x2SX1Y6RBwrCFToScTjLv3kq5qvHJPi7arBWd17wg
Scope: Production
```

Click **Add** after entering

---

### Variable 4: PHONE_BRIDGE_URL

⚠️ **IMPORTANT:** Update this with your actual bridge tunnel URL before adding

**Get your bridge tunnel URL:**

**Option A: ngrok (if running on Android device)**
```bash
ssh -p 8022 u0_a290@10.36.210.159 "./ngrok http 3001"
# Look for: "Forwarding  https://xxxx-xxxx.ngrok.io -> http://localhost:3001"
# Use the ngrok URL: https://xxxx-xxxx.ngrok.io
```

**Option B: Cloudflare Tunnel**
- Check your Cloudflare dashboard for the tunnel URL
- Format: `https://mybridge-xyz.trycloudflare.com`

**Then add the variable:**
```
Name:  PHONE_BRIDGE_URL
Value: https://your-actual-tunnel-url-here
Scope: Production
```

Click **Add** after entering

---

### Variable 5: NODE_ENV

```
Name:  NODE_ENV
Value: production
Scope: Production
```

Click **Add** after entering

---

## Step 4: Verify All Variables Added

After adding all 5 variables, your Environment Variables page should show:

```
✓ NEXT_PUBLIC_SUPABASE_URL     (Production)
✓ NEXT_PUBLIC_SUPABASE_KEY     (Production)
✓ SUPABASE_SERVICE_KEY         (Production)
✓ PHONE_BRIDGE_URL             (Production)
✓ NODE_ENV                     (Production)
```

---

## Step 5: Trigger Redeploy

Now Vercel needs to rebuild with the new environment variables:

1. Go to **Deployments** tab (top menu)
2. Click the most recent deployment (should be from commit 7c23885)
3. Click the **Redeploy** button (three dots → Redeploy)
4. Vercel will:
   - Apply the environment variables
   - Run the build command
   - Deploy to production

**Expected build time:** 3-5 minutes

---

## Step 6: Monitor Build Progress

1. Click the redeployed deployment to view logs
2. Look for these success indicators:
   ```
   ✓ Build completed
   ✓ Function bundled successfully
   ✓ Deployment ready
   ```

3. If errors occur, click "Logs" tab to see details

---

## Step 7: Verify Website Is Live

Once build completes successfully:

1. Copy the deployment URL (format: `https://beeline-website.vercel.app`)
2. Open it in browser
3. Check:
   ```
   ✓ Page loads without errors
   ✓ No 404 errors
   ✓ Signup form visible
   ✓ Open F12 console - check for CORS errors
   ```

---

## Step 8: Verify Bridge Connectivity

Test that the website can reach your bridge:

**From your local machine:**
```bash
# Replace with your actual bridge tunnel URL
curl https://your-actual-tunnel-url-here/health

# Should return 200 status with "Ok" or similar response
```

**From browser console (on deployed website):**
```javascript
fetch('https://your-actual-tunnel-url-here/health')
  .then(r => r.json())
  .then(console.log)
  .catch(console.error)
```

---

## Troubleshooting

### Build Still Fails After Adding Variables

**Check:**
1. All 5 variable names spelled exactly as above (case-sensitive)
2. All values copied without extra spaces
3. PHONE_BRIDGE_URL points to a working tunnel

**View logs:**
- Go to Deployments → Click failed deployment → Logs tab
- Look for specific error message

---

### Website Loads But No Bridge Connection

**Verify:**
1. Bridge tunnel is still running: `ssh -p 8022 u0_a290@10.36.210.159 "pgrep ngrok"`
2. Bridge is responding: `curl https://your-tunnel-url/health`
3. Check browser console (F12) for CORS or connection errors
4. Verify PHONE_BRIDGE_URL in Vercel matches your actual tunnel URL

---

### Environment Variables Not Loading

**Solution:**
1. Verify variables exist in Vercel Dashboard
2. Redeploy again: Deployments → Click deployment → Redeploy
3. Wait 30 seconds for rebuild to start
4. Check Logs tab during rebuild

---

## Environment Variables Reference

| Variable | Purpose | Scope |
|----------|---------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | Database connection (public) | Production |
| `NEXT_PUBLIC_SUPABASE_KEY` | Supabase auth key (public) | Production |
| `SUPABASE_SERVICE_KEY` | Supabase backend key (private) | Production |
| `PHONE_BRIDGE_URL` | Bridge server tunnel URL | Production |
| `NODE_ENV` | Environment mode | Production |

---

## Next Steps After Deployment

1. ✅ Add environment variables (THIS STEP)
2. ✅ Verify website loads and connects to bridge
3. 🔄 Run E2E tests with bridge
4. 🔄 Have vendor scan QR code with WhatsApp
5. 🔄 Send test message through website
6. 🔄 Verify message reaches vendor and response captured

---

## Command Reference

**Get bridge tunnel URL (ngrok):**
```bash
ssh -p 8022 u0_a290@10.36.210.159 "./ngrok http 3001"
```

**Test bridge health:**
```bash
curl https://your-tunnel-url/health
```

**View Vercel deployments:**
```bash
vercel list
```

**Check build logs:**
Visit Vercel Dashboard → Deployments → Click deployment → Logs

---

**Last Updated:** December 13, 2025
**Configuration Status:** ✅ Ready for Environment Variable Setup
**Next Action:** Add 5 variables in Vercel Dashboard & redeploy

