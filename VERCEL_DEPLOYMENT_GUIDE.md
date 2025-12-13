# Vercel Deployment Guide - BUZZ MVP

**Date:** December 13, 2025
**Status:** Ready for Deployment
**Phase:** 5.1a Complete → Vercel Deployment

---

## Overview

This guide walks through deploying the BUZZ MVP website to Vercel, including:
1. Environment configuration
2. Deployment steps
3. Vercel dashboard setup
4. Bridge tunnel configuration
5. Post-deployment verification

---

## Step 1: Environment Files Setup

### Files Created

✅ **`.env.local`** (for local development)
```
NEXT_PUBLIC_SUPABASE_URL=https://jwwuggvkjivrnbrlhpbc.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
PHONE_BRIDGE_URL=http://localhost:3001
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

✅ **`.env.production`** (for Vercel production)
```
NEXT_PUBLIC_SUPABASE_URL=https://jwwuggvkjivrnbrlhpbc.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJ...
SUPABASE_SERVICE_KEY=eyJ...
PHONE_BRIDGE_URL=https://your-tunnel-url.trycloudflare.com  # ← UPDATE THIS
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.vercel.app  # ← UPDATE THIS
```

### Key Differences

| Variable | Development | Production |
|----------|-------------|-----------|
| `PHONE_BRIDGE_URL` | `http://localhost:3001` | Cloudflare/ngrok tunnel URL |
| `NODE_ENV` | `development` | `production` |
| `NEXT_PUBLIC_APP_URL` | `http://localhost:3000` | Vercel domain URL |

---

## Step 2: Setup Bridge Tunnel (Cloudflare Recommended)

### Option A: Cloudflare Tunnel (Recommended for Production)

Cloudflare tunnel is more stable and faster than ngrok for production.

```bash
# 1. SSH into the Android device
ssh -p 8022 u0_a290@10.36.210.159

# 2. Download Cloudflare tunneling tool
# (Instructions depend on your setup)

# 3. Create a tunnel pointing to bridge:3001
# This gives you a public URL like: https://mybridge-xyz.trycloudflare.com

# 4. Update .env.production with the tunnel URL
# PHONE_BRIDGE_URL=https://mybridge-xyz.trycloudflare.com
```

### Option B: ngrok Tunnel (Temporary/Testing)

If you already have ngrok set up:

```bash
# 1. Start ngrok tunnel
ngrok http 3001

# 2. Copy the public URL (e.g., https://abcd-1234.ngrok.io)

# 3. Update .env.production
# PHONE_BRIDGE_URL=https://abcd-1234.ngrok.io
```

### Option C: Check What's Available

```bash
# SSH into device to see what tunneling is available
ssh -p 8022 u0_a290@10.36.210.159 "ls -la ~ | grep -E 'ngrok|cloudflare|tunnel'"

# Check running processes
ssh -p 8022 u0_a290@10.36.210.159 "ps aux | grep -E 'ngrok|cloudflare|tunnel'"
```

---

## Step 3: Install Vercel CLI (if not already installed)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Verify installation
vercel --version

# Login to Vercel (opens browser)
vercel login
```

---

## Step 4: Deploy to Vercel

### Method 1: Using Deployment Script

```bash
# Automated deployment (recommended)
bash DEPLOY_BEELINE_MVP.sh deploy
```

This will:
- Update website environment variables
- Deploy to Vercel (with interactive setup)
- Prompt for environment variable configuration
- Show deployment success/status

### Method 2: Manual Vercel Deployment

```bash
# Navigate to website directory
cd website

# Build locally to verify
npm run build

# Deploy to Vercel
vercel --prod

# You'll be prompted to:
# 1. Link to existing project or create new
# 2. Confirm project name
# 3. Set deployment directory (./  is fine)
# 4. Don't overwrite build settings
```

### Method 3: Git-based Deployment

```bash
# Commit your .env.production updates
git add website/.env.production
git commit -m "Add production environment variables for Vercel"

# Push to GitHub/GitLab/Bitbucket
git push origin master

