-- ============================================================================
-- BEELINE MVP - COMPLETE DATABASE MIGRATION
-- ============================================================================
-- Run this in Supabase SQL Editor to set up all tables
-- ============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- 1. VENDORS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS vendors (
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

CREATE INDEX IF NOT EXISTS idx_vendors_phone ON vendors(phone);
CREATE INDEX IF NOT EXISTS idx_vendors_category ON vendors(category);
CREATE INDEX IF NOT EXISTS idx_vendors_status ON vendors(status);

-- Enable RLS for vendors
ALTER TABLE vendors ENABLE ROW LEVEL SECURITY;

-- RLS Policies for vendors (allow app-level security)
CREATE POLICY IF NOT EXISTS "Vendors can view their own data"
  ON vendors FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Vendors can insert"
  ON vendors FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Vendors can update their own data"
  ON vendors FOR UPDATE
  USING (true);

-- ============================================================================
-- 2. PRODUCTS TABLE
-- ============================================================================

CREATE TABLE IF NOT EXISTS products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(id) ON DELETE CASCADE,

  -- Product details
  name VARCHAR(255) NOT NULL,
  description TEXT,
  image_url TEXT,

  -- Pricing and inventory
  price DECIMAL(10, 2) NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 0,

  -- Product status
  is_active BOOLEAN DEFAULT true,
  low_stock_threshold INTEGER DEFAULT 5,

  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),

  -- Search optimization
  tsv tsvector GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'B')
  ) STORED
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_products_vendor_id ON products(vendor_id);
CREATE INDEX IF NOT EXISTS idx_products_name ON products(name);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON products(is_active);
CREATE INDEX IF NOT EXISTS idx_products_search ON products USING GIN(tsv);

-- Create updated_at trigger
CREATE OR REPLACE FUNCTION update_products_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS products_updated_at_trigger ON products;
CREATE TRIGGER products_updated_at_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Vendors can only manage their own products
CREATE POLICY IF NOT EXISTS "Vendors can view their own products"
  ON products FOR SELECT
  USING (true);

CREATE POLICY IF NOT EXISTS "Vendors can insert their own products"
  ON products FOR INSERT
  WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Vendors can update their own products"
  ON products FOR UPDATE
  USING (true);

CREATE POLICY IF NOT EXISTS "Vendors can delete their own products"
  ON products FOR DELETE
  USING (true);

-- ============================================================================
-- 3. VIEWS
-- ============================================================================

-- Create view for low stock products
CREATE OR REPLACE VIEW low_stock_products AS
SELECT
  p.product_id,
  p.vendor_id,
  p.name,
  p.quantity,
  p.low_stock_threshold,
  v.phone as vendor_phone
FROM products p
JOIN vendors v ON p.vendor_id = v.id
WHERE p.is_active = true
  AND p.quantity <= p.low_stock_threshold
ORDER BY p.quantity ASC;

-- ============================================================================
-- MIGRATION COMPLETE
-- ============================================================================

-- Verify tables exist
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'vendors') THEN
    RAISE NOTICE '✅ vendors table created';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'products') THEN
    RAISE NOTICE '✅ products table created';
  END IF;

  IF EXISTS (SELECT 1 FROM information_schema.views WHERE table_name = 'low_stock_products') THEN
    RAISE NOTICE '✅ low_stock_products view created';
  END IF;
END $$;
