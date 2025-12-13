# Vercel Deployment - Quick Start Guide

**Status:** Ready to Deploy
**Date:** December 13, 2025
**Requirements:** Vercel CLI + Bridge Tunnel URL

---

## One-Command Deployment (After Setup)

Once Vercel CLI is installed and you have your bridge tunnel URL:

```bash
# 1. Update production environment file
# Edit: website/.env.production
# Replace: PHONE_BRIDGE_URL=https://your-actual-tunnel-url.trycloudflare.com
# Replace: NEXT_PUBLIC_APP_URL=https://your-vercel-domain.vercel.app

# 2. Deploy to Vercel
cd whatsapp-ai-platform-beeline-main/website
vercel --prod

# 3. Configure environment variables in Vercel Dashboard
# https://vercel.com/dashboard → Select Project → Settings → Environment Variables
```

---

## Manual Step-by-Step Deployment

### Step 1: Install Vercel CLI (If Not Already Done)

```bash
npm install -g vercel
vercel --version  # Verify installation
```

### Step 2: Login to Vercel

```bash
vercel login
# Opens browser for authentication
# Creates ~/.vercelrc with credentials
```

### Step 3: Update Production Environment File

Edit `website/.env.production`:

```bash
# Find your bridge tunnel URL first
# Option A: Cloudflare tunnel (check your Cloudflare dashboard)
# Option B: ngrok tunnel (get from Android device)
#   ssh -p 8022 u0_a290@10.36.210.159 "cat ~/ngrok_tunnel_url.txt"

# Then update:
PHONE_BRIDGE_URL=https://your-actual-tunnel-url-here
NEXT_PUBLIC_APP_URL=https://beeline-website.vercel.app
```

### Step 4: Build Website Locally (Verify No Errors)

```bash
cd whatsapp-ai-platform-beeline-main/website
npm install --legacy-peer-deps
npm run build

# If build fails, fix errors before deploying
```

### Step 5: Deploy to Vercel

```bash
# From website directory
vercel --prod

# Or if not linked yet:
vercel --prod --name beeline-website

# Vercel will:
# 1. Create project (if new)
# 2. Build website
# 3. Deploy to production URL
# 4. Show deployment URL
```

### Step 6: Set Environment Variables in Vercel

```bash
# Method A: Via CLI
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://jwwuggvkjivrnbrlhpbc.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_KEY
# Paste: eyJ...

vercel env add SUPABASE_SERVICE_KEY
# Paste: eyJ...

vercel env add PHONE_BRIDGE_URL
# Paste: https://your-tunnel-url

vercel env add NODE_ENV
# Paste: production

vercel env add NEXT_PUBLIC_APP_URL
# Paste: https://your-vercel-domain.vercel.app

# Then redeploy to apply variables
vercel --prod
```

OR

```bash
# Method B: Via Dashboard
# 1. Go to https://vercel.com/dashboard
# 2. Select your project
# 3. Click Settings → Environment Variables
# 4. Add each variable from .env.production
# 5. Redeploy the latest deployment
```

### Step 7: Verify Deployment

```bash
# Check website loads
curl https://your-vercel-domain.vercel.app

# Check bridge connectivity
curl https://your-tunnel-url/health

# Open in browser
https://your-vercel-domain.vercel.app
```

---

## What Happens During Deployment

```
┌─────────────────────────────────────────────────────────┐
│ Your Computer                                           │
│ ┌───────────────────────────────────────────────────┐   │
│ │ vercel --prod                                     │   │
│ │ 1. Reads .env.production                          │   │
│ │ 2. Builds Next.js project (npm run build)         │   │
│ │ 3. Uploads build to Vercel servers                │   │
│ └───────────────┬─────────────────────────────────┘   │
│                 │                                      │
│                 ▼                                      │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Vercel Servers                                   │  │
│  │ 1. Runs build command                            │  │
│  │ 2. Sets environment variables                    │  │
│  │ 3. Deploys to Edge Network (worldwide)           │  │
│  │ 4. Assigns domain: beeline-website.vercel.app    │  │
│  │ 5. Creates deployment URL                        │  │
│  └──────────────────────────────────────────────────┘  │
│                                                        │
│  ✅ Deployment Complete                               │
│  Your website is now live on Vercel!                  │
└─────────────────────────────────────────────────────────┘
```

---

## Environment Variables Explained

