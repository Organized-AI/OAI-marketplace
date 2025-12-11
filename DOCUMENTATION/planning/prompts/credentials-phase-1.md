# Organized Credentials - Phase 1: Database Schema

## Objective
Create the Supabase database schema for credential storage with RLS policies.

## Prerequisites
- Supabase project from Phase A
- Monorepo structure from Phase 0

## Tasks

### Task 1: Create Migration
Create `supabase/migrations/002_credentials.sql`:

```sql
-- Profiles (extends auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  master_key_salt TEXT,
  key_check_blob TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Credentials
CREATE TABLE credentials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id TEXT NOT NULL,
  env_var TEXT NOT NULL,
  label TEXT,
  encrypted_value TEXT NOT NULL,
  encryption_iv TEXT NOT NULL,
  validation_status TEXT DEFAULT 'unknown',
  validation_error TEXT,
  last_validated_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ,
  UNIQUE(user_id, service_id, env_var)
);

-- Services (reference data)
CREATE TABLE services (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon_url TEXT,
  setup_url TEXT,
  setup_instructions JSONB,
  documentation_url TEXT,
  validation_type TEXT DEFAULT 'none',
  validation_config JSONB,
  key_format TEXT,
  category TEXT,
  env_vars TEXT[],
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Audit logs
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  credential_id UUID REFERENCES credentials(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  ip_address INET,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes
CREATE INDEX idx_credentials_user ON credentials(user_id);
CREATE INDEX idx_credentials_service ON credentials(service_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER credentials_updated
  BEFORE UPDATE ON credentials
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

### Task 2: RLS Policies
Create `supabase/migrations/003_credentials_rls.sql`:

```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE credentials ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "Users view own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users insert own profile" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Credentials
CREATE POLICY "Users view own credentials" ON credentials FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own credentials" ON credentials FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users update own credentials" ON credentials FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users delete own credentials" ON credentials FOR DELETE USING (auth.uid() = user_id);

-- Audit logs
CREATE POLICY "Users view own logs" ON audit_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own logs" ON audit_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Services are public
CREATE POLICY "Services public" ON services FOR SELECT USING (true);
```

### Task 3: Seed Services
Create `supabase/migrations/004_seed_services.sql`:

```sql
INSERT INTO services (id, name, setup_url, validation_type, category, env_vars) VALUES
('anthropic', 'Anthropic', 'https://console.anthropic.com/settings/keys', 'api', 'ai', ARRAY['ANTHROPIC_API_KEY']),
('openai', 'OpenAI', 'https://platform.openai.com/api-keys', 'api', 'ai', ARRAY['OPENAI_API_KEY']),
('github', 'GitHub', 'https://github.com/settings/tokens', 'api', 'development', ARRAY['GITHUB_TOKEN']),
('supabase', 'Supabase', 'https://supabase.com/dashboard/project/_/settings/api', 'connection', 'database', ARRAY['SUPABASE_URL', 'SUPABASE_ANON_KEY']),
('stripe', 'Stripe', 'https://dashboard.stripe.com/apikeys', 'api', 'payment', ARRAY['STRIPE_API_KEY']),
('vercel', 'Vercel', 'https://vercel.com/account/tokens', 'api', 'deployment', ARRAY['VERCEL_TOKEN']),
('cloudflare', 'Cloudflare', 'https://dash.cloudflare.com/profile/api-tokens', 'api', 'deployment', ARRAY['CLOUDFLARE_API_TOKEN']);
```

### Task 4: Auto-create Profile Trigger
```sql
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();
```

## Verification
1. `supabase db push`
2. `supabase studio` - Check tables exist
3. Create test user - Verify profile auto-created
4. Try accessing credentials as different user - Should fail (RLS)

## Success Criteria
- [ ] All tables created
- [ ] RLS policies working
- [ ] Services seeded
- [ ] Profile auto-creation works
