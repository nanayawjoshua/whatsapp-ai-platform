# Enterprise Account Support - Integration Summary

## Overview

Successfully added enterprise account management to the Beeline platform, enabling differentiation between Personal, Business, and Enterprise tiers with volume-based pricing.

## Database Schema Updates

### New Tables Created

#### 1. `enterprise_accounts`
Multi-location business account management
- Company information (name, billing email)
- Account type (enterprise, reseller, white-label)
- Location capacity tracking
- Volume-based pricing tiers
- Paystack subscription integration
- White-label and priority support flags

**Pricing Tiers:**
- 3-5 locations: GHS 79/location (20% discount)
- 6-10 locations: GHS 69/location (30% discount)
- 11-20 locations: GHS 59/location (40% discount)
- 21-50 locations: GHS 49/location (50% discount)
- 51+ locations: Custom pricing (contact sales)

#### 2. `enterprise_users`
Team management and role-based access control
- Admin, Manager, Staff roles
- Location-based access control
- Granular permissions (add locations, manage team, view analytics, modify settings)
- Multi-user support per enterprise account

#### 3. `enterprise_analytics`
Aggregated analytics across all enterprise locations
- Daily metrics rollup
- Per-location breakdown (JSONB)
- Message counts, customer counts, AI vs human response rates
- Response time tracking

### Updated Tables

#### `vendors` Table
Added new columns:
- `account_type` VARCHAR(20) - 'personal', 'business', or 'enterprise'
- `enterprise_account_id` VARCHAR(100) - Links to enterprise_accounts table
- `location_name` VARCHAR(255) - Human-readable location name (e.g., "Accra Mall")
- `location_id` VARCHAR(100) - Unique identifier within enterprise

## Automatic Features

### 1. Location Count Trigger
Automatically updates `enterprise_accounts.total_locations` whenever:
- A vendor is added/removed
- A vendor's enterprise association changes
- A vendor's subscription status changes

### 2. Pricing Calculation Function
`calculate_enterprise_pricing(num_locations)` returns:
- Discount tier name
- Price per location
- Discount percentage

## Bridge Server Updates

### QR Generation Endpoint
Updated `/vendor/generate-qr` to accept `accountType` in vendorData:

```javascript
{
  vendorId: "vendor_123",
  vendorData: {
    name: "KFC Accra Mall",
    phone: "233501234567",
    email: "accra@kfc.com.gh",
    businessType: "restaurant",
    accountType: "enterprise"  // NEW: personal, business, or enterprise
  }
}
```

The bridge server now:
1. Accepts `accountType` from signup flow
2. Stores it in the vendors table
3. Defaults to 'business' if not provided

## Migration Files

### `003_add_enterprise_support.sql`
- Creates all enterprise tables
- Adds columns to vendors table
- Creates triggers and functions
- Includes sample queries for common operations

**Run Migration:**
```bash
cd cloud
npm run migrate
```

**Verify Schema:**
```bash
node verify-enterprise-schema.js
```

## Website Integration (Next Steps)

To fully utilize enterprise support, the website needs updates:

### 1. Signup Flow
Update `app/signup/page.tsx` to pass `accountType`:

```typescript
const qrData = await fetchVendorQRCode(vendorId, {
  name: formData.name,
  phone: formData.phone,
  email: formData.email,
  businessType: formData.businessType,
  personality: selectedPersonality,
  accountType: formData.tier // 'personal', 'business', or 'enterprise'
});
```

### 2. Enterprise Onboarding Flow
For enterprise accounts, create additional flow:
1. Create `enterprise_accounts` record
2. Generate `account_id` (e.g., `ent_kfc_ghana`)
3. Create admin user in `enterprise_users`
4. Link first location to enterprise account

### 3. Enterprise Dashboard
Build admin panel for enterprise accounts:
- View all locations
- Add/remove locations
- Manage team members
- View aggregated analytics
- Billing and subscription management

## Example: Creating an Enterprise Account

