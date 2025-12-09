# 🚀 Quick Fix Checklist - WhatsApp Connection Error

## 1-Minute Diagnosis
```bash
# Run this to check everything
node diagnose-whatsapp.js

# Expected output:
# ✅ Bridge is healthy
# ✅ Vendors: 0/75
# ✅ Memory good
# ⚠️  Redis timeout (OK)
```

---

## Error: "Failed to initiate WhatsApp connection"

### Most Common Fixes (Try These First)

**❌ BEFORE** → **✅ AFTER**

1. **Try Again** (30 seconds later)
   - Sometimes bridge is slow on first QR generation
   - Just retry the connection
   - Usually works on 2nd attempt

2. **Check Bridge Health**
   ```bash
   curl https://beeline-bridge.onrender.com/health
   # Should return: {"status":"healthy",...}
   ```
   - If not healthy → wait 60 seconds
   - If still down → check Render dashboard logs

3. **Verify Environment Variables**
   ```
   CLOUD_BRIDGE_URL=https://beeline-bridge.onrender.com
   DATABASE_URL=postgresql://... (in bridge .env)
   ```
   - Missing = error
   - Wrong value = error
   - Fix in Render or `.env.local` and redeploy

4. **Check Browser Console** (F12)
   - Look for actual error message
   - Share with me if unclear
   - Helps narrow down the issue

---

## Error Messages Reference

| Error | Cause | Fix |
|-------|-------|-----|
| "Server at capacity" | Bridge has 75+ vendors | Wait 5 min, bridge scales up |
| "Request timed out" | Bridge/Baileys slow | Retry in 30 seconds |
| "Cannot connect to bridge" | Network issue | Check CLOUD_BRIDGE_URL env var |
| "QR code generation timed out" | Baileys slow | Retry, usually works 2nd time |
| "Invalid phone number" | Bad format | Use: +233 24 123 4567 |

---

## Phone Number Formats (All Valid)

✅ `+233501234567` (with country code)  
✅ `0501234567` (Ghana format)  
✅ `233501234567` (without +)  
✅ `+233 50 123 4567` (with spaces)  

❌ `12345` (too short)  
❌ `+1234567890` (wrong country)  

---

## Quick Debug Commands

### Check if bridge is reachable
```bash
curl https://beeline-bridge.onrender.com/health
```

### Check Render logs
- Go to: https://dashboard.render.com
- Click: beeline-bridge service
- Click: Logs tab
- Look for: errors when you tried to connect

### Check website logs
- Open: Browser DevTools (F12)
- Go to: Console tab
- Try: Connecting again
- Look for: Red error messages

---

## Step-by-Step Fix Guide

### If Bridge is DOWN
```
1. Go to https://dashboard.render.com
2. Find beeline-bridge service
3. Click "Manual Deploy"
4. Wait 2-3 minutes
5. Try connecting again
```

### If Bridge is UP but Error Persists
```
1. Open DevTools (F12 → Console)
2. Note the exact error message
3. Check Render logs for corresponding error
4. Verify DATABASE_URL in bridge .env
5. If all else fails: restart bridge service
```

### If You See "QR generation timeout"
```
1. Wait 30 seconds
2. Try again with same phone number
3. If works = bridge was just slow
4. If still fails = restart bridge
```

---

## Success Indicators

✅ QR code appears in glass card (white background)  
✅ QR code is scannable by WhatsApp  
✅ Page moves to "Step 3 of 3: Complete!" after scan  
✅ Vendor record created in database  

---

## Emergency Contacts

If stuck after 5 minutes:
1. Check bridge logs for specific error
2. Verify all env vars are set correctly
3. Restart the bridge service
4. Try with different phone number

---

## Timeline

| What | Time |
|------|------|
| First attempt | 5s |
| If timeout, retry | +30s (wait) |
| Check logs | +1m |
| Fix env var | +2m |
| Restart bridge | +3m |
| Try again | +5m |

---

**Last Updated:** Dec 9, 2025  
**Issue:** WhatsApp connection error  
**Status:** 🟢 Investigated • Ready to fix

For detailed info, see: `WHATSAPP_ERROR_RESOLUTION.md`
