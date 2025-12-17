-- Create products table for vendor inventory management
CREATE TABLE IF NOT EXISTS products (
  product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  vendor_id UUID NOT NULL REFERENCES vendors(vendor_id) ON DELETE CASCADE,

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

CREATE TRIGGER products_updated_at_trigger
  BEFORE UPDATE ON products
  FOR EACH ROW
  EXECUTE FUNCTION update_products_updated_at();

-- Create storage bucket for product images (run this separately in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public)
-- VALUES ('product-images', 'product-images', true);

-- Enable RLS
ALTER TABLE products ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Vendors can only manage their own products
CREATE POLICY "Vendors can view their own products"
  ON products FOR SELECT
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can insert their own products"
  ON products FOR INSERT
  WITH CHECK (vendor_id = auth.uid());

CREATE POLICY "Vendors can update their own products"
  ON products FOR UPDATE
  USING (vendor_id = auth.uid());

CREATE POLICY "Vendors can delete their own products"
  ON products FOR DELETE
  USING (vendor_id = auth.uid());

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
JOIN vendors v ON p.vendor_id = v.vendor_id
WHERE p.is_active = true
  AND p.quantity <= p.low_stock_threshold
ORDER BY p.quantity ASC;
