-- User Profiles API Key Extension
-- Adds encrypted API key storage to profiles table for Supabase Auth integration
-- Note: RLS policies already defined in 003_credentials_rls.sql

-- Add encrypted_api_key column for storing user's Anthropic API key
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS encrypted_api_key TEXT;

-- Add timestamp for when API key was added
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS api_key_added_at TIMESTAMPTZ;

-- Create index for faster API key lookups
CREATE INDEX IF NOT EXISTS idx_profiles_api_key_added ON profiles(api_key_added_at)
WHERE api_key_added_at IS NOT NULL;
