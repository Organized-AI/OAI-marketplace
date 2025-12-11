-- Seed data for Organized AI Marketplace
-- Run this after applying migrations to populate initial components

-- Clear existing data (for development)
TRUNCATE TABLE components CASCADE;

-- Insert sample components
INSERT INTO components (id, type, name, description, author, icon, downloads, rating, tags, compatible_models, config_schema, github_url) VALUES

-- Agents
('react-specialist', 'agent', 'React Specialist', 'Expert agent for React, Next.js, and modern frontend development', 'Organized AI', '⚛️', 1250, 4.8,
  ARRAY['react', 'frontend', 'nextjs'],
  ARRAY['claude-opus-4', 'claude-sonnet-4'],
  '{"ENABLE_TSX": {"type": "boolean", "required": false, "default": true, "description": "Enable TypeScript JSX support"}}',
  'https://github.com/Organized-AI/react-specialist'),

('python-specialist', 'agent', 'Python Specialist', 'Expert in Python, FastAPI, and backend development', 'Organized AI', '🐍', 980, 4.7,
  ARRAY['python', 'backend', 'fastapi'],
  ARRAY['claude-opus-4', 'claude-sonnet-4'],
  '{}',
  'https://github.com/Organized-AI/python-specialist'),

('security-auditor', 'agent', 'Security Auditor', 'Scans code for security vulnerabilities and best practices', 'Organized AI', '🔒', 720, 4.9,
  ARRAY['security', 'audit', 'vulnerabilities'],
  ARRAY['claude-opus-4', 'claude-sonnet-4'],
  '{}',
  'https://github.com/Organized-AI/security-auditor'),

('documentation-writer', 'agent', 'Documentation Writer', 'Generates and maintains comprehensive code documentation', 'Organized AI', '📝', 650, 4.6,
  ARRAY['docs', 'documentation', 'readme'],
  ARRAY['claude-opus-4', 'claude-sonnet-4'],
  '{}',
  'https://github.com/Organized-AI/documentation-writer'),

-- MCPs (Model Context Protocols)
('github-mcp', 'mcp', 'GitHub MCP', 'Integrate with GitHub API for repository operations', 'Anthropic', '🔌', 3420, 4.9,
  ARRAY['github', 'git', 'version-control'],
  ARRAY['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4'],
  '{"GITHUB_TOKEN": {"type": "string", "required": true, "sensitive": true, "description": "GitHub Personal Access Token with repo scope", "placeholder": "ghp_xxxxxxxxxxxxxxxxxxxx"}, "DEFAULT_BRANCH": {"type": "string", "required": false, "description": "Default branch for operations", "placeholder": "main", "default": "main"}}',
  'https://github.com/anthropics/github-mcp'),

('supabase-mcp', 'mcp', 'Supabase MCP', 'Connect to Supabase for database operations', 'Community', '🗄️', 890, 4.6,
  ARRAY['database', 'supabase', 'postgresql'],
  ARRAY['claude-opus-4', 'claude-sonnet-4'],
  '{"SUPABASE_URL": {"type": "string", "required": true, "description": "Supabase project URL", "placeholder": "https://xxx.supabase.co"}, "SUPABASE_KEY": {"type": "string", "required": true, "sensitive": true, "description": "Supabase anon/service key"}}',
  'https://github.com/supabase/supabase-mcp'),

('slack-mcp', 'mcp', 'Slack MCP', 'Send notifications and interact with Slack workspaces', 'Community', '💬', 560, 4.5,
  ARRAY['slack', 'notifications', 'messaging'],
  ARRAY['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4'],
  '{"SLACK_BOT_TOKEN": {"type": "string", "required": true, "sensitive": true, "description": "Slack Bot OAuth Token", "placeholder": "xoxb-..."}}',
  'https://github.com/community/slack-mcp'),

