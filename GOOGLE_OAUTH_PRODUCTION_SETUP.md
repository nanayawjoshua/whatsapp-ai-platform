# 🔐 Google OAuth Production Setup for beeline.works

**Purpose:** Configure Google OAuth for production domain
**Status:** Step-by-step guide
**Time Required:** 20 minutes

---

## Overview

You need to register `beeline.works` with Google Cloud to allow users to sign in with Google on your production domain.

---

## Step 1: Create Google Cloud Project

### Go to Google Cloud Console
1. Visit [Google Cloud Console](https://console.cloud.google.com)
2. Click on **Select a Project** (top left)
3. Click **NEW PROJECT**
4. Enter name: `Beeline WhatsApp Platform`
5. Click **CREATE**
6. Wait for project to be created
7. Select your new project

---

## Step 2: Enable Google+ API

1. In left sidebar, go to **APIs & Services**
2. Click **+ ENABLE APIS AND SERVICES**
3. Search for: `Google+ API`
4. Click on it
5. Click **ENABLE**

---

## Step 3: Create OAuth 2.0 Credentials

### Navigate to Credentials
1. Left sidebar → **APIs & Services** → **Credentials**
2. Click **+ CREATE CREDENTIALS**
3. Select **OAuth 2.0 Client IDs**

### Configure Consent Screen First
If prompted to configure OAuth consent screen:

1. Click **CONFIGURE CONSENT SCREEN**
2. Select **External**
3. Click **CREATE**

### Fill OAuth Consent Screen
1. **App name:** `Beeline WhatsApp Platform`
2. **User support email:** `your-email@gmail.com`
3. **Developer contact:** `your-email@gmail.com`
4. Click **SAVE AND CONTINUE**

### Add Scopes
1. Click **ADD OR REMOVE SCOPES**
2. Search for: `email`
3. Select: `email`
4. Click **UPDATE**
5. Click **SAVE AND CONTINUE**

### Add Test Users (Optional)
1. Add your email as a test user
2. Click **SAVE AND CONTINUE**

---

## Step 4: Create OAuth 2.0 Client ID

### Back to Credentials

1. Click **+ CREATE CREDENTIALS**
2. Choose **OAuth 2.0 Client IDs**
3. Select **Web application**

### Configure Web Application

**Name:** `Beeline Production`

**Authorized JavaScript origins:**
```
https://beeline.works
https://www.beeline.works
```

**Authorized redirect URIs:**
```
https://beeline.works/api/auth/callback/google
https://beeline.works/api/auth/signin/google
https://www.beeline.works/api/auth/callback/google
https://www.beeline.works/api/auth/signin/google
```

Click **CREATE**

---

## Step 5: Save Your Credentials

### You'll see a popup with:
- **Client ID** (looks like: `123456-abc.apps.googleusercontent.com`)
- **Client Secret** (long random string)

**⚠️ IMPORTANT:** Save these securely! This is sensitive data.

### Download JSON
1. Click **DOWNLOAD JSON** button
2. Save the file somewhere safe
3. Keep it secure (don't commit to git)

---

## Step 6: Add Credentials to Vercel

### In Vercel Dashboard:

1. Go to your project: **beeline**
2. **Settings** → **Environment Variables**
3. Add/update these variables for **Production**:

```
GOOGLE_CLIENT_ID=<your-client-id>
GOOGLE_CLIENT_SECRET=<your-client-secret>
NEXTAUTH_URL=https://beeline.works
NEXTAUTH_SECRET=<generate-secure-random>
```

### Generate Secure Secrets

```bash
# Generate NEXTAUTH_SECRET
openssl rand -base64 32

# Example output:
# vZ9kL2mN5pQ8rT1uV4wX7yA0bC3dE6fG9hI2jK5lM8nO1pQ
```

### Copy the output and paste it in Vercel as `NEXTAUTH_SECRET`

---

## Step 7: Update Production Build

### Redeploy Application

In Vercel Dashboard:
1. Go to **Deployments**
2. Select latest deployment
3. Click **Redeploy**
4. Wait for build to complete

Or push to main branch:
```bash
git add .
git commit -m "Production: Update Google OAuth for beeline.works"
git push origin beeline-main
```

---

## Step 8: Test Google OAuth

### Test Sign In

1. Go to `https://beeline.works/login`
2. Click **Continue with Google**
3. You should be redirected to Google login
4. After signing in, should be redirected to dashboard

### Test is Successful If:
✅ Google login button works
✅ You're redirected to Google login
✅ After login, you see your dashboard
✅ Admin dashboard shows your email

---

## Step 9: Update .env.local for Local Development (Optional)

If you want to test production Google OAuth locally:

```bash
# website/.env.local

GOOGLE_CLIENT_ID=<production-client-id>
GOOGLE_CLIENT_SECRET=<production-client-secret>
NEXTAUTH_URL=https://beeline.works
NEXTAUTH_SECRET=<same-as-production>
```

⚠️ Note: Local testing with production OAuth requires:
- Running on `https://` (HTTPS)
- Or adding `http://localhost:3000` to Google OAuth authorized origins

---

## Troubleshooting

### "Redirect URI mismatch" Error

**Problem:** Google says callback URL doesn't match

**Solution:**
1. Go to Google Cloud Console
2. **APIs & Services** → **Credentials**
3. Edit the OAuth client
4. Add the exact redirect URL that's failing
5. Example: `https://beeline.works/api/auth/callback/google`
6. Click **SAVE**
7. Wait 1-2 minutes for changes to propagate
8. Test again

### "OAuth Client not found"

**Problem:** Environment variables aren't set

**Solution:**
1. Verify `GOOGLE_CLIENT_ID` is in Vercel dashboard
2. Verify `GOOGLE_CLIENT_SECRET` is in Vercel dashboard
3. Verify `NEXTAUTH_URL` is set to `https://beeline.works`
4. Redeploy the application

### "Sign in page doesn't show Google button"

**Problem:** NextAuth not configured

**Solution:**
1. Check `.env.local` has Google credentials (for local)
2. Check Vercel has Google credentials (for production)
3. Verify build completed successfully
4. Clear browser cache and try again

---

## Security Checklist

- [ ] Client ID is known (it's public)
- [ ] Client Secret is NOT committed to git
- [ ] Client Secret is only in Vercel secrets (not in code)
- [ ] Authorized origins include `https://beeline.works`
- [ ] Authorized redirect URIs are correct
- [ ] HTTPS is enforced on production domain
- [ ] NEXTAUTH_SECRET is long and random
- [ ] Environment variables are marked as "Sensitive"

---

## What Users See

### Google Sign In Flow:

1. User goes to `https://beeline.works`
2. Clicks "Continue with Google" or "Get Started"
3. Redirected to Google login
4. User signs in with their Google account
5. Redirected back to `beeline.works`
6. User can now access dashboard

---

## Admin Registration with Google OAuth

### For Admin Access:

1. **Register admin secret first:**
   ```bash
   curl -X POST 'https://beeline.works/api/auth/admin-signup' \
     -H 'Content-Type: application/json' \
     -d '{
       "email": "your-email@gmail.com",
       "adminSecret": "Janae3lla@2603"
     }'
   ```

2. **Sign in with Google:**
   - Go to `/login`
   - Click "Continue with Google"
   - Use the same email

3. **Access Admin Dashboard:**
   - Navigate to `/admin/dashboard`
   - Should see bridge metrics

---

## Quick Reference

| Item | Value |
|------|-------|
| **Google Project** | Beeline WhatsApp Platform |
| **OAuth App Name** | Beeline Production |
| **Redirect Domain** | https://beeline.works |
| **Callback URL** | /api/auth/callback/google |
| **Admin Email** | nanayawjoshua@gmail.com |

---

## Files That Changed

### In Vercel Environment Variables:
```
GOOGLE_CLIENT_ID=<production-value>
GOOGLE_CLIENT_SECRET=<production-value>
NEXTAUTH_URL=https://beeline.works
NEXTAUTH_SECRET=<secure-random-value>
```

### No Code Changes Needed
The existing NextAuth configuration in `lib/auth.ts` already supports Google OAuth.

---

## Next Steps

1. ✅ Create Google Cloud project
2. ✅ Create OAuth credentials
3. ✅ Add credentials to Vercel
4. ✅ Redeploy application
5. ✅ Test Google login at beeline.works
6. ✅ Admin can register with secret
7. ✅ Admin can access /admin/dashboard

---

**Google OAuth is now configured for beeline.works!** 🔐

Users can sign in with their Google accounts.
