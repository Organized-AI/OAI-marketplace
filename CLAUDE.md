# Organized AI Marketplace

## Project Overview
A marketplace and installation system for Claude Code components (agents, skills, MCPs, commands, hooks, settings).

## Current State
- ✅ Next.js frontend with Stack Builder UI (React Flow)
- ✅ Component library browser
- ⚠️ AI Analysis is FAKE (setTimeout mock) - needs real API
- ⚠️ Components are mock data - need Supabase
- ❌ No backend API routes
- ❌ No credential management

## Tech Stack
- Next.js 14 (App Router)
- React 18 + TypeScript
- Supabase (SDK installed, not configured)
- Anthropic SDK (installed, not used)
- React Flow / XYFlow
- TailwindCSS
- Zustand (state management)

## Build Plan
Execute prompts in this order:

1. **DOCUMENTATION/planning/prompts/marketplace-phase-a.md**
   - Real AI validation via Anthropic API
   - Supabase setup + component registry
   - Rate limiting (3 free/day)

2. **DOCUMENTATION/planning/prompts/credentials-phase-0.md**
   - Monorepo structure for credentials package

3. **DOCUMENTATION/planning/prompts/credentials-phase-1.md**
   - Database schema, RLS policies

4. **DOCUMENTATION/planning/prompts/credentials-phase-2.md**
   - TypeScript SDK, encryption, CLI

5. **DOCUMENTATION/planning/prompts/phase0-all-phases.md**
   - Dependency detection system

6. **DOCUMENTATION/planning/prompts/stack-builder-all-phases.md**
   - Visual installer (Ink TUI)

## Key Files
- `app/builder/page.tsx` - Stack Builder UI
- `components/stack-builder/AIAnalysisModal.tsx` - NEEDS REAL AI
- `lib/services/stack-analyzer.ts` - Current heuristic (replace with API)
- `lib/data/marketplace-components.ts` - Mock data (move to Supabase)

## Environment Variables Needed
```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ANTHROPIC_API_KEY=
```

## Commands
```bash
pnpm dev          # Start dev server
pnpm build        # Build for production
supabase start    # Start local Supabase
supabase db push  # Apply migrations
```

## First Task
Start with `marketplace-phase-a.md` - it makes the AI validation real.
