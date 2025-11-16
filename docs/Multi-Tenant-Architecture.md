# Multi-Tenant Architecture: Built for Billions from Day 1

## Vision

Build a **white-label AI agent platform** that can serve:
- Supermarkets (current MVP)
- Car washes (original idea)
- Salons, barbershops, restaurants, pharmacies, hotels, etc.

**One codebase. Infinite businesses. Global scale.**

---

## Architecture Principles

### 1. Tenant Isolation
Each business (tenant) has:
- ✅ Own business configuration
- ✅ Own product/service catalog
- ✅ Own customer database
- ✅ Own branding & tone
- ✅ Own payment methods
- ✅ Shared infrastructure (you control costs)

### 2. Configuration-Driven
- No code changes per client
- Everything driven by JSON configs
- Deploy once, onboard in minutes

### 3. Data Segregation
```
Google Sheets Structure (MVP):
- Spreadsheet per tenant: "Tenant_SupermarketA"
  - Sheet 1: Products
  - Sheet 2: Customers
  - Sheet 3: Orders
  - Sheet 4: Transactions

- Spreadsheet per tenant: "Tenant_CarWashB"
  - Sheet 1: Services
  - Sheet 2: Customers
  - Sheet 3: Bookings
  - Sheet 4: Transactions
```

**Later (PostgreSQL):**
```sql
-- Every table has tenant_id
CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID NOT NULL,  -- Links to tenant
  name TEXT,
  price DECIMAL,
  ...
);

-- Row-level security
CREATE POLICY tenant_isolation ON products
  USING (tenant_id = current_setting('app.current_tenant')::uuid);
```

---

## Folder Structure (Multi-Tenant)

```
whatsapp-ai-platform/
├── ai-agents/
│   ├── business_configs/
│   │   ├── _template.json           # Base template
│   │   ├── supermarket.json         # Industry template
│   │   ├── car_wash.json           # Industry template
│   │   ├── salon.json              # Industry template
│   │   └── tenants/                # Actual client configs
│   │       ├── tenant_abc123.json  # Client A (supermarket)
│   │       ├── tenant_xyz789.json  # Client B (car wash)
│   │       └── ...
│   ├── system_prompts/
│   │   ├── base_system_prompt.md   # Shared across all
│   │   └── industry_prompts/       # Industry-specific
│   │       ├── retail.md
│   │       ├── services.md
│   │       └── hospitality.md
│   └── tools/
│       ├── product_search.js       # Shared tools
│       ├── order_builder.js
│       ├── payment_handler.js
│       └── inventory_checker.js
├── backend/
│   ├── core/                       # Shared platform code
│   │   ├── tenant_manager.js
│   │   ├── whatsapp_listener.js
│   │   ├── llm_router.js
│   │   └── webhook_handler.js
│   ├── modules/                    # Business logic modules
│   │   ├── retail/
│   │   │   ├── product_catalog.js
│   │   │   ├── cart_management.js
│   │   │   └── delivery_scheduler.js
│   │   ├── services/
│   │   │   ├── booking_system.js
│   │   │   └── appointment_scheduler.js
│   │   └── shared/
│   │       ├── payment_processing.js
│   │       ├── invoice_generator.js
│   │       └── sms_notifications.js
│   └── config/
│       └── tenant_registry.json    # Maps phone numbers → tenants
├── workflows/                       # n8n workflows
│   ├── core_workflows/             # Shared workflows
│   │   ├── message_router.json
│   │   ├── llm_processor.json
│   │   └── payment_verifier.json
│   └── industry_workflows/         # Industry-specific
│       ├── retail_order_flow.json
│       └── service_booking_flow.json
├── deployment/
│   └── docker-compose.yml          # Already done!
└── docs/
    ├── onboarding/
    │   ├── new_tenant_checklist.md
    │   └── configuration_guide.md
    └── API/
        └── tenant_api.md
```

---

## Tenant Configuration Schema

### Master Template: `_template.json`