| Variable | Value | Purpose |
|----------|-------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jwwu...` | Database URL (public) |
| `NEXT_PUBLIC_SUPABASE_KEY` | `eyJ...` | Public auth key |
| `SUPABASE_SERVICE_KEY` | `eyJ...` | Backend auth key |
| `PHONE_BRIDGE_URL` | `https://tunnel-url` | Bridge server location |
| `NODE_ENV` | `production` | Environment mode |
| `NEXT_PUBLIC_APP_URL` | `https://vercel-domain` | Website URL |

---

## Getting Your URLs

### Bridge Tunnel URL

**Option A: Cloudflare Tunnel**
```bash
# Check Cloudflare dashboard for tunnel URL
# Format: https://mybridge-xyz.trycloudflare.com
```

**Option B: ngrok Tunnel**
```bash
# Get from Android device
ssh -p 8022 u0_a290@10.36.210.159 "ps aux | grep ngrok"

# Look for output like:
# https://abcd-1234.ngrok.io
```

### Vercel Domain

After deployment:
```bash
# Check in Vercel dashboard
# Or from CLI output
# Format: https://beeline-website.vercel.app
```

---

## Troubleshooting

### Build Fails with TypeScript Errors

```bash
# Fix issues locally first
cd website
npm run build  # See actual errors

# Common fixes:
# 1. Missing dependencies: npm install --legacy-peer-deps
# 2. Environment variables: Check .env.production
# 3. Type errors: Check website/tsconfig.json
```

### Environment Variables Not Loading

```bash
# 1. Verify in Vercel Dashboard
# Settings → Environment Variables (confirm they're there)

# 2. Redeploy
vercel --prod

# 3. Check in browser
# F12 → Network tab → Check requests to bridge
```

### Bridge Not Reachable from Vercel

```bash
# 1. Verify tunnel is running
ssh -p 8022 u0_a290@10.36.210.159 "ps aux | grep ngrok"

# 2. Test tunnel from local machine
curl https://your-tunnel-url/health

# 3. Check bridge firewall/CORS
# Bridge may need to allow Vercel domain in CORS headers
```

### Domain Issues

```bash
# Vercel auto-assigns domain, but you can add custom domain:
# 1. Go to Vercel Dashboard
# 2. Project Settings → Domains
# 3. Add your custom domain
# 4. Update DNS records as instructed
```

---

## After Deployment

### 1. Test Website

```bash
# Open in browser
https://your-vercel-domain.vercel.app

# Check:
# ✅ Page loads
# ✅ No console errors (F12)
# ✅ Signup form visible
# ✅ Bridge connectivity works
```

### 2. Run E2E Tests

```bash
# Test against production
bash DEPLOY_BEELINE_MVP.sh test

# Or manually:
curl https://your-vercel-domain.vercel.app
curl https://your-tunnel-url/health
```

### 3. Have Vendor Scan QR Code

Once website is live:
- Point vendor to Vercel domain
- Have them sign up with phone number
- Display QR code from bridge logs
- Have vendor scan with WhatsApp

### 4. Test Full Message Flow

1. User opens website
2. User enters phone number
3. User clicks "Register as Vendor"
4. Message sent through Vercel → Bridge → WhatsApp
5. Vendor responds
6. Response stored in Supabase

---

## Continuous Deployment (Optional)

Connect GitHub for auto-deploy on push:

```bash
# 1. Push code to GitHub
git add .
git commit -m "Vercel deployment setup"
git push origin master

# 2. In Vercel Dashboard
# Settings → Git → Connect Repository
# Select your GitHub repo and branch

# 3. Now every push to master auto-deploys!
```

---

## Command Reference

```bash
# Install & Login
npm install -g vercel
vercel login

# Deploy
vercel --prod

# List deployments
vercel list

# Check logs
vercel logs

# Set environment variable
vercel env add VAR_NAME

# Remove variable
vercel env rm VAR_NAME

# List variables
vercel env list
```

---

## Next Steps

1. **Get bridge tunnel URL** (Cloudflare or ngrok)
2. **Update `.env.production`** with actual URLs
3. **Install Vercel CLI** (if not done): `npm install -g vercel`
4. **Login to Vercel**: `vercel login`
5. **Deploy**: `cd website && vercel --prod`
6. **Set environment variables** in Vercel Dashboard
7. **Run E2E tests** against production
8. **Have vendor scan QR code**
9. **Complete full message flow test**

---

**Status:** ✅ Ready to Deploy
**Estimated Time:** 5-10 minutes for deployment
**Estimated Time:** 1-2 hours for full E2E test with vendor