# Vercel will auto-deploy if project is connected
# (You can connect in Vercel dashboard)
```

---

## Step 5: Configure Environment Variables in Vercel

After initial deployment, set environment variables in Vercel dashboard:

### Via Vercel CLI

```bash
# Set each variable
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://jwwuggvkjivrnbrlhpbc.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_KEY
# Paste: eyJ...

vercel env add SUPABASE_SERVICE_KEY
# Paste: eyJ...

vercel env add PHONE_BRIDGE_URL
# Paste: https://your-tunnel-url.trycloudflare.com

vercel env add NODE_ENV
# Paste: production

vercel env add NEXT_PUBLIC_APP_URL
# Paste: https://your-vercel-domain.vercel.app

# Deploy with new env vars
vercel --prod
```

### Via Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. Click **Settings** → **Environment Variables**
4. Add each variable:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_KEY`
   - `SUPABASE_SERVICE_KEY`
   - `PHONE_BRIDGE_URL`
   - `NODE_ENV`
   - `NEXT_PUBLIC_APP_URL`
5. Click "Save"
6. Redeploy: Click **Deployments** → **Redeploy** on latest deployment

---

## Step 6: Update .env.production with Real Values

**Before redeploying**, update the placeholder values:

```bash
# Edit .env.production
# Replace these values with real ones:

# 1. Get your Vercel deployment URL
# Go to vercel.com/dashboard → Your Project → Domains
# Copy the production domain (e.g., beeline-website.vercel.app)
NEXT_PUBLIC_APP_URL=https://beeline-website.vercel.app

# 2. Get your bridge tunnel URL
# From Cloudflare / ngrok
PHONE_BRIDGE_URL=https://your-actual-tunnel-url.trycloudflare.com
```

Then redeploy:
```bash
vercel --prod
```

---

## Step 7: Verify Deployment

### Test Website Access

```bash
# Open your Vercel domain in browser
# https://your-domain.vercel.app

# Check that:
# ✅ Homepage loads
# ✅ Signup form visible
# ✅ No console errors (F12)
# ✅ Can see network requests to bridge
```

### Test Bridge Connectivity

```bash
# From your local machine
curl https://your-domain.vercel.app  # Should return HTML

# Check bridge is reachable
curl https://your-tunnel-url.trycloudflare.com/health
# Should return: {"status":"unhealthy","phoneModel":"TCL_50SE",...}

# Check website can talk to bridge
# Open browser console on your Vercel site and check network tab
# POST /api/send-message should reach your bridge
```

### Monitoring in Vercel Dashboard

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project
3. View:
   - **Deployments** - see all versions deployed
   - **Analytics** - traffic and performance
   - **Logs** - server-side logs
   - **Functions** - edge function performance

---

## Step 8: Continuous Deployment (Optional)

### Setup Auto-Deploy on Git Push

1. Go to Vercel project settings
2. Click **Git** → **Connected Repository**
3. Select your GitHub/GitLab repo
4. Choose branch to auto-deploy (e.g., `master`)
5. Now every push to master auto-deploys

---

## Common Issues & Troubleshooting

### Issue: Bridge URL Not Working

```bash
# 1. Verify tunnel is still running
ssh -p 8022 u0_a290@10.36.210.159 "ps aux | grep ngrok"

# 2. Check bridge is responding
ssh -p 8022 u0_a290@10.36.210.159 "curl http://localhost:3001/health"

# 3. Test tunnel URL directly
curl https://your-tunnel-url.trycloudflare.com/health

# If tunnel stopped, restart it
ssh -p 8022 u0_a290@10.36.210.159 "ngrok http 3001"
```

### Issue: Environment Variables Not Loading

```bash
# 1. Verify in Vercel dashboard
# Settings → Environment Variables (check they're there)

# 2. Redeploy to apply env vars
vercel --prod

# 3. Check in browser
# Open https://your-domain.vercel.app
# F12 → Network → Check request headers
# Should see Supabase calls in Network tab
```

### Issue: CORS Error from Bridge

If you see CORS errors, the bridge needs to allow your Vercel domain:

