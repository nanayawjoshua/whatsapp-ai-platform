-- Add Authentication Fields to Vendors Table
-- This enables vendors to log into their dashboard

ALTER TABLE vendors
ADD COLUMN IF NOT EXISTS password_hash VARCHAR(255),
ADD COLUMN IF NOT EXISTS email_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS phone_verified BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS verification_code VARCHAR(10),
ADD COLUMN IF NOT EXISTS verification_code_expires TIMESTAMP,
ADD COLUMN IF NOT EXISTS reset_token VARCHAR(100),
ADD COLUMN IF NOT EXISTS reset_token_expires TIMESTAMP;

-- Create sessions table for JWT/session management
CREATE TABLE IF NOT EXISTS vendor_auth_sessions (
  session_id VARCHAR(100) PRIMARY KEY,
  vendor_id VARCHAR(100) REFERENCES vendors(vendor_id) ON DELETE CASCADE,

  -- Session data
  ip_address VARCHAR(45),
  user_agent TEXT,

  -- Expiry
  created_at TIMESTAMP DEFAULT NOW(),
  expires_at TIMESTAMP NOT NULL,
  last_active TIMESTAMP DEFAULT NOW(),

  -- Status
  is_active BOOLEAN DEFAULT TRUE
);

CREATE INDEX idx_auth_sessions_vendor ON vendor_auth_sessions(vendor_id);
CREATE INDEX idx_auth_sessions_expires ON vendor_auth_sessions(expires_at);
CREATE INDEX idx_auth_sessions_active ON vendor_auth_sessions(is_active);

-- Create login attempts table (security)
CREATE TABLE IF NOT EXISTS login_attempts (
  attempt_id SERIAL PRIMARY KEY,
  identifier VARCHAR(255) NOT NULL, -- email or phone
  ip_address VARCHAR(45),
  success BOOLEAN DEFAULT FALSE,
  attempted_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX idx_login_attempts_identifier ON login_attempts(identifier, attempted_at DESC);
CREATE INDEX idx_login_attempts_ip ON login_attempts(ip_address, attempted_at DESC);
