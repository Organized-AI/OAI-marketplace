-- Stack Templates Migration
-- Creates stack_templates table for saving and sharing component configurations

-- ============================================================================
-- Stack Templates Table
-- ============================================================================
CREATE TABLE IF NOT EXISTS stack_templates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  author_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  author_name TEXT DEFAULT 'Organized AI',
  components JSONB NOT NULL,
  tags TEXT[],
  is_featured BOOLEAN DEFAULT false,
  is_public BOOLEAN DEFAULT true,
  use_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- Indexes for Performance
-- ============================================================================
-- Featured templates (partial index for fast featured queries)
CREATE INDEX IF NOT EXISTS idx_templates_featured
  ON stack_templates(is_featured)
  WHERE is_featured = true;

-- Public templates (partial index for fast public queries)
CREATE INDEX IF NOT EXISTS idx_templates_public
  ON stack_templates(is_public)
  WHERE is_public = true;

-- Tags (GIN index for array containment queries)
CREATE INDEX IF NOT EXISTS idx_templates_tags
  ON stack_templates USING GIN(tags);

-- Use count for sorting by popularity
CREATE INDEX IF NOT EXISTS idx_templates_use_count
  ON stack_templates(use_count DESC);

-- Author ID for user's templates
CREATE INDEX IF NOT EXISTS idx_templates_author
  ON stack_templates(author_id);

-- ============================================================================
-- Enable Row Level Security
-- ============================================================================
ALTER TABLE stack_templates ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- RLS Policies
-- ============================================================================
-- Public templates are viewable by everyone (including anonymous users)
CREATE POLICY "Public templates viewable by all"
  ON stack_templates
  FOR SELECT
  USING (is_public = true);

-- Users can view their own templates (even if private)
CREATE POLICY "Users can view own templates"
  ON stack_templates
  FOR SELECT
  USING (auth.uid() = author_id);

-- Authenticated users can create templates
CREATE POLICY "Users can create templates"
  ON stack_templates
  FOR INSERT
  WITH CHECK (auth.uid() = author_id);

-- Users can update their own templates
CREATE POLICY "Users can update own templates"
  ON stack_templates
  FOR UPDATE
  USING (auth.uid() = author_id)
  WITH CHECK (auth.uid() = author_id);

-- Users can delete their own templates
CREATE POLICY "Users can delete own templates"
  ON stack_templates
  FOR DELETE
  USING (auth.uid() = author_id);

-- Allow anonymous updates to use_count (for tracking)
CREATE POLICY "Anyone can increment use count"
  ON stack_templates
  FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- ============================================================================
-- RPC Function: Increment Template Use Count
-- ============================================================================
CREATE OR REPLACE FUNCTION increment_template_use(template_id UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE stack_templates
  SET use_count = use_count + 1,
      updated_at = NOW()
  WHERE id = template_id;
END;
$$;

-- ============================================================================
-- Trigger: Auto-update updated_at
-- ============================================================================
DROP TRIGGER IF EXISTS update_stack_templates_updated_at ON stack_templates;
CREATE TRIGGER update_stack_templates_updated_at
  BEFORE UPDATE ON stack_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- Seed Data: 3 Featured Templates
-- ============================================================================

-- 1. Full-Stack Next.js Template
INSERT INTO stack_templates (name, description, author_name, components, tags, is_featured, is_public)
VALUES (
  'Full-Stack Next.js',
  'Complete setup for Next.js development with React specialist, testing, and GitHub integration.',
  'Organized AI',
  '[
    {"id": "react-specialist", "type": "agent", "name": "React Specialist", "position": {"x": 150, "y": 100}},
    {"id": "test-writer", "type": "subagent", "name": "Test Writer", "position": {"x": 500, "y": 100}},
    {"id": "github-mcp", "type": "mcp", "name": "GitHub MCP", "position": {"x": 325, "y": 300}}
  ]'::jsonb,
  ARRAY['nextjs', 'react', 'frontend', 'testing'],
  true,
  true
);

-- 2. Python Data Science Template
INSERT INTO stack_templates (name, description, author_name, components, tags, is_featured, is_public)
VALUES (
  'Python Data Science',
  'Data science workflow with Python specialist, Jupyter integration, and database connectivity.',
  'Organized AI',
  '[
    {"id": "python-specialist", "type": "agent", "name": "Python Specialist", "position": {"x": 150, "y": 100}},
    {"id": "supabase-mcp", "type": "mcp", "name": "Supabase MCP", "position": {"x": 500, "y": 100}},
    {"id": "code-reviewer", "type": "subagent", "name": "Code Reviewer", "position": {"x": 150, "y": 300}},
    {"id": "test-writer", "type": "subagent", "name": "Test Writer", "position": {"x": 500, "y": 300}}
  ]'::jsonb,
  ARRAY['python', 'data-science', 'backend', 'database'],
  true,
  true
);

-- 3. DevOps Pipeline Template
INSERT INTO stack_templates (name, description, author_name, components, tags, is_featured, is_public)
VALUES (
  'DevOps Pipeline',
  'Complete DevOps setup with infrastructure specialist, CI/CD hooks, and monitoring.',
  'Organized AI',
  '[
    {"id": "devops-specialist", "type": "agent", "name": "DevOps Specialist", "position": {"x": 150, "y": 100}},
    {"id": "github-mcp", "type": "mcp", "name": "GitHub MCP", "position": {"x": 500, "y": 100}},
    {"id": "pre-commit", "type": "hook", "name": "Pre-Commit Hook", "position": {"x": 150, "y": 300}},
    {"id": "build-command", "type": "command", "name": "Build Command", "position": {"x": 500, "y": 300}},
    {"id": "performance-setting", "type": "setting", "name": "Performance Setting", "position": {"x": 325, "y": 500}}
  ]'::jsonb,
  ARRAY['devops', 'ci-cd', 'infrastructure', 'automation'],
  true,
  true
);
