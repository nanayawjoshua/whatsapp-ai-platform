# BUZZ: Lean Architecture Pivot
## The Ruthless Optimization for MVP Launch

**Date:** December 13, 2025
**Status:** 🚀 In Progress
**Goal:** Reduce complexity 70%, reduce cost 75%, ship vendor MVP in 4 weeks

---

## 🎯 The Vision

**Before (Old "Project OS"):**
```
3 bridges + Redis + n8n + Load balancing + State sync
= 80% engineering time, 0 vendors, GHS 3,860/month burn
```

**After (BUZZ):**
```
1 phone bridge + Supabase + Grok + Simple vendor flow
= 20% engineering time, 10+ vendors/week, GHS 1,030/month burn
```

---

## 🏗️ Architecture

### Single Source of Truth: Phone Bridge

```
┌──────────────────────────────────────────────┐
│         BEELINE CLASSIFIEDS MVP              │
│         (Single Bridge, Maximum Simplicity)  │
├──────────────────────────────────────────────┤
│                                              │
│  1. Website (Vercel)                         │
│     ├─ Vendor onboarding form                │
│     ├─ Vendor dashboard (simple)             │
│     └─ Jiji lead import admin panel          │
│                                              │
│  2. Phone Bridge (TCL 50SE on Termux)        │
│     ├─ Single WhatsApp instance              │
│     ├─ QR code generation                    │
│     ├─ Message routing to Grok               │
│     ├─ Receive/send messages                 │
│     └─ NO Redis, NO state sync               │
│                                              │
│  3. Supabase (PostgreSQL + Storage)          │
│     ├─ vendors table                         │
│     ├─ products table                        │
│     ├─ transactions table                    │
│     ├─ messages table                        │
│     ├─ Product image storage                 │
│     └─ Row-level security (multi-tenant)     │
│                                              │
│  4. Grok API                                 │
│     ├─ Classify products to category         │
│     ├─ Detect spam/fraudulent messages       │
│     ├─ Route buyer messages to vendor        │
│     └─ GHS 200/month                         │
│                                              │
│  5. PawaPay                                  │
│     └─ Instant settlements (no transaction fee) │
│                                              │
│  6. Jiji MCP Server (Lead Generation)        │
│     ├─ Scrape Jiji listings                  │
│     ├─ Extract vendor contact                │
│     ├─ Score vendor quality                  │
│     └─ Queue WhatsApp outreach               │
│                                              │
│  7. n8n Workflow (Simple)                    │
│     ├─ Send daily vendor summary              │
│     ├─ Payment confirmation                  │
│     └─ That's it!                            │
│                                              │
└──────────────────────────────────────────────┘
```

---

## 📊 Cost Breakdown (Monthly)

| Component | Before | After | Savings |
|-----------|--------|-------|---------|
| Render (Cloud bridge) | GHS 360 | ❌ DELETED | GHS 360 |
| Upstash Redis | GHS 150 | ❌ DELETED | GHS 150 |
| PostgreSQL (Render) | GHS 360 | Supabase | -GHS 110 |
| Claude API | GHS 1,000 | Grok GHS 200 | GHS 800 |
| Domain | GHS 50 | GHS 50 | - |
| Yango (delivery, later) | GHS 530 | Disabled | GHS 530 |
| **TOTAL** | **GHS 2,450+** | **GHS 250** | **GHS 2,200/month** |

**Annual Savings: GHS 26,400**

---

## 📋 Implementation Checklist

### Phase 1: Remove Complexity (This Week)

- [ ] **Delete cloud bridge entirely**
  - Remove `cloud/bridge-server.js` bridge registry integration
  - Remove Redis imports from cloud bridge
  - Keep database migration scripts (reuse for Supabase)

- [ ] **Remove bridge registry**
  - Delete `shared/bridge-registry.js`
  - Remove heartbeat/discovery logic from phone bridge
  - Phone bridge becomes standalone

- [ ] **Simplify phone bridge**
  - Remove Redis sync code
  - Remove state clustering
  - Remove Pi integration code
  - Keep only: Baileys QR + message handling

