-- BEELINE GHANA - POSTGRESQL SCHEMA
-- Database: beeline
-- Run this after creating database on Render

-- ============================================================================
-- VENDORS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendors (
  vendor_id VARCHAR(100) PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL UNIQUE,
  business_type VARCHAR(100),
  email VARCHAR(255),

  -- Subscription
  subscription_status VARCHAR(20) DEFAULT 'trial', -- trial, active, suspended, cancelled
  subscription_start_date TIMESTAMP DEFAULT NOW(),
  subscription_end_date TIMESTAMP,
  referred_by VARCHAR(100), -- Referrer vendor_id for 7-day free reward

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),

  CONSTRAINT fk_referrer FOREIGN KEY (referred_by) REFERENCES vendors(vendor_id) ON DELETE SET NULL
);

CREATE INDEX idx_vendors_phone ON vendors(phone);
CREATE INDEX idx_vendors_status ON vendors(subscription_status);
CREATE INDEX idx_vendors_referred_by ON vendors(referred_by);

-- ============================================================================
-- VENDOR SESSIONS (Baileys WhatsApp Auth)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendor_sessions (
  vendor_id VARCHAR(100) PRIMARY KEY REFERENCES vendors(vendor_id) ON DELETE CASCADE,

  -- Baileys session data (creds + keys)
  session_data JSONB,

  -- QR code (base64) for new vendor onboarding
  qr_code TEXT,

  -- Session status
  status VARCHAR(20) DEFAULT 'initializing', -- initializing, waiting_for_scan, connected, logged_out

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  last_active TIMESTAMP DEFAULT NOW(),

  -- Metadata
  whatsapp_number VARCHAR(20),
  whatsapp_name VARCHAR(255),
  device_model VARCHAR(100)
);

CREATE INDEX idx_sessions_status ON vendor_sessions(status);
CREATE INDEX idx_sessions_last_active ON vendor_sessions(last_active DESC);

-- ============================================================================
-- VENDOR PERSONAS (AI Configuration)
-- ============================================================================
CREATE TABLE IF NOT EXISTS vendor_personas (
  vendor_id VARCHAR(100) PRIMARY KEY REFERENCES vendors(vendor_id) ON DELETE CASCADE,

  -- Voice note from onboarding
  voice_note_url TEXT,
  voice_transcription TEXT,

  -- Generated persona
  persona_json JSONB NOT NULL,
  -- Example structure:
  -- {
  --   "greeting": "Akwaaba! Welcome to Mama Joyce's shop!",
  --   "tone": "friendly, casual, warm",
  --   "products": ["oranges", "bananas", "tomatoes"],
  --   "rules": ["Always greet in Twi", "Ask about delivery preference"],
  --   "personality": "Mother figure, caring, remembers regular customers"
  -- }

  -- Personality style (chosen by vendor)
  personality_style VARCHAR(20) DEFAULT 'casual', -- casual, formal, twi-heavy

  -- Custom system prompt (if vendor wants to override)
  custom_system_prompt TEXT,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- ============================================================================
-- PRODUCTS CATALOG (per vendor)
-- ============================================================================
CREATE TABLE IF NOT EXISTS products (
  product_id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(100) REFERENCES vendors(vendor_id) ON DELETE CASCADE,

  -- Product info
  name VARCHAR(255) NOT NULL,
  description TEXT,
  category VARCHAR(100),
  sku VARCHAR(100),
  barcode VARCHAR(100),

  -- Pricing
  price DECIMAL(10, 2) NOT NULL,
  currency VARCHAR(3) DEFAULT 'GHS',

  -- Inventory
  quantity INTEGER DEFAULT 0,
  low_stock_warning INTEGER DEFAULT 5,

  -- Status
  is_active BOOLEAN DEFAULT TRUE,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),

  -- Unique constraint per vendor
  UNIQUE(vendor_id, sku)
);

CREATE INDEX idx_products_vendor ON products(vendor_id);
CREATE INDEX idx_products_active ON products(is_active);
CREATE INDEX idx_products_category ON products(category);
CREATE INDEX idx_products_name ON products(name);

