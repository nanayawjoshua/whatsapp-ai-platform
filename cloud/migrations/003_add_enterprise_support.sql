-- BEELINE GHANA - ENTERPRISE SUPPORT MIGRATION
-- Adds enterprise account management for multi-location businesses

-- ============================================================================
-- ENTERPRISE ACCOUNTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS enterprise_accounts (
  account_id VARCHAR(100) PRIMARY KEY,
  company_name VARCHAR(255) NOT NULL,
  billing_email VARCHAR(255) NOT NULL,

  -- Subscription tier
  account_type VARCHAR(20) DEFAULT 'enterprise', -- enterprise, reseller, white-label
  total_locations INTEGER DEFAULT 0,
  max_locations INTEGER DEFAULT 100, -- Capacity limit

  -- Pricing
  discount_tier VARCHAR(50), -- '3-5', '6-10', '11-20', '21-50', '51+'
  price_per_location DECIMAL(10,2) DEFAULT 99.00,
  base_fee DECIMAL(10,2) DEFAULT 0.00, -- Optional base fee for hybrid pricing

  -- Billing
  subscription_status VARCHAR(20) DEFAULT 'trial', -- trial, active, suspended, cancelled
  paystack_customer_code VARCHAR(100),
  paystack_subscription_code VARCHAR(100),

  -- Features
  white_label_enabled BOOLEAN DEFAULT FALSE,
  custom_domain VARCHAR(255),
  priority_support BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_enterprise_accounts_status ON enterprise_accounts(subscription_status);
CREATE INDEX idx_enterprise_accounts_company ON enterprise_accounts(company_name);

-- ============================================================================
-- UPDATE VENDORS TABLE - Add Enterprise Link
-- ============================================================================
ALTER TABLE vendors
  ADD COLUMN IF NOT EXISTS account_type VARCHAR(20) DEFAULT 'business', -- personal, business, enterprise
  ADD COLUMN IF NOT EXISTS enterprise_account_id VARCHAR(100) REFERENCES enterprise_accounts(account_id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS location_name VARCHAR(255), -- For enterprise: 'Accra Mall', 'Kumasi Branch'
  ADD COLUMN IF NOT EXISTS location_id VARCHAR(100); -- Unique identifier within enterprise

CREATE INDEX idx_vendors_account_type ON vendors(account_type);
CREATE INDEX idx_vendors_enterprise_account ON vendors(enterprise_account_id);

-- ============================================================================
-- ENTERPRISE USERS TABLE (Team Management)
-- ============================================================================
CREATE TABLE IF NOT EXISTS enterprise_users (
  user_id VARCHAR(100) PRIMARY KEY,
  enterprise_account_id VARCHAR(100) NOT NULL REFERENCES enterprise_accounts(account_id) ON DELETE CASCADE,

  -- User info
  email VARCHAR(255) NOT NULL,
  name VARCHAR(255),

  -- Role-based access
  role VARCHAR(50) NOT NULL, -- admin, manager, staff
  assigned_locations TEXT[], -- Array of location_ids (NULL = all locations)

  -- Permissions
  can_add_locations BOOLEAN DEFAULT FALSE,
  can_manage_team BOOLEAN DEFAULT FALSE,
  can_view_analytics BOOLEAN DEFAULT TRUE,
  can_modify_settings BOOLEAN DEFAULT FALSE,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

CREATE INDEX idx_enterprise_users_account ON enterprise_users(enterprise_account_id);
CREATE INDEX idx_enterprise_users_email ON enterprise_users(email);
CREATE INDEX idx_enterprise_users_role ON enterprise_users(role);

-- ============================================================================
-- ENTERPRISE ANALYTICS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS enterprise_analytics (
  analytics_id SERIAL PRIMARY KEY,
  enterprise_account_id VARCHAR(100) NOT NULL REFERENCES enterprise_accounts(account_id) ON DELETE CASCADE,

  -- Date for aggregation
  date DATE NOT NULL,

  -- Metrics per enterprise (aggregated across all locations)
  total_messages INTEGER DEFAULT 0,
  total_customers INTEGER DEFAULT 0,
  ai_responses INTEGER DEFAULT 0,
  human_responses INTEGER DEFAULT 0,
  avg_response_time_seconds DECIMAL(10,2),

  -- Per-location breakdown (JSONB for flexibility)
  location_metrics JSONB,
  -- Example structure:
  -- {
  --   "accra_mall": { "messages": 150, "customers": 45, "ai_rate": 0.92 },
  --   "kumasi_city": { "messages": 95, "customers": 30, "ai_rate": 0.88 }
  -- }

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),

  UNIQUE(enterprise_account_id, date)
);

CREATE INDEX idx_enterprise_analytics_account_date ON enterprise_analytics(enterprise_account_id, date DESC);

-- ============================================================================
-- FUNCTIONS: Auto-update enterprise location count
-- ============================================================================
CREATE OR REPLACE FUNCTION update_enterprise_location_count()
RETURNS TRIGGER AS $$
DECLARE
  target_account_id VARCHAR(100);
BEGIN
  -- Determine which enterprise account to update
  IF TG_OP = 'DELETE' THEN
    target_account_id := OLD.enterprise_account_id;
  ELSE
    target_account_id := NEW.enterprise_account_id;
  END IF;

  -- Skip if no enterprise account involved
  IF target_account_id IS NULL THEN
    RETURN COALESCE(NEW, OLD);
  END IF;

  -- Update total_locations count when vendors are added/removed/updated
  UPDATE enterprise_accounts
  SET
    total_locations = (
      SELECT COUNT(*)
      FROM vendors
      WHERE enterprise_account_id = target_account_id
        AND subscription_status IN ('trial', 'active')
    ),
    updated_at = NOW()
  WHERE account_id = target_account_id;

  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Trigger for INSERT/UPDATE/DELETE on vendors
DROP TRIGGER IF EXISTS trigger_update_enterprise_location_count ON vendors;
CREATE TRIGGER trigger_update_enterprise_location_count
  AFTER INSERT OR UPDATE OR DELETE ON vendors
  FOR EACH ROW
  EXECUTE FUNCTION update_enterprise_location_count();

-- ============================================================================
-- FUNCTIONS: Calculate enterprise pricing tier
-- ============================================================================
CREATE OR REPLACE FUNCTION calculate_enterprise_pricing(num_locations INTEGER)
RETURNS TABLE(
  tier VARCHAR(50),
  price_per_location DECIMAL(10,2),
  discount_percent INTEGER
) AS $$
BEGIN
  IF num_locations >= 51 THEN
    RETURN QUERY SELECT 'custom'::VARCHAR, 0.00::DECIMAL, 100::INTEGER;
  ELSIF num_locations >= 21 THEN
    RETURN QUERY SELECT '21-50'::VARCHAR, 49.00::DECIMAL, 50::INTEGER;
  ELSIF num_locations >= 11 THEN
    RETURN QUERY SELECT '11-20'::VARCHAR, 59.00::DECIMAL, 40::INTEGER;
  ELSIF num_locations >= 6 THEN
    RETURN QUERY SELECT '6-10'::VARCHAR, 69.00::DECIMAL, 30::INTEGER;
  ELSIF num_locations >= 3 THEN
    RETURN QUERY SELECT '3-5'::VARCHAR, 79.00::DECIMAL, 20::INTEGER;
  ELSE
    RETURN QUERY SELECT 'business'::VARCHAR, 99.00::DECIMAL, 0::INTEGER;
  END IF;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- UPDATE TRIGGERS: Auto-update updated_at
-- ============================================================================
CREATE TRIGGER update_enterprise_accounts_updated_at BEFORE UPDATE ON enterprise_accounts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA: Test Enterprise Account (optional - commented out)
-- ============================================================================
/*
-- Create test enterprise
INSERT INTO enterprise_accounts (account_id, company_name, billing_email, total_locations, discount_tier, price_per_location)
VALUES ('ent_kfc_ghana', 'KFC Ghana', 'admin@kfc.com.gh', 15, '11-20', 59.00)
ON CONFLICT (account_id) DO NOTHING;

-- Create test enterprise user (admin)
INSERT INTO enterprise_users (user_id, enterprise_account_id, email, name, role, can_add_locations, can_manage_team, can_modify_settings)
VALUES ('user_kfc_admin', 'ent_kfc_ghana', 'manager@kfc.com.gh', 'KFC Admin', 'admin', TRUE, TRUE, TRUE)
ON CONFLICT (user_id) DO NOTHING;

-- Link existing test vendor to enterprise
UPDATE vendors
SET
  account_type = 'enterprise',
  enterprise_account_id = 'ent_kfc_ghana',
  location_name = 'Accra Mall',
  location_id = 'loc_accra_mall'
WHERE vendor_id = 'test_vendor_001';
*/

-- ============================================================================
-- QUERIES: Common enterprise operations
-- ============================================================================

-- Get enterprise dashboard summary
-- SELECT
--   ea.account_id,
--   ea.company_name,
--   ea.total_locations,
--   ea.discount_tier,
--   ea.price_per_location,
--   ea.total_locations * ea.price_per_location as monthly_cost,
--   COUNT(CASE WHEN v.subscription_status = 'active' THEN 1 END) as active_locations,
--   COUNT(CASE WHEN vs.status = 'connected' THEN 1 END) as connected_locations
-- FROM enterprise_accounts ea
-- LEFT JOIN vendors v ON ea.account_id = v.enterprise_account_id
-- LEFT JOIN vendor_sessions vs ON v.vendor_id = vs.vendor_id
-- WHERE ea.account_id = 'ent_kfc_ghana'
-- GROUP BY ea.account_id;

-- Get all locations for an enterprise
-- SELECT
--   v.vendor_id,
--   v.location_name,
--   v.location_id,
--   v.phone,
--   v.subscription_status,
--   vs.status as whatsapp_status,
--   vs.last_active
-- FROM vendors v
-- LEFT JOIN vendor_sessions vs ON v.vendor_id = vs.vendor_id
-- WHERE v.enterprise_account_id = 'ent_kfc_ghana'
-- ORDER BY v.location_name;

-- Calculate pricing for enterprise
-- SELECT * FROM calculate_enterprise_pricing(15);
