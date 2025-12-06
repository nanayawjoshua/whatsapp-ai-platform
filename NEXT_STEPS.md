# Next Steps - Beeline Platform

## ✅ Completed Today

1. **Enterprise Database Schema**
   - Created enterprise_accounts, enterprise_users, enterprise_analytics tables
   - Added account_type field to vendors table
   - Implemented volume-based pricing tiers
   - Auto-update triggers for location counts

2. **Bridge Server Updates**
   - Updated to accept and store account_type
   - Cleaned up stale test sessions
   - Ready to differentiate Personal, Business, and Enterprise accounts

3. **Website QR Utils Update**
   - Updated `fetchVendorQRCode` to accept `accountType` parameter

## 🎯 Next: Complete Website Integration

### Step 1: Update Signup Flow to Pass Account Type

The website signup needs to determine which tier the user selected and pass it to the QR generation.

**File to modify:** `website/app/signup/page.tsx`

Currently, when calling `fetchVendorQRCode`, you need to add `accountType`:

```typescript
const qrData = await fetchVendorQRCode(vendorId, {
  name: formData.name,
  phone: formData.phone,
  email: formData.email,
  businessType: formData.businessType,
  personality: selectedPersonality || 'casual',
  accountType: determineAccountType(paymentAmount) // ADD THIS
});
```

**Helper function to add:**

```typescript
function determineAccountType(amount: number): string {
  if (amount === 49) return 'personal';
  if (amount === 99) return 'business';
  return 'enterprise'; // For any enterprise tier amounts
}
```

OR better yet, if your signup form already knows the tier from the pricing selection:

```typescript
accountType: formData.selectedTier // 'personal', 'business', or 'enterprise'
```

### Step 2: Enterprise-Specific Onboarding (Future Enhancement)

For enterprise accounts, you may want a different flow:

1. **Collect Company Info**
   - Company name
   - Billing email
   - Number of locations

2. **Create Enterprise Account**
   ```typescript
   // Call new API endpoint
   POST /api/enterprise/create
   {
     companyName: "KFC Ghana",
     billingEmail: "admin@kfc.com.gh",
     numberOfLocations: 15
   }
   ```

3. **Create First Location**
   - Link vendor to enterprise_account_id
   - Set location_name and location_id

4. **Invite Team Members**
   - Create enterprise_users records
   - Send invitation emails

### Step 3: Test the Full Flow

1. **Start both servers:**
   ```bash
   # Terminal 1: Cloud Bridge
   cd cloud
   npm start

   # Terminal 2: Website
   cd website
   npm run dev
   ```

2. **Test signup:**
   - Go to http://localhost:3001/signup
   - Select Personal tier (GHS 49)
   - Complete payment
   - Verify QR code appears
   - Check database:
     ```sql
     SELECT vendor_id, name, account_type FROM vendors ORDER BY created_at DESC LIMIT 5;
     ```
   - Should see `account_type = 'personal'`

3. **Repeat for Business and Enterprise tiers**

## 📊 Database Queries for Verification

### Check vendor account types:
```sql
SELECT
  vendor_id,
  name,
  account_type,
  subscription_status,
  enterprise_account_id,
  location_name
FROM vendors
ORDER BY created_at DESC;
```

### Check enterprise accounts:
```sql
SELECT
  account_id,
  company_name,
  total_locations,
  discount_tier,
  price_per_location,
  total_locations * price_per_location as monthly_cost
FROM enterprise_accounts;
```

### Test pricing calculation:
```sql
-- Test different location counts
SELECT * FROM calculate_enterprise_pricing(3);   -- 3-5 tier
SELECT * FROM calculate_enterprise_pricing(8);   -- 6-10 tier
SELECT * FROM calculate_enterprise_pricing(15);  -- 11-20 tier
SELECT * FROM calculate_enterprise_pricing(30);  -- 21-50 tier
SELECT * FROM calculate_enterprise_pricing(100); -- custom tier
```

## 🚀 Deployment Checklist

Before deploying to production:

### 1. Environment Variables

**Vercel (website):**
- `CLOUD_BRIDGE_URL=https://beeline-bridge.onrender.com`
- All existing Paystack keys

**Render (cloud bridge):**
- `DATABASE_URL=<neon-postgres-url>`
- `REDIS_URL=<upstash-redis-url>`
- `N8N_WEBHOOK_URL=<n8n-webhook-url>`
- `NODE_ENV=production`
- `MAX_VENDORS=75`

### 2. Database Migrations

Run all migrations on production database:
```bash
# Already run:
# 001_initial_schema.sql
# 002_add_paystack_fields.sql (if exists)
# 003_add_enterprise_support.sql ✅

# Verify:
node verify-enterprise-schema.js
```

### 3. Paystack Plans

Create enterprise plans in Paystack dashboard:
- `enterprise-3` (3-5 locations)
- `enterprise-8` (6-10 locations)
- `enterprise-15` (11-20 locations)
- `enterprise-30` (21-50 locations)
- Custom pricing for 51+

### 4. Testing Checklist

- [ ] Personal tier signup works
- [ ] Business tier signup works
- [ ] QR code generates successfully
- [ ] WhatsApp connection completes
- [ ] account_type saved correctly in database
- [ ] Paystack webhooks working
- [ ] Enterprise accounts (manual creation) working

## 💡 Future Enhancements

1. **Enterprise Dashboard**
   - View all locations
   - Add/remove locations
   - Manage team members
   - View aggregated analytics

2. **Self-Service Enterprise Onboarding**
   - Automated enterprise account creation
   - Location management UI
   - Team invitation system

3. **Billing Automation**
   - Automatic tier upgrades based on location count
   - Prorated billing for new locations
   - Usage-based pricing

4. **Analytics**
   - Enterprise-wide reporting
   - Per-location performance metrics
   - Comparison across locations

---

## 📝 Quick Commands

```bash
# Check database sessions
node cloud/check-sessions.js

# Clean up stale sessions
node cloud/cleanup-all-initializing.js

# Verify enterprise schema
node cloud/verify-enterprise-schema.js

# Run migrations
cd cloud && npm run migrate
```

---

**Current Status:** Ready for website signup integration! The backend fully supports Personal, Business, and Enterprise tiers. Just need to pass `accountType` from the signup form.
