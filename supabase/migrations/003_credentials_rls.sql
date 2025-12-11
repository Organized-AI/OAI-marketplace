-- Organized Credentials - Row Level Security Policies
-- Ensures users can only access their own data

-- Enable RLS on all tables
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- =====================================
-- PROFILES POLICIES
-- =====================================

-- Users can view their own profile
CREATE POLICY "Users view own profile" ON profiles
  FOR SELECT
  USING (auth.uid() = id);

-- Users can update their own profile
CREATE POLICY "Users update own profile" ON profiles
  FOR UPDATE
  USING (auth.uid() = id);

-- Users can insert their own profile (for auto-creation)
CREATE POLICY "Users insert own profile" ON profiles
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- =====================================
-- CREDENTIALS POLICIES
-- =====================================

-- Users can view their own credentials
CREATE POLICY "Users view own credentials" ON credentials
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own credentials
CREATE POLICY "Users insert own credentials" ON credentials
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own credentials
CREATE POLICY "Users update own credentials" ON credentials
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Users can delete their own credentials
CREATE POLICY "Users delete own credentials" ON credentials
  FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================
-- AUDIT LOGS POLICIES
-- =====================================

-- Users can view their own audit logs
CREATE POLICY "Users view own audit logs" ON audit_logs
  FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own audit logs
CREATE POLICY "Users insert own audit logs" ON audit_logs
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================
-- SERVICES POLICIES
-- =====================================

-- Services are publicly readable (reference data)
CREATE POLICY "Services are public" ON services
  FOR SELECT
  USING (true);
