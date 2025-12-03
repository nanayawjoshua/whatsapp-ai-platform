# BEELINE GHANA - CLOUD HYBRID ARCHITECTURE

**Status:** Ready for deployment after Pi CloudFlare Tunnel is complete

**Architecture:** Thin Gateway (Pi) → Business Logic (Cloud) → AI (n8n/Groq)

---

## WHAT THIS IS

This is the **cloud-hybrid** branch of Beeline Ghana. It splits the system into two parts:

### 1. **Raspberry Pi (Thin Gateway)** - `pi.beeline.works`
- ONLY handles WhatsApp sessions (Baileys)
- Receives messages from customers
- Forwards to cloud bridge for AI processing
- Sends AI responses back to customers
- **Capacity: 75-80 vendors per Pi** (vs 50 in fat setup)

### 2. **Cloud Bridge (This Service)** - `beeline-bridge.onrender.com`
- Receives messages from Pi
- Loads vendor persona from PostgreSQL
- Queries product catalog
- Forwards to n8n for AI generation
- Returns AI response to Pi
- **Capacity: Unlimited** (horizontal scaling)

### 3. **n8n + Groq (Unchanged)** - `n8n-latest-4dbq.onrender.com`
- AI response generation
- System prompt building
- Conversation history management

---

## WHY HYBRID (vs Pi-Only or Full Cloud)

| Factor | Pi-Only | Hybrid | Full Cloud |
|--------|---------|--------|------------|
| **Vendor Capacity/Pi** | 50 | 75-80 | N/A (no Pi) |
| **Remote Access** | ❌ No | ✅ Yes (tunnel) | ✅ Yes |
| **Power Outage Impact** | All offline | Business logic OK | N/A |
| **Deployment Speed** | Slow (SSH) | Fast (cloud) | Fastest |
| **Monthly Cost (75 vendors)** | $38 | $45 | $18 |
| **Hardware Cost** | $125 | $125 | $0 |
| **Setup Complexity** | Low | Medium | High |

**Hybrid is Best Right Now Because:**
- You already have the Pi ($125 sunk cost)
- 50% more capacity per Pi (75 vs 50)
- Remote access when lights out (CloudFlare Tunnel)
- Cloud handles business logic (faster deploys, no Pi downtime)
- Easy migration to full cloud later (when >100 vendors)

---

## DEPLOYMENT STEPS

### Prerequisites
1. ✅ Pi accessible via CloudFlare Tunnel: `pi.beeline.works`
2. ✅ GitHub repo with cloud-hybrid branch
3. ✅ Render.com account (free tier)
4. ✅ Upstash Redis account (free tier)

### Step 1: Create cloud-hybrid Branch

```bash
# SSH to Pi
ssh pi@pi.beeline.works

# Navigate to project
cd /home/pi/beeline-ai  # or wherever your repo is

# Create branch
git checkout -b cloud-hybrid

# Push to GitHub
git push origin cloud-hybrid
```

### Step 2: Deploy to Render

1. Go to: https://render.com/dashboard
2. Click **New** → **Blueprint**
3. Connect your GitHub repo
4. Select branch: **cloud-hybrid**
5. Render will read `render.yaml` and create:
   - Web service: `beeline-bridge`
   - PostgreSQL database: `beeline-postgres`

6. Set environment variables (in Render dashboard):
   ```
   N8N_WEBHOOK_URL=https://n8n-latest-4dbq.onrender.com/webhook/whatsapp
   REDIS_URL=redis://default:PASSWORD@HOST:PORT (from Upstash)
   GROQ_API_KEY=gsk_... (optional, for fallback)
   ```

7. Click **Deploy**

**Deployment Time:** 5-10 minutes

### Step 3: Run Database Migration

Once deployment is complete:

```bash
# Get PostgreSQL connection URL from Render dashboard
# Format: postgres://user:pass@host:5432/dbname

# Run migration (from your laptop or Pi)
PGPASSWORD=your_password psql -h hostname -U username -d dbname -f cloud/migrations/001_initial_schema.sql
```

