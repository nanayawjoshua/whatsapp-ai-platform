# Super Admin Dashboard Setup Guide

**Status:** ✅ Complete - Ready for testing
**Date:** December 14, 2025

## What's Been Set Up

You now have a complete super admin system with:

1. ✅ **Admin Registration Endpoint** (`/api/auth/admin-signup`)
   - Requires secret code verification
   - Email-based registration
   - Configured in `.env.local`

2. ✅ **Admin Dashboard** (`/admin/dashboard`)
   - Real-time bridge status monitoring
   - WhatsApp connection state tracking
   - QR generation metrics and statistics
   - Auto-refresh capability (every 10 seconds)

3. ✅ **Bridge Status API** (`/api/admin/bridge-status`)
   - Fetches live bridge health
   - Returns connection state, uptime, device info
   - Includes QR generation metrics

4. ✅ **Environment Configuration**
   - `ADMIN_SECRET` added to `.env.local`
   - Google OAuth credentials pre-configured
   - NextAuth secrets configured

---

## How to Become Super Admin

### Step 1: Register as Admin (via API)

Send a POST request to `/api/auth/admin-signup`:

```bash
curl -X POST 'http://localhost:3000/api/auth/admin-signup' \
  -H 'Content-Type: application/json' \
  -d '{
    "email": "your-email@gmail.com",
    "adminSecret": "your-super-secret-admin-code-12345"
  }'
```

**Expected Response:**
```json
{
  "success": true,
  "message": "Admin registration verified for your-email@gmail.com",
  "nextSteps": "1. Sign in with Google using this email\n2. You will be granted admin access\n3. Go to /admin dashboard",
  "redirectTo": "/login"
}
```

### Step 2: Sign In with Google

1. Go to `http://localhost:3000/login`
2. Click "Continue with Google"
3. Sign in with the **same email** you used in Step 1
4. You'll be redirected to the dashboard

### Step 3: Access Admin Dashboard

Navigate to `http://localhost:3000/admin/dashboard`

You should see:
- 🟢 **Bridge Status** (Online/Offline/Reconnecting)
- 📊 **WhatsApp Connection State** (Open/Closed)
- 📈 **QR Generation Metrics** (Success/Failed counts)
- ⏱️ **Bridge Uptime** and device model
- 🔧 **Configuration Details** (Bridge URL, last checked time)

---

## Admin Secret Configuration

### Current Setup

**Default Admin Secret:**
```
ADMIN_SECRET=your-super-secret-admin-code-12345
```

Located in: `website/.env.local` (line 29)

### ⚠️ Change This in Production!

Before deploying to production:

```bash
# Generate a secure random code
openssl rand -base64 32

# Update .env.local with the new value
# Update .env.production with the new value
# Update Vercel Dashboard with the new value
```

Example secure secret:
```
ADMIN_SECRET=vZ9kL2mN5pQ8rT1uV4wX7yA0bC3dE6fG9hI2jK5lM8nO1pQ
```

---

## Environment Variables

Your `.env.local` now includes:

### Admin Configuration
```
ADMIN_SECRET=your-super-secret-admin-code-12345
```

### NextAuth & Google OAuth
```
NEXTAUTH_SECRET=toRMbFTMmaqdl96N/i985MNXqwcEDDrnBTs6+/6xxm8=
NEXTAUTH_URL=http://localhost:3000
GOOGLE_CLIENT_ID=236111634034-8jeeps5grj1qmrm7idm8fmj6fi1didvf.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=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
```

### Bridge Configuration
```
PHONE_BRIDGE_URL=http://10.36.210.159:3001
```

---

## Testing the Admin System

### Quick Test Flow:

1. **Start the bridge:**
   ```bash
   ssh -p 8022 u0_a290@10.36.210.159 'cd ~/beeline/phone_bridge && pgrep -f phone-bridge || nohup node phone-bridge-server.js > bridge.log 2>&1 &'
   ```

2. **Start the dev server:**
   ```bash
   cd website && npm run dev
   ```

3. **Register as admin via curl:**
   ```bash
   curl -X POST 'http://localhost:3000/api/auth/admin-signup' \
     -H 'Content-Type: application/json' \
     -d '{
       "email": "your-email@gmail.com",
       "adminSecret": "your-super-secret-admin-code-12345"
     }'
   ```

4. **Go to login:** `http://localhost:3000/login`

5. **Sign in with Google** using the same email

6. **Access dashboard:** `http://localhost:3000/admin/dashboard`

### Expected Dashboard Behavior:

- **Bridge Status Card**: Shows "Online" or "Reconnecting" status
- **WhatsApp Connection**: Shows 🟢 (open) or 🔴 (closed)
- **Auto-refresh**: Updates every 10 seconds with latest bridge data
- **Metrics**: Displays QR generation success/fail counts
- **Manual Refresh**: "Refresh Now" button fetches latest status immediately

---

## API Endpoints

### Admin Registration
```
POST /api/auth/admin-signup
Content-Type: application/json

{
  "email": "user@example.com",
  "adminSecret": "secret-code"
}

Response: { success, message, nextSteps }
```

