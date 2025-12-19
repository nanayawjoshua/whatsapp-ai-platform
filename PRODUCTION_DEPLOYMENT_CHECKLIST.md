# 🚀 Production Deployment Checklist - beeline.works

**Client Ready Date:** December 14, 2025
**Objective:** Deploy complete WhatsApp AI platform to production
**Status:** Ready for deployment

---

## Pre-Deployment Verification (DO FIRST)

### ✅ Website Code Status
- [x] Country code selector implemented
- [x] Bridge endpoint fixed (`/api/generate-qr`)
- [x] Admin dashboard built and tested
- [x] All TypeScript compiles without errors
- [x] Environment variables configured

**Action:** Build the website
```bash
cd website
npm run build
```

Expected: `✅ Compiled successfully`

### ✅ Bridge Status
- [ ] Bridge is running on device (`~/beeline/phone_bridge/`)
- [ ] WhatsApp is logged in (connection state: "open")
- [ ] Can access `/health` endpoint
- [ ] Phone number is active on WhatsApp

**Action:** Verify bridge
```bash
curl http://10.36.210.159:3001/health
```

Expected response should show:
```json
{
  "status": "healthy",
  "whatsappConnected": true,
  "connectionState": "open",
  "phoneModel": "TCL_50SE"
}
```

### ✅ Dev Server Works Locally
- [ ] Port 3000 is accessible
- [ ] All pages load: `/`, `/signup`, `/login`, `/dashboard`
- [ ] Signup form submits without errors
- [ ] Admin dashboard shows bridge metrics

**Action:** Test locally
```bash
# Terminal 1: Start dev server
cd website && npm run dev

# Terminal 2: Test homepage
curl http://localhost:3000

# Terminal 3: Test signup
curl -X POST http://localhost:3000/api/auth/initiate-whatsapp \
  -H "Content-Type: application/json" \
  -d '{"phone": "+233543362454"}'
```

---

## Step 1: Build for Production

### Build the Next.js Application
```bash
cd website
npm run build
```

**Expected Output:**
```
> beeline-website@0.1.0 build
> next build

  ▲ Next.js 14.x.x
  ✓ Compiled successfully
  ✓ Linting and type checking
  ✓ Collecting page data
  ✓ Generating static pages
```

**If build fails:** Check TypeScript errors with:
```bash
npm run type-check
```

---

## Step 2: Configure Production Environment Variables

### Create `.env.production`
```bash
# Copy and update these in Vercel Dashboard

# ============================================================================
# SUPABASE (PRODUCTION DATABASE)
# ============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://jwwuggvkjivrnbrlhpbc.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ============================================================================
# PHONE BRIDGE (PRODUCTION)
# ============================================================================
# This should be your production bridge URL
# Option A: Direct IP with ngrok/Cloudflare Tunnel
PHONE_BRIDGE_URL=http://10.36.210.159:3001

# Option B: If using Cloudflare Tunnel
# PHONE_BRIDGE_URL=https://bridge.yourdomain.com

# ============================================================================
# ADMIN CONFIGURATION (CHANGE THIS!)
# ============================================================================
# IMPORTANT: Generate a new secure secret for production
ADMIN_SECRET=<generate-new-secure-secret>

# ============================================================================
# NEXTAUTH CONFIGURATION
# ============================================================================
NEXTAUTH_SECRET=<generate-new-secret-for-production>
NEXTAUTH_URL=https://beeline.works

# ============================================================================
# GOOGLE OAUTH (UPDATE FOR beeline.works)
# ============================================================================
GOOGLE_CLIENT_ID=<production-google-client-id>
GOOGLE_CLIENT_SECRET=<production-google-client-secret>

# ============================================================================
# ENVIRONMENT
# ============================================================================
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://beeline.works
```

### Generate Secure Secrets
```bash
# Generate ADMIN_SECRET
openssl rand -base64 32

# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Save these somewhere secure!
```

---

## Step 3: Setup Domain (beeline.works)

### Option A: Vercel Domain (Easiest)
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Domains
4. Add custom domain: `beeline.works`
5. Update DNS records as shown by Vercel

### Option B: Custom Domain Provider
1. Go to your domain registrar (GoDaddy, Namecheap, etc.)
2. Point DNS to Vercel:
   - A record: `76.76.19.0`
   - CNAME: `cname.vercel-dns.com`
3. Wait for DNS propagation (5-30 minutes)