Or use Render's Web Shell:
1. Go to your database in Render dashboard
2. Click **Connect** → **External Connection**
3. Use psql command to run migration

**Verify:**
```sql
SELECT * FROM vendors;
SELECT * FROM vendor_sessions;
```

Should return empty tables (no errors).

### Step 4: Set Up Redis (Upstash)

1. Go to: https://upstash.com
2. Create account (free tier: 10k commands/day)
3. Click **Create Database**
   - Name: `beeline-redis`
   - Region: **Europe (closest to Ghana with good latency)**
   - Type: Regional
4. Copy connection URL (format: `redis://default:password@host:port`)
5. Paste into Render env var: `REDIS_URL`
6. Restart Render service

### Step 5: Test Cloud Bridge

```bash
# Health check
curl https://beeline-bridge.onrender.com/health
```

**Expected Response:**
```json
{
  "status": "healthy",
  "vendors": 0,
  "maxVendors": 75,
  "uptime": 123.45,
  "timestamp": "2024-12-03T10:30:00.000Z"
}
```

### Step 6: Update Pi to Forward to Cloud

**Option A: Edit Existing pi/index.js** (if staying on same branch)

Find this line (around line 180):
```javascript
const response = await axios.post(config.n8nWebhookUrl, payload, {
```

Change to:
```javascript
// NEW: Forward to cloud bridge instead of n8n directly
const cloudBridgeUrl = process.env.CLOUD_BRIDGE_URL || 'https://beeline-bridge.onrender.com/webhook';
const response = await axios.post(cloudBridgeUrl, payload, {
```

**Option B: Keep Pi on beeline-main** (recommended for safety)

Keep current Pi on `beeline-main` (working state). Only deploy cloud-hybrid when fully tested.

### Step 7: Test End-to-End

1. **Connect test vendor to cloud:**
   ```bash
   curl -X POST https://beeline-bridge.onrender.com/vendor/generate-qr \
     -H "Content-Type: application/json" \
     -d '{"vendorId": "test_vendor_001"}'
   ```

2. **Scan QR code** (returns in response)

3. **Send test message** on WhatsApp

4. **Check logs:**
   - Render dashboard → beeline-bridge → Logs
   - Should see: "📨 Message received"
   - Should see: "✅ AI response sent"

5. **Verify conversation history in Redis:**
   ```bash
   redis-cli -u $REDIS_URL
   KEYS *
   GET "history:test_vendor_001:233..."
   ```

---

## FILE STRUCTURE

```
cloud/
├── bridge-server.js         # Main WhatsApp gateway service
├── Dockerfile               # Container image for Render
├── package.json             # Node dependencies
├── migrations/
│   └── 001_initial_schema.sql  # PostgreSQL schema
└── README.md                # This file

render.yaml                  # Render deployment config (root)
```

---

## ENVIRONMENT VARIABLES

### Required
- `DATABASE_URL` - PostgreSQL connection (auto-set by Render)
- `N8N_WEBHOOK_URL` - n8n webhook (current: `https://n8n-latest-4dbq.onrender.com/webhook/whatsapp`)
- `REDIS_URL` - Redis connection (from Upstash)

### Optional
- `PORT` - HTTP port (default: 3000, Render auto-sets)
- `NODE_ENV` - Environment (default: production)
- `LOG_LEVEL` - Logging (default: info)
- `MAX_VENDORS` - Capacity per instance (default: 75)
- `GROQ_API_KEY` - Fallback if n8n fails

---

## COST BREAKDOWN

### Monthly (75 vendors)
- Render Web Service: **$7/month** (512MB RAM)
- PostgreSQL (Render): **$0** (free tier, 1GB storage)
- Redis (Upstash): **$0** (free tier, 10k commands/day)
- n8n (current): **$7/month** (unchanged)
- Groq API: **~$6/month** (unchanged)
- Pi power + internet: **$25/month** (unchanged)
- **Total: $45/month** (vs $38 on Pi-only)

