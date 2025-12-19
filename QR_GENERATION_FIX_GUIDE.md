# 🔧 QR Generation Fix - Complete Guide

**Issue:** "Failed to generate QR code. Try again."
**Root Cause:** Vercel environment variable not set
**Status:** Requires manual Vercel dashboard configuration

---

## 🎯 The Problem

The website code is correct, but **Vercel environment variables are NOT read from the repository**.

Even though `.env.production` contains:
```bash
PHONE_BRIDGE_URL=https://bridge.beeline.works
```

Vercel ignores this file. Environment variables must be set in the Vercel Dashboard.

---

## ✅ Solution: Set Environment Variable in Vercel

### **Step 1: Go to Vercel Dashboard**
Open: https://vercel.com/dashboard

### **Step 2: Select Your Project**
Click on: `beeline` or `whatsapp-ai-platform` (your project name)

### **Step 3: Go to Settings**
Click: **Settings** (top navigation)

### **Step 4: Environment Variables**
Click: **Environment Variables** (left sidebar)

### **Step 5: Add/Edit PHONE_BRIDGE_URL**

**If variable exists:**
1. Find `PHONE_BRIDGE_URL` in the list
2. Click the **3 dots (...)** → **Edit**
3. Change value to: `https://bridge.beeline.works`
4. Click **Save**

**If variable doesn't exist:**
1. Click **Add New** button
2. Fill in:
   - **Name:** `PHONE_BRIDGE_URL`
   - **Value:** `https://bridge.beeline.works`
3. Select environments:
   - ✅ **Production**
   - ✅ **Preview**
   - ✅ **Development**
4. Click **Add**

### **Step 6: Redeploy**
1. Go to **Deployments** tab (top navigation)
2. Find the latest deployment
3. Click the **3 dots (...)** → **Redeploy**
4. Select: **Use existing Build Cache** (faster)
5. Click **Redeploy**

### **Step 7: Wait for Deployment**
- Watch for: "Building..." → "Ready" (takes 1-2 minutes)
- Once shows ✅ **Ready**, proceed to testing

---

## 🧪 Verify Fix

### **Test 1: Check Environment Variable**
After deployment completes:

**Visit:** https://beeline.works/api/debug/config

**Expected Output:**
```json
{
  "phoneBridgeUrl": "https://bridge.beeline.works",
  "nodeEnv": "production",
  "timestamp": "2025-12-19T11:xx:xx.xxxZ"
}
```

**If shows:** `"phoneBridgeUrl": "NOT SET"` or `"http://localhost:3001"`
→ Environment variable didn't save correctly. Repeat Step 5-6.

---

### **Test 2: Vendor Registration**

**Visit:** https://beeline.works/vendor/register

**Fill in:**
- WhatsApp Number: `+233246304434` (or your test number)
- Name: `Test Vendor`
- Category: `Electronics`
- Auth Method: `WhatsApp`
- Password: (create one, min 8 characters)

**Click:** "Create Account"

**Expected Result:** QR code displays! ✅

**If still fails:** Check bridge logs (see troubleshooting below)

---

## 🔍 Troubleshooting

### **Issue: Still getting 404 on /api/debug/config**

**Cause:** Deployment hasn't completed or failed

**Check:**
1. Go to: https://vercel.com/dashboard/deployments
2. Look for latest deployment status
3. If shows "Error" → Click to see build logs
4. Common issues:
   - Build timeout
   - TypeScript errors
   - Missing dependencies

**Fix:** Wait for deployment or check build errors

---

### **Issue: phoneBridgeUrl shows "NOT SET"**

**Cause:** Environment variable not saved correctly

**Fix:**
1. Double-check spelling: `PHONE_BRIDGE_URL` (exactly)
2. Ensure "Production" is checked
3. Click Save and **wait 30 seconds**
4. Redeploy again
5. Clear browser cache (Ctrl+Shift+R)

---

### **Issue: QR still fails after env var is correct**

**Cause:** Bridge might not be responding

**Check bridge health:**
```bash
# From Windows:
curl https://bridge.beeline.works/health

# Expected:
{"status":"healthy","phoneModel":"TCL_50SE",...}
```

