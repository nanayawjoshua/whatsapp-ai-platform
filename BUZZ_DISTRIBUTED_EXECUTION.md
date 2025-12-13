# BUZZ: Distributed Execution Plan
## Using Project OS Framework + Grok + Claude Code + Elon & Steve

**Status:** Ready for parallel execution
**Date:** December 13, 2025
**Target:** Complete BUZZ MVP in 4 weeks
**Budget:** $50-75 (Grok free, Groq API ~$5, Cursor/Claude Code ~$40)

---

## 🎯 EXECUTION STRATEGY

**Per Project OS AI Decision Tree:**
- ✅ **GROK**: Planning, architecture, code review, decision-making (FREE)
- ✅ **CLAUDE CODE**: Complex multi-file implementations, deployments
- ✅ **CONTINUE.DEV / CURSOR**: Routine coding, documentation updates
- ✅ **GROQ API**: In-app AI (message classification, vendor scoring)

**Team Roles:**
- **You** (Human): Strategic decisions, vendor communication, deployment approval
- **Claude Code** (Me): Complex implementations, Phase 3-7 execution
- **Grok**: Planning, architecture review, debugging strategy
- **Elon & Steve**: Specialized domain expertise (when called upon)

---

## 📅 PHASE 2: SUPABASE SETUP (This Week)

### Task 2.1: Supabase Project Creation (HUMAN + GROK)
**Owner:** You
**Duration:** 15 minutes
**Tools:** Supabase dashboard

**Steps:**
1. Visit https://supabase.com
2. Create project: `beeline-mvp`
3. Database password: [Generate & save securely]
4. Region: us-east-1 or closest to Ghana
5. Wait 3-5 minutes for initialization
6. Share the following with me:
   - Project URL: `SUPABASE_URL`
   - Anon key: `SUPABASE_KEY`
   - Service key: `SUPABASE_SERVICE_KEY`

**Success Criteria:**
- [ ] Project created
- [ ] Can access Supabase dashboard
- [ ] API keys copied and ready

---

### Task 2.2: Schema Import & Verification (CLAUDE CODE)
**Owner:** Claude Code
**Duration:** 30 minutes
**Tools:** Supabase SQL Editor
**Requires:** Task 2.1 complete + API keys

**Steps:**
1. Receive Supabase project credentials
2. Import `shared/supabase-schema.sql`:
   - Go to SQL Editor → New Query
   - Paste entire schema
   - Execute
   - Verify: All 7 tables created ✅
3. Run verification queries:
   ```sql
   SELECT COUNT(*) as table_count FROM information_schema.tables WHERE table_schema='public';
   SELECT * FROM vendors LIMIT 1;
   ```
4. Test RLS policies are in place
5. Commit verification results to buzz branch

**Success Criteria:**
- [ ] 7 tables created (vendors, products, transactions, messages, jiji_leads, outreach_campaigns, daily_analytics)
- [ ] Verification queries return expected results
- [ ] RLS policies enabled on sensitive tables
- [ ] Documentation updated with test results

**Parallel With:** Task 2.3

---

### Task 2.3: Storage & RLS Configuration (GROK PLANNING + HUMAN)
**Owner:** You (execution) + Grok (planning)
**Duration:** 20 minutes
**Tools:** Supabase dashboard

**Steps:**
1. **Ask Grok:** "Review our RLS policies from supabase-schema.sql. Are they configured correctly for vendor isolation?"
   - Grok will review the policies
   - Confirm vendor can only see their own data
   - Flag any security issues

2. **Execute in Supabase:**
   - Go to Storage → Create bucket
   - Name: `product-images`
   - Keep private (unchecked public)
   - Click Create

3. **Test RLS:**
   - Go to Auth → Policies
   - Verify policies show as "enabled"
   - Check tables: vendors, products, transactions, messages

**Success Criteria:**
- [ ] Storage bucket created
- [ ] RLS enabled on all required tables
- [ ] Grok confirmed no security issues

---

### Task 2.4: Connection Testing (CLAUDE CODE)
**Owner:** Claude Code
**Duration:** 15 minutes
**Tools:** Supabase dashboard + SQL Editor

**Steps:**
1. Test connection from Supabase SQL Editor:
   ```sql
   -- Should return 0 (no vendors yet)
   SELECT COUNT(*) FROM vendors;

   -- Should return column names
   SELECT * FROM products LIMIT 0;

   -- Test storage bucket exists
   SELECT * FROM storage.buckets WHERE name = 'product-images';
   ```

