# PHASE 2: SUPABASE SETUP
## Complete database migration (1-2 hours)

**Status:** Ready to execute
**Estimated Time:** 2 hours
**Cost:** Free (Supabase free tier)

---

## 🎯 WHAT THIS PHASE DOES

Replaces:
- ❌ Render PostgreSQL (GHS 360/month)
- ❌ Upstash Redis (GHS 150/month)

With:
- ✅ Supabase (PostgreSQL + Storage + Auth + Real-time) = GHS 250/month

**Savings: GHS 260/month = GHS 3,120/year**

---

## 📋 STEP-BY-STEP SETUP

### Step 1: Create Supabase Project (2 minutes)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. **Project name:** `beeline-mvp` (or your choice)
5. **Database password:** Generate strong password (save it!)
6. **Region:** `us-east-1` (or closest to Ghana)
7. Click "Create new project"

⏳ Wait 3-5 minutes for database to initialize

---

### Step 2: Get API Keys (2 minutes)

Once project is created:

1. Go to **Settings** → **API**
2. Copy these values:
   - **Project URL** → `SUPABASE_URL`
   - **anon public key** → `SUPABASE_KEY`
   - **service_role key** → `SUPABASE_SERVICE_KEY`

3. Save to `.env` file:
```bash
SUPABASE_URL=https://xxxxxxxxx.supabase.co
SUPABASE_KEY=eyJhbGc...xxxxxx
SUPABASE_SERVICE_KEY=eyJhbGc...xxxxxx
```

---

### Step 3: Import Database Schema (5 minutes)

1. Go to **SQL Editor** in Supabase dashboard
2. Click **New Query**
3. Copy entire content of `shared/supabase-schema.sql`
4. Paste into SQL Editor
5. Click **Run**

✅ Wait for schema to be created (should see green checkmark)

---

### Step 4: Enable Row-Level Security (3 minutes)

RLS protects vendor data (vendors only see their own data):

1. Go to **Auth** → **Policies**
2. You should see tables with RLS enabled:
   - vendors
   - products
   - transactions
   - messages

✅ Verify each table shows "RLS enabled"

---

### Step 5: Create Storage Bucket (2 minutes)

For product images:

1. Go to **Storage** in Supabase
2. Click **Create new bucket**
3. **Bucket name:** `product-images`
4. **Public:** Uncheck (private bucket)
5. Click **Create bucket**

✅ You should see bucket in the list

---

### Step 6: Test Connection (3 minutes)

From your machine, test the connection:

```bash
# Using psql (if installed)
psql -h db.xxxxxxxxx.supabase.co \
     -U postgres \
     -d postgres \
     -p 5432 \
     -c "SELECT * FROM vendors LIMIT 1;"

# Or using Supabase dashboard:
# Go to SQL Editor → New Query
# SELECT COUNT(*) FROM vendors;
```

Expected output: `count: 0` (no vendors yet)

---

## ✅ VERIFICATION CHECKLIST

After completing all steps, verify:

- [ ] Supabase project created and accessible
- [ ] API keys copied to `.env`
- [ ] Schema imported (7 tables created)
  - [ ] vendors
  - [ ] products
  - [ ] transactions
  - [ ] messages
  - [ ] jiji_leads
  - [ ] outreach_campaigns
  - [ ] daily_analytics
- [ ] RLS enabled on sensitive tables
- [ ] Storage bucket created for images
- [ ] Test query returns 0 vendors

---

## 🔧 ENVIRONMENT VARIABLES TO UPDATE

Update your `.env` file with these values from Supabase:

```bash
# From Supabase Settings → API
SUPABASE_URL=https://[PROJECT_ID].supabase.co
SUPABASE_KEY=[ANON_PUBLIC_KEY]
SUPABASE_SERVICE_KEY=[SERVICE_ROLE_KEY]

# For website
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_ID].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[ANON_PUBLIC_KEY]
```

---

## 📚 WHAT EACH TABLE DOES

### vendors
```
Stores vendor information
├─ phone (unique identifier)
├─ name, email, category
├─ wallet_balance (how much they've earned)
├─ commission_rate (5% default)
├─ rating (from buyers)
└─ whatsapp_connected (true/false)
```

### products
```
Stores product listings
├─ vendor_id (which vendor)
├─ title, description, price
├─ category (electronics, fashion, food, etc.)
├─ image_urls (array of images)
└─ status (active, sold, removed)
```

### transactions
```
Records every sale
├─ vendor_id (who sold)
├─ buyer_phone (who bought)
├─ gross_amount (sale price)
├─ commission_amount (5% Beeline takes)
├─ net_amount (vendor receives)
├─ payment_status (pending, paid, failed)
└─ pawapay_transaction_id (for settlement)
```

### messages
```
Stores all conversations
├─ vendor_id (vendor in conversation)
├─ sender_type (vendor, buyer, system)
├─ message_text (what was said)
├─ message_type (inquiry, confirmation, suggestion, etc.)
└─ ai_suggested_response (what Grok suggested)
```

### jiji_leads
```
Tracks lead generation from Jiji
├─ phone (vendor contact)
├─ name, category (Jiji seller info)
├─ quality_score (0-100, how good a fit)
├─ status (pending, contacted, onboarded, etc.)
└─ converted_to_vendor_id (link to actual vendor if signed up)
```

### outreach_campaigns
```
Tracks marketing campaigns
├─ name (e.g., "Jiji Batch 1")
├─ target_category (who to target)
├─ message_template (what to send)
└─ stats (how many responded, onboarded, etc.)
```

### daily_analytics
```
Tracks daily metrics
├─ date (which day)
├─ transactions_count (how many sales)
├─ gmv (total sale value)
├─ revenue (Beeline commission)
└─ new_vendors (how many signed up)
```

---

## 🚀 NEXT STEPS

Once Phase 2 is complete:

1. **Phase 3:** Migrate website to use Supabase (instead of Render PostgreSQL)
2. **Phase 4:** Deploy simplified phone bridge with Supabase connection
3. **Phase 5:** Integrate Grok API for message routing

---

## 📞 TROUBLESHOOTING

### "Connection refused"
- Verify `SUPABASE_URL` is correct
- Check `SUPABASE_KEY` matches anon public key (not service key)
- Ensure Supabase project is fully initialized (wait 5 minutes)

### "RLS policy denies access"
- This is expected until we set up authentication
- Phase 3 will handle this

### "Storage bucket not found"
- Verify bucket name is `product-images` (exact match)
- Check "Public" is unchecked

### Schema import failed
- Copy-paste entire `shared/supabase-schema.sql` file
- Make sure no lines are cut off
- Try splitting by sections if too large

---

## ✨ SUCCESS CRITERIA

Phase 2 complete when:

✅ Supabase project accessible
✅ All 7 tables created
✅ Storage bucket ready
✅ Environment variables set
✅ Can query vendors table (returns 0 rows)
✅ Ready for Phase 3 (website migration)

**Estimated completion: 2-3 hours from start**

---

*BUZZ Phase 2 | Supabase MVP Setup | Ready to Execute*
