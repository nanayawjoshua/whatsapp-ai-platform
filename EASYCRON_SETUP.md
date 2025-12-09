# EasyCron Setup: Keep Bridge Awake (5 Minutes)

## Why?

Render free tier sleeps services after 15 minutes of inactivity.
Without keep-alive, your bridge takes 60+ seconds to wake on signup.

**With keep-alive:** Bridge is always ready, QR loads in 15-20 seconds.

---

## Setup (FREE)

### Step 1: Go to EasyCron
https://www.easycron.com/

### Step 2: Sign Up (or Login)
- Free account (unlimited free API calls)
- No credit card required

### Step 3: Create New Cron Job

Click **"Add Cron Job"**

**Configure:**

| Field | Value |
|-------|-------|
| **Cron Expression** | `0 */10 * * * *` (every 10 minutes) |
| **URL** | `https://beeline.works/api/bridge/health` |
| **HTTP Method** | GET |
| **Execution Timeout** | 30 (seconds) |
| **Timezone** | Africa/Accra (or your timezone) |

### Step 4: Test

Click **"Run now"** to test immediately

Expected response:
```
{
  "status": "available",
  "bridge": { "status": "healthy", ... },
  "checkedAt": "2025-12-09T..."
}
```

### Step 5: Save

Click **"Save"**

Status should show: **"Enabled"** ✅

---

## Verification

### Check in EasyCron Dashboard

1. Go to EasyCron.com → Login
2. Click your cron job
3. See **"Execution Log"**
4. Should show successful runs every 10 minutes

### Check Bridge Health Directly

```bash
# Test the health endpoint
curl https://beeline.works/api/bridge/health

# Should respond instantly with:
{
  "status": "available",
  "bridge": { "status": "healthy", ... }
}
```

---

## Expected Results

### With Keep-Alive Running ✅

```
Client clicks "Scan WhatsApp"
  ↓
Frontend checks /api/bridge/health
  ↓
Response: available (keep-alive pinged 2 min ago)
  ↓
Generate QR code (15-20 seconds)
```

### Without Keep-Alive ❌

```
Client clicks "Scan WhatsApp"
  ↓
Frontend checks /api/bridge/health
  ↓
Response: sleeping (bridge cold-starting)
  ↓
Wait 30-60 seconds for bridge to wake
  ↓
Generate QR code (60+ seconds total)
```

---

## Troubleshooting

### Cron Job Shows "Disabled"
- Check EasyCron email for any alerts
- Re-save the job
- Contact EasyCron support

### Health Endpoint Returns 503
- Bridge might have crashed
- Check Render dashboard: https://dashboard.render.com
- Check bridge logs in Render

### Cron Runs But Health Shows "Sleeping"

This shouldn't happen if keep-alive is running.

**Check:**
```bash
# 1. Verify endpoint URL is correct
curl https://beeline.works/api/bridge/health

# 2. Check Vercel logs
# Dashboard → project → Deployments → Logs

# 3. Restart bridge on Render
# Dashboard → beeline-bridge → Manual Deploy
```

---

## Dashboard View

Once set up, you'll see in EasyCron:

```
Cron Job: Bridge Keep-Alive
├─ Status: Enabled ✅
├─ Expression: 0 */10 * * * * (every 10 min)
├─ URL: https://beeline.works/api/bridge/health
├─ Last Run: 2 minutes ago
├─ Last Status: 200 OK
└─ Execution Log: (shows all runs)
```

---

## Cost

**Total:** $0 (completely free)

- EasyCron free tier: unlimited API calls
- No payment method required
- No upgrade needed

---

## Summary

✅ **5-minute setup, zero cost, huge UX improvement**

1. Sign up at EasyCron
2. Create cron job every 10 minutes
3. Point to `https://beeline.works/api/bridge/health`
4. Bridge stays awake, clients get instant QR codes

**That's it!** Bridge now has professional uptime.
