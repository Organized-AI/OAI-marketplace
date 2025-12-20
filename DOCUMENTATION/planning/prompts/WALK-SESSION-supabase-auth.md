# Walk Session: Supabase Auth

> **Branch:** `feature/supabase-auth`
> **Estimated Duration:** 2-3 hours
> **Checkpoints:** 6
> **Prerequisites:** BYOK auth merged (PR #5)

## Overview

Add full user authentication with Supabase Auth. Users can create accounts, sign in with email/password or OAuth (Google, GitHub), and their API keys persist across devices.

**Current State:** API key stored in localStorage (device-specific)
**End State:** User accounts with API keys stored in Supabase (cross-device)

---

## Architecture

```
┌─────────────────────────────────────────┐
│  User visits /builder                   │
│  ↓                                      │
│  Not logged in → Sign In/Sign Up modal  │
│  ↓                                      │
│  Supabase Auth (email or OAuth)         │
│  ↓                                      │
│  Check for stored API key in profile    │
│  ↓                                      │
│  No key → ApiKeyModal                   │
│  Has key → Builder UI                   │
└─────────────────────────────────────────┘
```

---

## Pre-Flight Check

- [ ] BYOK auth is merged and working
- [ ] Supabase project has Auth enabled
- [ ] OAuth providers configured (optional: Google, GitHub)

**Create branch:** `git checkout -b feature/supabase-auth`

---

## Checkpoint 1: Database Schema for User Profiles (20 min)

Create `supabase/migrations/002_user_profiles.sql`:

```sql
-- User profiles with encrypted API key storage
CREATE TABLE user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  display_name TEXT,
  encrypted_api_key TEXT,
  api_key_added_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- RLS policies
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Updated_at trigger
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_profiles_updated
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
```

Run: `supabase db push`

**Report:** "✅ Checkpoint 1: User profiles table created with RLS"

---

## Checkpoint 2: Supabase Auth Hook (25 min)

Create `hooks/useAuth.ts`:

```typescript
'use client';

import { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import type { User, Session } from '@supabase/supabase-js';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<{ error?: string }>;
  signUp: (email: string, password: string) => Promise<{ error?: string }>;
  signInWithOAuth: (provider: 'google' | 'github') => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  const supabase = createClientComponentClient();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase.auth]);

  const signIn = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return { error: error.message };
    return {};
  }, [supabase.auth]);

  const signUp = useCallback(async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({ 
      email, 
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`
      }
    });
    if (error) return { error: error.message };
    return {};
  }, [supabase.auth]);

  const signInWithOAuth = useCallback(async (provider: 'google' | 'github') => {
    await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  }, [supabase.auth]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, [supabase.auth]);

  return (
    <AuthContext.Provider value={{
      user,
      session,
      isLoading,
      signIn,
      signUp,
      signInWithOAuth,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

**Report:** "✅ Checkpoint 2: Auth hook with email + OAuth support"

---

## Checkpoint 3: Auth Callback Route (15 min)

Create `app/auth/callback/route.ts`:

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');

  if (code) {
    const supabase = createRouteHandlerClient({ cookies });
    await supabase.auth.exchangeCodeForSession(code);
  }

  return NextResponse.redirect(new URL('/builder', requestUrl.origin));
}
```

**Report:** "✅ Checkpoint 3: OAuth callback route created"

---

## Checkpoint 4: Auth Modal Component (30 min)

Create `components/AuthModal.tsx` with email/password form and OAuth buttons for Google and GitHub.

**Report:** "✅ Checkpoint 4: Auth modal with email + OAuth"

---

## Checkpoint 5: Server-Side API Key Storage (25 min)

Update `hooks/useApiKey.ts` to use Supabase for authenticated users, localStorage for guests.

**Report:** "✅ Checkpoint 5: API key storage unified (Supabase for users, localStorage for guests)"

---

## Checkpoint 6: Integrate Auth with Builder (25 min)

Update `app/builder/page.tsx` to show auth flow and wrap layout with AuthProvider.

**Report:** "✅ Checkpoint 6: Full auth flow integrated"

---

## Final Verification

1. [ ] Visit `/builder` - shows "Sign In" screen
2. [ ] Sign up with email - receive confirmation email
3. [ ] Sign in - redirected to "Add API Key" screen
4. [ ] Add API key - builder loads
5. [ ] Sign out and back in - API key persists
6. [ ] Test OAuth (Google/GitHub) if configured

**Final Report:** "🎉 Supabase Auth Complete! Users can create accounts and sync API keys across devices."

---

## Commit Message

```
feat: Add Supabase Auth for user accounts

- Add user_profiles table with encrypted API key storage
- Create AuthProvider and useAuth hook
- Add AuthModal with email + OAuth support
- Update useApiKey to sync with Supabase for logged-in users
- Gate builder behind authentication
- Add sign out functionality
```