```sql
-- 1. Create enterprise account
INSERT INTO enterprise_accounts (
  account_id,
  company_name,
  billing_email,
  total_locations,
  discount_tier,
  price_per_location
)
VALUES (
  'ent_kfc_ghana',
  'KFC Ghana',
  'admin@kfc.com.gh',
  15,
  '11-20',
  59.00
);

-- 2. Create admin user
INSERT INTO enterprise_users (
  user_id,
  enterprise_account_id,
  email,
  name,
  role,
  can_add_locations,
  can_manage_team,
  can_modify_settings
)
VALUES (
  'user_kfc_admin',
  'ent_kfc_ghana',
  'manager@kfc.com.gh',
  'KFC Admin',
  'admin',
  TRUE,
  TRUE,
  TRUE
);

-- 3. Link existing vendor to enterprise
UPDATE vendors
SET
  account_type = 'enterprise',
  enterprise_account_id = 'ent_kfc_ghana',
  location_name = 'Accra Mall',
  location_id = 'loc_accra_mall'
WHERE vendor_id = 'vendor_123';
```

## Testing

### Verify Schema
```bash
cd cloud
node verify-enterprise-schema.js
```

**Expected Output:**
- ✅ All tables created
- ✅ Vendor columns added
- ✅ Pricing function works
- ✅ Test pricing: 15 locations = 11-20 tier @ GHS 59.00/location

### Test Bridge Server
```bash
curl -X POST http://localhost:3000/vendor/generate-qr \
  -H "Content-Type: application/json" \
  -d '{
    "vendorId": "test_enterprise_001",
    "vendorData": {
      "name": "Test Enterprise Location",
      "phone": "233501234567",
      "email": "test@enterprise.com",
      "businessType": "retail",
      "accountType": "enterprise"
    }
  }'
```

## Current Status

✅ Database schema created
✅ Migration executed successfully
✅ Bridge server updated to handle account_type
✅ All triggers and functions working
✅ Verification script confirms all components

## Remaining Tasks

1. **Website Updates:**
   - Update signup flow to pass accountType
   - Build enterprise onboarding flow
   - Create enterprise dashboard

2. **Paystack Integration:**
   - Create enterprise subscription plans in Paystack
   - Implement volume-based pricing in checkout
   - Handle enterprise billing logic

3. **API Endpoints:**
   - Enterprise account CRUD operations
   - Team member management
   - Location management
   - Aggregated analytics endpoints

4. **Documentation:**
   - Enterprise API documentation
   - Admin user guide
   - Team management guide

## File Changes

### Created:
- `cloud/migrations/003_add_enterprise_support.sql`
- `cloud/verify-enterprise-schema.js`
- `ENTERPRISE_INTEGRATION.md` (this file)

### Modified:
- `cloud/bridge-server.js` - Added accountType handling
- `cloud/run-migration.js` - Updated to run enterprise migration

## Architecture Benefits

1. **Scalability**: Supports businesses with hundreds of locations
2. **Flexibility**: Volume-based pricing automatically calculated
3. **Access Control**: Role-based permissions for team members
4. **Analytics**: Aggregated metrics across all locations
5. **White Label**: Support for resellers and white-label partners
6. **Automatic**: Triggers maintain data consistency

## Pricing Model

The system supports three distinct tiers:

| Tier | Monthly Price | Target Audience |
|------|---------------|-----------------|
| Personal | GHS 49 | Individual users, side hustles |
| Business | GHS 99 | Single-location businesses |
| Enterprise | Volume discount | Multi-location businesses |

Enterprise volume discounts make it cost-effective for chains:
- 10 locations × GHS 69 = GHS 690/month (vs GHS 990 at business rate)
- 20 locations × GHS 59 = GHS 1,180/month (vs GHS 1,980 at business rate)
- 50 locations × GHS 49 = GHS 2,450/month (vs GHS 4,950 at business rate)

---

**Next Step:** Update the website signup flow to collect and pass the tier selection to the bridge server.
