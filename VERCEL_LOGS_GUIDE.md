# 📋 Reading Vercel Logs - WhatsApp Error Diagnosis

**Error Received:** `500` on `/api/auth/initiate-whatsapp`  
**Goal:** Find the exact error in server logs  
**Time to Fix:** 5 minutes

---

## How to Access Vercel Logs

### Step 1: Go to Vercel Dashboard
```
https://vercel.com/dashboard
```

### Step 2: Select Beeline Project
- Find your project in the dashboard
- Click to open it

### Step 3: Navigate to Logs
```
Click: "Deployments" tab
Then: Click on the latest deployment
Then: Click "Logs" or "Runtime Logs"
```

---

## What to Look For

### ✅ Success Flow (Will Show):
```
📞 WhatsApp initiate-whatsapp endpoint called
📝 Received request: { phone: '2824', bodyKeys: [ 'phone' ] }
🔗 Bridge configuration: { bridgeUrl: 'https://beeline-bridge.onrender.com', hasEnv: true, vendorId: 'vendor_...' }
📤 Calling bridge service...
✅ Bridge response OK
🎉 Success! QR code generated { vendorId: 'vendor_...', qrLength: 1234, expiresIn: 60 }
```

### ❌ Failure Examples (Will Show):

**Phone Validation Failed:**
```
📞 WhatsApp initiate-whatsapp endpoint called
📝 Received request: { phone: 'MISSING', bodyKeys: [] }
❌ Phone validation failed: empty or not string
```

**Bridge Connection Failed:**
```
📞 WhatsApp initiate-whatsapp endpoint called
📝 Received request: { phone: '2824', bodyKeys: [ 'phone' ] }
🔗 Bridge configuration: { bridgeUrl: 'https://beeline-bridge.onrender.com', hasEnv: true, vendorId: 'vendor_...' }
📤 Calling bridge service...
❌ WhatsApp initiation error: { message: 'fetch failed', name: 'TypeError', code: 'ECONNREFUSED' }
```

**Bridge Returned Error:**
```
📞 WhatsApp initiate-whatsapp endpoint called
📝 Received request: { phone: '2824', bodyKeys: [ 'phone' ] }
🔗 Bridge configuration: { bridgeUrl: 'https://beeline-bridge.onrender.com', hasEnv: true, vendorId: 'vendor_...' }
📤 Calling bridge service...
🚨 Bridge service returned error: { status: 503, statusText: 'Service Unavailable', errorPreview: '{"error":"Server at capacity"}' }
```

**Timeout:**
```
📞 WhatsApp initiate-whatsapp endpoint called
📝 Received request: { phone: '2824', bodyKeys: [ 'phone' ] }
🔗 Bridge configuration: { bridgeUrl: 'https://beeline-bridge.onrender.com', hasEnv: true, vendorId: 'vendor_...' }
📤 Calling bridge service...
❌ WhatsApp initiation error: { message: 'The operation was aborted', name: 'AbortError' }
```

---

## Decode Common Errors

| Log Message | Meaning | Fix |
|-------------|---------|-----|
| `phone: 'MISSING'` | No phone sent from frontend | Check signup form is working |
| `hasEnv: false` | CLOUD_BRIDGE_URL not set | Set env var in Vercel |
| `status: 503` | Bridge at capacity | Wait 5 min, service scales up |
| `status: 408` | QR timeout at bridge | Retry, usually works 2nd time |
| `ECONNREFUSED` | Can't reach bridge | Check CLOUD_BRIDGE_URL value |
| `AbortError` | Request timeout | Timeout is 35s, bridge took longer |
| `No QR code in bridge response` | Bridge didn't generate QR | Check bridge logs |
| `TypeError` | Parse/code error | Check error message details |

---

## Expected Log Entry Points

When you click "Connect WhatsApp" with phone `0203772824`:

1. ✅ **Frontend validation** (happens on your browser, not in Vercel logs)
   - Phone format check
   - If fails: stops here, shows error

2. ✅ **Request reaches backend**
   - Log: `📞 WhatsApp initiate-whatsapp endpoint called`
   - Log: `📝 Received request: { phone: '2824', ...`

3. ✅ **Phone validation in backend**
   - Log: Phone is required check
   - Log: Phone format normalization

4. ✅ **Bridge URL check**
   - Log: `🔗 Bridge configuration: { bridgeUrl: '...', hasEnv: ...`
   - If `hasEnv: false` → ERROR (env var not set)

5. ✅ **Call bridge service**
   - Log: `📤 Calling bridge service...`
   - Wait up to 35 seconds for response

6. ✅ **Bridge response processing**
   - Log: `✅ Bridge response OK` OR `🚨 Bridge service returned error`
   - If error: see bridge response status code

7. ✅ **Success or failure**
   - Success: `🎉 Success! QR code generated`
   - Failure: `❌ Internal server error: ...`

---

## Your Current Issue (500 Error)

**Likely causes in order:**
1. CLOUD_BRIDGE_URL env var not set (hasEnv: false)
2. Bridge service is down or unreachable (ECONNREFUSED)
3. Bridge returned an error (status: 503, 408, etc.)
4. Bridge took > 35 seconds (AbortError - timeout)
5. Code error in endpoint (TypeError)

**To Identify Which:**
1. Check Vercel logs
2. Look for the log entry that appears LAST before the error
3. That shows which step failed

---

## Next Steps

### If You See: `hasEnv: false`
```
Fix: Add to Vercel environment variables
CLOUD_BRIDGE_URL=https://beeline-bridge.onrender.com

Then: Redeploy
```

### If You See: `ECONNREFUSED`
```
Fix: Verify bridge is running
curl https://beeline-bridge.onrender.com/health

If not responding:
1. Go to https://dashboard.render.com
2. Restart beeline-bridge service
3. Try again
```

### If You See: `status: 503`
```
Fix: Wait 5 minutes (server is scaling up)
Then: Try again
```

### If You See: `AbortError`
```
Fix: Try again - bridge was just slow on first attempt
Usually works on retry
```

---

## How to Share Logs with Me

1. **Go to Vercel logs**
2. **Find the entry with "📞 WhatsApp initiate-whatsapp"**
3. **Copy everything from that log entry until the error**
4. **Share with me** - I'll identify the exact issue

---

## Quick Checklist

- [ ] Read Vercel logs for latest error
- [ ] Check if `hasEnv: true` (env var is set)
- [ ] Identify the last successful log line
- [ ] Check bridge status: `https://beeline-bridge.onrender.com/health`
- [ ] Retry the connection
- [ ] Share logs if still failing

---

**Current Status:** Endpoint has detailed logging  
**Next Action:** Deploy to Vercel and try connecting again  
**Expected:** Much clearer error message in logs

After seeing the logs, the fix is usually 5 minutes!
