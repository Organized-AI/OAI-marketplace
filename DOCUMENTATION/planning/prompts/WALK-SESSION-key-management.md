# Walk Session: Key Management UI

> **Branch:** `feature/key-management`
> **Estimated Duration:** 1.5-2 hours
> **Checkpoints:** 4
> **Prerequisites:** Supabase Auth merged

## Overview

Create a settings page where users can manage their API keys, view usage, and configure multiple keys for different providers.

**Current State:** Single API key, no management UI
**End State:** Settings page with key management, masking, and future multi-key support

---

## Architecture

```
/settings
├── Profile Section
│   ├── Email (read-only)
│   └── Display Name (editable)
├── API Keys Section
│   ├── Anthropic Key (sk-ant-...xxxx)
│   ├── Last used: Dec 20, 2025
│   ├── [Update] [Remove]
│   └── [+ Add Another Key] (future)
└── Danger Zone
    └── [Delete Account]
```

---

## Pre-Flight Check

- [ ] Supabase Auth is working
- [ ] User can sign in and add API key

**Create branch:** `git checkout -b feature/key-management`

---

## Checkpoint 1: Settings Page Layout (25 min)

Create `app/settings/page.tsx` with profile, API keys, and danger zone sections.

**Report:** "✅ Checkpoint 1: Settings page layout created"

---

## Checkpoint 2: Profile Section Component (20 min)

Create `components/settings/ProfileSection.tsx` with editable display name.

**Report:** "✅ Checkpoint 2: Profile section with editable display name"

---

## Checkpoint 3: API Keys Section (30 min)

Create `components/settings/ApiKeysSection.tsx` with masked key display, update/remove options.

**Report:** "✅ Checkpoint 3: API key management with update/remove"

---

## Checkpoint 4: Danger Zone & Navigation (20 min)

Create `components/settings/DangerZone.tsx` with account deletion and add settings link to builder header.

**Report:** "✅ Checkpoint 4: Danger zone + navigation complete"

---

## Final Verification

1. [ ] Navigate to `/settings` from builder
2. [ ] See profile with email (read-only) and display name
3. [ ] See API key masked (sk-ant-...xxxx)
4. [ ] Update API key - works
5. [ ] Remove API key - redirects to add key flow
6. [ ] Delete account - account removed

**Final Report:** "🎉 Key Management Complete! Full settings page with API key management."

---

## Commit Message

```
feat: Add settings page with API key management

- Create /settings page with profile, API keys, and danger zone
- Add masked key display with update/remove options
- Add account deletion functionality
- Link settings from builder header
```
