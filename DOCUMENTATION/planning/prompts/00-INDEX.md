# Implementation Prompts Index

> **For Claude Code:** Start with `marketplace-phase-a.md`

## Execution Order

| # | File | Description | Time |
|---|------|-------------|------|
| 1 | `marketplace-phase-a.md` | Real AI validation + Supabase | 2-3h |
| 2 | `credentials-phase-0.md` | Monorepo setup | 1-2h |
| 3 | `credentials-phase-1.md` | Database schema + RLS | 1-2h |
| 4 | `credentials-phase-2.md` | SDK + encryption | 2-3h |
| 5 | `phase0-all-phases.md` | Dependency detection | 2-3h |
| 6 | `stack-builder-all-phases.md` | CLI installer | 2-3h |

## Phase A: Marketplace MVP (CURRENT PRIORITY)

**Goal:** Replace fake AI analysis with real Anthropic API calls

**Creates:**
- `app/api/validate-stack/route.ts`
- `app/api/components/route.ts`  
- `lib/supabase.ts`
- `hooks/useSessionId.ts`
- `supabase/migrations/001_marketplace.sql`

**Modifies:**
- `components/stack-builder/AIAnalysisModal.tsx`

## Success Criteria

After Phase A, you should be able to:
1. Add components to Stack Builder canvas
2. Click "Analyze with AI"
3. See REAL analysis from Claude (not mock data)
4. Hit rate limit on 4th attempt

## Quick Commands

```bash
# Install dependencies
pnpm install

# Start dev server
pnpm dev

# Apply Supabase migrations
supabase db push

# Run build
pnpm build
```