```bash
# Edit bridge server to add CORS headers
ssh -p 8022 u0_a290@10.36.210.159 "nano ~/beeline/phone_bridge/phone-bridge-server.js"

# Find the Express app initialization, add:
# app.use(cors({
#   origin: ['http://localhost:3000', 'https://your-vercel-domain.vercel.app'],
#   credentials: true
# }));

# Restart bridge
ssh -p 8022 u0_a290@10.36.210.159 "pkill -f 'phone-bridge' && sleep 2 && cd ~/beeline/phone_bridge && nohup node phone-bridge-server.js > ~/bridge.log 2>&1 &"
```

### Issue: Build Failures on Vercel

```bash
# Check build logs in Vercel dashboard
# Deployments → Failed deployment → View Logs

# Common causes:
# 1. Missing environment variables → Add them in dashboard
# 2. TypeScript errors → Run locally: npm run build
# 3. Dependency issues → npm install --legacy-peer-deps

# If needed, update build settings
# Settings → Build & Development Settings
# Build Command: npm run build
# Output Directory: .next
```

---

## Post-Deployment Testing

### E2E Test Against Vercel

```bash
# Update DEPLOY_BEELINE_MVP.sh to use Vercel URL
# Then run E2E tests against production:
bash DEPLOY_BEELINE_MVP.sh test
```

### Manual Test Flow

1. **Open Website**
   ```
   https://your-vercel-domain.vercel.app
   ```

2. **Enter Vendor Phone Number**
   ```
   +233 504 123 456 (or your test number)
   ```

3. **Click "Register as Vendor"**
   - Should save to Supabase
   - Should get success message

4. **Send Test Message** (if vendor QR scanned)
   ```
   Message: "Hello, test message"
   Classification: "inquiry"
   ```

5. **Verify in Supabase**
   - Check `vendors` table for new record
   - Check `conversations` table for message history
   - Check `message_log` table for all messages

---

## Deployment Checklist

Before marking deployment complete:

- [ ] `.env.production` created with real values
- [ ] Bridge tunnel URL configured (Cloudflare or ngrok)
- [ ] Vercel CLI installed and logged in
- [ ] Website deployed to Vercel
- [ ] Environment variables set in Vercel dashboard
- [ ] Website homepage loads at Vercel domain
- [ ] Bridge connectivity verified (health endpoint accessible)
- [ ] No CORS errors in browser console
- [ ] Can access Supabase from Vercel site
- [ ] E2E test suite runs against Vercel deployment

---

## Next Steps After Deployment

1. **Verify E2E Flow**
   - Have vendor scan QR code (if not done)
   - Send test message through website
   - Verify response captured in Supabase

2. **Monitor Performance**
   - Check Vercel analytics dashboard
   - Monitor bridge logs for errors
   - Set up error alerts (optional)

3. **Phase 5.2 - Message Safety**
   - Implement message variation
   - Add rate limiting
   - Add human-like delays
   - Update anti-bot detection

4. **Phase 6 - Scale & Monitor**
   - Set up monitoring dashboard
   - Implement auto-scaling
   - Add comprehensive logging
   - Prepare for production load

---

## Quick Command Reference

```bash
# Deployment
bash DEPLOY_BEELINE_MVP.sh deploy           # Automated deployment
vercel --prod                               # Manual deployment
vercel --prod --token=$VERCEL_TOKEN         # CI/CD deployment

# Monitoring
vercel logs --follow                        # Real-time logs
vercel env list                             # List environment variables
vercel env add VAR_NAME                     # Add environment variable

# Bridge
ssh -p 8022 u0_a290@10.36.210.159 "curl http://localhost:3001/health"  # Health check
ssh -p 8022 u0_a290@10.36.210.159 "tail -f ~/bridge.log"               # Live logs

# Testing
bash DEPLOY_BEELINE_MVP.sh test              # Run E2E tests
curl https://your-domain.vercel.app          # Test website access
```

---

**Status:** Ready for Vercel Deployment ✅
**Last Updated:** 2025-12-13
**Next Phase:** Phase 5.2 (Message Safety Features)

