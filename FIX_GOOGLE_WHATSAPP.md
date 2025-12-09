# 🔧 Fix Google OAuth + WhatsApp Issues

## Issue 1: Google OAuth - "Error 400: redirect_uri_mismatch"

**Cause:** Google doesn't recognize your production domain

**Fix (5 minutes):**

### Step 1: Go to Google Cloud Console
```
https://console.cloud.google.com/apis/credentials
```

### Step 2: Find Your OAuth 2.0 Client ID
- Click on "Web client" (or create one if missing)
- Should say: "236111634034-8jeeps5grj1qmrm7idm8fmj6fi1didvf.apps.googleusercontent.com"

### Step 3: Update Authorized Redirect URIs
In the "Authorized redirect URIs" section, add BOTH:

```
http://localhost:3000/api/auth/callback/google
http://localhost:3002/api/auth/callback/google
https://beeline.works/api/auth/callback/google
https://beeline-website.vercel.app/api/auth/callback/google
```

### Step 4: Save
Click "Save" button

### Step 5: Done!
Google OAuth should now work for both local dev and production

---

## Issue 2: WhatsApp - "Failed to generate WhatsApp QR code. Bridge service error."

**Cause:** Bridge service is returning an error (could be multiple reasons)

**Check These (1 minute each):**

### Check 1: Is Bridge Service Running?
```bash
curl https://beeline-bridge.onrender.com/health
```

Should return:
```json
{"status":"healthy",...}
```

### Check 2: Is Database Connected?
The bridge needs access to PostgreSQL to save the QR code.

Check bridge `.env` on Render has:
```
DATABASE_URL=postgresql://...
```

### Check 3: Is Vendor Capacity Full?
```bash
curl https://beeline-bridge.onrender.com/health
```

Look for `"vendors": 0` - if it says `"maxVendors": 75` and vendors is close to 75, that could be the issue.

### Check 4: Vercel Logs
Go to: Vercel Dashboard → Deployments → Logs
Look for: `🚨 Bridge service returned error`
Copy that error and share with me

---

## Quick Fixes Checklist

- [ ] Added redirect URIs to Google Cloud Console (Step 1-4 above)
- [ ] Verified bridge service is running (Check 1)
- [ ] Verified DATABASE_URL is set in bridge .env (Check 2)
- [ ] Checked Vercel logs for bridge error details (Check 4)

---

## Expected Results After Fixes

### Google OAuth Should:
1. Show "Sign in with Google" button ✅
2. Click it → redirect to Google login
3. Login with your Google account
4. Redirect back to dashboard

### WhatsApp Should:
1. Enter phone number ✅
2. Click "Connect WhatsApp"
3. See QR code appear ✅
4. Scan with WhatsApp

---

## What I'm Checking Now

Let me verify the code is set up correctly for both...