### Bridge Status (for dashboard)
```
GET /api/admin/bridge-status

Response: {
  status: "online|offline|reconnecting|error",
  bridgeHealth: {
    status: string,
    phoneModel: string,
    whatsappConnected: boolean,
    connectionState: "open|closed|unknown",
    uptime: number (seconds)
  },
  metrics: {
    successful_qr_generations: number,
    failed_qr_attempts: number,
    avg_response_time_ms: number,
    total_qr_requests: number
  },
  bridgeUrl: string,
  lastChecked: ISO timestamp
}
```

---

## Admin Dashboard Features

### Status Indicators
- 🟢 **Online**: Bridge responding + WhatsApp connected
- 🔄 **Reconnecting**: Bridge responding but WhatsApp connection closing/opening
- 🔴 **Offline**: Bridge not responding
- ⚠️ **Error**: Unexpected error during health check

### Real-Time Monitoring
- **Auto-refresh**: Fetches bridge status every 10 seconds
- **Manual Refresh**: "Refresh Now" button for immediate update
- **Toggle auto-refresh**: Can pause periodic updates

### Metrics Displayed
- Successful QR code generations
- Failed QR attempts
- Average response time
- Total QR requests processed

### Bridge Information
- Phone model connected
- Current connection state
- System uptime
- Bridge URL and last check time

---

## File Structure

### New Files Created:
```
website/
├── app/api/auth/admin-signup/route.ts          ← Admin registration endpoint
├── app/api/admin/bridge-status/route.ts        ← Bridge status API
└── app/admin/dashboard/page.tsx                ← Admin dashboard UI

website/
└── .env.local (updated)                         ← Added ADMIN_SECRET
```

### Updated Files:
```
website/.env.local
  - Added ADMIN_SECRET configuration
  - Organized environment variables
```

---

## Next Steps

### 1. Test Locally (Recommended)
```bash
# Make sure your admin secret in .env.local is set
ADMIN_SECRET=your-super-secret-admin-code-12345

# Start dev server
cd website && npm run dev

# Register as admin (see "Testing" section above)
# Access dashboard at /admin/dashboard
```

### 2. For Production Deployment

**Update `.env.production`:**
```
ADMIN_SECRET=<generate-secure-random-secret>
PHONE_BRIDGE_URL=<your-production-bridge-url>
NEXTAUTH_URL=<your-production-domain>
```

**Update Vercel Dashboard:**
1. Go to Project Settings → Environment Variables
2. Add/update `ADMIN_SECRET` with production value
3. Add/update other env vars for production
4. Redeploy

### 3. Production Considerations

- ⚠️ Change `ADMIN_SECRET` before deploying
- 🔒 Use HTTPS in production
- 📊 Consider adding database for admin user tracking
- 🔐 Implement role-based access control (RBAC) in database
- 📝 Add audit logging for admin actions

---

## Troubleshooting

### "Invalid admin secret code"
- Check that the secret in your `.env.local` matches what you're sending
- Make sure `ADMIN_SECRET` environment variable is loaded
- Restart dev server after changing `.env.local`

### Dashboard shows "Bridge is offline"
- Check that bridge is running: `pgrep -f phone-bridge` on the device
- Verify `PHONE_BRIDGE_URL` in `.env.local` is correct
- Check network connectivity to bridge URL
- See [SIGNUP_GUIDE.md](SIGNUP_GUIDE.md) for bridge troubleshooting

### "WhatsApp connection reconnecting" stays for long
- This is normal after bridge restart (can take 2-5 minutes)
- Monitor the dashboard - status will change to "open" when reconnected
- Check bridge logs: `ssh u0_a290@10.36.210.159 'tail -20 ~/beeline/phone_bridge/bridge.log'`

### Dashboard not loading
- Verify you're signed in with Google
- Check browser console for errors
- Verify `PHONE_BRIDGE_URL` is accessible
- Try clearing browser cache and refreshing

---

## Architecture Overview

```
┌─────────────────────────────────────────┐
│  Admin Dashboard (/admin/dashboard)     │
│  - Real-time bridge status              │
│  - Auto-refresh every 10s                │
│  - Connection state indicators          │
└──────────────┬──────────────────────────┘
               │ Fetches every 10s
               ↓
┌─────────────────────────────────────────┐
│  API: /api/admin/bridge-status          │
│  - Queries bridge health endpoint        │
│  - Parses connection state               │
│  - Aggregates metrics                   │
└──────────────┬──────────────────────────┘
               │ HTTP call (timeout 5s)
               ↓
┌─────────────────────────────────────────┐
│  Phone Bridge (/health endpoint)        │
│  - Running on 10.36.210.159:3001        │
│  - Returns: status, uptime, WhatsApp    │
│    connection state, device info        │
└─────────────────────────────────────────┘
```

---

## Summary

✅ **Admin System Complete:**
- Registration endpoint with secret validation
- Real-time dashboard with bridge monitoring
- Auto-refresh and manual refresh capabilities
- Bridge health and WhatsApp connection tracking
- QR generation metrics and statistics

🚀 **Ready to:**
- Test locally with dev server
- Deploy to Vercel with production secrets
- Monitor bridge 24/7 from admin dashboard
- Track platform health and performance

📊 **Key Metrics Monitored:**
- Bridge online/offline status
- WhatsApp connection state
- QR code generation success rate
- System uptime and device info

💡 **Pro Tips:**
- Use auto-refresh toggle to pause updates when reading
- Check "Reconnecting" status after bridge restarts (normal, 2-5 min)
- Use bridge logs for detailed debugging
- Keep admin secret secure in production
