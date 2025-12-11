# Organized Credentials - Phase 0: Project Setup

## Context
You are building the Organized Credentials system - a secure, cross-platform credential management system built on Supabase. This is Phase 0: setting up the project foundation.

## Objective
Set up the monorepo structure, Supabase project configuration, and base development environment.

## Architecture Reference
See: `DOCUMENTATION/planning/organized-credentials.md` for full spec.

## Tasks

### 1. Initialize Monorepo Structure
Create the following directory structure:

```
organized-ai-marketplace/
├── apps/
│   └── .gitkeep
├── packages/
│   ├── credentials/           # This phase focuses here
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── client.ts
│   │   │   ├── encryption.ts
│   │   │   └── types.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── README.md
│   ├── cli/
│   │   └── .gitkeep
│   └── shared/
│       ├── src/
│       │   └── types.ts
│       ├── package.json
│       └── tsconfig.json
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   └── .gitkeep
│   └── functions/
│       └── .gitkeep
├── package.json              # Root package.json with workspaces
├── pnpm-workspace.yaml
├── tsconfig.base.json
└── .env.example
```

### 2. Root package.json
```json
{
  "name": "organized-ai-marketplace",
  "private": true,
  "scripts": {
    "build": "turbo run build",
    "dev": "turbo run dev",
    "lint": "turbo run lint",
    "test": "turbo run test",
    "db:migrate": "supabase db push",
    "db:generate": "supabase gen types typescript --local > packages/shared/src/database.types.ts"
  },
  "devDependencies": {
    "turbo": "^2.0.0",
    "typescript": "^5.3.0"
  }
}
```

### 3. packages/credentials/package.json
```json
{
  "name": "@organized-ai/credentials",
  "version": "0.1.0",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "scripts": {
    "build": "tsc",
    "dev": "tsc --watch",
    "test": "vitest"
  },
  "dependencies": {
    "@supabase/supabase-js": "^2.39.0"
  },
  "devDependencies": {
    "typescript": "^5.3.0",
    "vitest": "^1.0.0"
  },
  "peerDependencies": {
    "@organized-ai/shared": "workspace:*"
  }
}
```

### 4. Supabase Configuration
Create `supabase/config.toml`:
```toml
[api]
enabled = true
port = 54321
schemas = ["public", "storage"]
extra_search_path = ["public", "extensions"]
max_rows = 1000

[auth]
enabled = true
site_url = "http://localhost:3000"
additional_redirect_urls = ["http://localhost:3000/auth/callback"]
jwt_expiry = 3600
enable_signup = true
enable_anonymous_sign_ins = false

[auth.external.github]
enabled = true
client_id = "env(GITHUB_CLIENT_ID)"
secret = "env(GITHUB_CLIENT_SECRET)"
redirect_uri = "http://localhost:54321/auth/v1/callback"

[storage]
enabled = true
file_size_limit = "50MiB"
```

### 5. Base TypeScript Types
Create `packages/shared/src/types.ts`:
```typescript
export interface Credential {
  id: string;
  userId: string;
  serviceId: string;
  envVar: string;
  label?: string;
  encryptedValue: string;
  encryptionIv: string;
  validationStatus: 'valid' | 'invalid' | 'unknown' | 'expired';
  lastValidatedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
}

export interface Service {
  id: string;
  name: string;
  iconUrl?: string;
  setupUrl?: string;
  setupInstructions?: string[];
  documentationUrl?: string;
  validationType: 'api' | 'connection' | 'format' | 'none';
  validationConfig?: Record<string, unknown>;
  keyFormat?: string;
  category: string;
  envVars: string[];
}

export interface ValidationResult {
  valid: boolean;
  error?: string;
  validatedAt: Date;
}

export interface CredentialManagerConfig {
  supabaseUrl: string;
  supabaseAnonKey: string;
  onAuthRequired?: () => Promise<void>;
}
```

### 6. Environment Template
Create `.env.example`:
```bash
# Supabase
SUPABASE_URL=http://localhost:54321
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# OAuth (for GitHub login)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Development
NODE_ENV=development
```

## Verification Steps
After completing this phase, verify:
1. `pnpm install` runs successfully
2. `pnpm build` compiles all packages
3. `supabase start` launches local Supabase
4. All TypeScript files have no errors

## Output
- Working monorepo with pnpm workspaces
- Supabase local development ready
- Base TypeScript configuration
- Shared types package

## Next Phase
Phase 1: Core Infrastructure (Database schema, RLS policies, auth flows)
