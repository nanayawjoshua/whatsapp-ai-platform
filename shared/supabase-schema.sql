-- ============================================================================
-- BEELINE CLASSIFIEDS - SUPABASE SCHEMA
-- ============================================================================
-- Created for BUZZ MVP
-- Database: PostgreSQL (via Supabase)
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. VENDORS TABLE
-- ============================================================================

CREATE TABLE vendors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  phone VARCHAR(20) UNIQUE NOT NULL,
  name VARCHAR(255),
  email VARCHAR(255),
  category VARCHAR(100),

  -- Authentication
  password_hash VARCHAR(255), -- For password-based auth

  -- Commission and wallet
  commission_rate DECIMAL(5,2) DEFAULT 5.00, -- Percentage
  wallet_balance DECIMAL(15,2) DEFAULT 0,
  pending_payout DECIMAL(15,2) DEFAULT 0,
  total_earned DECIMAL(15,2) DEFAULT 0,

  -- Ratings
  rating DECIMAL(3,2) DEFAULT 0,
  review_count INT DEFAULT 0,
  response_time_hours DECIMAL(5,2), -- Average response time

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, suspended, deleted
  verified_at TIMESTAMP,

  -- Metadata
  whatsapp_connected BOOLEAN DEFAULT false,
  last_activity_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_vendors_phone ON vendors(phone);
CREATE INDEX idx_vendors_category ON vendors(category);
CREATE INDEX idx_vendors_status ON vendors(status);

-- ============================================================================
-- 2. PRODUCTS TABLE
-- ============================================================================

CREATE TABLE products (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Product details
  title VARCHAR(255) NOT NULL,
  description TEXT,
  price DECIMAL(15,2) NOT NULL,
  category VARCHAR(100) NOT NULL,

  -- Images
  image_urls TEXT[] DEFAULT ARRAY[]::TEXT[], -- Array of image URLs
  thumbnail_url VARCHAR(500),

  -- Stock
  quantity INT DEFAULT 1,

  -- Status
  status VARCHAR(50) DEFAULT 'active', -- active, sold, removed
  listed_at TIMESTAMP DEFAULT NOW(),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_products_vendor_id ON products(vendor_id);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_status ON products(status);

-- ============================================================================
-- 3. TRANSACTIONS TABLE
-- ============================================================================

CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,
  product_id UUID REFERENCES products(id),

  -- Buyer info
  buyer_phone VARCHAR(20),
  buyer_name VARCHAR(255),

  -- Amount
  gross_amount DECIMAL(15,2) NOT NULL,
  commission_amount DECIMAL(15,2) NOT NULL,
  net_amount DECIMAL(15,2) NOT NULL,

  -- Payment
  payment_method VARCHAR(50), -- pawapay, bank_transfer, momo
  payment_status VARCHAR(50) DEFAULT 'pending', -- pending, paid, failed, refunded
  pawapay_transaction_id VARCHAR(100),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  completed_at TIMESTAMP
);

CREATE INDEX idx_transactions_vendor_id ON transactions(vendor_id);
CREATE INDEX idx_transactions_payment_status ON transactions(payment_status);
CREATE INDEX idx_transactions_created_at ON transactions(created_at);

-- ============================================================================
-- 4. MESSAGES TABLE
-- ============================================================================

