# Walk Session: Supabase Auth

> **Branch:** `feature/supabase-auth`
> **Total Duration:** 2-3 hours (1 Claude Code Web session)
> **Phases:** 4
> **Token Budget:** ~150-200 Claude Code prompts
> **Prerequisites:** BYOK auth merged, Supabase project configured

---

## Session Budget Allocation

| Phase | Focus | Token Budget | Time |
|-------|-------|--------------|------|
| Phase 1 | Database & Schema | 20% (~35 prompts) | 30 min |
| Phase 2 | Auth Infrastructure | 30% (~55 prompts) | 45 min |
| Phase 3 | UI Components | 35% (~60 prompts) | 50 min |
| Phase 4 | Integration & Testing | 15% (~25 prompts) | 25 min |

---

## Pre-Flight Checklist

```markdown
Before starting, verify:
- [ ] BYOK auth PR is merged to main
- [ ] Supabase project URL and keys are in environment
- [ ] OAuth providers configured in Supabase dashboard (optional)
- [ ] Local dev environment runs without errors
```

---

## Phase 1: Database Schema & RLS (35 prompts, 30 min)

### Prompt 1.1: Create User Profiles Migration
```
Create a new Supabase migration file at `supabase/migrations/002_user_profiles.sql` that:

1. Creates a `user_profiles` table with these columns:
   - id (UUID, primary key, references auth.users)
   - email (TEXT)
   - display_name (TEXT)
   - encrypted_api_key (TEXT)
   - api_key_added_at (TIMESTAMPTZ)
   - created_at (TIMESTAMPTZ, default NOW())
   - updated_at (TIMESTAMPTZ, default NOW())

2. Creates a trigger function `handle_new_user()` that auto-creates a profile when a user signs up

3. Creates an `on_auth_user_created` trigger on auth.users

4. Enables RLS with policies:
   - Users can SELECT their own profile
   - Users can UPDATE their own profile

5. Creates an `update_updated_at()` trigger function for the updated_at column

Run `supabase db push` after creating the migration.
```

**FILES_CREATED:**
- `supabase/migrations/002_user_profiles.sql`

### Prompt 1.2: Verify Migration
```
Verify the user_profiles migration by:

1. Checking Supabase dashboard for the new table
2. Testing RLS policies work correctly
3. Confirming the trigger creates profiles on user signup

If any issues, fix the migration and re-push.
```

### Quality Gate 1
```markdown
✅ Phase 1 Complete when:
- [ ] user_profiles table exists in Supabase
- [ ] RLS policies are active
- [ ] Trigger creates profile on signup (test manually)
- [ ] No migration errors in console

Report: "✅ Phase 1 Complete: Database schema with RLS"
```

---

## Phase 2: Auth Infrastructure (55 prompts, 45 min)

### Prompt 2.1: Create Auth Context and Hook
```
Create `hooks/useAuth.ts` with a complete authentication system:

1. Create AuthContext with TypeScript interface containing:
   - user: User | null
   - session: Session | null
   - isLoading: boolean
   - signIn(email, password): Promise<{error?: string}>
   - signUp(email, password): Promise<{error?: string}>
   - signInWithOAuth(provider: 'google' | 'github'): Promise<void>
   - signOut(): Promise<void>

2. Create AuthProvider component that:
   - Uses createClientComponentClient from @supabase/auth-helpers-nextjs
   - Gets initial session on mount
   - Listens for auth state changes
   - Provides all auth methods via context

3. Create useAuth() hook that throws if used outside provider

4. Export both AuthProvider and useAuth

Use 'use client' directive at the top.
```

**FILES_CREATED:**
- `hooks/useAuth.ts`

### Prompt 2.2: Create OAuth Callback Route
```
Create `app/auth/callback/route.ts` for handling OAuth redirects:

1. Import createRouteHandlerClient from @supabase/auth-helpers-nextjs
2. Import cookies from next/headers
3. Create GET handler that:
   - Extracts 'code' from URL search params
   - If code exists, exchanges it for a session
   - Redirects to /builder after successful auth

This handles the redirect from Google/GitHub OAuth.
```

**FILES_CREATED:**
- `app/auth/callback/route.ts`

### Prompt 2.3: Update Root Layout with AuthProvider
```
Update `app/layout.tsx` to wrap the application with AuthProvider:

1. Import AuthProvider from hooks/useAuth
2. Wrap {children} with <AuthProvider>
3. Ensure proper TypeScript types for the layout props

Keep existing providers and styling intact.
```

**FILES_MODIFIED:**
- `app/layout.tsx`

### Quality Gate 2
```markdown
✅ Phase 2 Complete when:
- [ ] useAuth hook compiles without errors
- [ ] AuthProvider wraps the app in layout.tsx
- [ ] OAuth callback route exists
- [ ] No TypeScript errors in auth files

Report: "✅ Phase 2 Complete: Auth infrastructure ready"
```

---

## Phase 3: UI Components (60 prompts, 50 min)