### Verify Domain
```bash
# After DNS propagates
nslookup beeline.works
ping beeline.works
curl https://beeline.works
```

---

## Step 4: Configure Google OAuth for Production

### Get Production Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new OAuth 2.0 credentials:
   - Application type: Web application
   - Authorized JavaScript origins: `https://beeline.works`
   - Authorized redirect URIs:
     - `https://beeline.works/api/auth/callback/google`
     - `https://beeline.works/api/auth/signin/google`

3. Save the credentials:
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`

---

## Step 5: Deploy to Vercel

### Option A: Via Git (Recommended)
```bash
# Commit your changes
git add .
git commit -m "Chore: Production deployment with admin dashboard and bridge monitoring"
git push origin beeline-main

# Vercel automatically deploys on push (if configured)
```

### Option B: Via Vercel CLI
```bash
npm install -g vercel

# Deploy
vercel --prod

# Enter environment variables when prompted
```

### Option C: Via Vercel Dashboard
1. Go to Vercel Dashboard
2. Select your project
3. Settings → Environment Variables
4. Add all production env vars
5. Click "Redeploy"

---

## Step 6: Setup Bridge Auto-Restart (PM2)

### Install PM2 on Android Device
```bash
ssh -p 8022 u0_a290@10.36.210.159

# Install PM2 globally
npm install -g pm2

# Go to bridge directory
cd ~/beeline/phone_bridge

# Start bridge with PM2
pm2 start phone-bridge-server.js --name "whatsapp-bridge"

# Setup auto-start on device boot
pm2 startup
pm2 save

# Verify it's running
pm2 list
pm2 logs whatsapp-bridge
```

### What This Does
- ✅ Automatically restarts bridge if it crashes
- ✅ Restarts bridge when device reboots
- ✅ Logs all output to files
- ✅ Allows monitoring with `pm2 logs`
- ✅ Can manage multiple processes

### Managing Bridge with PM2
```bash
# View status
pm2 status

# View logs
pm2 logs whatsapp-bridge

# Restart manually
pm2 restart whatsapp-bridge

# Stop
pm2 stop whatsapp-bridge

# Start
pm2 start whatsapp-bridge
```

---

## Step 7: Setup Bridge Stability

### Monitor Bridge Health
```bash
# Check bridge is responding
curl https://beeline.works/api/admin/bridge-status

# Should return bridge health metrics
```

### Handle Disconnections
The bridge will occasionally disconnect from WhatsApp (normal):
- Connection drops: WhatsApp logs out device
- QR code needed: Phone was logged out or session expired
- Auto-reconnect: PM2 will restart the bridge process

**Client should:**
1. Go to `/signup`
2. Scan QR code again with WhatsApp
3. Bridge reconnects automatically

### Monitor from Admin Dashboard
```
URL: https://beeline.works/admin/dashboard
Email: nanayawjoshua@gmail.com
Secret: Janae3lla@2603 (for registration)
```

Dashboard shows:
- ✅ Bridge online/offline status
- ✅ WhatsApp connection state
- ✅ QR generation metrics
- ✅ System uptime

---

## Step 8: Setup Cloudflare Tunnel (Optional but Recommended)

**Why?** Makes bridge accessible without exposing IP, survives IP changes

### Install Cloudflare Tunnel
```bash
ssh -p 8022 u0_a290@10.36.210.159

# Download cloudflared binary
wget https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-arm64

chmod +x cloudflared-linux-arm64

# Login to Cloudflare
./cloudflared-linux-arm64 tunnel login

# Create tunnel
./cloudflared-linux-arm64 tunnel create beeline-bridge

# Configure tunnel (edit ~/.cloudflared/config.yml)
tunnel: beeline-bridge
credentials-file: /root/.cloudflared/uuid.json

ingress:
  - hostname: bridge.beeline.works
    service: http://localhost:3001
  - service: http_status:404

# Start tunnel
./cloudflared-linux-arm64 tunnel run

# Make permanent with PM2
pm2 start ./cloudflared-linux-arm64 --name "cloudflare-tunnel" -- tunnel run
pm2 save
```

### Update Environment Variable
Once tunnel is running:
```
PHONE_BRIDGE_URL=https://bridge.beeline.works
```

---

## Step 9: Pre-Launch Testing

### Test Checklist
- [ ] Website loads on `https://beeline.works`
- [ ] Homepage displays correctly
- [ ] `/signup` page shows country code selector
- [ ] Can enter phone number and see loading state
- [ ] Bridge responds to QR request
- [ ] Can scan QR with WhatsApp on test phone
- [ ] `/dashboard` works for logged-in user
- [ ] `/admin/dashboard` shows bridge metrics
- [ ] Bridge health API returns data
- [ ] All pages are responsive on mobile