CREATE TABLE messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Message details
  sender_type VARCHAR(50), -- vendor, buyer, system
  sender_phone VARCHAR(20),
  sender_name VARCHAR(255),

  -- Content
  message_text TEXT NOT NULL,
  message_type VARCHAR(50), -- product_inquiry, order_confirmation, payment_status, ai_suggestion, other

  -- AI Classification
  classified_category VARCHAR(100),
  classified_confidence INT,
  ai_suggested_response TEXT,

  -- Metadata
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_messages_vendor_id ON messages(vendor_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- ============================================================================
-- 5. JIJI LEADS TABLE (for outreach)
-- ============================================================================

CREATE TABLE jiji_leads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Jiji vendor info
  jiji_vendor_id VARCHAR(100) UNIQUE,
  jiji_vendor_name VARCHAR(255),
  jiji_vendor_url VARCHAR(500),

  -- Contact info
  phone VARCHAR(20) NOT NULL,
  name VARCHAR(255),

  -- Seller info
  category VARCHAR(100),
  product_count INT DEFAULT 0,
  monthly_sales INT DEFAULT 0,
  average_response_time INT, -- in hours
  rating DECIMAL(3,2),

  -- Scoring
  quality_score INT DEFAULT 0, -- 0-100
  fit_score INT DEFAULT 0, -- 0-100: How well they fit Beeline

  -- Outreach tracking
  status VARCHAR(50) DEFAULT 'pending', -- pending, contacted, interested, onboarded, declined, no_response
  contacted_count INT DEFAULT 0,
  last_contacted_at TIMESTAMP,
  last_response_at TIMESTAMP,
  converted_to_vendor_id UUID REFERENCES vendors(id),

  -- Metadata
  notes TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_jiji_leads_phone ON jiji_leads(phone);
CREATE INDEX idx_jiji_leads_quality_score ON jiji_leads(quality_score);
CREATE INDEX idx_jiji_leads_status ON jiji_leads(status);

-- ============================================================================
-- 6. OUTREACH CAMPAIGNS TABLE
-- ============================================================================

CREATE TABLE outreach_campaigns (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

  -- Campaign info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  status VARCHAR(50) DEFAULT 'active', -- active, paused, completed

  -- Targeting
  target_category VARCHAR(100),
  min_quality_score INT DEFAULT 0,

  -- Message
  message_template TEXT NOT NULL,
  subject VARCHAR(255),

  -- Stats
  leads_sent INT DEFAULT 0,
  responses_received INT DEFAULT 0,
  vendors_onboarded INT DEFAULT 0,

  -- Timing
  started_at TIMESTAMP DEFAULT NOW(),
  ended_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- 7. ANALYTICS TABLE (for dashboards)
-- ============================================================================

CREATE TABLE daily_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  date DATE NOT NULL,

  -- Volume
  transactions_count INT DEFAULT 0,
  unique_vendors INT DEFAULT 0,
  gmv DECIMAL(15,2) DEFAULT 0, -- Gross Merchandise Value
  revenue DECIMAL(15,2) DEFAULT 0, -- Commission revenue

  -- New users
  new_vendors INT DEFAULT 0,
  new_transactions INT DEFAULT 0,

  -- Engagement
  messages_sent INT DEFAULT 0,
  avg_response_time INT, -- minutes

  created_at TIMESTAMP DEFAULT NOW()
);

CREATE UNIQUE INDEX idx_daily_analytics_date ON daily_analytics(date);

-- ============================================================================
-- STORAGE BUCKETS (via Supabase Storage)
-- ============================================================================

-- Create storage bucket for product images
-- Note: This is done via Supabase UI, but documenting here
-- Bucket name: product-images
-- Public: false (private, served via Supabase signed URLs)
-- Max file size: 10MB

-- ============================================================================
-- HELPER FUNCTIONS FOR RLS
-- ============================================================================

-- Function to check if current user is admin
-- Uses Supabase's built-in is_super_admin flag from auth.users table
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM auth.users u
    WHERE u.id = auth.uid()
    AND u.is_super_admin = true
  );
$$;

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================

-- Enable RLS on all tables
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;

-- Vendors can see only their own data
CREATE POLICY "Vendors see own data" ON vendors
  FOR SELECT USING (
    auth.uid()::text = id::text OR
    (auth.role() = 'authenticated' AND is_admin())
  );

CREATE POLICY "Products visible to vendor owner" ON products
  FOR SELECT USING (
    vendor_id = (SELECT id FROM vendors WHERE auth.uid()::text = id::text)
  );

-- ============================================================================
-- VIEWS FOR DASHBOARDS
-- ============================================================================

