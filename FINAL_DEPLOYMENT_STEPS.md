# ✅ FINAL DEPLOYMENT STEPS - Ready to Deploy

**Status:** ALL SYSTEMS GO ✅
**Time to Deploy:** 60 minutes
**Client Status:** WAITING

---

## Your Credentials (Already Have These ✅)

### Google OAuth
```
GOOGLE_CLIENT_ID=236111634034-8jeeps5grj1qmrm7idm8fmj6fi1didvf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Supabase
```
SUPABASE_URL=https://jwwuggvkjivrnbrlhpbc.supabase.co
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d3VnZ3Zraml2cm5icmxocGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU3NDU3OSwiZXhwIjoyMDgxMTUwNTc5fQ.z9x2SX1Y6RBwrCFToScTjLv3kq5qvHJPi7arBWd17wg
NEXT_PUBLIC_SUPABASE_URL=https://jwwuggvkjivrnbrlhpbc.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d3VnZ3Zraml2cm5icmxocGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NzQ1NzksImV4cCI6MjA4MTE1MDU3OX0.DMGcj35QqJEDNTXpjfBJoNgSFNa_yiz82lWzyQko-XU
```

### Admin Secret
```
ADMIN_SECRET=Erama@2603
```

### Bridge
```
PHONE_BRIDGE_URL=http://10.36.210.159:3001 (for local)
PHONE_BRIDGE_URL=https://bridge.beeline.works (for production)
```

---

## STEP 1: Build for Production (5 minutes)

### Compile the Website
```bash
cd website
npm run build
```

Expected output:
```
✓ Compiled successfully
✓ Linting and type checking
✓ Collecting page data
✓ Generating static pages
```

If you get errors:
```bash
npm run type-check
```

---

## STEP 2: Setup Cloudflare Tunnel (15 minutes)

**Follow:** `CLOUDFLARE_TUNNEL_SETUP.md`

### Quick Steps:

1. **Ensure domain uses Cloudflare DNS**
   - Go to https://dash.cloudflare.com
   - Add domain: `beeline.works`
   - Update nameservers at registrar

2. **Create tunnel on your device:**
   ```bash
   ssh -p 8022 u0_a290@10.36.210.159
   cd ~/beeline/phone_bridge

   # Download cloudflared
   wget https://github.com/cloudflare/cloudflared/releases/download/2024.12.0/cloudflared-linux-arm64
   chmod +x cloudflared-linux-arm64

   # Authenticate
   ./cloudflared-linux-arm64 tunnel login

   # Create tunnel
   ./cloudflared-linux-arm64 tunnel create beeline-bridge
   ```

3. **Configure tunnel:**
   ```bash
   mkdir -p ~/.cloudflared
   nano ~/.cloudflared/config.yml
   ```

   Add:
   ```yaml
   tunnel: beeline-bridge
   credentials-file: /root/.cloudflared/<UUID>.json

   ingress:
     - hostname: bridge.beeline.works
       service: http://127.0.0.1:3001
     - service: http_status:404
   ```

4. **Add route in Cloudflare Dashboard:**
   - Go to **Networks** → **Tunnels**
   - Select `beeline-bridge`
   - **Public Hostnames** → **Create**
   - Subdomain: `bridge`
   - Domain: `beeline.works`
   - Service: `HTTP`
   - URL: `http://127.0.0.1:3001`

5. **Run with PM2:**
   ```bash
   npm install -g pm2

   pm2 start "~/beeline/phone_bridge/cloudflared-linux-arm64" \
     --name "cloudflare-tunnel" \
     -- tunnel run beeline-bridge

   pm2 startup
   pm2 save
   ```

6. **Test:**
   ```bash
   curl https://bridge.beeline.works/health
   ```
   Should return bridge status JSON.

---

## STEP 3: Deploy to Vercel (10 minutes)

### Update Environment Variables in Vercel Dashboard

1. Go to https://vercel.com/dashboard
2. Select project: **beeline**
3. **Settings** → **Environment Variables**
4. Add these for **Production**:

```
NEXT_PUBLIC_SUPABASE_URL=https://jwwuggvkjivrnbrlhpbc.supabase.co
NEXT_PUBLIC_SUPABASE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d3VnZ3Zraml2cm5icmxocGJjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjU1NzQ1NzksImV4cCI6MjA4MTE1MDU3OX0.DMGcj35QqJEDNTXpjfBJoNgSFNa_yiz82lWzyQko-XU
SUPABASE_SERVICE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imp3d3VnZ3Zraml2cm5icmxocGJjIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2NTU3NDU3OSwiZXhwIjoyMDgxMTUwNTc5fQ.z9x2SX1Y6RBwrCFToScTjLv3kq5qvHJPi7arBWd17wg

PHONE_BRIDGE_URL=https://bridge.beeline.works

ADMIN_SECRET=Erama@2603

NEXTAUTH_URL=https://beeline.works
NEXTAUTH_SECRET=<generate-new-secure-secret>

GOOGLE_CLIENT_ID=236111634034-8jeeps5grj1qmrm7idm8fmj6fi1didvf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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

NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://beeline.works
```

### Generate Secure Secret
```bash
openssl rand -base64 32
# Copy output and paste as NEXTAUTH_SECRET
```

### Deploy

**Option A: Push to git (auto-deploy)**
```bash
git add .
git commit -m "Production deployment: Cloudflare tunnel and OAuth configured"
git push origin beeline-main
```