```json
{
  "tenant_id": "TENANT-UUID",
  "business_info": {
    "name": "Business Name",
    "type": "retail|services|hospitality|other",
    "industry": "supermarket|car_wash|salon|restaurant|etc",
    "country": "GH",
    "currency": "GHC",
    "language": "en",
    "timezone": "Africa/Accra"
  },
  "contact": {
    "whatsapp_number": "+233XXXXXXXXX",
    "owner_name": "John Doe",
    "owner_phone": "+233XXXXXXXXX",
    "email": "owner@business.com"
  },
  "branding": {
    "business_name_display": "Friendly Shop",
    "tone": "friendly|professional|casual|formal",
    "greeting_message": "Hello! Welcome to {{business_name}}. How can I help you today?",
    "closing_message": "Thank you for choosing {{business_name}}! Have a great day!",
    "logo_url": "https://...",
    "primary_color": "#007bff"
  },
  "features": {
    "product_catalog": true,
    "inventory_tracking": true,
    "delivery": true,
    "pickup": true,
    "reservations": false,
    "loyalty_program": false,
    "promo_codes": true
  },
  "operations": {
    "operating_hours": {
      "weekdays": "08:00-20:00",
      "saturday": "09:00-18:00",
      "sunday": "closed"
    },
    "delivery_zones": [...],
    "payment_methods": [...],
    "minimum_order": 20,
    "free_delivery_threshold": 150
  },
  "integrations": {
    "google_sheets_id": "SPREADSHEET-ID",
    "payment_provider": "mtn_momo|vodafone_cash|paystack",
    "payment_api_key": "encrypted",
    "sms_provider": "twilio|hubtel",
    "sms_api_key": "encrypted"
  },
  "llm_config": {
    "primary_provider": "groq",
    "model": "llama-3.1-70b-versatile",
    "fallback_provider": "openai",
    "fallback_model": "gpt-4o-mini",
    "temperature": 0.7,
    "max_tokens": 500
  },
  "subscription": {
    "plan": "free|starter|growth|enterprise",
    "monthly_fee": 0,
    "transaction_fee_percent": 2.5,
    "max_orders_per_month": 100,
    "started_at": "2025-01-15",
    "expires_at": "2025-02-15"
  }
}
```

---

## Tenant Router (How It Works)

### 1. Incoming Message Flow

```javascript
// backend/core/whatsapp_listener.js

// Receive WhatsApp message
const incomingMessage = {
  from: "+233241234567",    // Customer
  to: "+233501234567",      // Business WhatsApp number
  message: "I need tomatoes"
};

// Step 1: Identify tenant
const tenant = await identifyTenant(incomingMessage.to);

// Step 2: Load tenant config
const config = await loadTenantConfig(tenant.tenant_id);

// Step 3: Route to n8n with tenant context
await sendToN8n({
  tenant_id: tenant.tenant_id,
  tenant_config: config,
  customer_phone: incomingMessage.from,
  message: incomingMessage.message
});
```

### 2. Tenant Registry

```json
// backend/config/tenant_registry.json
{
  "tenants": [
    {
      "tenant_id": "abc-123-supermarket",
      "whatsapp_number": "+233501234567",
      "business_name": "Fresh Mart Osu",
      "status": "active",
      "config_file": "tenants/tenant_abc123.json"
    },
    {
      "tenant_id": "xyz-789-carwash",
      "whatsapp_number": "+233502345678",
      "business_name": "Motormate Accra",
      "status": "active",
      "config_file": "tenants/tenant_xyz789.json"
    }
  ]
}
```

### 3. n8n Workflow with Tenant Context

```yaml
# n8n workflow: Message Router

Webhook Trigger
  ↓
[Extract tenant_id from payload]
  ↓
[Load Google Sheets for this tenant]
  ↓
[Query LLM with tenant-specific system prompt]
  ↓
[Process based on tenant's business type]
  ↓
[Send response via tenant's WhatsApp number]
```

---

## Data Isolation Strategy

### MVP: Google Sheets (One per Tenant)

```
Tenant A (Supermarket):
  Spreadsheet ID: 1ABC...XYZ
  - Products
  - Customers
  - Orders
  - Transactions

Tenant B (Car Wash):
  Spreadsheet ID: 2DEF...UVW
  - Services
  - Customers
  - Bookings
  - Transactions
```

**Pros:**
- ✅ Complete data isolation
- ✅ Tenant can access their own sheet
- ✅ Easy backup (duplicate sheet)
- ✅ No cross-tenant leaks possible

**Cons:**
- ⚠️ Manual setup per tenant
- ⚠️ Harder to do cross-tenant analytics
- ⚠️ API rate limits (100 requests/100 seconds per sheet)

### Scale: PostgreSQL with Row-Level Security

```sql
-- Multi-tenant schema
CREATE TABLE tenants (
  id UUID PRIMARY KEY,
  business_name TEXT,
  whatsapp_number TEXT UNIQUE,
  created_at TIMESTAMP
);

CREATE TABLE products (
  id UUID PRIMARY KEY,
  tenant_id UUID REFERENCES tenants(id),
  name TEXT,
  price DECIMAL,
  stock INT,
  ...
);

-- Automatic tenant filtering
CREATE POLICY tenant_isolation ON products
  FOR ALL
  USING (tenant_id = current_setting('app.current_tenant')::uuid);

-- Set tenant context per connection
SET app.current_tenant = 'abc-123-supermarket';
```

---

## Onboarding Flow (Add New Tenant in 30 Minutes)

### Step 1: Sales/Signup
- Customer fills form: business name, WhatsApp, industry
- Selects plan (free trial → paid)

