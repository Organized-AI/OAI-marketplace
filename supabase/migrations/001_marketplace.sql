-- Marketplace MVP Migration
-- Creates component registry and validation rate limiting tables

-- Component Registry
CREATE TABLE IF NOT EXISTS components (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL CHECK (type IN ('agent', 'subagent', 'skill', 'mcp', 'command', 'hook', 'setting')),
  name TEXT NOT NULL,
  description TEXT,
  author TEXT NOT NULL,
  repository TEXT,
  icon TEXT,
  downloads INTEGER DEFAULT 0,
  rating DECIMAL(2,1) DEFAULT 0,
  tags TEXT[],
  compatible_models TEXT[],
  dependencies JSONB DEFAULT '{}',
  credentials_required TEXT[],
  github_url TEXT,
  install_command TEXT,
  npm_packages TEXT[],
  config_schema JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Validation Usage (rate limiting)
CREATE TABLE IF NOT EXISTS validation_usage (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id TEXT NOT NULL,
  ip_address INET,
  validations_count INTEGER DEFAULT 0,
  reset_at TIMESTAMPTZ DEFAULT NOW() + INTERVAL '24 hours',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_components_type ON components(type);
CREATE INDEX IF NOT EXISTS idx_components_author ON components(author);
CREATE INDEX IF NOT EXISTS idx_components_tags ON components USING GIN(tags);
CREATE INDEX IF NOT EXISTS idx_validation_session ON validation_usage(session_id);
CREATE INDEX IF NOT EXISTS idx_validation_reset ON validation_usage(reset_at);

-- Enable Row Level Security
ALTER TABLE components ENABLE ROW LEVEL SECURITY;
ALTER TABLE validation_usage ENABLE ROW LEVEL SECURITY;

-- RLS Policies
-- Components are publicly readable
CREATE POLICY "Components public read" ON components
  FOR SELECT USING (true);

-- Only authenticated users can insert components (future feature)
CREATE POLICY "Components authenticated insert" ON components
  FOR INSERT WITH CHECK (true);

-- Validation usage is open (tracked by session_id)
CREATE POLICY "Validation usage open" ON validation_usage
  FOR ALL USING (true);

-- Function to auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for components updated_at
DROP TRIGGER IF EXISTS update_components_updated_at ON components;
CREATE TRIGGER update_components_updated_at
  BEFORE UPDATE ON components
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