2. Create `.env.buzz` file in repo root:
   ```bash
   # Supabase
   SUPABASE_URL=https://[project-id].supabase.co
   SUPABASE_KEY=[your-anon-key]
   SUPABASE_SERVICE_KEY=[your-service-key]

   # Groq (Phase 5)
   GROQ_API_KEY=[your-groq-key]

   # Phone Bridge
   PHONE_BRIDGE_URL=http://localhost:3001
   PORT=3001

   # Website
   NEXT_PUBLIC_SUPABASE_URL=${SUPABASE_URL}
   NEXT_PUBLIC_SUPABASE_KEY=${SUPABASE_KEY}
   ```

3. Test from local machine (if you have Node.js):
   ```bash
   node -e "
   const { createClient } = require('@supabase/supabase-js');
   const sb = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY);
   sb.from('vendors').select('COUNT(*)').then(r => console.log('✅ Connected!', r));
   "
   ```

**Success Criteria:**
- [ ] SQL queries return expected results
- [ ] .env file created with correct values
- [ ] Connection test passes

---

## 📅 PHASE 3: WEBSITE MIGRATION (Next 1-2 days)

### Task 3.1: Dependencies & Setup (CLAUDE CODE)
**Owner:** Claude Code
**Duration:** 1 hour
**Tools:** Node.js, npm
**Requires:** Phase 2 complete

**Steps:**
1. Update `website/package.json`:
   - Add: `@supabase/supabase-js`
   - Remove: Any direct PostgreSQL drivers
   - Keep: All existing dependencies

2. Run: `npm install`

3. Create Supabase client in `website/lib/supabase.ts`:
   ```typescript
   import { createClient } from '@supabase/supabase-js';

   export const supabase = createClient(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.NEXT_PUBLIC_SUPABASE_KEY!
   );
   ```

**Success Criteria:**
- [ ] Dependencies installed
- [ ] No build errors
- [ ] Supabase client can be imported

---

### Task 3.2: API Routes Migration (CLAUDE CODE)
**Owner:** Claude Code
**Duration:** 2-3 hours
**Tools:** Claude Code IDE
**Requires:** Task 3.1 complete

**Update Routes:**
1. `/api/vendor/register` → Already uses Supabase ✅
2. `/api/vendor/dashboard` → Query Supabase
3. `/api/products/create` → Insert into Supabase
4. `/api/transactions/list` → Query Supabase
5. Any other endpoints → Switch to Supabase

**For each route:**
- Replace Render PostgreSQL with Supabase
- Test locally: `npm run dev`
- Ensure no errors in console

**Success Criteria:**
- [ ] All routes migrated
- [ ] No build errors
- [ ] Vendor registration API tested locally
- [ ] Can create and query vendors/products

---

### Task 3.3: Environment & Deployment (YOU + CLAUDE CODE)
**Owner:** You (Vercel), Claude Code (configuration)
**Duration:** 30 minutes
**Tools:** Vercel dashboard

**Steps:**
1. Update Vercel environment variables:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_KEY`
   - Any other needed vars

2. Deploy to Vercel:
   ```bash
   git push origin buzz  # Already committed
   # Vercel auto-deploys from GitHub
   ```

3. Test deployment:
   - Visit https://[your-vercel-domain].vercel.app/api/vendor/register
   - Should return: "Phone number is required" (correct!)

**Success Criteria:**
- [ ] Environment variables set in Vercel
- [ ] Deployment successful
- [ ] Website accessible
- [ ] Vendor registration accessible

---

## 📅 PHASE 4: PHONE BRIDGE DEPLOYMENT (Days 3-4)

### Task 4.1: Phone Setup (YOU)
**Owner:** You
**Duration:** 30 minutes
**Tools:** Termux on TCL 50SE

**From BUZZ_IMPLEMENTATION_GUIDE.md:**
You confirmed phone already has Node.js + Termux ready.

**Steps:**
1. On phone: Open Termux
2. Navigate to phone_bridge directory
3. `npm install` (install dependencies)
4. Update `.env` with Supabase keys
5. Test: `node phone-bridge-server.js`
6. Should show: "Listening on port 3001"

**Success Criteria:**
- [ ] Dependencies installed
- [ ] No errors on startup
- [ ] Bridge listening on port 3001

---

### Task 4.2: ngrok Tunnel Setup (YOU)
**Owner:** You
**Duration:** 15 minutes

**Steps:**
1. Install ngrok: https://ngrok.com/download
2. Connect your ngrok account (free)
3. Start tunnel: `ngrok http 3001`
4. Copy tunnel URL (e.g., `https://xxxx-xx-xxx-xxx-xx.ngrok.io`)
5. Update `.env` on phone:
   ```bash
   PHONE_BRIDGE_URL=https://xxxx-xx-xxx-xxx-xx.ngrok.io
   ```

**Success Criteria:**
- [ ] Tunnel created and active
- [ ] URL accessible from browser
- [ ] Can reach http://[ngrok-url]:3001/health

---

