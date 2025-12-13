# 🚀 PHASE 3: WEBSITE MIGRATION - READY TO START

**Status:** READY FOR IMMEDIATE EXECUTION
**Timeline:** 1-2 days
**Target Completion:** December 15, 2025

---

## ✅ PREREQUISITE CHECK

Before starting Phase 3, verify Phase 2 is complete:

- [x] Supabase project created
- [x] Database schema imported (all 7 tables)
- [x] is_admin() function added
- [x] RLS policies configured
- [x] Storage bucket created
- [x] Credentials in .env.buzz

**Status:** ✅ READY FOR PHASE 3

---

## 🎯 WHAT IS PHASE 3?

**Goal:** Migrate website from Render PostgreSQL → Supabase

**What Changes:**
- Website dependencies (add @supabase/supabase-js)
- API routes (switch from Render → Supabase client)
- Environment variables (add Supabase keys)
- Deployment (Vercel gets new env vars)

**What Stays the Same:**
- Website UI/UX (no changes)
- API response format (no changes)
- Vendor experience (no changes)

**Outcome:**
- Website working with Supabase backend
- Vendor registration fully functional
- Ready for Phase 4 (phone bridge)

---

## 📋 PHASE 3 TASKS

### Task 3.1: Grok Creates Supabase Client Libraries (Parallel)
**What:** Two TypeScript files for Supabase integration
**Duration:** 15 minutes
**Files:**
- `shared/supabase-client.ts` - Admin/server-side client
- `website/lib/supabase.ts` - Client-side client

**Status:** READY FOR DISPATCH

---

### Task 3.2: Update website/package.json
**What:** Add Supabase SDK, remove Render drivers
**Duration:** 10 minutes
**Changes:**
- Add: `@supabase/supabase-js`
- Remove: Any PostgreSQL drivers
- Keep: All other dependencies

**Status:** READY FOR DISPATCH

---

### Task 3.3: Migrate API Routes
**What:** Update 3 API endpoints to use Supabase
**Duration:** 2-3 hours total

**Routes to Migrate:**
1. `/api/vendor/register` - Already partially done, needs full integration
2. `/api/vendor/dashboard` - Get vendor stats from Supabase
3. `/api/products/create` - Insert products into Supabase

**Pattern for each route:**
```typescript
// Replace this:
const result = await pgClient.query('SELECT * FROM vendors...');

// With this:
const { data, error } = await supabase
  .from('vendors')
  .select('*')
  .eq('id', vendorId);
```

**Status:** READY FOR DISPATCH

---

### Task 3.4: Update Environment Variables
**What:** Add Supabase keys to Vercel
**Duration:** 5 minutes

**Variables to Add:**
- NEXT_PUBLIC_SUPABASE_URL
- NEXT_PUBLIC_SUPABASE_KEY
- SUPABASE_SERVICE_KEY (for server-side)

**Status:** YOU WILL EXECUTE

---

### Task 3.5: Deploy to Vercel & Test
**What:** Push to GitHub, Vercel auto-deploys, test vendor registration
**Duration:** 10 minutes

**Test Checklist:**
- [ ] Vendor registration page loads
- [ ] Can submit phone number
- [ ] Get QR code back (or error if phone bridge not ready)
- [ ] No database errors
- [ ] Vendor created in Supabase

**Status:** YOU WILL EXECUTE

---

## 🎬 EXECUTION PLAN

### Day 1 (Today - Parallel Work)

**Grok Tasks (Parallel to your other work):**
- Task 3.1: Create Supabase client libraries

**Your Tasks:**
- Task 3.2: Update package.json
- Task 3.3: Migrate API routes

**Time Estimate:**
- Grok: 15 min
- You: 2-3 hours (including testing each route locally)

### Day 2 (Tomorrow)

**Your Tasks:**
- Task 3.4: Update Vercel environment variables
- Task 3.5: Deploy and test

**Time Estimate:**
- 15 minutes

---

## 💾 WORK LOCATION

**Website Location:** `website/` directory

**Files to Modify:**
- `website/package.json`
- `website/app/api/vendor/register/route.ts`
- `website/app/api/vendor/dashboard/route.ts`
- `website/app/api/products/create/route.ts`

**Files to Create:**
- `shared/supabase-client.ts` (Grok)
- `website/lib/supabase.ts` (Grok)

---

## 🔗 DEPENDENCIES

