# 🔧 WhatsApp Connection Error - Debugging Guide

**Issue:** "Failed to initiate WhatsApp connection" error when trying to connect WhatsApp  
**Error Screen:** Red error box appears after clicking "Connect WhatsApp"  
**Status:** Investigation in progress

---

## Common Causes & Solutions

### 1. **Bridge Service Not Running** 🟡 MOST LIKELY
**Symptom:** Error appears immediately after clicking button  
**Fix:**
```bash
# Check if bridge is running
curl https://beeline-bridge.onrender.com/health

# Should return:
# {"status":"healthy","redis":"timeout",...}
```

**If Not Running:**
- Go to https://dashboard.render.com
- Find "beeline-bridge" service
- Click "Manual Deploy" or check logs
- Ensure all environment variables are set

---

### 2. **Database Connection Issue** 🟡 LIKELY
**Symptom:** Error appears after 5-10 seconds  
**Cause:** PostgreSQL database unreachable  
**Fix:**
- Check `DATABASE_URL` in bridge `.env`
- Verify Neon database is running
- Check if connection pool is maxed out

**Check Bridge Logs:**
```bash
# View recent logs from Render
# Logs should show "Creating vendor record" or database errors
```

---

### 3. **QR Code Generation Timeout** 🟡 POSSIBLE
**Symptom:** Error appears after ~30 seconds  
**Cause:** Baileys takes too long to generate QR  
**Why:** 
- Bridge service may be overloaded
- Baileys QR generation is slow on first connection
- Network latency

**Fix:** Just retry - usually works on second attempt

---

### 4. **Environment Variable Not Set** 🔵 LESS LIKELY
**Symptom:** Error about missing env var  
**Fix:**
In your `.env.local` (dev) or Vercel dashboard (production):
```
CLOUD_BRIDGE_URL=https://beeline-bridge.onrender.com
```

---

## Troubleshooting Steps

### Step 1: Check Browser Console
```
1. Open browser DevTools (F12)
2. Go to "Console" tab
3. Try connecting again
4. Look for detailed error message
```

**Example Error Log:**
```
WhatsApp initiation error: {
  message: "Bridge service error...",
  status: 503,
  body: "Server at capacity..."
}
```

### Step 2: Check Bridge Logs
```
1. Go to https://dashboard.render.com
2. Click "beeline-bridge" service
3. Click "Logs" tab
4. Try connecting again
5. Look for these messages:
   - "Generating QR code for new vendor" (good)
   - "Failed to create vendor record" (database issue)
   - "QR generation timeout" (Baileys issue)
```

### Step 3: Verify Bridge Health
```bash
curl https://beeline-bridge.onrender.com/health

# Response should look like:
{
  "status": "healthy",
  "vendors": 0,
  "maxVendors": 75,
  "memory": {...}
}
```

**If `status` is NOT "healthy":**
- Bridge crashed or restarting
- Wait 30-60 seconds and retry
- Check Render logs for errors

### Step 4: Test Direct Connection
```bash
# Test if your phone number format is valid
phone="0203772824"
echo $phone | grep -E '^\+?[0-9]{8,}$'

# Should return the phone number (means it's valid)
```

---

## Recent Improvements (Dec 9)

✅ **Better Error Messages:**
- Now shows specific error from bridge (e.g., "Server at capacity")
- Distinguishes between network errors and service errors
- Longer timeout (35s instead of 30s) for slow QR generation

✅ **Better Logging:**
- Backend logs bridge responses for debugging
- Frontend shows which step failed
- Includes phone number (last 4 digits) and vendorId in logs

---

## What's Being Sent to Bridge

When you click "Connect WhatsApp", your phone number is sent to:

```json
POST https://beeline-bridge.onrender.com/vendor/generate-qr
{
  "vendorId": "vendor_1734000000_abc123",
  "vendorData": {
    "phone": "0203772824",
    "name": "New Vendor",
    "businessType": "retail",
    "accountType": "personal"
  }
}
```

The bridge should:
1. Create vendor in database
2. Initialize Baileys WhatsApp session
3. Generate QR code
4. Return QR in response

**If any step fails → error returned to you**

---

## If Bridge Service is Really Down

**Temporary Workaround:**
Currently none - you need the bridge service running.

**Long-term:**
Make sure bridge is deployed on Render and:
- [ ] All env vars set (DATABASE_URL, REDIS_URL, N8N_WEBHOOK_URL)
- [ ] Database accessible
- [ ] Redis accessible (or set to "optional")
- [ ] Service has enough memory (512MB minimum)

---

## Recommended Next Steps

1. **Check bridge health immediately:**
   ```bash
   curl https://beeline-bridge.onrender.com/health
   ```

2. **Look at bridge logs for detailed error**

3. **If bridge is healthy, check:**
   - Is DATABASE_URL correct in bridge .env?
   - Can you connect to PostgreSQL?
   - Is Neon database running?

4. **Try again** - sometimes it's just temporary

---

## What I Improved Today

**Commit 13af702:**
- Increased timeout from 30s → 35s (bridge has 30s polling loop)
- Added detailed error logging with status codes and error text
- Handle specific bridge errors (408 timeout, 503 capacity, etc.)
- Frontend now shows detailed backend error messages
- Better handling of network failures (ECONNREFUSED)
- Added check for bridge connectivity issues

**Result:** You should now see more helpful error messages explaining exactly what went wrong.

---

**Status:** Ready to debug once we have error message details  
**Next:** Run the troubleshooting steps above and share the bridge logs or browser console error