-- Vendor dashboard summary
CREATE VIEW vendor_dashboard AS
SELECT
  v.id,
  v.name,
  v.phone,
  v.rating,
  v.wallet_balance,
  v.pending_payout,
  v.total_earned,
  COUNT(DISTINCT p.id) as product_count,
  COUNT(DISTINCT CASE WHEN t.created_at > NOW() - INTERVAL '1 day' THEN t.id END) as today_sales,
  SUM(CASE WHEN t.created_at > NOW() - INTERVAL '1 day' THEN t.net_amount ELSE 0 END) as today_earnings
FROM vendors v
LEFT JOIN products p ON v.id = p.vendor_id AND p.status = 'active'
LEFT JOIN transactions t ON v.id = t.vendor_id AND t.payment_status = 'paid'
GROUP BY v.id, v.name, v.phone, v.rating, v.wallet_balance, v.pending_payout, v.total_earned;

-- Admin dashboard summary
CREATE VIEW admin_dashboard AS
SELECT
  DATE(t.created_at) as date,
  COUNT(DISTINCT t.id) as total_transactions,
  COUNT(DISTINCT t.vendor_id) as active_vendors,
  SUM(t.gross_amount) as gmv,
  SUM(t.commission_amount) as revenue,
  AVG(t.commission_amount / t.gross_amount * 100) as avg_commission_rate
FROM transactions t
WHERE t.payment_status = 'paid'
GROUP BY DATE(t.created_at)
ORDER BY DATE(t.created_at) DESC;

-- ============================================================================
-- FUNCTIONS
-- ============================================================================

-- Function to calculate vendor quality score
CREATE OR REPLACE FUNCTION calculate_vendor_score(vendor_id UUID)
RETURNS INT AS $$
DECLARE
  rating_score INT;
  sales_score INT;
  response_score INT;
  quality INT;
BEGIN
  -- Rating: 0-30 points
  SELECT COALESCE((rating * 6), 0) INTO rating_score
  FROM vendors WHERE id = vendor_id;

  -- Sales volume: 0-40 points (max 100 sales/month)
  SELECT COALESCE(LEAST((COUNT(*) / 100 * 40), 40), 0) INTO sales_score
  FROM transactions
  WHERE vendor_id = $1 AND created_at > NOW() - INTERVAL '30 days';

  -- Response time: 0-30 points (lower is better)
  SELECT COALESCE(LEAST(30, GREATEST(0, 30 - (response_time_hours * 2))), 0) INTO response_score
  FROM vendors WHERE id = vendor_id;

  quality := rating_score + sales_score + response_score;

  RETURN quality;
END;
$$ LANGUAGE plpgsql;

-- ============================================================================
-- TRIGGERS
-- ============================================================================

-- Update vendor updated_at on any change
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER jiji_leads_updated_at BEFORE UPDATE ON jiji_leads
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- Update vendor wallet on transaction completion
CREATE OR REPLACE FUNCTION update_vendor_wallet()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.payment_status = 'paid' AND OLD.payment_status != 'paid' THEN
    UPDATE vendors
    SET wallet_balance = wallet_balance + NEW.net_amount,
        total_earned = total_earned + NEW.net_amount
    WHERE id = NEW.vendor_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_update_wallet AFTER UPDATE ON transactions
  FOR EACH ROW EXECUTE FUNCTION update_vendor_wallet();

-- ============================================================================
-- INITIAL DATA
-- ============================================================================

-- Insert default commission rate for new vendors
-- (handled in application layer via defaults above)

-- ============================================================================
-- NOTES
-- ============================================================================

-- To use this schema:
-- 1. Create a new Supabase project
-- 2. Run this SQL in the Supabase SQL editor
-- 3. Enable Storage via Supabase dashboard
-- 4. Create "product-images" bucket
-- 5. Set environment variables in .env
--    - SUPABASE_URL
--    - SUPABASE_KEY (anon key for client)
--    - SUPABASE_SERVICE_KEY (service key for admin operations)
