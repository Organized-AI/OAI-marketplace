# Build Phases - Execute in Order

## Quick Start for Claude Code

Read `CLAUDE.md` first for project context, then execute phases below.

---

## Phase A: Marketplace MVP (START HERE)
**File:** `DOCUMENTATION/planning/prompts/marketplace-phase-a.md`
**Time:** 2-3 hours
**Goal:** Make AI validation real

### What You'll Build:
- `/api/validate-stack` - Real Anthropic API calls
- `/api/components` - Supabase component registry
- Rate limiting (3 free validations/day)
- Update AIAnalysisModal to use real API

### Prerequisites:
1. Create Supabase project at https://supabase.com
2. Get Anthropic API key from https://console.anthropic.com
3. Create `.env.local`:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...
ANTHROPIC_API_KEY=sk-ant-...
```

### Verification:
- [ ] `pnpm dev` runs without errors
- [ ] Go to `/builder`, add 2-3 components
- [ ] Click "Analyze with AI" - should show REAL analysis
- [ ] Try 4 times - 4th should show rate limit

---

## Phase B.0: Credentials Setup
**File:** `DOCUMENTATION/planning/prompts/credentials-phase-0.md`
**Time:** 1-2 hours
**Goal:** Monorepo structure

### What You'll Build:
- `packages/credentials/` directory
- Package.json and TypeScript config
- Basic project structure

---

## Phase B.1: Credentials Database
**File:** `DOCUMENTATION/planning/prompts/credentials-phase-1.md`
**Time:** 1-2 hours
**Goal:** Database schema with RLS

### What You'll Build:
- profiles, credentials, services, audit_logs tables
- Row Level Security policies
- Service seed data

---

## Phase B.2: Credentials SDK
**File:** `DOCUMENTATION/planning/prompts/credentials-phase-2.md`
**Time:** 2-3 hours
**Goal:** TypeScript SDK with encryption

### What You'll Build:
- Client-side AES-256-GCM encryption
- Master password key derivation (PBKDF2)
- Store/get/list/export credentials

---

## Phase C: Dependency Detection
**File:** `DOCUMENTATION/planning/prompts/phase0-all-phases.md`
**Time:** 2-3 hours
**Goal:** Pre-install dependency checking

### What You'll Build:
- Environment variable detector
- NPM package detector
- System tool detector
- Unified detection API

---

## Phase D: Stack Builder CLI
**File:** `DOCUMENTATION/planning/prompts/stack-builder-all-phases.md`
**Time:** 2-3 hours
**Goal:** Install components from CLI

### What You'll Build:
- Git clone installer
- Config merger
- Terminal progress UI

---

## Total Estimated Time: 12-18 hours

## How to Use These Files

Each phase file contains:
1. **Objective** - What you're building
2. **Context** - Current state and what exists
3. **Tasks** - Step-by-step implementation
4. **Code** - Copy-paste ready code blocks
5. **Verification** - How to test it works

### In Claude Code:
```
Open marketplace-phase-a.md and implement all tasks
```

### Tips:
- Complete one phase before starting the next
- Run verification steps before moving on
- Commit after each successful phase