('filesystem-mcp', 'mcp', 'Filesystem MCP', 'Read and write files on the local filesystem', 'Anthropic', '📁', 2100, 4.8,
  ARRAY['filesystem', 'files', 'local'],
  ARRAY['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4'],
  '{"ALLOWED_PATHS": {"type": "string", "required": false, "description": "Comma-separated list of allowed paths", "default": "."}}',
  'https://github.com/anthropics/filesystem-mcp'),

-- Commands
('generate-tests', 'command', 'Generate Tests', 'Auto-generate unit tests for your code', 'Organized AI', '⚡', 1680, 4.7,
  ARRAY['testing', 'automation', 'unit-tests'],
  ARRAY['claude-opus-4', 'claude-sonnet-4'],
  '{}',
  'https://github.com/Organized-AI/generate-tests'),

('refactor-code', 'command', 'Refactor Code', 'Intelligent code refactoring with best practices', 'Organized AI', '🔄', 1420, 4.6,
  ARRAY['refactoring', 'clean-code', 'optimization'],
  ARRAY['claude-opus-4', 'claude-sonnet-4'],
  '{}',
  'https://github.com/Organized-AI/refactor-code'),

('explain-code', 'command', 'Explain Code', 'Get detailed explanations of code snippets', 'Community', '💡', 980, 4.8,
  ARRAY['explanation', 'learning', 'documentation'],
  ARRAY['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4'],
  '{}',
  'https://github.com/community/explain-code'),

-- Hooks
('pre-commit-review', 'hook', 'Pre-Commit Review', 'Review code before committing to catch issues early', 'Organized AI', '🪝', 2100, 4.9,
  ARRAY['git', 'code-review', 'quality'],
  ARRAY['claude-opus-4', 'claude-sonnet-4'],
  '{}',
  'https://github.com/Organized-AI/pre-commit-review'),

('post-push-notify', 'hook', 'Post-Push Notify', 'Send notifications after successful pushes', 'Community', '📣', 450, 4.4,
  ARRAY['git', 'notifications', 'ci-cd'],
  ARRAY['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4'],
  '{"WEBHOOK_URL": {"type": "string", "required": true, "description": "Webhook URL for notifications"}}',
  'https://github.com/community/post-push-notify'),

-- Skills
('typescript-expert', 'skill', 'TypeScript Expert', 'Advanced TypeScript type manipulation and patterns', 'Organized AI', '🎯', 1100, 4.7,
  ARRAY['typescript', 'types', 'generics'],
  ARRAY['claude-opus-4', 'claude-sonnet-4'],
  '{}',
  'https://github.com/Organized-AI/typescript-expert'),

('api-design', 'skill', 'API Design', 'RESTful and GraphQL API design best practices', 'Organized AI', '🌐', 780, 4.6,
  ARRAY['api', 'rest', 'graphql'],
  ARRAY['claude-opus-4', 'claude-sonnet-4'],
  '{}',
  'https://github.com/Organized-AI/api-design'),

-- Settings
('model-preference', 'setting', 'Model Preference', 'Configure default model selection for tasks', 'Organized AI', '⚙️', 3200, 4.9,
  ARRAY['config', 'model', 'preferences'],
  ARRAY['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4'],
  '{"DEFAULT_MODEL": {"type": "select", "required": true, "options": ["claude-opus-4", "claude-sonnet-4", "claude-haiku-4"], "default": "claude-sonnet-4", "description": "Default model for tasks"}}',
  NULL),

('token-budget', 'setting', 'Token Budget', 'Set maximum token limits per conversation', 'Organized AI', '💰', 1500, 4.5,
  ARRAY['config', 'tokens', 'limits'],
  ARRAY['claude-opus-4', 'claude-sonnet-4', 'claude-haiku-4'],
  '{"MAX_TOKENS": {"type": "number", "required": true, "default": 100000, "description": "Maximum tokens per conversation"}}',
  NULL);

-- Verify inserted data
SELECT type, COUNT(*) as count FROM components GROUP BY type ORDER BY type;