**If bridge is down:**
```bash
ssh -p 8022 u0_a290@10.62.162.24 "pm2 restart beeline-phone-bridge"
```

**Check bridge logs:**
```bash
ssh -p 8022 u0_a290@10.62.162.24 "pm2 logs beeline-phone-bridge --lines 30"
```

---

### **Issue: Registration creates vendor but no QR**

**Cause:** Endpoint mismatch or bridge error

**Check Vercel logs:**
1. Go to: Vercel Dashboard → Project → Deployments
2. Click latest deployment → **View Function Logs**
3. Look for errors from `/api/vendor/register`

**Check what endpoint is being called:**
- Should see: `POST https://bridge.beeline.works/api/generate-qr`
- If different URL → env var not applied
- If 404/500 response → check bridge logs

---

## 📋 Quick Verification Checklist

Before testing registration, verify:

- [ ] Vercel environment variable set to: `https://bridge.beeline.works`
- [ ] Latest deployment shows "Ready" ✅
- [ ] `/api/debug/config` shows correct URL
- [ ] Bridge health check returns healthy status
- [ ] Bridge accessible at: https://bridge.beeline.works/health
- [ ] PM2 shows bridge online: `pm2 status`

If all checked, registration should work!

---

## 🎯 Expected Flow (When Working)

1. **User fills registration form** → Submits
2. **Website creates vendor** in Supabase database
3. **Website calls bridge:** `POST https://bridge.beeline.works/api/generate-qr`
4. **Bridge generates QR** using Baileys WhatsApp library
5. **Bridge returns QR string** to website
6. **Website displays QR** to user
7. **User scans QR** with WhatsApp
8. **Bridge connects** vendor's WhatsApp
9. **Dashboard unlocks** → Vendor can manage inventory

---

## 🔧 Manual Test (Bypass Website)

If you want to test bridge directly:

```bash
# Test from phone (via SSH):
ssh -p 8022 u0_a290@10.62.162.24

# Run:
curl -X POST http://localhost:3001/api/generate-qr \
  -H "Content-Type: application/json" \
  -d '{"vendorId":"test-12345","vendorData":{"phone":"+233246304434","name":"Test"}}'

# Expected (if WhatsApp not connected yet):
{"error":"QR code not yet available. Please wait for WhatsApp connection.","status":"closed"}

# This proves endpoint exists and responds!
```

---

## 📞 Support Commands

### **Check Bridge Status:**
```bash
ssh -p 8022 u0_a290@10.62.162.24 "pm2 status"
```

### **View Bridge Logs:**
```bash
ssh -p 8022 u0_a290@10.62.162.24 "pm2 logs beeline-phone-bridge --lines 50"
```

### **Restart Bridge:**
```bash
ssh -p 8022 u0_a290@10.62.162.24 "cd ~/beeline/phone_bridge && pm2 restart beeline-phone-bridge"
```

### **Check IP:**
```bash
ssh -p 8022 u0_a290@10.62.162.24 "ifconfig ap0 | grep 'inet '"
```

### **Test Bridge Health:**
```bash
curl https://bridge.beeline.works/health
```

---

## ✅ Success Criteria

QR generation is working when:

1. ✅ `/api/debug/config` shows correct URL
2. ✅ Bridge health check returns healthy
3. ✅ Registration form submits without errors
4. ✅ QR code appears on screen
5. ✅ Bridge logs show QR generation request
6. ✅ User can scan QR with WhatsApp

---

## 🚀 Once Fixed

After QR generation works:

1. **Test WhatsApp connection:** Scan QR with real WhatsApp number
2. **Verify dashboard access:** Login with same credentials
3. **Test product creation:** Add a test product
4. **Check database:** Verify product appears in Supabase
5. **Launch MVP!** 🐝

---

**Created:** December 19, 2025 11:15 UTC
**Status:** Waiting for Vercel environment variable configuration
**Next:** Set `PHONE_BRIDGE_URL` in Vercel Dashboard → Redeploy → Test

🤖 *Generated with Claude Code*