### Step 2: Auto-Provisioning
```javascript
// backend/core/tenant_manager.js

async function provisionNewTenant(businessInfo) {
  // 1. Generate tenant ID
  const tenantId = generateUUID();

  // 2. Copy industry template
  const template = loadTemplate(businessInfo.industry);
  const config = {
    ...template,
    tenant_id: tenantId,
    business_info: businessInfo
  };

  // 3. Create Google Sheet from template
  const sheetId = await createGoogleSheet(tenantId);
  config.integrations.google_sheets_id = sheetId;

  // 4. Save config
  await saveConfig(`tenants/tenant_${tenantId}.json`, config);

  // 5. Register in tenant registry
  await registerTenant({
    tenant_id: tenantId,
    whatsapp_number: businessInfo.whatsapp_number,
    config_file: `tenants/tenant_${tenantId}.json`
  });

  // 6. Send onboarding WhatsApp
  await sendWelcomeMessage(businessInfo.whatsapp_number);

  return { tenantId, sheetId };
}
```

### Step 3: Client Setup (15 mins)
- Fill Google Sheet with products/services
- Test with sample WhatsApp message
- Go live!

---

## Pricing Model (Per Tenant)

| Plan | Price | Orders/Month | Features |
|------|-------|--------------|----------|
| **Free Trial** | $0 | 50 | Basic agent, 1 user |
| **Starter** | $29/mo | 500 | Full features, 2 users |
| **Growth** | $99/mo | 2,000 | + Analytics, 5 users |
| **Enterprise** | Custom | Unlimited | + Dedicated, SLA |

**Transaction Fees:**
- 2% per successful order (covers LLM + infra costs)

**Revenue Math:**
- 10 tenants × $29 = $290/mo base
- 5,000 orders/mo × 2% × $50 avg = $5,000/mo fees
- **Total: $5,290/mo from 10 clients**

At 100 tenants: **~$50K/month** 🚀

---

## Multi-Tenant Benefits

### For You (Platform Owner)
1. **Single codebase** → one deployment serves all
2. **Economy of scale** → LLM costs spread across tenants
3. **Faster onboarding** → minutes, not weeks
4. **Centralized updates** → fix once, all benefit
5. **Data insights** → cross-tenant analytics (anonymized)

### For Clients (Tenants)
1. **Low upfront cost** → no custom dev
2. **Fast setup** → live in 30 minutes
3. **Own their data** → can export anytime
4. **No tech knowledge** → just fill spreadsheet
5. **Continuous improvement** → platform evolves

---

## Migration Path

### Today → Month 3 (MVP)
```
Single tenant (your supermarket test client)
  ↓
Manual config files
  ↓
Google Sheets
  ↓
Local Docker n8n
```

### Month 3 → Month 6 (Multi-Tenant Beta)
```
5-10 tenants
  ↓
Automated provisioning
  ↓
Still Google Sheets
  ↓
Cloud n8n (Railway)
```

### Month 6+ (SaaS Platform)
```
50+ tenants
  ↓
Self-service signup
  ↓
PostgreSQL with RLS
  ↓
Kubernetes cluster
  ↓
Admin dashboard
```

---

## Competitive Moats

### 1. Multi-Tenant from Day 1
- Most competitors build single-tenant first
- Rewriting for multi-tenancy later = 6-12 months
- You skip that pain

### 2. Configuration-Driven
- No code changes per client
- Scale without dev team growth
- Competitors need custom dev per client

### 3. Industry Templates
- Supermarket, car wash, salon, etc.
- Copy-paste onboarding
- 10x faster than custom builds

### 4. LLM Cost Advantage (Groq)
- Your COGS: $0.01/conversation
- Competitor COGS: $0.15/conversation
- Can charge 50% less and still profit

---

## Action Plan

### Week 1: Build Single Tenant (Supermarket MVP)
- Focus on getting ONE client working perfectly
- Use placeholder tenant_id in code
- Prove the concept

### Week 2-3: Refactor for Multi-Tenant
- Extract tenant config from hardcoded values
- Build tenant router
- Test with 2 configs (supermarket + car wash dummy)

### Week 4: Onboard Client #2
- Find another business (car wash, salon, restaurant)
- Use real multi-tenant system
- Validate onboarding flow

### Month 2: Automate Provisioning
- Self-service signup form
- Auto-create Google Sheets
- Automated WhatsApp setup guide

### Month 3: Launch SaaS Platform
- Public website
- Pricing page
- Automated billing (Stripe)
- First 10 paying clients

---

## Key Insight

**You're not building a chatbot. You're building a platform.**

Every design decision today should ask:
- ✅ Will this work for 1,000 tenants?
- ✅ Can I onboard a new client in under 30 minutes?
- ✅ Does this scale without linear cost growth?

**Car wash → Supermarket was the best thing that could have happened.**

It forced you to think multi-tenant from Day 1. That's your billion-dollar moat.

Now execute on the supermarket MVP, nail it, then copy-paste for the next 1,000 businesses.

**Let's build. 🚀**
