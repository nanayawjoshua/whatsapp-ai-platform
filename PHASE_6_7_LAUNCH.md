# PHASES 6 & 7: LAUNCH MVP
## Lead generation + 50 vendors + Series A prep (2-3 weeks)

**Status:** Ready once Phases 1-5 complete
**Estimated Time:** 2-3 weeks
**Outcome:** 50+ vendors onboarded, GHS 500K GMV, Series A ready

---

## 🎯 WHAT THESE PHASES DO

### Phase 6: Jiji Lead Generation (Week 2)
- Deploy Jiji scraper
- Create n8n workflow for WhatsApp outreach
- Launch first batch of 50 vendors
- Monitor response rates

### Phase 7: Scale & Optimize (Weeks 3-4)
- Continue vendor acquisition
- Monitor metrics dashboard
- Fix issues from initial vendors
- Prepare Series A pitch

---

## PHASE 6: JIJI LEAD GENERATION

### Step 1: Setup Jiji Scraper

The scraper is ready in `shared/mcp-jiji-scraper.js`

Test it locally:

```bash
cd shared
node mcp-jiji-scraper.js

# Expected output:
# 🐝 Jiji Lead Generation - MCP Server
#
# Top Leads:
#
# 1. John's Electronics
#    Phone: +233501234567
#    Category: electronics
#    Quality Score: 85/100
#    Rating: 4.5/5 (120 reviews)
```

### Step 2: Create n8n Workflow

