# BUZZ Implementation Guide
## Step-by-Step Instructions for Lean Pivot

**Status:** Phase 1 files created ✅ | Awaiting clarification answers | Ready to implement

---

## 📋 What's Been Created (Waiting for Go-Ahead)

### Files Ready on `buzz` Branch:

1. **`BUZZ_PIVOT_ROADMAP.md`** ✅
   - Complete overview of the architectural pivot
   - Week-by-week implementation timeline
   - Success criteria and metrics

2. **`phone_bridge/BUZZ-phone-bridge-server.js`** ✅
   - Simplified phone bridge (no Redis, no clustering)
   - ~150 lines vs 500+ in original
   - Uses Supabase + Grok for message routing
   - Ready to deploy

3. **`shared/supabase-schema.sql`** ✅
   - Complete PostgreSQL schema
   - 7 tables: vendors, products, transactions, messages, jiji_leads, campaigns, analytics
   - Row-level security policies
   - Useful views for dashboards
   - Ready to import into Supabase

4. **`shared/mcp-jiji-scraper.js`** ✅
   - Jiji lead generation tool
   - Web scraping for vendor discovery
   - Quality scoring algorithm (0-100)
   - Can be used standalone or with Claude
   - Ready to integrate with n8n

5. **`website/app/api/vendor/register/route.ts`** ✅
   - Simplified vendor registration
   - Uses Supabase (not PostgreSQL)
   - Calls phone bridge for QR generation
   - Ready to deploy

---

## 🎯 CLARIFICATION QUESTIONS (ANSWER THESE FIRST)

Before we proceed, I need your decisions on:

### 1. **JIJI SCRAPING APPROACH**
```
Option A: Web scraping (free, risky)
├─ Pros: Free, works immediately
├─ Cons: Jiji might block if too aggressive
└─ Timeline: 1 day to implement

Option B: Contact Jiji for partnership (safe)
├─ Pros: Official relationship, better data
├─ Cons: 1-2 weeks negotiation
└─ Timeline: 1 week+

DECISION NEEDED: Which approach?
```A

**Recommendation:** Start with A (web scraping), keep it light (1-2 requests/sec). Can pivot to B later.

---

### 2. **PHONE BRIDGE SETUP**
```
Question: Is TCL 50SE already running Node.js + Termux?

If YES:
├─ We can deploy BUZZ-phone-bridge-server.js immediately
├─ Just set env vars and restart
└─ Time: 30 minutes

If NO:
├─ Need to install Node.js on phone
├─ Install Termux on Android
├─ Set up environment
└─ Time: 2-3 hours (one-time)

DECISION NEEDED: Current status of phone setup?
```
YES
**Recommendation:** Assume it's already set up from previous work.

---

### 3. **VENDOR OUTREACH MESSAGE**
```
Current template:
"Hi! 👋 Selling on Jiji?

We're launching Beeline Classifieds -
same reach, ZERO commission for first 100 vendors 🎁

✅ No monthly fee
✅ WhatsApp messaging (just like Jiji)
✅ Instant buyer payments (no waiting)
✅ AI handles customer service 24/7
✅ Link with delivery (Yango integration)

Join: beeline.works/vendor
First 100 vendors = ZERO commission forever
After = 5% commission (vs Jiji's 0% but slower payments)

Want in?"

DECISION NEEDED:
├─ Keep this message?
├─ Want A/B testing (2 versions)?
└─ Any changes needed?
``` keep this message

**Recommendation:** Use this as is. Test with first 50 vendors, iterate based on response rates.

---

### 4. **VENDOR DASHBOARD FEATURES (MVP)**
```
Option A: Minimal (fastest to market)
├─ Sales today
├─ Total earnings
├─ Product count
└─ Time: 1 day

Option B: Moderate (balanced)
├─ All of A, plus:
├─ Sales this week/month
├─ Ratings received
├─ Message count
├─ Pending payouts
└─ Time: 3 days

Option C: Full analytics (more useful)
├─ All of B, plus:
├─ Charts and graphs
├─ Customer insights
├─ Performance trends
└─ Time: 1 week

DECISION NEEDED: Which level for MVP?
``` Start with Option A. Add B features in Week 2 once you have real data.