### Phase 2: Build Lean Stack (Week 1-2)

- [ ] **Supabase Setup**
  - Create project
  - Design schema (vendors, products, transactions, messages)
  - Enable row-level security
  - Create storage bucket for images

- [ ] **Update website**
  - Replace Render PostgreSQL with Supabase
  - Add Supabase auth
  - Create vendor dashboard
  - Create admin panel for Jiji imports

- [ ] **Switch to Grok**
  - Replace Claude API calls with Grok
  - Keep routing logic same, just different model

### Phase 3: Lead Generation (Week 2-3)

- [ ] **Create Jiji MCP Server**
  - Web scraping with puppeteer
  - Extract: vendor phone, products, prices
  - Score vendors by volume/ratings
  - Queue high-quality leads

- [ ] **Create n8n Workflow**
  - Triggered by MCP server
  - Send WhatsApp message to Jiji vendors
  - Track response rates
  - Log successful onboardings

### Phase 4: Testing & Launch (Week 3-4)

- [ ] **Test vendor flow**
  - Vendor scans QR → Sends product → Gets routing
  - Buyer messages → AI response → Vendor sees it
  - Payment flow → Instant settlement

- [ ] **Launch Jiji outreach**
  - Target 50 vendors/day for first 2 weeks
  - Track: Response rate, onboarding rate, retention

- [ ] **Metrics dashboard**
  - GMV (Gross Merchandise Value)
  - Vendor count
  - Transaction volume
  - CAC (Customer Acquisition Cost)

---

## 🗄️ Supabase Schema

### Tables

```sql
-- Vendors
CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  category VARCHAR(100),
  commission_rate DECIMAL(5,2) DEFAULT 5.00,
  wallet_balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Products (classified listings)
CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15,2),
  category VARCHAR(100),
  image_url VARCHAR(500),
  status VARCHAR(50) DEFAULT 'active', -- active, sold, removed
  created_at TIMESTAMP DEFAULT NOW()
);

-- Transactions
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id),
  buyer_phone VARCHAR(20),
  amount DECIMAL(15,2),
  commission DECIMAL(15,2),
  net_amount DECIMAL(15,2),
  status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed
  payment_method VARCHAR(50), -- pawapay, bank_transfer
  created_at TIMESTAMP DEFAULT NOW()
);

-- Messages
CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID REFERENCES vendors(id),
  buyer_phone VARCHAR(20),
  message_text TEXT,
  message_type VARCHAR(50), -- buyer_inquiry, vendor_response, ai_suggestion
  created_at TIMESTAMP DEFAULT NOW()
);

-- Jiji Leads (for outreach)
CREATE TABLE jiji_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  jiji_vendor_id VARCHAR(100) UNIQUE,
  phone VARCHAR(20),
  name VARCHAR(255),
  category VARCHAR(100),
  product_count INT,
  monthly_sales INT,
  rating DECIMAL(3,2),
  quality_score INT, -- 0-100
  status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, interested, onboarded, declined
  contacted_at TIMESTAMP,
  last_response_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Enable RLS (Row Level Security)
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Vendors see only their own data
CREATE POLICY "Vendors see own data" ON vendors
  USING (auth.uid() = vendor_id OR is_admin());
```

---

## 🤖 Grok Integration (vs Claude)

**Switch from Claude to Grok for routing:**

```javascript
// Old (Claude)
const response = await anthropic.messages.create({
  model: "claude-3-5-sonnet-20241022",
  max_tokens: 500,
  messages: [{ role: "user", content: productText }]
});

// New (Grok)
const response = await groq.chat.completions.create({
  model: "mixtral-8x7b-32768",  // or grok-latest if available
  max_tokens: 500,
  messages: [{ role: "user", content: productText }]
});

// Cost: GHS 200/month vs GHS 1,000/month
```

---

## 📱 Jiji MCP Server

