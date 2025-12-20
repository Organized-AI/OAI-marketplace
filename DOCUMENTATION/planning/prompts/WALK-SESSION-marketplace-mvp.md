# Walk Session: Marketplace MVP

> **Estimated Duration:** 2-3 hours (perfect for a long walk)
> **Checkpoints:** 6 (report progress after each)

## Overview

Transform the fake AI analysis into real Anthropic API calls with Supabase backend.

**Current State:** AI Analysis Modal uses `setTimeout` mock
**End State:** Real Claude API validation with rate limiting

---

## Pre-Flight Check

Before starting, verify:
- [ ] Environment variables are available (ANTHROPIC_API_KEY, SUPABASE_*)
- [ ] Can run `pnpm install` and `pnpm dev`
- [ ] Supabase project is accessible

**If env vars missing, STOP and report.**

---

## Checkpoint 1: Supabase Client (15 min)

Create `lib/supabase.ts`:
```typescript
import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);
```

**Report:** "✅ Checkpoint 1: Supabase client created"

---

## Checkpoint 2: Database Schema (20 min)

Create `supabase/migrations/001_marketplace.sql`:
- `components` table (id, type, name, description, author, downloads, rating, tags)
- `validation_usage` table (session_id, validations_count, reset_at)
- RLS policies for public read access
- Indexes for performance

Run migration via Supabase CLI or dashboard.

**Report:** "✅ Checkpoint 2: Database schema created and migrated"

---

## Checkpoint 3: Seed Data (15 min)

Create `supabase/seed.sql` with 10 components:
- 3 agents (React, Python, DevOps)
- 2 subagents (Test Writer, Code Reviewer)
- 2 MCPs (GitHub, Supabase)
- 1 command, 1 hook, 1 setting

Run seed: `psql $DATABASE_URL -f supabase/seed.sql`

**Report:** "✅ Checkpoint 3: Component data seeded (10 components)"

---

## Checkpoint 4: Session Hook (10 min)

Create `hooks/useSessionId.ts`:
- Generate unique session ID
- Persist in localStorage
- Return session ID for API calls

**Report:** "✅ Checkpoint 4: Session tracking hook created"

---

## Checkpoint 5: Validation API (45 min)

Create `app/api/validate-stack/route.ts`:
- Accept stack config + sessionId
- Check rate limit (3 free/day)
- Call Anthropic API with validation prompt
- Parse and return analysis
- Increment usage counter

Create `app/api/components/route.ts`:
- Fetch components from Supabase
- Support type filter and search

Test both endpoints:
```bash
curl -X POST http://localhost:3000/api/validate-stack \
  -H "Content-Type: application/json" \
  -d '{"stack":{"name":"test","components":[]},"sessionId":"test123"}'

curl http://localhost:3000/api/components
```

**Report:** "✅ Checkpoint 5: API routes working - validation returns real AI response"

---

## Checkpoint 6: Connect UI (30 min)

Update `components/stack-builder/AIAnalysisModal.tsx`:
- Import and use `useSessionId` hook
- Replace `StackAnalyzer.analyze()` with fetch to `/api/validate-stack`
- Add error state for rate limits
- Display remaining validations
- Map API response to existing UI format

Test end-to-end:
1. Go to `/builder`
2. Add 2-3 components
3. Click "Analyze with AI"
4. See REAL AI analysis

**Report:** "✅ Checkpoint 6: UI connected - full flow working!"

---

## Final Verification

Run through complete flow:
1. [ ] Components load from Supabase
2. [ ] Add components to canvas
3. [ ] Click Analyze → Real AI response appears
4. [ ] Response includes confidence, recommendations, workflow
5. [ ] Rate limiting works (try 4 times, 4th fails)

**Final Report:** "🎉 Marketplace MVP Complete! Real AI validation working with rate limiting."

---

## If Time Remains: Bonus Features

### Bonus A: BYOK Prompt (15 min)
Add UI field for users to enter their own Anthropic API key.
Pass `userApiKey` to API, bypasses rate limit.

### Bonus B: Remaining Validations UI (10 min)
Show "2 of 3 free validations remaining" in modal.

### Bonus C: Error Styling (10 min)
Style the rate limit error message nicely with upgrade CTA.

---

## Troubleshooting

**"Cannot find module '@supabase/supabase-js'"**
→ Run `pnpm install @supabase/supabase-js`

**"ANTHROPIC_API_KEY is not defined"**
→ Check .env.local exists and server was restarted

**"relation 'components' does not exist"**
→ Migration didn't run - check Supabase dashboard

**API returns 500**
→ Check server logs, likely JSON parse error from AI response

---

## Commit Message (when done)

```
feat: Implement real AI validation for Stack Builder

- Add Supabase client and database schema
- Create validation API with Anthropic integration
- Add rate limiting (3 free validations/day)
- Seed component registry with 10 components
- Connect AI Analysis Modal to real API

Closes #MVP
```