**Recommendation:** Start with Option A. Add B features in Week 2 once you have real data.

---

### 5. **PRODUCT IMAGE UPLOADS**
```
Option A: WhatsApp only (vendor sends photo)
├─ Vendor: "I have shoes for GHS 150" + image
├─ AI extracts: Product, price, category
├─ Image stored in Supabase Storage
├─ Pros: Simplest, most natural
├─ Cons: Image quality varies
└─ Time: 2 days to implement

Option B: Web dashboard upload
├─ Vendor logs in, uploads images
├─ Higher quality control
├─ Pros: Better images
├─ Cons: Extra friction
└─ Time: 4 days

Option C: Both (hybrid)
├─ WhatsApp default, dashboard optional
├─ Pros: Best experience
├─ Cons: More complex
└─ Time: 5 days

DECISION NEEDED: Which approach?
```Start with A (WhatsApp). Users prefer it. Add B in Week 3

**Recommendation:** Start with A (WhatsApp). Users prefer it. Add B in Week 3.

---

### 6. **PAYMENT INTEGRATION TIMING**
```
Option A: Use PawaPay API immediately (instant settlement)
├─ Vendors get paid instantly
├─ More complex integration
└─ Timeline: 3-4 days

Option B: Simple "pending" status for now
├─ Just track transactions
├─ Payment handled manually for MVP
├─ Timeline: 1 day
└─ Can add PawaPay later

DECISION NEEDED: Which for MVP launch?
```A

**Recommendation:** Start with B (simple). Add PawaPay in Week 3 when you have paying vendors.

---

### 7. **LAUNCH TIMELINE COMMITMENT**
```
Can you commit 4 weeks full-time?

Week 1:
├─ Monday: Setup Supabase
├─ Tuesday: Migrate website to Supabase
├─ Wednesday: Deploy simplified phone bridge
├─ Thursday: Test vendor flow end-to-end
└─ Friday: Deploy to production

Week 2:
├─ Monday: Build Jiji scraper
├─ Tuesday: Create n8n outreach workflow
├─ Wednesday: Create vendor dashboard
├─ Thursday: Test with 10 real vendors
└─ Friday: Launch Jiji outreach (batch 1)

Week 3:
├─ Scale vendor acquisition
├─ Monitor metrics and fix issues
├─ Implement quick feature requests
├─ Prepare Series A pitch deck

Week 4:
├─ Polish and optimization
├─ Hit 50+ vendors milestone
├─ Document architecture
└─ Prep for Series A conversations

DECISION NEEDED: Can you commit?
```YES

**Recommendation:** Yes, this is tight but achievable. I can work 8+ hours/day.

---

### 8. **SAFE TO DELETE REDIS CODE?**
```
Current phone bridge has:
├─ Redis sync with Pi master
├─ State clustering
├─ Heartbeat monitoring
├─ Bridge registry

Question: Can we safely delete ALL of this?

Option A: Yes, delete everything
├─ Simplify phone bridge massively
├─ No state sync needed for MVP
└─ Risk: Low (single bridge = no sync needed)

Option B: Keep as backup, just disable
├─ Comment out Redis code
├─ Don't delete
├─ Risk: Medium (legacy code adds confusion)

DECISION NEEDED: Delete or keep?
```Delete

**Recommendation:** DELETE. This is a pivot. Legacy code is dead weight. Keep only what BUZZ needs.

---

## 🚀 IMPLEMENTATION PHASES

Once you answer the 8 questions above, we'll execute in phases:

### Phase 1: Infrastructure Cleanup (1 day)
```
☐ Delete cloud/bridge-server.js entirely
☐ Delete shared/bridge-registry.js
☐ Simplify phone_bridge/phone-bridge-server.js
☐ Remove all Redis imports
☐ Keep only: Baileys QR + message handling
```

### Phase 2: Supabase Setup (1 day)
```
☐ Create Supabase project (2 minutes)
☐ Run supabase-schema.sql (10 minutes)
☐ Create "product-images" storage bucket (5 minutes)
☐ Set environment variables
  ├─ SUPABASE_URL
  ├─ SUPABASE_ANON_KEY
  └─ SUPABASE_SERVICE_KEY
☐ Test connection from website
```