**Phase 3 Depends On:**
- ✅ Phase 2 complete (database live)
- ✅ Supabase credentials in .env.buzz
- ✅ Node.js and npm installed

**Phase 3 Blocks:**
- Phase 4 (phone bridge needs migrated APIs)
- Phase 5-7 (all depend on working website)

---

## 💰 COST ESTIMATE

**Grok (Code Generation):** FREE
- Creating client libraries

**Claude Code (Coordination):** ~$2
- Debugging, coordinating migration

**AI Costs Total:** ~$2

**Infrastructure:**
- Vercel: Still free (existing)
- Supabase: Free tier (existing)

**Total Cost:** ~$2

---

## ⚡ CRITICAL SUCCESS FACTORS

1. **Package.json First**
   - Update dependencies before writing code
   - Test `npm install` works

2. **One Route at a Time**
   - Migrate /vendor/register first
   - Test it locally
   - Then migrate others

3. **Use Supabase Client**
   - Import from `shared/supabase-client.ts`
   - Don't create multiple clients
   - Reuse the same instance

4. **Test Locally First**
   - Run `npm run dev`
   - Test each route before deploying
   - Check console for errors

5. **Deploy Early**
   - Don't wait for perfection
   - Vercel deploys automatically on git push
   - Easy to fix bugs post-deploy

---

## 🆘 COMMON ISSUES & FIXES

**Issue: "Cannot find module '@supabase/supabase-js'"**
→ Run: `npm install`

**Issue: "Environment variables not found"**
→ Check: .env file has NEXT_PUBLIC_SUPABASE_URL

**Issue: "Supabase connection refused"**
→ Check: SUPABASE_URL is correct in .env
→ Check: SUPABASE_KEY is correct

**Issue: "RLS policy violation"**
→ This is expected - means RLS is working
→ Will be fixed by authentication in Phase 4

---

## 📚 FILES YOU'LL NEED

**From Phase 2:**
- `.env.buzz` (copy credentials)
- `shared/supabase-schema.sql` (reference for table structure)

**From Website:**
- `website/package.json` (needs updating)
- `website/app/api/vendor/register/route.ts` (needs migration)
- `website/app/api/vendor/dashboard/route.ts` (needs creation)
- `website/app/api/products/create/route.ts` (needs migration)

**To Be Created:**
- `shared/supabase-client.ts` (Grok will create)
- `website/lib/supabase.ts` (Grok will create)

---

## 📈 SUCCESS METRICS

**Phase 3 is successful when:**
- [ ] Website builds without errors
- [ ] Vendor registration API responds
- [ ] Can create vendors in Supabase
- [ ] Can query vendor data
- [ ] All routes migrated and working
- [ ] Vercel deployment successful
- [ ] No TypeScript errors

---

## 🎯 NEXT STEPS

### Right Now (Immediate)

1. Read this document ✅
2. Review Phase 2 completion
3. Prepare to start Phase 3

### When Ready (Say "Ready for Phase 3")

1. Grok will create Supabase client libraries
2. You will update website/package.json
3. You will migrate API routes (one by one)
4. You will deploy to Vercel
5. You will test vendor registration

### Timeline

- Task 3.1 (Grok): 15 minutes
- Task 3.2 (You): 10 minutes
- Task 3.3 (You): 2-3 hours (with testing)
- Task 3.4 (You): 5 minutes
- Task 3.5 (You): 10 minutes
- **Total: ~3-4 hours of active work**

---

## 💡 KEY INSIGHT

**Phase 3 is the bridge between infrastructure (Phase 2) and features (Phases 4-7).**

Once Phase 3 is done:
- You have a working website with Supabase backend
- Vendors can register
- Data persists to database
- Ready to add phone bridge communication

This unblocks everything that comes next! 🚀

---

## ✨ SUMMARY

**Phase 3 Status:** READY TO EXECUTE ✅

**What Happens:** Website migrates from Render → Supabase

**Cost:** ~$2 in AI tools

**Time:** 3-4 hours active work

**Risk:** LOW (Supabase client is straightforward)

**Next Milestone:** Phase 4 (phone bridge deployment)

---

## 🚀 READY?

When you're ready to start Phase 3:

1. Say: **"Ready for Phase 3"**
2. I'll dispatch Grok tasks immediately
3. You start with package.json update
4. We execute in parallel
5. Website goes live with Supabase in 1-2 days

---

*BUZZ Phase 3 Prep | Website Migration | Ready to Ship*