### Task 4.3: Phone Bridge Test (CLAUDE CODE)
**Owner:** Claude Code
**Duration:** 1 hour
**Tools:** Phone bridge + test scripts

**Steps:**
1. Verify phone bridge connectivity:
   ```bash
   curl https://[ngrok-url]/health
   # Expected: {"status": "ok"}
   ```

2. Test QR generation:
   ```bash
   curl -X POST https://[ngrok-url]/api/generate-qr \
     -H "Content-Type: application/json" \
     -d '{"vendorId": "test-001"}'
   # Expected: {"qrCode": "data:image/png;..."}
   ```

3. Update website `.env`:
   ```bash
   PHONE_BRIDGE_URL=https://[ngrok-url]
   ```

4. Test vendor registration end-to-end:
   - Go to website registration
   - Submit phone number
   - Should get QR code back

**Success Criteria:**
- [ ] Health check returns OK
- [ ] QR generation works
- [ ] Website can reach phone bridge
- [ ] Vendor registration end-to-end works

---

## 📅 PHASE 5: GROK INTEGRATION (Day 4)

### Task 5.1: Grok API Setup (YOU + CLAUDE CODE)
**Owner:** You (get key), Claude Code (integration)
**Duration:** 1 hour

**Steps:**
1. You: Get Groq API key from https://console.groq.com
   - Create account
   - Generate API key
   - Share with me

2. Claude Code:
   - Install `groq-sdk` in phone bridge
   - Update phone-bridge-server.js to use Grok
   - Replace Claude API calls with Grok

**Cost Analysis:**
- Before: Claude API GHS 1,000/month
- After: Grok via Groq GHS 200/month
- **Savings: GHS 800/month**

**Success Criteria:**
- [ ] Groq API key obtained
- [ ] Groq SDK installed
- [ ] Phone bridge updated to use Grok
- [ ] Message classification working
- [ ] Cost reduction verified

---

## 📅 PHASE 6: JIJI LEAD GENERATION (Weeks 2)

### Task 6.1: Jiji Scraper Testing (CLAUDE CODE)
**Owner:** Claude Code
**Duration:** 2 hours
**Tools:** Node.js

**Steps:**
1. Test `shared/mcp-jiji-scraper.js` locally:
   ```bash
   node shared/mcp-jiji-scraper.js
   ```

2. Verify it can:
   - Scrape Jiji listings
   - Extract vendor data
   - Score vendor quality (0-100)
   - Generate quality leads

3. Test with specific categories:
   - Electronics
   - Clothing
   - Home & Garden

**Success Criteria:**
- [ ] Scraper runs without errors
- [ ] Can find 100+ vendors per category
- [ ] Quality scoring 0-100 works
- [ ] Data quality verified

---

### Task 6.2: n8n Workflow Setup (GROK + YOU)
**Owner:** You (n8n dashboard), Grok (workflow design)
**Duration:** 2 hours

**Ask Grok First:**
"Design an n8n workflow that:
1. Runs daily
2. Calls our Jiji scraper (shared/mcp-jiji-scraper.js)
3. Gets 50 high-quality vendors
4. Sends WhatsApp message via phone bridge
5. Tracks responses in Supabase

What nodes do I need? In what order?"

**Then Execute in n8n:**
1. Create new workflow
2. Add nodes as per Grok's plan:
   - Schedule trigger (daily)
   - HTTP call to Jiji scraper
   - Filter high-quality leads
   - Send WhatsApp messages
   - Log responses to Supabase

**Success Criteria:**
- [ ] Workflow created
- [ ] Can run manually without errors
- [ ] Successfully sends WhatsApp messages
- [ ] Responses logged to database

---

### Task 6.3: First Batch Launch (YOU)
**Owner:** You
**Duration:** 1 hour

**Steps:**
1. Run n8n workflow manually: First 50 vendors
2. Monitor responses:
   - How many open the message?
   - How many reply?
   - What's the response rate?
3. Document metrics

**Target Metrics:**
- Messages sent: 50
- Opens: ~25 (50%)
- Replies: ~5-10 (10-20%)
- Conversions to vendors: 1-3

**Success Criteria:**
- [ ] 50 messages sent
- [ ] Responses coming in
- [ ] Metrics being tracked
- [ ] Ready to scale

---

## 📅 PHASE 7: SCALE & SERIES A (Weeks 3-4)

### Task 7.1: Scale Vendor Acquisition (YOU)
**Owner:** You
**Duration:** 7 days
**Tools:** n8n workflow

**Daily Tasks:**
- Day 1-2: Send 50 messages → expect 5-10 responses
- Day 3-4: Send 100 messages → expect 10-20 responses
- Day 5-6: Send 150 messages → expect 15-30 responses
- Day 7: Send 100 messages → expect 10-20 responses