### Prompt 3.1: Create Auth Modal Component
```
Create `components/AuthModal.tsx` with a full authentication modal:

1. Props interface: { isOpen: boolean; onClose?: () => void }

2. State management for:
   - mode: 'signin' | 'signup'
   - email, password fields
   - error message
   - success message
   - loading state

3. OAuth section with buttons for:
   - Google (with icon)
   - GitHub (with icon)
   - Divider with "or" text

4. Email form section with:
   - Email input (required, type="email")
   - Password input (required, minLength=6)
   - Submit button with loading state
   - Error/success message display

5. Mode toggle link at bottom ("Don't have an account? Sign Up")

6. Close button if onClose prop provided

7. Proper accessibility (labels, focus management)

Use Tailwind CSS for styling. Dark mode compatible.
```

**FILES_CREATED:**
- `components/AuthModal.tsx`

### Prompt 3.2: Create Auth Status Component
```
Create `components/AuthStatus.tsx` for displaying user auth state in headers:

1. Shows user email or display name when logged in
2. Shows "Sign In" button when logged out
3. Includes dropdown menu for logged-in users:
   - Link to /settings
   - Sign Out button
4. Compact design suitable for header placement

Use useAuth hook for state.
```

**FILES_CREATED:**
- `components/AuthStatus.tsx`

### Prompt 3.3: Update useApiKey for Supabase Storage
```
Update `hooks/useApiKey.ts` to support both authenticated and guest users:

1. If user is logged in (from useAuth):
   - Load encrypted_api_key from user_profiles table
   - Save encrypted key to user_profiles on setApiKey
   - Clear from user_profiles on clearApiKey

2. If user is guest (no auth):
   - Fall back to localStorage (existing behavior)

3. Handle migration: if user logs in and has localStorage key but no Supabase key, migrate it

4. Use the existing encryptApiKey/decryptApiKey functions from lib/crypto

Keep the same hook interface: { apiKey, isLoading, isAuthenticated, setApiKey, clearApiKey }
```

**FILES_MODIFIED:**
- `hooks/useApiKey.ts`

### Quality Gate 3
```markdown
✅ Phase 3 Complete when:
- [ ] AuthModal renders without errors
- [ ] AuthStatus shows correct state
- [ ] useApiKey works for both auth states
- [ ] All components have dark mode support
- [ ] No console errors when rendering

Report: "✅ Phase 3 Complete: UI components ready"
```

---

## Phase 4: Integration & Testing (25 prompts, 25 min)

### Prompt 4.1: Update Builder Page with Auth Flow
```
Update `app/builder/page.tsx` to implement the full auth flow:

1. Import useAuth, useApiKey, AuthModal, AuthStatus

2. Add state for showAuthModal

3. Implement three UI states:

   State A - Not logged in:
   - Show welcome message
   - "Sign In to Continue" button
   - Brief description of benefits
   - AuthModal when button clicked

   State B - Logged in, no API key:
   - Show "Welcome, {email}"
   - "Connect Your API Key" message
   - Button to open ApiKeyModal

   State C - Fully authenticated:
   - Show builder header with AuthStatus
   - Link to /settings
   - Sign Out button
   - Full StackBuilderCanvas

4. Handle loading states for both auth and API key

Keep existing builder functionality intact.
```

**FILES_MODIFIED:**
- `app/builder/page.tsx`

### Prompt 4.2: Final Integration Testing
```
Test the complete auth flow:

1. Visit /builder as guest - should see sign in prompt
2. Click Sign In - modal should open
3. Sign up with email - should receive confirmation message
4. Sign in with email - should redirect to API key prompt
5. Add API key - should load builder
6. Refresh page - should still be logged in with key
7. Sign out - should return to sign in prompt
8. Sign in again - API key should persist

Fix any issues found during testing.
```

### Quality Gate 4 (Final)
```markdown
✅ Phase 4 Complete when:
- [ ] Guest sees sign in prompt on /builder
- [ ] Sign up flow works (email sent)
- [ ] Sign in flow works
- [ ] API key persists after login
- [ ] Sign out clears session
- [ ] OAuth works (if configured)
- [ ] No console errors
- [ ] Mobile responsive

Report: "🎉 Supabase Auth Complete!"
```

---

## Rollback Points

| Phase | Rollback Action |
|-------|-----------------|
| Phase 1 | `supabase db reset` to remove migration |
| Phase 2 | Delete hooks/useAuth.ts, revert layout.tsx |
| Phase 3 | Delete new components, revert useApiKey.ts |
| Phase 4 | Revert builder/page.tsx to pre-auth state |

---

## Commit Message Template

```
feat: Add Supabase Auth for user accounts

Phase 1: Database
- Add user_profiles table with RLS
- Create auto-profile trigger on signup

Phase 2: Infrastructure  
- Create AuthProvider and useAuth hook
- Add OAuth callback route

Phase 3: UI
- Create AuthModal with email + OAuth
- Update useApiKey for Supabase storage

Phase 4: Integration
- Gate builder behind authentication
- Add AuthStatus to header
```

---

## Files Summary

**Created:**
- `supabase/migrations/002_user_profiles.sql`
- `hooks/useAuth.ts`
- `app/auth/callback/route.ts`
- `components/AuthModal.tsx`
- `components/AuthStatus.tsx`

**Modified:**
- `app/layout.tsx`
- `hooks/useApiKey.ts`
- `app/builder/page.tsx`
