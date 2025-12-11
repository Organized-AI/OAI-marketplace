-- Organized Credentials - Database Schema
-- This migration creates the core tables for credential storage

-- Profiles (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  avatar_url TEXT,
  master_key_salt TEXT,
  key_check_blob TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credentials table - stores encrypted credential values
CREATE TABLE IF NOT EXISTS credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id TEXT NOT NULL,
  env_var TEXT NOT NULL,
  label TEXT,
  encrypted_value TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  validation_status TEXT DEFAULT 'unknown' CHECK (validation_status IN ('valid', 'invalid', 'unknown', 'expired')),
  validation_error TEXT,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, service_id, env_var)
);

-- Services reference table - predefined service configurations
CREATE TABLE IF NOT EXISTS services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  setup_url TEXT,
  setup_instructions JSONB DEFAULT '[]',
  documentation_url TEXT,
  validation_type TEXT DEFAULT 'none' CHECK (validation_type IN ('api', 'connection', 'format', 'none')),
  validation_config JSONB DEFAULT '{}',
  key_format TEXT,
  category TEXT,
  env_vars TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs for security tracking
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credential_id UUID REFERENCES credentials(id) ON DELETE SET NULL,
  service_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('create', 'read', 'update', 'delete', 'validate', 'export')),
  metadata JSONB DEFAULT '{}',
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_credentials_user ON credentials(user_id);
CREATE INDEX IF NOT EXISTS idx_credentials_service ON credentials(service_id);
CREATE INDEX IF NOT EXISTS idx_credentials_user_service ON credentials(user_id, service_id);
CREATE INDEX IF NOT EXISTS idx_audit_user ON audit_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_audit_credential ON audit_logs(credential_id);
CREATE INDEX IF NOT EXISTS idx_audit_created ON audit_logs(created_at DESC);

-- Update timestamp trigger function
CREATE OR REPLACE FUNCTION update_updated_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to credentials table
DROP TRIGGER IF EXISTS credentials_updated_at ON credentials;
CREATE TRIGGER credentials_updated_at
  BEFORE UPDATE ON credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();

-- Apply trigger to profiles table
DROP TRIGGER IF EXISTS profiles_updated_at ON profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_timestamp();
