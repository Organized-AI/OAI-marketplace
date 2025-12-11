---
name: project-status
description: Check the current build status of the marketplace
---

# /project-status

Check what's been built and what's pending.

## Behavior

1. Check for existence of key files:
   - `app/api/validate-stack/route.ts` - Phase A API
   - `lib/supabase.ts` - Phase A Supabase client
   - `packages/credentials/` - Phase B
   - `packages/phase-0/` - Phase C

2. Check environment:
   - `.env.local` exists
   - Required env vars set

3. Report status:
   - ✅ Complete
   - ⚠️ Partial
   - ❌ Not started

## Expected Output
```
📊 Build Status

Phase A (Marketplace MVP):
  ✅ Supabase client
  ❌ API routes
  ⚠️ AI Analysis Modal (using mock)

Phase B (Credentials):
  ❌ Not started

Environment:
  ❌ .env.local missing
```