### Phase 3: Website Migration (1-2 days)
```
☐ Replace Render PostgreSQL with Supabase
☐ Update connection strings
☐ Test vendor registration flow
☐ Update API route to use Supabase
☐ Deploy to Vercel
```

### Phase 4: Phone Bridge Deploy (1 day)
```
☐ Backup current phone-bridge-server.js
☐ Deploy BUZZ-phone-bridge-server.js
☐ Update environment variables
  ├─ SUPABASE_URL
  ├─ SUPABASE_KEY
  ├─ GROQ_API_KEY
  └─ PAWAPAY_API_KEY
☐ Test QR generation
☐ Test message routing to Supabase
```

### Phase 5: Grok Integration (1 day)
```
☐ Add Groq API key to environment
☐ Replace Claude API calls with Grok
☐ Test message classification
☐ Verify cost reduction (GHS 1000 → GHS 200)
```

### Phase 6: Jiji Lead Gen (2 days)
```
☐ Set up Jiji scraper locally
☐ Test with 10 vendors
☐ Create n8n workflow for outreach
☐ Create admin panel for imports
☐ Launch initial batch (50 vendors)
```

### Phase 7: Launch & Optimize (1 week)
```
☐ Vendor testing with 10 real people
☐ Fix issues discovered
☐ Optimize for speed
☐ Create monitoring dashboard
☐ Prepare Series A pitch
```

---

## ✅ TASKS READY NOW (No Questions Needed)

These can start immediately:

1. **Delete complexity from phone bridge** ✅
   - Remove redis-sync.js imports
   - Remove clustering code
   - Simplify to 200 lines

2. **Commit to buzz branch** ✅
   ```bash
   git add -A
   git commit -m "BUZZ: Lean architecture files created

   - Added BUZZ-phone-bridge-server.js (simplified)
   - Added supabase-schema.sql (complete schema)
   - Added mcp-jiji-scraper.js (lead generation)
   - Added vendor/register API route
   - Ready for Phase 1 cleanup"
   ```

---

## 📊 EXPECTED OUTCOMES (By End of Week 4)

| Metric | Target | How We'll Measure |
|--------|--------|-------------------|
| **Website** | Live & stable | Deployed to Vercel |
| **Phone Bridge** | 99.5% uptime | Health check endpoint |
| **Vendors** | 50+ onboarded | Query Supabase |
| **GMV** | GHS 500K | Sum transactions |
| **Cost** | GHS 250/month | Invoice review |
| **Revenue** | GHS 25K | Commission tracking |
| **Series A Ready** | Yes | Pitch deck complete |

---

## 🎬 NEXT STEPS

1. **ANSWER THE 8 QUESTIONS ABOVE** ✋ (This is critical!)

2. **Once answered, I'll:**
   - Create Phase 1 cleanup commits
   - Set up Supabase project
   - Deploy simplified phone bridge
   - Begin Jiji scraping implementation

3. **You'll need to:**
   - Provide Supabase credentials
   - Provide Groq API key (for Grok)
   - Test phone bridge setup
   - Sign off on vendor outreach message

---

## 🎯 Success Criteria for BUZZ

By end of Week 1:
- [ ] Website deployed with Supabase
- [ ] Phone bridge running with Grok
- [ ] Zero Redis complexity
- [ ] GHS 250/month infrastructure cost

By end of Week 2:
- [ ] Jiji scraper working
- [ ] n8n workflow sending WhatsApp
- [ ] 10 vendors beta testing

By end of Week 4:
- [ ] 50+ vendors onboarded
- [ ] First GHS 500K in GMV
- [ ] Series A pitch ready
- [ ] Cost: GHS 250/month (from GHS 2,450)

---

## 📞 QUESTIONS FOR YOU NOW

**Before we proceed, please answer:**

1. Jiji scraping: A or B?
2. Phone bridge: Already set up?
3. Vendor message: Keep current or change?
4. Dashboard: A, B, or C?
5. Images: A, B, or C?
6. Payments: A or B for MVP?
7. Timeline: Can you commit 4 weeks?
8. Redis code: Delete or keep?

**Then we'll execute at full speed. All hands on deck! 🚀**

---

*BUZZ Branch | December 13, 2025 | Ready to launch*