### Per-Vendor Cost
- Pi-only: $38 ÷ 50 = **$0.76/vendor**
- Hybrid: $45 ÷ 75 = **$0.60/vendor** (21% cheaper!)

### Hardware Savings
- Pi-only: Need Pi #2 at vendor 51 ($125)
- Hybrid: Need Pi #2 at vendor 76 ($125)
- **Savings: 25 vendors × $9/mo = $225/month delayed cost**

---

## SCALING

### 0-75 Vendors
- 1 Pi + 1 Render instance
- Cost: $45/month
- MRR: $675 (75 × $9)
- Profit: $630/month

### 76-150 Vendors
- 2 Pis + 2 Render instances
- Cost: $90/month
- MRR: $1,350
- Profit: $1,260/month

### 1000 Vendors
- 14 Pis + 14 Render instances
- Cost: $540/month
- MRR: $9,000
- Profit: $8,460/month

**At this scale, migrate to full cloud** (no Pis):
- Render web service: 14 instances × $7 = $98/month
- Total cost: $120/month (vs $540 with Pis)
- **Savings: $420/month ($5,040/year)**

---

## MONITORING

### Render Dashboard
- Real-time logs
- Memory/CPU metrics
- Request counts
- Error rates

### Health Checks
```bash
# Service health
curl https://beeline-bridge.onrender.com/health

# Database health
psql $DATABASE_URL -c "SELECT COUNT(*) FROM vendors;"

# Redis health
redis-cli -u $REDIS_URL PING
```

### Alerts
Set up in Render dashboard:
- Service down → Email/Slack
- High memory usage (>80%) → Scale up
- Database connection errors → Restart service

---

## ROLLBACK PLAN

If cloud-hybrid fails:

1. **Immediate:** Pi stays on `beeline-main` (working state)
2. **Database:** Export vendor data from PostgreSQL
3. **Sessions:** Re-generate QR codes on Pi
4. **Redis:** Conversation history lost (acceptable, last 10 messages)

**Time to rollback:** 5 minutes (just switch branches on Pi)

---

## MIGRATION CHECKLIST

- [ ] CloudFlare Tunnel working (`ssh pi@pi.beeline.works`)
- [ ] cloud-hybrid branch created and pushed to GitHub
- [ ] Render account created
- [ ] Upstash Redis account created
- [ ] Deployed to Render via Blueprint
- [ ] Environment variables set (N8N_WEBHOOK_URL, REDIS_URL)
- [ ] Database migration run successfully
- [ ] Health check returns 200 OK
- [ ] Test vendor QR generated
- [ ] Test message sent and received
- [ ] Conversation history saved to Redis
- [ ] Payment detection triggers footer
- [ ] BUZZ referral triggers signup link
- [ ] Pi forwarding to cloud bridge (if ready)

---

## NEXT FEATURES

After cloud-hybrid is stable:

1. **Vendor Onboarding Web UI** (`signup.beeline.works`)
   - Voice note upload
   - AI persona generation
   - QR code display in browser

2. **Product Catalog Integration**
   - Import 708 products from CSV
   - Per-vendor product tables
   - AI queries inventory before responding

3. **Analytics Dashboard** (`dashboard.beeline.works`)
   - Vendor earnings
   - Message counts
   - BUZZ referral tracking
   - Revenue projections

4. **Full Cloud Migration** (at 100+ vendors)
   - Move Baileys sessions to cloud
   - Deprecate Pi
   - Use Meta Cloud API for WhatsApp

---

**Created:** December 3, 2024
**For:** Beeline Ghana
**By:** Claude Code + Joshua
**Status:** Ready for deployment (waiting for CloudFlare Tunnel completion)

🐝🇬🇭🚀