**Option B: Redeploy in Vercel**
1. Go to **Deployments**
2. Click **Redeploy** on latest
3. Wait for build (2-3 min)

### Test Deployment
```bash
# Test homepage
curl https://beeline.works

# Test signup
curl https://beeline.works/signup

# Test admin dashboard
curl https://beeline.works/admin/dashboard
```

All should return HTTP 200 with HTML.

---

## STEP 4: Setup PM2 Auto-Restart (10 minutes)

### Configure Bridge Auto-Restart

```bash
ssh -p 8022 u0_a290@10.36.210.159

cd ~/beeline/phone_bridge

# Start bridge with PM2
pm2 start phone-bridge-server.js --name "whatsapp-bridge"

# Setup auto-start on boot
pm2 startup
pm2 save

# Verify both processes are running
pm2 list
```

You should see:
```
┌─────┬──────────────────────┬─────────┬─────────┬─────────┬──────────┐
│ id  │ name                 │ version │ mode    │ status  │ restart  │
├─────┼──────────────────────┼─────────┼─────────┼─────────┼──────────┤
│ 0   │ cloudflare-tunnel    │ N/A     │ fork    │ online  │ 0        │
│ 1   │ whatsapp-bridge      │ N/A     │ fork    │ online  │ 0        │
└─────┴──────────────────────┴─────────┴─────────┴─────────┴──────────┘
```

---

## STEP 5: Final Testing (10 minutes)

### Test Homepage
```bash
curl https://beeline.works
# Should return HTML with homepage content
```

### Test Signup Page
Go to: `https://beeline.works/signup`
- Should see country selector
- Should see phone number input
- Should be able to enter phone

### Test Admin Registration
```bash
curl -X POST 'https://beeline.works/api/auth/admin-signup' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "nanayawjoshua@gmail.com",
    "adminSecret": "Erama@2603"
  }'
```

Expected:
```json
{
  "success": true,
  "message": "Admin registration verified for nanayawjoshua@gmail.com",
  "nextSteps": "1. Sign in with Google using this email\n2. You will be granted admin access\n3. Go to /admin dashboard"
}
```

### Test Admin Dashboard
1. Go to `https://beeline.works/login`
2. Click "Continue with Google"
3. Sign in with `nanayawjoshua@gmail.com`
4. Go to `https://beeline.works/admin/dashboard`
5. Should see bridge status, WhatsApp connection state, and metrics

### Test Bridge Status
```bash
curl https://bridge.beeline.works/health
```

Expected: Bridge health JSON with `"status":"healthy"`

---

## STEP 6: Client Onboarding (5 minutes)

### Send Client This Link:
```
https://beeline.works
```

### They Do This:
1. **Click:** "Get Started"
2. **Enter:** Phone number
   - Country: Ghana
   - Number: 543362454
3. **Scan:** QR code with WhatsApp
4. **See:** Dashboard loads
5. **Done!** Messages auto-respond

---

## Verification Checklist

### Pre-Deployment ✅
- [x] Website builds successfully
- [x] All TypeScript compiles
- [x] Have Google OAuth credentials
- [x] Have Supabase credentials
- [x] Have admin secret

### Deployment ✅
- [ ] Cloudflare domain setup complete
- [ ] Cloudflare tunnel created and running
- [ ] PM2 installed and cloudflare tunnel running
- [ ] PM2 installed and bridge running
- [ ] Environment variables in Vercel
- [ ] Website deployed to Vercel
- [ ] PM2 auto-start configured

### Testing ✅
- [ ] https://beeline.works loads
- [ ] https://beeline.works/signup works
- [ ] https://bridge.beeline.works/health responds
- [ ] Admin registration endpoint works
- [ ] Admin can login with Google
- [ ] Admin dashboard shows bridge metrics
- [ ] Client can signup and scan QR

---

## Quick Command Reference

```bash
# Build
cd website && npm run build

# Check bridge
curl https://bridge.beeline.works/health

# Check website
curl https://beeline.works

# PM2 status
pm2 list

# PM2 logs
pm2 logs whatsapp-bridge
pm2 logs cloudflare-tunnel

# Restart if needed
pm2 restart whatsapp-bridge
pm2 restart cloudflare-tunnel

# Admin registration
curl -X POST 'https://beeline.works/api/auth/admin-signup' \
  -H 'Content-Type: application/json' \
  -d '{"email":"nanayawjoshua@gmail.com","adminSecret":"Erama@2603"}'
```

---

## What's Running 24/7

1. **Website at beeline.works** (Vercel)
2. **Bridge auto-restart** (PM2 on device)
3. **Cloudflare Tunnel** (PM2 on device)
4. **Admin Dashboard** (monitoring everything)

---

## After Going Live

### Daily Monitoring
```bash
# Check everything is online
curl https://bridge.beeline.works/health

# Check admin dashboard
https://beeline.works/admin/dashboard
```

### If Bridge Goes Offline
```bash
ssh -p 8022 u0_a290@10.36.210.159
pm2 restart whatsapp-bridge
```

### If Tunnel Goes Down
```bash
ssh -p 8022 u0_a290@10.36.210.159
pm2 restart cloudflare-tunnel
```

---

## You're Ready! 🚀

**All systems ready to deploy.**

**Your client will be live in less than 60 minutes.**

Follow these 6 steps and you'll have:
1. Website live at beeline.works
2. Admin dashboard monitoring bridge 24/7
3. Bridge auto-restarting if it crashes
4. Client signing up and receiving messages
5. Complete platform operational

**Next Step:** Start with STEP 1 (Build for Production)
