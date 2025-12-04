-- Migration: Add vendor_settings table for Human-in-the-Loop control
-- Created: December 4, 2025
-- Description: Adds table to store vendor AI settings, VIP contacts, and silence timeouts

-- Create vendor_settings table
CREATE TABLE IF NOT EXISTS vendor_settings (
  vendor_id VARCHAR(255) PRIMARY KEY,
  ai_enabled BOOLEAN DEFAULT true NOT NULL,
  ai_silence_timeout INTEGER DEFAULT 5 NOT NULL CHECK (ai_silence_timeout >= 1 AND ai_silence_timeout <= 120),
  vip_contacts TEXT[] DEFAULT '{}' NOT NULL,
  created_at TIMESTAMP DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP DEFAULT NOW() NOT NULL
);

-- Add index for fast vendor lookups
CREATE INDEX IF NOT EXISTS idx_vendor_settings_vendor_id ON vendor_settings(vendor_id);

-- Add index for AI-enabled vendors
CREATE INDEX IF NOT EXISTS idx_vendor_settings_ai_enabled ON vendor_settings(ai_enabled);

-- Add foreign key constraint to vendor_sessions (if it exists)
-- Note: Uncomment if vendor_sessions table already has vendor_id as primary key
-- ALTER TABLE vendor_settings
--   ADD CONSTRAINT fk_vendor_sessions
--   FOREIGN KEY (vendor_id) REFERENCES vendor_sessions(vendor_id)
--   ON DELETE CASCADE;

-- Add updated_at trigger
CREATE OR REPLACE FUNCTION update_vendor_settings_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_vendor_settings_updated_at
  BEFORE UPDATE ON vendor_settings
  FOR EACH ROW
  EXECUTE FUNCTION update_vendor_settings_updated_at();

-- Insert default settings for existing vendors (if any)
-- This ensures all vendors have settings even if they signed up before this migration
INSERT INTO vendor_settings (vendor_id, ai_enabled, ai_silence_timeout, vip_contacts)
SELECT vendor_id, true, 5, '{}'
FROM vendor_sessions
WHERE vendor_id NOT IN (SELECT vendor_id FROM vendor_settings)
ON CONFLICT (vendor_id) DO NOTHING;

-- Migration verification
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_name = 'vendor_settings'
  ) THEN
    RAISE NOTICE '✅ vendor_settings table created successfully';
  ELSE
    RAISE EXCEPTION '❌ Failed to create vendor_settings table';
  END IF;
END $$;
