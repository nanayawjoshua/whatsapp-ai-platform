# 🚀 DEPLOYMENT QUICK START - Get Client Live in 60 Minutes

**Client Ready:** YES
**Domain:** beeline.works
**Objective:** Deploy platform and have client scanning WhatsApp QR code

---

## The 5-Step Deployment Plan

STEP 1: Build & Test Locally (10 min)
STEP 2: Setup Google OAuth (15 min)
STEP 3: Setup Cloudflare Tunnel (15 min)
STEP 4: Deploy to Vercel (10 min)
STEP 5: Setup PM2 Auto-Restart (10 min)

Total Time: 60 minutes

---

## STEP 1: Build & Test Locally

Build the website
```
cd website
npm run build
```

Verify bridge is running
```
curl http://10.36.210.159:3001/health
```

Test signup flow locally
```
cd website && npm run dev
curl -X POST http://localhost:3000/api/auth/initiate-whatsapp
```

---

## STEP 2: Setup Google OAuth

Follow: GOOGLE_OAUTH_PRODUCTION_SETUP.md

1. Go to Google Cloud Console
2. Create project: Beeline WhatsApp Platform
3. Enable Google+ API
4. Create OAuth credentials for beeline.works
5. Add to Vercel environment variables

---

## STEP 3: Setup Cloudflare Tunnel

Follow: CLOUDFLARE_TUNNEL_SETUP.md

1. Add domain to Cloudflare
2. Create tunnel: beeline-bridge
3. Route to bridge.beeline.works
4. Run with PM2 for auto-restart

Test: curl https://bridge.beeline.works/health

---

## STEP 4: Deploy to Vercel

Update environment variables:
- PHONE_BRIDGE_URL=https://bridge.beeline.works
- ADMIN_SECRET=Janae3lla@2603
- Google OAuth credentials

Deploy:
```
git push origin beeline-main
```

Or redeploy in Vercel dashboard.

---

## STEP 5: Setup PM2 Auto-Restart

On bridge device:
```
ssh -p 8022 u0_a290@10.36.210.159
cd ~/beeline/phone_bridge

npm install -g pm2
pm2 start phone-bridge-server.js --name "whatsapp-bridge"
pm2 startup
pm2 save
```

---

## What Your Client Does

1. Go to https://beeline.works
2. Enter phone number with country code
3. Scan QR with WhatsApp
4. Dashboard loads
5. Messages auto-respond

---

## What You See as Admin

Access: https://beeline.works/admin/dashboard

Register:
```
curl -X POST https://beeline.works/api/auth/admin-signup \
  -H 'Content-Type: application/json' \
  -d '{"email":"nanayawjoshua@gmail.com","adminSecret":"Janae3lla@2603"}'
```

You will see:
- Bridge status (Online/Offline)
- WhatsApp connection state
- QR generation metrics
- System uptime
- Auto-refresh every 10 seconds

---

## Monitoring Commands

Check bridge: pm2 list
View logs: pm2 logs whatsapp-bridge
Restart: pm2 restart whatsapp-bridge
Test tunnel: curl https://bridge.beeline.works/health

---

## Detailed Guides

See these files for complete information:
- PRODUCTION_DEPLOYMENT_CHECKLIST.md
- CLOUDFLARE_TUNNEL_SETUP.md
- GOOGLE_OAUTH_PRODUCTION_SETUP.md
- ADMIN_SETUP_GUIDE.md

---

Your platform is ready to deploy! Follow these 5 steps and your client will be live in 60 minutes.
