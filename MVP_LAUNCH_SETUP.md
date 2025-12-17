# 🚀 MVP Launch Setup Guide

**Date**: January 17, 2025
**Target**: Launch Beeline MVP today
**Platform**: https://beeline.works

---

## ✅ Already Completed

- [x] Terminal cursor logo integrated
- [x] Vendor login page (/login)
- [x] Admin login page (/admin/login)
- [x] Complete inventory management system
- [x] WhatsApp inventory commands
- [x] Products dashboard UI
- [x] All code pushed to GitHub

---

## 🎯 Setup Steps (Do in Order)

### 1. Run Database Migration

**Go to**: Supabase Dashboard → SQL Editor → New Query

**IMPORTANT**: Copy ONLY the SQL code below (no markdown formatting, no backticks)

```sql
-- Create products table for vendor inventory management
CREATE TABLE IF NOT EXISTS products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,

  -- Product details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,

  -- Pricing and inventory
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,

  -- Product status
  is_active BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 5,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Search optimization
  tsv tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(tsv);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER products_updated_at_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Vendors can only manage their own products
CREATE POLICY "Vendors can view their own products"
  ON products FOR SELECT
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own products"
  ON products FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own products"
  ON products FOR UPDATE
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can delete their own products"
  ON products FOR DELETE
  USING (vendor_id = auth.uid());

-- Create view for low stock products
CREATE OR REPLACE VIEW low_stock_products AS
SELECT
  p.product_id,
  p.vendor_id,
  p.name,
  p.quantity,
  p.low_stock_threshold,
  v.phone as vendor_phone
FROM products p
JOIN vendors v ON p.vendor_id = v.vendor_id
WHERE p.is_active = true
  AND p.quantity <= p.low_stock_threshold
ORDER BY p.quantity ASC;
```

**Click**: "Run" button

**Expected**:
```
Success. No rows returned
```

**Common Errors & Fixes**:
- ❌ "syntax error at or near 'from'" → You copied markdown text. Copy ONLY the SQL code.
- ❌ "column 'name' does not exist" → Old version. Use the SQL above (already fixed).
- ✅ "Success. No rows returned" → Perfect! Migration complete.

---

### 2. Create Storage Bucket for Product Images

**Go to**: Supabase Dashboard → Storage → Create Bucket

**Settings**:
- **Bucket name**: `product-images`
- **Public bucket**: ✅ **YES** (important!)
- **File size limit**: 5 MB (optional)
- **Allowed MIME types**: `image/*` (optional)

**Click**: Create bucket

**Verify**: You should see `product-images` in your buckets list

---

### 3. Update Google OAuth Redirect URIs

**Go to**: [Google Cloud Console](https://console.cloud.google.com/) → APIs & Services → Credentials

**Find**: Your OAuth 2.0 Client ID (the one you created for Beeline)

**Click**: Edit (pencil icon)

**Add to "Authorized redirect URIs"**:
```
https://beeline.works/api/auth/callback/google
```

**Keep existing URIs**:
```
http://localhost:3000/api/auth/callback/google
https://your-vercel-preview-url/api/auth/callback/google (if any)
```

**Click**: Save

**Wait**: Takes ~5 minutes for changes to propagate

---

### 4. Verify Vercel Environment Variables

**Go to**: Vercel Dashboard → Your Project → Settings → Environment Variables

**Check these exist** (don't change values, just verify):
- ✅ `NEXTAUTH_URL` = `https://beeline.works`
- ✅ `NEXTAUTH_SECRET` = (your secret)
- ✅ `GOOGLE_CLIENT_ID` = (your Google OAuth client ID)
- ✅ `GOOGLE_CLIENT_SECRET` = (your Google OAuth client secret)
- ✅ `NEXT_PUBLIC_SUPABASE_URL` = (your Supabase URL)
- ✅ `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (your Supabase anon key)
- ✅ `SUPABASE_SERVICE_ROLE_KEY` = (your Supabase service role key)

**If missing**: Add them in Vercel, then redeploy

---

### 5. Verify WhatsApp Bridge is Running

**On your server** (where bridge runs):

```bash
cd phone_bridge
pm2 status
```

**Expected**: `phone-bridge-server` showing `online`

**If not running**:
```bash
pm2 restart phone-bridge-server
```

**Check logs**:
```bash
pm2 logs phone-bridge-server --lines 50
```

---

### 6. Verify Cloudflare Tunnel is Running

```bash
cloudflared tunnel list
```

**Expected**: Your tunnel showing as `ACTIVE`

**Verify DNS**:
```bash
ping bridge.beeline.works
```

**Should resolve**: To Cloudflare IP (104.x.x.x or similar)

---

## 🧪 Testing Checklist (Next Document)

Once setup is complete, move to `MVP_TESTING_CHECKLIST.md`

---

## 🆘 Troubleshooting

### Migration Failed?
- Check if `vendors` table exists first
- Check for syntax errors in SQL
- Try running sections separately

### Storage Bucket Creation Failed?
- Make sure you're in the right Supabase project
- Try refreshing the page and creating again

### Google OAuth Not Working?
- Wait 5-10 minutes after adding redirect URI
- Clear browser cache
- Check that URI is exact match (https, no trailing slash)

### Bridge Not Connecting?
- Check bridge logs: `pm2 logs phone-bridge-server`
- Restart bridge: `pm2 restart phone-bridge-server`
- Check tunnel: `cloudflared tunnel list`

---

## ✅ Setup Checklist

- [ ] Database migration ran successfully (saw "Success. No rows returned")
- [ ] `product-images` storage bucket created and is PUBLIC
- [ ] Google OAuth redirect URI added (https://beeline.works/api/auth/callback/google)
- [ ] Vercel environment variables verified (all 7 exist)
- [ ] WhatsApp bridge running (`pm2 status` shows online)
- [ ] Cloudflare tunnel active (`cloudflared tunnel list` shows ACTIVE)

**When all checked**: ✅ Setup complete! → Proceed to [MVP_TESTING_CHECKLIST.md](MVP_TESTING_CHECKLIST.md)

---

## 🎯 Quick Verification

**Test the migration worked**:

Go to Supabase → Table Editor → Should see new `products` table with columns:
- product_id
- vendor_id
- name
- description
- image_url
- price
- quantity
- is_active
- low_stock_threshold
- created_at
- updated_at

**If you see these columns** → Migration successful! ✅