-- ============================================================================
-- CONVERSATIONS (tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS conversations (
  conversation_id VARCHAR(200) PRIMARY KEY, -- Format: vendorId:customerId
  vendor_id VARCHAR(100) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  customer_id VARCHAR(100) NOT NULL, -- WhatsApp number

  -- Conversation metadata
  started_at TIMESTAMP DEFAULT NOW(),
  last_message_at TIMESTAMP DEFAULT NOW(),
  message_count INTEGER DEFAULT 0,

  -- Order tracking
  order_completed BOOLEAN DEFAULT FALSE,
  payment_detected BOOLEAN DEFAULT FALSE,
  referral_triggered BOOLEAN DEFAULT FALSE,

  -- Customer info (optional)
  customer_name VARCHAR(255),
  customer_location TEXT
);

CREATE INDEX idx_conversations_vendor ON conversations(vendor_id);
CREATE INDEX idx_conversations_last_message ON conversations(last_message_at DESC);
CREATE INDEX idx_conversations_order ON conversations(order_completed);

-- ============================================================================
-- MESSAGES (full message history for analytics)
-- ============================================================================
CREATE TABLE IF NOT EXISTS messages (
  message_id SERIAL PRIMARY KEY,
  conversation_id VARCHAR(200) REFERENCES conversations(conversation_id) ON DELETE CASCADE,

  -- Message content
  role VARCHAR(20) NOT NULL, -- user, assistant
  content TEXT NOT NULL,

  -- Timestamps
  sent_at TIMESTAMP DEFAULT NOW(),

  -- Metadata
  metadata JSONB,
  -- Example: { "paymentDetected": true, "products": ["Coca Cola"], "aiModel": "llama-3.3-70b" }

  -- Token usage (for cost tracking)
  input_tokens INTEGER,
  output_tokens INTEGER
);

CREATE INDEX idx_messages_conversation ON messages(conversation_id);
CREATE INDEX idx_messages_sent_at ON messages(sent_at DESC);
CREATE INDEX idx_messages_role ON messages(role);

-- ============================================================================
-- ANALYTICS EVENTS (virality tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS analytics_events (
  event_id SERIAL PRIMARY KEY,
  vendor_id VARCHAR(100) REFERENCES vendors(vendor_id) ON DELETE CASCADE,

  -- Event type
  event_type VARCHAR(50) NOT NULL, -- buzz_detected, signup_started, signup_completed, payment_detected

  -- Event data
  event_data JSONB,
  -- Example for buzz_detected: { "customerId": "233...", "referralLink": "..." }
  -- Example for signup_completed: { "newVendorId": "...", "referralReward": "7 days" }

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_analytics_vendor ON analytics_events(vendor_id);
CREATE INDEX idx_analytics_type ON analytics_events(event_type);
CREATE INDEX idx_analytics_created ON analytics_events(created_at DESC);

-- ============================================================================
-- REFERRAL REWARDS (track free days given)
-- ============================================================================
CREATE TABLE IF NOT EXISTS referral_rewards (
  reward_id SERIAL PRIMARY KEY,
  referrer_vendor_id VARCHAR(100) REFERENCES vendors(vendor_id) ON DELETE CASCADE,
  referred_vendor_id VARCHAR(100) REFERENCES vendors(vendor_id) ON DELETE CASCADE,

  -- Reward details
  reward_type VARCHAR(20) DEFAULT 'free_days', -- free_days, credit
  reward_amount INTEGER DEFAULT 7, -- 7 days free
  reward_value_usd DECIMAL(10, 2) DEFAULT 2.25, -- $9/mo ÷ 30 × 7 = $2.25

  -- Status
  status VARCHAR(20) DEFAULT 'pending', -- pending, applied, expired
  applied_at TIMESTAMP,
  expires_at TIMESTAMP,

  -- Timestamps
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_rewards_referrer ON referral_rewards(referrer_vendor_id);
CREATE INDEX idx_rewards_status ON referral_rewards(status);

-- ============================================================================
-- FUNCTIONS: Auto-update updated_at timestamps
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Triggers
CREATE TRIGGER update_vendors_updated_at BEFORE UPDATE ON vendors
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_personas_updated_at BEFORE UPDATE ON vendor_personas
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- SAMPLE DATA: Test Vendor (optional)
-- ============================================================================
-- Uncomment to create test vendor
/*
INSERT INTO vendors (vendor_id, name, phone, business_type, subscription_status)
VALUES ('test_vendor_001', 'Mama Joyce Shop', '233123456789', 'fruit_vegetable', 'trial')
ON CONFLICT (vendor_id) DO NOTHING;

INSERT INTO vendor_personas (vendor_id, persona_json, personality_style)
VALUES (
  'test_vendor_001',
  '{
    "greeting": "Akwaaba! Welcome to Mama Joyce''s shop! 🍊",
    "tone": "friendly, warm, motherly",
    "products": ["oranges", "bananas", "tomatoes"],
    "rules": ["Always greet warmly", "Ask about delivery", "Mention fresh stock"],
    "personality": "Caring mother figure who remembers her regular customers"
  }'::jsonb,
  'casual'
)
ON CONFLICT (vendor_id) DO NOTHING;
*/

-- ============================================================================
-- QUERIES FOR COMMON OPERATIONS
-- ============================================================================

-- Get all active vendors
-- SELECT v.vendor_id, v.name, vs.status, vs.last_active
-- FROM vendors v
-- JOIN vendor_sessions vs ON v.vendor_id = vs.vendor_id
-- WHERE v.subscription_status = 'active' AND vs.status = 'connected'
-- ORDER BY vs.last_active DESC;

-- Get vendor's conversation history (for n8n)
-- SELECT role, content, sent_at
-- FROM messages
-- WHERE conversation_id = 'test_vendor_001:233201234567'
-- ORDER BY sent_at DESC
-- LIMIT 10;

-- Track virality: BUZZ clicks per vendor
-- SELECT vendor_id, COUNT(*) as buzz_count
-- FROM analytics_events
-- WHERE event_type = 'buzz_detected'
-- GROUP BY vendor_id
-- ORDER BY buzz_count DESC;

-- Revenue projection (active vendors × $9/month)
-- SELECT
--   COUNT(*) as active_vendors,
--   COUNT(*) * 9 as mrr_usd,
--   COUNT(*) * 99 as mrr_ghs
-- FROM vendors
-- WHERE subscription_status IN ('trial', 'active');