### Test Signup Flow
```bash
# Test from terminal
curl -X POST 'https://beeline.works/api/auth/initiate-whatsapp' \
  -H 'Content-Type: application/json' \
  -d '{
    "phone": "+233543362454",
    "countryCode": "+233"
  }'

# Should return QR code
```

### Test Admin Dashboard
```bash
# Register as admin
curl -X POST 'https://beeline.works/api/auth/admin-signup' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "nanayawjoshua@gmail.com",
    "adminSecret": "Janae3lla@2603"
  }'

# Then visit https://beeline.works/admin/dashboard
# Should see bridge metrics updating every 10 seconds
```

---

## Step 10: Client Onboarding

### Your Client Can Now:

1. **Go to:** `https://beeline.works`
2. **Click "Get Started"**
3. **Enter phone number:**
   - Select country (Ghana)
   - Enter local number (543362454)
4. **Scan QR code** with WhatsApp phone
5. **See dashboard** with conversations
6. **AI responds** to messages automatically

### What Happens Behind the Scenes:
1. User enters phone → Website calls bridge
2. Bridge generates QR code → User scans with WhatsApp
3. WhatsApp session established → PM2 keeps bridge running
4. Messages come in → Bridge forwards to AI
5. AI responds → Sent back through bridge
6. Admin can monitor → See bridge health 24/7

---

## Troubleshooting

### Bridge is Offline
```bash
# Check bridge process
ssh -p 8022 u0_a290@10.36.210.159 'pm2 list'

# Restart bridge
ssh -p 8022 u0_a290@10.36.210.159 'pm2 restart whatsapp-bridge'

# Check logs
ssh -p 8022 u0_a290@10.36.210.159 'pm2 logs whatsapp-bridge'
```

### WhatsApp Says "at capacity"
- Normal during reconnection
- Wait 1-2 minutes
- Bridge will auto-reconnect via PM2
- Check admin dashboard for status

### Client Can't Scan QR
- Ensure bridge is online (check admin dashboard)
- Phone must have WhatsApp installed
- Phone must have internet connection
- Try refreshing signup page and generating new QR

### Vercel Deployment Fails
- Check build errors: `npm run build` locally
- Verify environment variables are set
- Check Node.js version compatibility
- View build logs in Vercel dashboard

---

## Summary - What Client Needs to Do

**Your Client:**
1. ✅ Goes to `https://beeline.works`
2. ✅ Enters phone number: `+233543362454`
3. ✅ Scans QR with WhatsApp
4. ✅ Messages start working immediately

**You (Admin):**
1. ✅ Monitor at `/admin/dashboard`
2. ✅ See bridge health in real-time
3. ✅ Restart bridge if needed (via PM2)
4. ✅ Check logs if issues occur

---

## Deployment Timeline

| Step | Time | Status |
|------|------|--------|
| Build for production | 2-3 min | Ready |
| Setup Vercel domain | 5-10 min | Ready |
| Deploy to Vercel | 2-3 min | Ready |
| Setup PM2 auto-restart | 5 min | Ready |
| DNS propagation | 5-30 min | Wait |
| Test end-to-end | 10 min | Ready |
| **Total** | **30-60 min** | **Ready** |

---

## Post-Launch Monitoring

### Daily
- [ ] Check admin dashboard shows "Online"
- [ ] Monitor bridge metrics
- [ ] Restart bridge if needed

### Weekly
- [ ] Review bridge logs
- [ ] Check QR generation success rate
- [ ] Monitor platform metrics

### Monthly
- [ ] Update dependencies
- [ ] Review security logs
- [ ] Scale if needed (add more bridges)

---

## Quick Command Reference

```bash
# Local development
cd website && npm run dev

# Build for production
npm run build

# Start dev server
npm run start

# Check bridge (on device)
curl http://127.0.0.1:3001/health

# Restart bridge (on device)
pm2 restart whatsapp-bridge

# View bridge logs (on device)
pm2 logs whatsapp-bridge

# Deploy to Vercel
vercel --prod
```

---

**Your platform is ready to go live! 🚀**

Follow this checklist and your client will be up and running in less than an hour.
