# Organized AI Marketplace

## Project Overview
A marketplace and installation system for Claude Code components (agents, skills, MCPs, commands, hooks, settings).

## Current State
- ✅ Next.js frontend with Stack Builder UI (React Flow)
- ✅ Component library browser
- ✅ Real AI Analysis via Anthropic API
- ✅ Backend API routes (`/api/validate-stack`, `/api/components`)
- ✅ Rate limiting (3 free validations/day)
- ✅ Credential management SDK with encryption
- ✅ Dependency detection system (phase-0)
- ✅ Stack Builder CLI
- ⚠️ Frontend uses mock data - needs Supabase integration
- ⚠️ No user authentication yet

## Tech Stack
- Next.js 14 (App Router)
- React 18 + TypeScript
- Supabase (database configured, migrations ready)
- Anthropic SDK (integrated in /api/validate-stack)
- React Flow / XYFlow
- TailwindCSS
- Zustand (state management)
- pnpm workspaces (monorepo)

## Packages

| Package | Status | Description |
|---------|--------|-------------|
| `@organized-ai/credentials` | ✅ | Credential vault with AES-256-GCM encryption |
| `@organized-ai/phase-0` | ✅ | Dependency detection (env, npm, system) |
| `@organized-ai/stack-builder` | ✅ | Component installer with git clone |
| `@organized-ai/cli` | ✅ | CLI: `install`, `check`, `list` commands |
| `@organized-ai/shared` | ✅ | Shared TypeScript types |

## Build Plan Progress

| Phase | Status | Description |
|-------|--------|-------------|
| Phase A | ✅ | Real AI validation, Supabase schema, rate limiting |
| Phase B.0 | ✅ | Monorepo structure, credentials package |
| Phase B.1 | ✅ | Database schema, RLS policies |
| Phase B.2 | ✅ | Credentials SDK with encryption |
| Phase C | ✅ | Dependency detection system |
| Phase D | ✅ | Stack Builder CLI |

## Remaining Work

1. **Wire up frontend** - Replace mock data with Supabase queries
2. **Add authentication** - Supabase Auth for user accounts
3. **Write tests** - Unit & integration tests for all packages
4. **Credentials UI** - Web dashboard for credential management

## Key Files
- `app/builder/page.tsx` - Stack Builder UI
- `app/api/validate-stack/route.ts` - AI validation endpoint
- `app/api/components/route.ts` - Component registry endpoint
- `components/stack-builder/AIAnalysisModal.tsx` - Analysis modal
- `packages/credentials/` - Credential management SDK
- `packages/phase-0/` - Dependency detection
- `packages/stack-builder/` - Installation engine
- `packages/cli/` - Command-line interface

## Database Migrations
```
supabase/migrations/
├── 001_marketplace.sql      # Components + validation_usage
├── 002_credentials.sql      # Credential storage
├── 003_credentials_rls.sql  # Row Level Security
├── 004_seed_services.sql    # Pre-configured services
└── 005_auto_profile.sql     # Auto-create profile
```

## Environment Variables
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## Commands
```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build all packages + Next.js

# Database
supabase start        # Start local Supabase
supabase db push      # Apply migrations

# Packages
pnpm --filter @organized-ai/cli build    # Build CLI
pnpm --filter @organized-ai/phase-0 build # Build phase-0

# Testing
pnpm test             # Run all tests
```
