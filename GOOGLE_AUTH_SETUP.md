# Google OAuth Setup Guide for Beeline

## Overview

We've implemented Google Sign-In using NextAuth.js. Vendors can now login with:
1. **Google OAuth** (one-click, recommended)
2. **Email/Password** (traditional)

## What Was Built

### Files Created
- `app/api/auth/[...nextauth]/route.ts` - NextAuth configuration
- `types/next-auth.d.ts` - TypeScript type extensions
- `app/providers.tsx` - SessionProvider wrapper
- `.env.example` - Environment variables template

### Files Modified
- `app/login/page.tsx` - Added "Sign in with Google" button
- `app/dashboard/page.tsx` - Uses NextAuth session
- `app/layout.tsx` - Wrapped with Providers
- `package.json` - Added next-auth dependency

## Google Cloud Console Setup

### Step 1: Create Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Click "Select a project" → "NEW PROJECT"
3. Project name: `Beeline Ghana`
4. Click "CREATE"

### Step 2: Enable Google OAuth

1. In your project, go to **APIs & Services** → **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
3. Click **"CONFIGURE CONSENT SCREEN"**

### Step 3: Configure OAuth Consent Screen

#### Basic Info
- User Type: **External** (for all users - Personal, Business, and Enterprise)
- Click **CREATE**

#### App Information (Actual fields you'll see)
- **App name**: `Beeline Ghana`
- **User support email**: your@email.com (select from dropdown)
- **App logo**: (optional - skip for now, not required)
- **App domain** (optional fields - may not appear):
  - Application home page: `https://beeline.works` (add if field exists)
  - Privacy policy: (skip - not required)
  - Terms of service: (skip - not required)

**Note:** Privacy and Terms URLs are **NOT required** for OAuth to work. Only needed for public app verification.

#### Developer Contact Information
- **Email addresses**: your@email.com
- Click **SAVE AND CONTINUE**