**Target by end of Week 3:**
- 500+ messages sent
- 50+ vendors responding
- 20+ vendors onboarded
- GHS 100K+ GMV

---

### Task 7.2: Metrics Dashboard (CLAUDE CODE)
**Owner:** Claude Code
**Duration:** 2 hours
**Tools:** Website dashboard

**Build dashboard showing:**
- Active vendors count
- Daily transactions
- GMV (Gross Merchandise Value)
- Revenue (5% of GMV)
- Cost per month
- Response rate %

**Success Criteria:**
- [ ] Dashboard live at /dashboard
- [ ] Real-time data from Supabase
- [ ] All 6 key metrics visible
- [ ] Can be shared with investors

---

### Task 7.3: Series A Pitch Preparation (GROK + YOU)
**Owner:** Grok (pitch strategy), You (execution)
**Duration:** 2 days

**Ask Grok:**
"Help me create Series A pitch deck for:
- 50+ vendors
- GHS 500K+ GMV
- GHS 25K revenue
- 88% gross margins
- GHS 250/month cost
- Zero marketing spend

What slides do I need? What data? What story?"

**Then Build:**
1. Pitch deck (10-15 slides)
2. Financial model
3. Unit economics breakdown
4. Market size analysis
5. Competitive positioning

**Success Criteria:**
- [ ] Pitch deck complete
- [ ] All metrics verified
- [ ] Story coherent and compelling
- [ ] Ready for investor meetings

---

## 🎯 SUCCESS METRICS BY PHASE

### Phase 2 (End of this week)
- [ ] Supabase project live
- [ ] Schema imported (7 tables)
- [ ] RLS enabled
- [ ] Connection tested
- [ ] Cost: GHS 250/month vs GHS 510 (Render + Redis)

### Phase 3 (End of next week)
- [ ] Website deployed to Vercel with Supabase
- [ ] All APIs migrated
- [ ] Vendor registration working end-to-end
- [ ] Phone bridge connected

### Phase 4 (End of next week)
- [ ] Phone bridge running on phone
- [ ] ngrok tunnel active
- [ ] QR generation working
- [ ] Vendor registration complete

### Phase 5 (End of next week)
- [ ] Grok API integrated
- [ ] Message classification working
- [ ] Cost reduction verified (GHS 800/month saved)

### Phase 6 (End of Week 2)
- [ ] Jiji scraper tested
- [ ] n8n workflow created
- [ ] 50 vendors contacted
- [ ] 5-10 initial responses

### Phase 7 (End of Week 4)
- [ ] 50+ vendors onboarded
- [ ] GHS 500K+ GMV
- [ ] GHS 25K+ revenue
- [ ] Series A pitch ready
- [ ] **COMPLETE PIVOT SUCCESSFUL** ✅

---

## 💰 COST TRACKING

**AI Tool Costs (This Month):**
- Grok: FREE (planning, review)
- Groq API: ~$5 (message classification)
- Cursor/Claude Code: ~$40 (implementation)
- Supabase: GHS 250/month (~$4)
- **Total: ~$50/month**

**Infrastructure Savings:**
- Before: GHS 2,450/month (Render + Redis + Claude)
- After: GHS 450/month (Supabase + Groq)
- **Monthly savings: GHS 2,000 = $30/month**

---

## 🎬 NEXT IMMEDIATE ACTIONS

1. **You:** Complete Task 2.1 (Create Supabase project)
   - Takes 15 minutes
   - Share 3 API keys with me
   - Estimated completion: Today

2. **Claude Code:** Complete Task 2.2 (Schema import)
   - Runs once you share API keys
   - 30 minutes
   - Estimated completion: Today

3. **You:** Complete Task 2.3 (Storage + RLS)
   - 20 minutes
   - Ask Grok to review security
   - Estimated completion: Today

4. **Claude Code:** Complete Task 2.4 (Testing)
   - 15 minutes
   - Create `.env.buzz`
   - Estimated completion: Today

**Phase 2 Target:** COMPLETE TODAY ✅

---

## 📞 WHO TO CALL WHEN?

**GROK (Planning & Strategy):**
- Architecture decisions
- Code review for security/performance
- Debugging strategy
- Decision analysis
- Workflow design

**CLAUDE CODE (Implementation):**
- Multi-file code changes
- Database migrations
- API implementations
- Deployment procedures
- Complex integrations

**ELON (Optimization & Scaling):**
- Infrastructure optimization
- Cost reduction strategies
- Performance bottlenecks
- Scaling to 1000+ vendors

**STEVE (Product & UX):**
- Vendor dashboard UX
- Message templates
- Onboarding flow
- Metrics presentation

---

*BUZZ Distributed Execution | Project OS Framework | Ready for Parallel Execution*