In n8n (https://n8n.io):

1. Create new workflow
2. Add trigger: **Schedule** (daily at 6 AM)
3. Add step: **Code node** - Run Jiji scraper
4. Add step: **For each** - Loop through leads
5. Add step: **WhatsApp** - Send outreach message

**Sample n8n workflow:**

```
[Schedule Trigger]
    ↓
[Code Node: Run scraper, get top 50 leads]
    ↓
[Filter: Quality score > 70]
    ↓
[For Each Lead]
    ↓
[Check if already contacted]
    ↓
[Send WhatsApp message]
    ↓
[Save to jiji_leads table]
    ↓
[Log response rate]
```

### Step 3: Setup WhatsApp Integration

Two options:

**Option A: Use Beeline Phone Bridge (Recommended)**
```
n8n → Phone Bridge API → WhatsApp
```

Create API endpoint in phone bridge:

```javascript
app.post('/api/send-message', async (req, res) => {
  const { phone, message } = req.body;

  // Send via WhatsApp
  await socket.sendMessage(phone + '@s.whatsapp.net', {
    text: message
  });

  res.json({ sent: true });
});
```

Then in n8n, HTTP request to:
```
POST http://localhost:3001/api/send-message
Body: { "phone": "233501234567", "message": "..." }
```

**Option B: Use WhatsApp Business API**
- More official but requires approval
- Skip for MVP

### Step 4: Create Outreach Message Template

Template in n8n:

```
Hi {{vendorName}}! 👋

Selling on Jiji? We're launching Beeline Classifieds -
same reach, ZERO commission for first 100 vendors 🎁

✅ No monthly fee
✅ WhatsApp messaging (just like Jiji)
✅ Instant buyer payments (no waiting)
✅ AI handles customer service 24/7

Join: beeline.works/vendor
First 100 vendors = ZERO commission forever
After = 5% commission

Want in?
```

### Step 5: Track Responses

Store in Supabase `jiji_leads` table:

```sql
UPDATE jiji_leads SET
  status = 'contacted',
  contacted_count = contacted_count + 1,
  last_contacted_at = NOW()
WHERE jiji_vendor_id = $1;
```

Track metrics:
- Messages sent: 50/day
- Response rate: Target 5-10%
- Onboarded: Target 1-2 per day

### Step 6: Launch First Batch

```
Day 1: Send 50 messages (test group)
Day 2-3: Monitor responses and adjust message
Day 4-5: Send next 100 messages (scale)
Week 2: Continuous outreach (500+ messages)
```

---

## PHASE 7: SCALE & OPTIMIZE

### Week 3: Continue Acquisition

**Daily tasks:**
- Send 100 WhatsApp messages to Jiji vendors
- Monitor response rate (should be 5-10%)
- Onboard interested vendors (expect 5-10/day)
- Track conversion to actual sales

**Metrics to track:**
```
jiji_leads.sql
SELECT
  status,
  COUNT(*) as count,
  AVG(quality_score) as avg_score
FROM jiji_leads
GROUP BY status;

-- Expected:
-- pending: 0
-- contacted: 500+
-- interested: 50-100
-- onboarded: 10-20
```

### Week 4: Prepare Series A

Create **Series A Pitch Deck:**

**Slide 1: Problem**
- Africa's $200B informal economy lacks modern tools
- Jiji sellers can't scale customer service
- No instant payments, no AI help

**Slide 2: Solution**
- Beeline: WhatsApp classifieds with AI routing
- 24/7 customer service, instant payments
- Zero commission for first 100 vendors

**Slide 3: Traction**
- 50+ vendors in first month (organic growth)
- GHS 500K+ GMV
- 88% gross margins (unit economics proven)
- $0 spend on acquisition (viral growth)

**Slide 4: Market**
- TAM: $200B African informal commerce
- SAM: $10B mobile commerce in West Africa
- Paystack, Jiji, Kuda all started in this space

**Slide 5: Team**
- Joshua: Founder, full-stack engineer
- Advisors: [2-3 notable people]

**Slide 6: Ask**
- Series A: GHS 30M @ GHS 100M valuation
- Use of funds:
  - 40% Engineering (2 engineers, 1 PM)
  - 30% Growth (2 marketers, 1 partnership manager)
  - 20% Operations (finance, legal, vendor support)
  - 10% Infrastructure & contingency

**Slide 7: Key Metrics**
```
Metric          Week 1    Week 4    Projection (Year 2)
Vendors:        10        50        10,000
Daily Active:   5         25        5,000
Transactions:   50        500       100,000/month
GMV:            GHS 50K   GHS 500K  GHS 100M+
Revenue:        GHS 2.5K  GHS 25K   GHS 5M+ (commission)
CAC:            GHS 0     GHS 0     GHS 0 (viral)
```

**Slide 8: Why Us**
- Founder-market fit (same background as vendors)
- WhatsApp native (no app install barrier)
- AI-first approach (ChatGPT integrated)
- Regional expansion ready (Ghana → Nigeria → Kenya)

### Create Metrics Dashboard

Create `website/app/dashboard/admin/route.ts`:

```typescript
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY!
);

export async function GET() {
  // Get daily metrics
  const { data: analytics } = await supabase
    .from('daily_analytics')
    .select('*')
    .order('date', { ascending: false })
    .limit(30);

  // Calculate key metrics
  const latestDay = analytics?.[0] || {};
  const previousDay = analytics?.[1] || {};

  const metrics = {
    vendors: {
      current: (await supabase.from('vendors').select('id', { count: 'exact' })).count,
      growth: '+10 this week'
    },
    gmv: {
      current: latestDay.gmv || 0,
      growth: ((latestDay.gmv - previousDay.gmv) / previousDay.gmv * 100).toFixed(1) + '%'
    },
    revenue: {
      current: latestDay.revenue || 0,
      growth: ((latestDay.revenue - previousDay.revenue) / previousDay.revenue * 100).toFixed(1) + '%'
    },
    transactions: {
      current: latestDay.transactions_count || 0,
      growth: '+50 yesterday'
    }
  };

  return Response.json(metrics);
}
```

### Track Series A Readiness

Checklist for investors:

- [ ] 50+ vendors onboarded
- [ ] GHS 500K+ GMV
- [ ] Unit economics proven (88% margins)
- [ ] Zero CAC (organic growth)
- [ ] Team in place (founder + advisors)
- [ ] Product-market fit signals
- [ ] Technical architecture solid
- [ ] Regulatory path clear

---

## 📊 EXPECTED OUTCOMES

### By End of Week 2:
```
✅ Jiji scraper running
✅ n8n workflow deployed
✅ First 50 WhatsApp messages sent
✅ 5-10 initial responses
✅ 2-5 vendors onboarded from Jiji
```

### By End of Week 4:
```
✅ 500+ WhatsApp messages sent
✅ 50-100 interested leads
✅ 10-20 vendors onboarded from Jiji
✅ GHS 500K+ GMV
✅ GHS 25K gross profit
✅ Series A pitch ready
✅ Ready to approach investors
```

---

## 🚀 SERIES A CONVERSATION STARTERS

**When reaching out to investors:**

1. **Traction First**
   > "We've acquired 50 vendors in 4 weeks with zero marketing spend, achieved 88% gross margins, and have a clear path to GHS 100M+ GMV in Year 2."

2. **Unfair Advantage**
   > "We're WhatsApp-native (no app install barrier), AI-first (handles customer service 24/7), and founder-led (same background as vendors)."

3. **Market Opportunity**
   > "We're targeting the $200B informal African economy. Jiji is at $2B+ valuation. We're earlier-stage and have a superior product."

4. **Unit Economics**
   > "Unit economics are exceptional: 88% gross margins, near-zero CAC (viral growth), high LTV (repeat sellers), and clear path to profitability."

5. **Expansion Ready**
   > "We're operator-light: single phone bridge, Supabase database, Grok AI. We can expand to Nigeria and Kenya with minimal new infrastructure."

---

## ✅ VERIFICATION CHECKLIST

### Phase 6:
- [ ] Jiji scraper working locally
- [ ] n8n workflow deployed
- [ ] WhatsApp integration working
- [ ] First 50 messages sent
- [ ] Response tracking enabled
- [ ] Jiji leads table populated

### Phase 7:
- [ ] 500+ messages sent to Jiji vendors
- [ ] 50+ vendors onboarded
- [ ] GHS 500K+ GMV recorded
- [ ] Metrics dashboard live
- [ ] Series A pitch deck created
- [ ] Ready to approach investors

---

## 📞 SUCCESS METRICS (Week 4 Target)

| Metric | Target | Status |
|--------|--------|--------|
| Vendors | 50+ | |
| GMV | GHS 500K | |
| Transactions | 500+ | |
| CAC | GHS 0 | |
| LTV | GHS 10K+ | |
| Monthly Revenue | GHS 25K | |
| Cost | GHS 250 | |
| Uptime | 99.5% | |

---

*BUZZ Phases 6-7 | MVP Launch & Series A | Ready to Execute*
