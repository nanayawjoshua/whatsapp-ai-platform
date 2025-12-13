# Vercel Setup Instructions - Manual Configuration

**Status:** Configuration file pushed to GitHub
**File:** vercel.json (root directory)

---

## Step-by-Step Vercel Dashboard Setup

### 1. Go to Vercel Project Settings

1. Visit: https://vercel.com/dashboard
2. Select your project: `whatsapp-ai-platform`
3. Click **Settings** (top menu)

---

### 2. Configure Build Settings

Go to **Settings → Build & Development Settings**

**Update these fields:**

**Build Command:**
```bash
cd whatsapp-ai-platform-beeline-main/website && npm install --legacy-peer-deps && npm run build
```

**Output Directory:**
```
whatsapp-ai-platform-beeline-main/website/.next
```

**Install Command:**
```bash
npm install --legacy-peer-deps
```

**Development Command (optional):**
```bash
cd whatsapp-ai-platform-beeline-main/website && npm run dev
```

Click **Save**

---

### 3. Set Environment Variables

Go to **Settings → Environment Variables**

**Add each of these variables:**

#### Production Environment:

| Variable | Value | Scope |
|----------|-------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://jwwuggvkjivrnbrlhpbc.supabase.co` | Production |
| `NEXT_PUBLIC_SUPABASE_KEY` | (Your anon key from .env.production) | Production |
| `SUPABASE_SERVICE_KEY` | (Your service key from .env.production) | Production |
| `PHONE_BRIDGE_URL` | `https://your-tunnel-url.trycloudflare.com` | Production |
| `NODE_ENV` | `production` | Production |

**To find these values:**
1. Open `website/.env.production` locally
2. Copy the values for each variable
3. Paste into Vercel dashboard

---

### 4. Redeploy

After setting environment variables:

1. Go to **Deployments**
2. Click the latest failed deployment
3. Click **Redeploy** button
4. Wait for build to complete

---

## Full Manual Deploy Command

If you prefer command-line deployment:

```bash
# Navigate to project root
cd c:\Users\USER\Desktop\josh\whatsapp-ai-platform-beeline-main

# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://jwwuggvkjivrnbrlhpbc.supabase.co

vercel env add NEXT_PUBLIC_SUPABASE_KEY
# Paste: (from .env.production)

vercel env add SUPABASE_SERVICE_KEY
# Paste: (from .env.production)

vercel env add PHONE_BRIDGE_URL
# Paste: https://your-bridge-tunnel-url.trycloudflare.com

vercel env add NODE_ENV
# Paste: production

# Deploy with new environment variables
vercel --prod
```

---

## Expected Build Process

When Vercel rebuilds with correct configuration:

```
1. Clone repository (buzz branch)
2. Run custom build command:
   cd whatsapp-ai-platform-beeline-main/website && npm install --legacy-peer-deps && npm run build
3. Build Next.js application
4. Output directory: whatsapp-ai-platform-beeline-main/website/.next
5. Deploy to Vercel Edge Network
6. Assign domain: https://beeline-website.vercel.app (or custom domain)
```

---

## Troubleshooting

### Build Still Fails

**Check these:**

1. **Root Directory Setting**
   - Verify "Root Directory" is NOT set (leave blank)
   - The `vercel.json` file specifies the build command

2. **Build Logs**
   - Click on failed deployment in Vercel Dashboard
   - Click "Logs" tab
   - Look for specific error message

3. **Local Build Test**
   ```bash
   cd whatsapp-ai-platform-beeline-main/website
   npm install --legacy-peer-deps
   npm run build
   ```
   - This should succeed locally first

### Environment Variables Not Loading

```bash
# Verify variables are set
vercel env list

# If missing, add them
vercel env add VARIABLE_NAME
# Then paste value

# Redeploy
vercel --prod
```

### Website Loads But Bridge Not Connected

1. Verify PHONE_BRIDGE_URL environment variable is set
2. Verify bridge tunnel is running
3. Test tunnel: `curl https://your-tunnel-url/health`
4. Check website console (F12) for CORS errors

---

## Vercel.json Explanation

The `vercel.json` file in repository root tells Vercel:

```json
{
  "buildCommand": "cd whatsapp-ai-platform-beeline-main/website && npm install --legacy-peer-deps && npm run build",
  // ^ Build command for nested website

  "outputDirectory": "whatsapp-ai-platform-beeline-main/website/.next",
  // ^ Where the built files are located

  "public": "whatsapp-ai-platform-beeline-main/website/public",
  // ^ Public assets directory

  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_KEY": "@next_public_supabase_key",
    "SUPABASE_SERVICE_KEY": "@supabase_service_key",
    "PHONE_BRIDGE_URL": "@phone_bridge_url",
    "NODE_ENV": "production"
  }
  // ^ Environment variables (@ prefix means pull from Vercel secrets)
}
```

---

## Success Indicators

✅ **Build succeeds:**
- Vercel logs show "Build Completed"
- No errors in build output
- Deployment status shows ✓

✅ **Website loads:**
- Can visit https://beeline-website.vercel.app
- Homepage displays correctly
- No 404 errors

✅ **Bridge connected:**
- Open developer console (F12)
- Network tab shows requests to bridge
- Health endpoint responds

---

## Next Steps

1. **Update Vercel Build Settings** with the commands above
2. **Set Environment Variables** in Vercel Dashboard
3. **Redeploy** latest deployment
4. **Verify** website loads and bridge connects
5. **Test** full message flow:
   - Sign up with phone number
   - Send test message
   - Verify in Supabase

---

## Quick Checklist

- [ ] Build Command updated in Vercel
- [ ] Output Directory set to `.next` path
- [ ] Environment variables added to Vercel
- [ ] PHONE_BRIDGE_URL points to working tunnel
- [ ] Redeployed after changing settings
- [ ] Website loads at vercel domain
- [ ] Bridge health endpoint accessible
- [ ] Console shows no CORS errors

---

**Last Updated:** 2025-12-13
**Configuration File:** vercel.json (committed to GitHub)

