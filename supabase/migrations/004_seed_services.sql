-- Organized Credentials - Seed Services Data
-- Pre-populate common service configurations

INSERT INTO services (id, name, icon_url, setup_url, documentation_url, validation_type, category, env_vars, setup_instructions) VALUES

-- AI Services
('anthropic', 'Anthropic', 'https://www.anthropic.com/favicon.ico', 'https://console.anthropic.com/settings/keys', 'https://docs.anthropic.com/', 'api', 'ai',
  ARRAY['ANTHROPIC_API_KEY'],
  '["Go to console.anthropic.com", "Navigate to API Keys", "Click Create Key", "Copy the key (starts with sk-ant-)"]'::jsonb),

('openai', 'OpenAI', 'https://openai.com/favicon.ico', 'https://platform.openai.com/api-keys', 'https://platform.openai.com/docs', 'api', 'ai',
  ARRAY['OPENAI_API_KEY'],
  '["Go to platform.openai.com", "Navigate to API Keys", "Click Create new secret key", "Copy the key (starts with sk-)"]'::jsonb),

('google-ai', 'Google AI', 'https://ai.google.dev/favicon.ico', 'https://aistudio.google.com/app/apikey', 'https://ai.google.dev/docs', 'api', 'ai',
  ARRAY['GOOGLE_AI_API_KEY'],
  '["Go to Google AI Studio", "Click Get API Key", "Create API key in new project or existing project"]'::jsonb),

-- Development Tools
('github', 'GitHub', 'https://github.githubassets.com/favicons/favicon.png', 'https://github.com/settings/tokens', 'https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token', 'api', 'development',
  ARRAY['GITHUB_TOKEN', 'GITHUB_CLIENT_ID', 'GITHUB_CLIENT_SECRET'],
  '["Go to GitHub Settings > Developer settings", "Click Personal access tokens > Fine-grained tokens", "Generate new token with required permissions"]'::jsonb),

('gitlab', 'GitLab', 'https://about.gitlab.com/nuxt-images/ico/favicon-192x192.png', 'https://gitlab.com/-/profile/personal_access_tokens', 'https://docs.gitlab.com/ee/user/profile/personal_access_tokens.html', 'api', 'development',
  ARRAY['GITLAB_TOKEN'],
  '["Go to GitLab Profile > Access Tokens", "Add new token with required scopes", "Copy the generated token"]'::jsonb),

-- Database Services
('supabase', 'Supabase', 'https://supabase.com/favicon/favicon-32x32.png', 'https://supabase.com/dashboard/project/_/settings/api', 'https://supabase.com/docs', 'connection', 'database',
  ARRAY['SUPABASE_URL', 'SUPABASE_ANON_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
  '["Go to your Supabase project dashboard", "Navigate to Settings > API", "Copy URL and API keys"]'::jsonb),

('postgres', 'PostgreSQL', NULL, NULL, 'https://www.postgresql.org/docs/', 'connection', 'database',
  ARRAY['DATABASE_URL', 'POSTGRES_URL'],
  '["Get connection string from your database provider", "Format: postgresql://user:password@host:port/database"]'::jsonb),

('mongodb', 'MongoDB', 'https://www.mongodb.com/assets/images/global/favicon.ico', 'https://cloud.mongodb.com/', 'https://www.mongodb.com/docs/', 'connection', 'database',
  ARRAY['MONGODB_URI'],
  '["Go to MongoDB Atlas dashboard", "Click Connect on your cluster", "Choose connection method and copy URI"]'::jsonb),

-- Payment Services
('stripe', 'Stripe', 'https://stripe.com/favicon.ico', 'https://dashboard.stripe.com/apikeys', 'https://stripe.com/docs/api', 'api', 'payment',
  ARRAY['STRIPE_API_KEY', 'STRIPE_SECRET_KEY', 'STRIPE_WEBHOOK_SECRET'],
  '["Go to Stripe Dashboard > Developers > API keys", "Copy your secret key", "For webhooks, go to Webhooks and copy signing secret"]'::jsonb),

-- Deployment & Hosting
('vercel', 'Vercel', 'https://vercel.com/favicon.ico', 'https://vercel.com/account/tokens', 'https://vercel.com/docs/rest-api', 'api', 'deployment',
  ARRAY['VERCEL_TOKEN'],
  '["Go to vercel.com/account/tokens", "Create new token", "Copy the generated token"]'::jsonb),

('netlify', 'Netlify', 'https://www.netlify.com/v3/static/favicon.ico', 'https://app.netlify.com/user/applications#personal-access-tokens', 'https://docs.netlify.com/', 'api', 'deployment',
  ARRAY['NETLIFY_AUTH_TOKEN'],
  '["Go to User Settings > Applications", "Create new personal access token", "Copy the token"]'::jsonb),

('cloudflare', 'Cloudflare', 'https://www.cloudflare.com/favicon.ico', 'https://dash.cloudflare.com/profile/api-tokens', 'https://developers.cloudflare.com/', 'api', 'deployment',
  ARRAY['CLOUDFLARE_API_TOKEN', 'CLOUDFLARE_ACCOUNT_ID'],
  '["Go to Cloudflare Dashboard > My Profile > API Tokens", "Create custom token with required permissions"]'::jsonb),

('aws', 'AWS', 'https://aws.amazon.com/favicon.ico', 'https://console.aws.amazon.com/iam/home#/security_credentials', 'https://docs.aws.amazon.com/', 'api', 'deployment',
  ARRAY['AWS_ACCESS_KEY_ID', 'AWS_SECRET_ACCESS_KEY', 'AWS_REGION'],
  '["Go to AWS IAM Console", "Create Access Key for CLI", "Copy Access Key ID and Secret"]'::jsonb),

-- Communication
('slack', 'Slack', 'https://a.slack-edge.com/80588/marketing/img/meta/favicon-32.png', 'https://api.slack.com/apps', 'https://api.slack.com/docs', 'api', 'communication',
  ARRAY['SLACK_BOT_TOKEN', 'SLACK_SIGNING_SECRET'],
  '["Create a Slack App at api.slack.com/apps", "Install to workspace", "Copy Bot User OAuth Token"]'::jsonb),

('discord', 'Discord', 'https://discord.com/assets/favicon.ico', 'https://discord.com/developers/applications', 'https://discord.com/developers/docs', 'api', 'communication',
  ARRAY['DISCORD_TOKEN', 'DISCORD_CLIENT_ID'],
  '["Go to Discord Developer Portal", "Create New Application", "Go to Bot section and copy token"]'::jsonb),

('sendgrid', 'SendGrid', 'https://sendgrid.com/favicon.ico', 'https://app.sendgrid.com/settings/api_keys', 'https://docs.sendgrid.com/', 'api', 'communication',
  ARRAY['SENDGRID_API_KEY'],
  '["Go to SendGrid Settings > API Keys", "Create API Key with required permissions", "Copy the generated key"]'::jsonb),

-- Analytics
('posthog', 'PostHog', 'https://posthog.com/favicon.ico', 'https://posthog.com/project/settings', 'https://posthog.com/docs', 'api', 'analytics',
  ARRAY['POSTHOG_API_KEY', 'POSTHOG_HOST'],
  '["Go to PostHog project settings", "Find your Project API Key", "Note your host URL"]'::jsonb)

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  setup_url = EXCLUDED.setup_url,
  documentation_url = EXCLUDED.documentation_url,
  validation_type = EXCLUDED.validation_type,
  category = EXCLUDED.category,
  env_vars = EXCLUDED.env_vars,
  setup_instructions = EXCLUDED.setup_instructions;
