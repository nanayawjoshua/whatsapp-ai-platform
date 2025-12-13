# 🚀 PHASE 2: SUPABASE SETUP - START HERE

**Status:** Ready for execution RIGHT NOW
**Duration:** 30 minutes total
**Your Role:** Execute in Supabase dashboard (I provide all instructions)
**Your Tools:** Supabase dashboard + browser only (no coding needed)

---

## ⚡ QUICK SUMMARY

You have Supabase credentials ready. Now we execute in 3 simple steps:

1. **Import database schema** (5 minutes)
2. **Verify it worked** (10 minutes)
3. **Create storage bucket** (5 minutes)

This gives you a complete database with 7 tables, security policies, and storage for images.

---

## 📋 STEP 1: IMPORT DATABASE SCHEMA (5 minutes)

### What You'll Do:
1. Open Supabase dashboard
2. Copy a SQL file
3. Paste it into an editor
4. Click "Run"
5. Wait for green checkmarks

### Detailed Instructions:

**Step 1.1: Open Supabase Dashboard**
```
URL: https://jwwuggvkjivrnbrlhpbc.supabase.co

You should already be logged in. If not:
- Email: [your email]
- Password: [your password]
```

**Step 1.2: Go to SQL Editor**
On the left sidebar, find and click: **"SQL Editor"**

**Step 1.3: Create New Query**
Click button: **"New Query"** (top right area)

**Step 1.4: Copy the Database Schema**

The schema file is here in your repo:
```
whatsapp-ai-platform-beeline-main/shared/supabase-schema.sql
```

**What to do:**
1. Open that file in VS Code or text editor
2. Select ALL content (Ctrl+A)
3. Copy it (Ctrl+C)

**The file contains:**
- 7 database tables
- Security policies
- Functions and triggers
- ~400 lines total

**Step 1.5: Paste into Supabase**
1. Click in the SQL editor text area in Supabase
2. Paste the SQL (Ctrl+V)
3. You'll see the entire schema code in the editor

**Step 1.6: Run the Schema**
1. Click the blue **"Run"** button (bottom right)
2. Wait 1-2 minutes
3. Watch for green checkmarks next to each statement
4. You should see: "Successfully executed X statements"

**What happens:**
- 7 tables created: vendors, products, transactions, messages, jiji_leads, outreach_campaigns, daily_analytics
- Security rules added automatically
- Indexes created for performance
- Functions and triggers set up

**If you see red errors:**
- Common: "Extension already exists" - This is fine, ignore it
- If schema doesn't import: Take a screenshot and send it to me

---

## ✅ STEP 2: VERIFY IT WORKED (10 minutes)

### 2.1: Check Tables Were Created

**In SQL Editor, create a NEW QUERY:**
```sql
SELECT table_name
FROM information_schema.tables
WHERE table_schema='public'
ORDER BY table_name;
```

**Click Run**

**Expected result:**
You should see 7 table names:
- daily_analytics
- jiji_leads
- messages
- outreach_campaigns
- products
- transactions
- vendors

✅ If you see all 7 → **PASS**
❌ If you see fewer → Something went wrong in Step 1

---

### 2.2: Check Vendors Table is Empty

**New Query:**
```sql
SELECT COUNT(*) as vendor_count FROM vendors;
```

**Expected result:** `0` (no vendors yet)

✅ If you see 0 → **PASS**

---

### 2.3: Check Table Structure

**New Query:**
```sql
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name='vendors'
ORDER BY ordinal_position;
```

**Expected result:**
You should see columns like: id, phone, name, email, category, commission_rate, wallet_balance, etc.

✅ If you see ~18 columns → **PASS**

---

### 2.4: Check Security Policies Exist

**New Query:**
```sql
SELECT tablename, COUNT(*) as policy_count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename;
```

**Expected result:**
Policies should exist on: vendors, products, transactions, messages

✅ If you see policies → **PASS**

---

## 🪣 STEP 3: CREATE STORAGE BUCKET (5 minutes)

### 3.1: Go to Storage

In Supabase left sidebar, click: **"Storage"**

### 3.2: Create New Bucket

Click button: **"Create new bucket"**

Fill in:
- **Bucket name:** `product-images` (exactly this)
- **Public bucket:** UNCHECK this (keep private)

Click: **"Create bucket"**

### 3.3: Verify Bucket Created

You should see `product-images` in the bucket list.

✅ If you see it → **PASS**

---

## 📊 FINAL CHECKLIST

When you complete all 3 steps, you should have:

- [ ] Schema imported (Step 1)
- [ ] 7 tables visible (Step 2.1)
- [ ] Vendors table empty (Step 2.2)
- [ ] Table columns verified (Step 2.3)
- [ ] Security policies confirmed (Step 2.4)
- [ ] Storage bucket created (Step 3)

**Once all checked, Phase 2 is COMPLETE ✅**

---

## 🎯 WHAT YOU JUST BUILT

A production-ready database with:

**Tables:**
- `vendors` - Seller profiles
- `products` - Items for sale
- `transactions` - Orders & payments
- `messages` - Customer messages
- `jiji_leads` - Prospects to contact
- `outreach_campaigns` - Marketing campaigns
- `daily_analytics` - Performance metrics

**Security:**
- Row-level security (vendors see only their data)
- Automatic timestamp management
- Commission calculations

**Storage:**
- `product-images` bucket for photos

**Cost:**
- All included in Supabase free tier (~GHS 250/month at scale)

---

## 🚀 WHEN YOU'RE DONE

Reply with:
1. ✅ All checks passed (or list any that failed)
2. Screenshot of table list (optional but helpful)
3. Any error messages you saw

Then I'll immediately:
1. Create the Supabase client libraries
2. Start migrating the website to use this database
3. Move to Phase 3

---

## 💡 NOTES

- **Don't worry about the SQL.** I created it for you. You just copy-paste-run.
- **This is safe.** The schema has automatic backups in Supabase.
- **If you make a mistake,** You can delete the project and create a new one in 2 minutes.
- **Keep credentials safe.** Don't share the URLs or keys in Slack or email.

---

## ⏱️ TIME ESTIMATE

- Reading this: 3 minutes
- Step 1 (Import): 5 minutes
- Step 2 (Verify): 10 minutes
- Step 3 (Storage): 5 minutes
- **Total: 23 minutes**

---

## 🆘 IF SOMETHING GOES WRONG

**Error: "Extension already exists"**
→ This is fine. Click Run again, it will skip it.

**Error: "Syntax error in SQL"**
→ Take a screenshot and send it to me. I'll debug it.

**Tables not showing after Run**
→ Refresh the page (F5) and try query 2.1 again.

**Can't find SQL Editor**
→ Look on left sidebar. Should be 3rd item down. It has a terminal/code icon.

---

**You're ready! Open Supabase dashboard now and start with Step 1.**

Good luck! 🎉

---

*Phase 2: Supabase Setup | 30 minutes | No coding required*