#### Scopes (Next screen)
- If prompted, click **ADD OR REMOVE SCOPES**
- Select these (or skip if not shown - they're added automatically):
  - `.../auth/userinfo.email` - See your email address
  - `.../auth/userinfo.profile` - See your basic profile info
- Click **UPDATE** then **SAVE AND CONTINUE**

#### Test Users (Next screen)
- **Skip this step** - Not needed for External apps
- Click **SAVE AND CONTINUE**

#### Summary
- Review your settings
- Click **BACK TO DASHBOARD**

### Step 4: Create OAuth Client ID

1. Go back to **Credentials**
2. Click **"+ CREATE CREDENTIALS"** → **OAuth client ID**
3. Application type: **Web application**
4. Name: `Beeline Website`

#### Authorized JavaScript origins
Add these URLs:
```
http://localhost:3000
https://beeline.works
https://www.beeline.works
https://your-vercel-deployment.vercel.app
```

#### Authorized redirect URIs
Add these URLs:
```
http://localhost:3000/api/auth/callback/google
https://beeline.works/api/auth/callback/google
https://www.beeline.works/api/auth/callback/google
https://your-vercel-deployment.vercel.app/api/auth/callback/google
```

5. Click **CREATE**
6. You'll see a popup with:
   - **Client ID**: `123456789-abc...apps.googleusercontent.com`
   - **Client Secret**: `GOCSPX-...`
7. Copy both values

### Step 5: Add Environment Variables

Create `website/.env.local`:

```env
# Database
DATABASE_URL=your-neon-database-url

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-generate-one

# Google OAuth
GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=GOCSPX-your-client-secret

# Cloud Bridge
CLOUD_BRIDGE_URL=https://your-cloud-bridge.onrender.com
```

#### Generate NEXTAUTH_SECRET

Run this command:
```bash
openssl rand -base64 32
```

Or in Node.js:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

### Step 6: Deploy to Vercel

Add environment variables in Vercel dashboard:

1. Go to your Vercel project
2. Settings → Environment Variables
3. Add each variable:
   - `DATABASE_URL`
   - `NEXTAUTH_URL` = `https://beeline.works`
   - `NEXTAUTH_SECRET` = (same as local)
   - `GOOGLE_CLIENT_ID`
   - `GOOGLE_CLIENT_SECRET`
   - `CLOUD_BRIDGE_URL`

### Step 7: Update Database

Since vendors can now sign up with Google, you need to ensure:

1. Email is set when vendor signs up via Google
2. No password required for Google OAuth users

**Already handled in code:**
- Google users are only allowed if they already exist in vendors table
- For new Google users, they should go through signup flow first

## Testing

### Local Testing

1. Start dev server:
   ```bash
   cd website
   npm run dev
   ```

2. Go to `http://localhost:3000/login`
3. Click "Continue with Google"
4. You should see Google sign-in popup
5. Select your Google account
6. Should redirect to dashboard

### Test with Existing Vendor

1. Create a test vendor with Google email:
   ```sql
   INSERT INTO vendors (
     vendor_id, name, phone, email, business_type, subscription_status
   ) VALUES (
     'test_google_001',
     'Test Hospital',
     '233501234567',
     'your-gmail@gmail.com',  -- Use your actual Gmail
     'hospital',
     'active'
   );
   ```

2. Login with Google using that Gmail
3. Should work!

## Flow Diagram

```
User clicks "Sign in with Google"
  ↓
Google OAuth popup appears
  ↓
User selects Google account
  ↓
Google redirects to /api/auth/callback/google
  ↓
NextAuth checks if vendor exists with that email
  ↓
If exists: Create session & redirect to /dashboard
If not exists: Redirect to /signup with error
```

## Signup Flow Update (Future)

For Monday demo, vendors must be created manually or via existing signup flow.

**Future enhancement:**
When a new user signs up with Google, automatically create vendor record:

```typescript
// In NextAuth signIn callback
if (account?.provider === 'google' && !vendorExists) {
  // Create new vendor
  await query(`
    INSERT INTO vendors (vendor_id, name, email, subscription_status)
    VALUES ($1, $2, $3, 'trial')
  `, [generateId(), profile.name, profile.email]);
}
```

## Troubleshooting

### Error: "Error 400: redirect_uri_mismatch"
- Go to Google Cloud Console → Credentials
- Add the exact redirect URI shown in error
- Format: `https://your-domain.com/api/auth/callback/google`

### Error: "This app isn't verified"
- During development, this is normal
- Click "Advanced" → "Go to Beeline Ghana (unsafe)"
- For production, submit app for Google verification

### Error: "Account not found"
- Vendor with that Gmail doesn't exist in database
- Create vendor manually with that email
- Or update signup flow to create vendor

### Session not persisting
- Check NEXTAUTH_SECRET is set
- Ensure cookies are enabled in browser
- Check NEXTAUTH_URL matches your domain

## Security Notes

1. **Never commit `.env.local`** - It's in `.gitignore`
2. **Use different secrets** for dev and production
3. **Keep Google Client Secret** private
4. **Add production URLs only** to Google Console
5. **Enable HTTPS** in production (Vercel does this automatically)

## Monday Demo

For Monday's hospital demo:

1. **Before meeting:**
   - Create hospital vendor record with hospital's Gmail
   - Test Google login works
   
2. **During demo:**
   - Show "Sign in with Google" button
   - One-click login (impressive!)
   - They see their dashboard immediately

3. **Fallback:**
   - If hospital doesn't use Gmail, use email/password flow
   - Most businesses in Ghana use Gmail for work

## Production Checklist

- [ ] Google Cloud project created
- [ ] OAuth consent screen configured
- [ ] OAuth Client ID created
- [ ] Authorized redirect URIs added (production URLs)
- [ ] Environment variables set in Vercel
- [ ] NEXTAUTH_SECRET is secure random string
- [ ] Test login works on production domain
- [ ] Test vendor can access dashboard after Google login

---

**Built with industry-standard NextAuth.js - the best auth solution for Next.js apps.**