```javascript
// mcp-jiji-scraper.js
// Scrapes Jiji, extracts vendors, scores quality

const mcpServer = {
  tools: [
    {
      name: "search_jiji_listings",
      description: "Search Jiji for active vendor listings",
      params: {
        category: "electronics",  // or fashion, food, services
        limit: 100
      }
    },
    {
      name: "extract_vendor_data",
      description: "Get vendor phone, products, sales history",
      params: {
        vendor_id: "...",
        include_ratings: true
      }
    },
    {
      name: "score_vendor_quality",
      description: "Rate vendor by volume, response time, ratings",
      params: {
        vendor_id: "..."
      }
    }
  ]
};
```

---

## 🚀 Week-by-Week Timeline

### Week 1: Cleanup & Setup
- Monday: Delete cloud bridge + Redis code (2 hours)
- Tuesday: Set up Supabase + schema (3 hours)
- Wednesday: Migrate website to Supabase (4 hours)
- Thursday: Test vendor auth flow (2 hours)
- Friday: Deploy to Vercel (1 hour)

### Week 2: Grok + Dashboard
- Monday: Switch to Grok API (2 hours)
- Tuesday-Wednesday: Build vendor dashboard (6 hours)
- Thursday: Create admin panel for Jiji imports (3 hours)
- Friday: Test end-to-end flow (2 hours)

### Week 3: Lead Generation
- Monday-Tuesday: Build Jiji MCP server (6 hours)
- Wednesday: Create n8n workflow for outreach (3 hours)
- Thursday: Test with 10 vendors (2 hours)
- Friday: Launch outreach campaign (1 hour)

### Week 4: Optimization & Scale
- Focus on vendor feedback
- Fix any friction points
- Onboard first 50 vendors
- Prepare metrics for Series A

---

## ✅ Success Criteria

**By End of Week 4:**

```
Metrics:
├─ Website: Live and stable
├─ Phone bridge: 99.5% uptime (single instance)
├─ Vendors: 50+ onboarded
├─ GMV: GHS 500K+ (first month)
├─ Transactions: 500+ (first month)
├─ Cost: GHS 250/month (from GHS 2,450)
└─ Revenue: GHS 25K (5% of GMV)

Ready for Series A pitch:
├─ "We acquired 50 vendors without paid ads"
├─ "88% gross margins"
├─ "Phone bridge only system = maximum reliability"
└─ "Need GHS 500K for team + regional expansion"
```

---

## 🎬 What Gets Deleted (Be Ruthless)

```
❌ cloud/bridge-server.js (entire file)
❌ shared/bridge-registry.js (entire file)
❌ phone_bridge/utils/redis-sync.js (most of it)
❌ Redis Upstash subscription
❌ Render cloud bridge instance
❌ Bridge discovery logic
❌ State clustering code
❌ Heartbeat monitoring
❌ Load balancing code (Pi + phone selection)
❌ n8n complex workflows

✅ Keep:
├─ phone-bridge-server.js (simplified)
├─ Baileys QR generation
├─ Message handling
├─ Database migrations (repurpose for Supabase)
├─ Website structure
├─ Payment integration
└─ Basic n8n (vendor summary only)
```

---

## 🎯 Questions for Joshua

Before we proceed, clarify:

1. **Jiji Scraping**: Do you want to use public API (if available) or web scraping? Web scraping is riskier but free. Public API is safer but might cost.

2. **Phone Bridge Hardware**: Is the TCL 50SE phone already set up with Node.js + Termux? Should we document the setup process?

3. **Lead Generation Messaging**: What exact WhatsApp message should we send to Jiji vendors? Do you want A/B testing for different messages?

4. **Vendor Dashboard**: How complex should it be? MVP: Just sales today + total earnings. Or more features?

5. **Image Uploads**: Should vendors upload images via WhatsApp (send photo) or web dashboard? WhatsApp = simpler, dashboard = higher quality.

---

## 🚀 Next Steps

1. Confirm decisions above
2. Start with Phase 1 (delete complexity)
3. Deploy to buzz branch as we go
4. Test each component before moving to next

**Status: Ready to implement. Awaiting go-ahead.**

---

*Generated with Claude Code
Branch: buzz
Prepared for lean MVP launch*
