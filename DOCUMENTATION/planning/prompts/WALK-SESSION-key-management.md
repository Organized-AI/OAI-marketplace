# Walk Session: Key Management

> **Branch:** `feature/key-management`
> **Total Duration:** 1.5-2 hours (1 Claude Code Web session)
> **Phases:** 3
> **Token Budget:** ~100-130 Claude Code prompts
> **Prerequisites:** Supabase Auth merged and working

---

## Session Budget Allocation

| Phase | Focus | Token Budget | Time |
|-------|-------|--------------|------|
| Phase 1 | Settings Page Layout | 30% (~35 prompts) | 30 min |
| Phase 2 | Section Components | 45% (~55 prompts) | 45 min |
| Phase 3 | Integration & Polish | 25% (~30 prompts) | 25 min |

---

## Pre-Flight Checklist

```markdown
Before starting, verify:
- [ ] Supabase Auth is working (can sign in/out)
- [ ] user_profiles table exists with encrypted_api_key column
- [ ] useAuth and useApiKey hooks work correctly
- [ ] No TypeScript errors in existing auth code
```

---

## Phase 1: Settings Page Layout (35 prompts, 30 min)

### Prompt 1.1: Create Settings Page Structure
```
Create `app/settings/page.tsx` with a complete settings page layout:

1. Use 'use client' directive

2. Import useAuth and useRouter hooks

3. Add redirect effect: if not loading and no user, redirect to /builder

4. Create page layout with:
   - Header with "Settings" title and "← Back to Builder" link
   - Max-width container (max-w-3xl) centered
   - Gray background (light) / dark gray (dark mode)
   - Spacing for section cards (space-y-8)

5. Import and render three section components (create placeholders):
   - <ProfileSection user={user} />
   - <ApiKeysSection />
   - <DangerZone />

6. Show loading spinner while auth is loading

Use Tailwind CSS. Ensure dark mode compatibility.
```

**FILES_CREATED:**
- `app/settings/page.tsx`

### Prompt 1.2: Create Settings Components Directory
```
Create the settings components directory structure:

1. Create `components/settings/` directory

2. Create placeholder files with basic exports:
   - `components/settings/ProfileSection.tsx`
   - `components/settings/ApiKeysSection.tsx`
   - `components/settings/DangerZone.tsx`
   - `components/settings/index.ts` (barrel export)

Each placeholder should:
- Accept appropriate props
- Return a simple card with section title
- Use 'use client' directive
- Include TypeScript interfaces

This sets up the structure for Phase 2.
```

**FILES_CREATED:**
- `components/settings/ProfileSection.tsx`
- `components/settings/ApiKeysSection.tsx`
- `components/settings/DangerZone.tsx`
- `components/settings/index.ts`

### Quality Gate 1
```markdown
✅ Phase 1 Complete when:
- [ ] /settings page renders without errors
- [ ] Redirects to /builder if not logged in
- [ ] Shows loading state while checking auth
- [ ] Three placeholder sections visible
- [ ] Back to Builder link works

Report: "✅ Phase 1 Complete: Settings page layout ready"
```

---

## Phase 2: Section Components (55 prompts, 45 min)

### Prompt 2.1: Build Profile Section
```
Implement `components/settings/ProfileSection.tsx` with full functionality:

1. Props: { user: User } from Supabase

2. State for:
   - displayName (string)
   - isSaving (boolean)
   - message (string | null) for success/error feedback

3. On mount, fetch current display_name from user_profiles table

4. UI elements:
   - Section card with white background, rounded corners, shadow
   - "Profile" heading
   - Email field (read-only, disabled input)
   - Display Name field (editable) with Save button
   - Success/error message display

5. handleSave function that:
   - Sets isSaving to true
   - Updates display_name in user_profiles
   - Shows success message for 3 seconds
   - Handles errors gracefully

Use createClientComponentClient for Supabase operations.
```

**FILES_MODIFIED:**
- `components/settings/ProfileSection.tsx`

### Prompt 2.2: Build API Keys Section
```
Implement `components/settings/ApiKeysSection.tsx` with full functionality:

1. Import useApiKey hook

2. State for:
   - showModal (for ApiKeyModal)
   - showConfirmRemove (for remove confirmation dialog)

3. Compute maskedKey: if apiKey exists, show "sk-ant-...{last 4 chars}"

4. UI for when API key exists:
   - Card showing masked key with green "● Active" indicator
   - "Anthropic API Key" label
   - Update button (opens ApiKeyModal)
   - Remove button (opens confirmation dialog)

5. UI for when no API key:
   - Dashed border empty state
   - "No API key configured" message
   - "Add API Key" button

6. Confirmation dialog for remove:
   - Warning message
   - Cancel and Remove buttons
   - Calls clearApiKey() on confirm

7. Security note at bottom: "Your API key is encrypted and stored securely."

8. Render ApiKeyModal with isOpen={showModal}

Include loading skeleton while API key is loading.
```

**FILES_MODIFIED:**
- `components/settings/ApiKeysSection.tsx`

### Prompt 2.3: Build Danger Zone Section
```
Implement `components/settings/DangerZone.tsx` with account deletion:

1. Import useAuth, useRouter, createClientComponentClient

2. State for:
   - showConfirm (boolean)
   - isDeleting (boolean)

3. UI:
   - Section card with red-tinted border
   - "Danger Zone" heading in red
   - "Delete Account" row with description
   - Red outline "Delete Account" button

4. Confirmation modal:
   - Warning icon and red heading
   - "This action cannot be undone" message
   - Cancel button
   - Red "Delete" button with loading state

5. handleDeleteAccount function that:
   - Sets isDeleting to true
   - Deletes user_profiles row (cascade handles auth.users)
   - Calls signOut()
   - Redirects to home page

Handle errors gracefully with user feedback.
```

**FILES_MODIFIED:**
- `components/settings/DangerZone.tsx`

### Quality Gate 2
```markdown
✅ Phase 2 Complete when:
- [ ] Profile section shows email and editable display name
- [ ] Display name saves successfully
- [ ] API key shows masked (sk-ant-...xxxx)
- [ ] Update key flow works
- [ ] Remove key flow works with confirmation
- [ ] Danger zone shows delete option
- [ ] All sections have dark mode support

Report: "✅ Phase 2 Complete: All section components working"
```

---

## Phase 3: Integration & Polish (30 prompts, 25 min)

### Prompt 3.1: Add Settings Navigation to Builder
```
Update the builder page and header to include settings navigation:

1. In `app/builder/page.tsx` header section, add:
   - Settings icon/link that navigates to /settings
   - Position it near the sign out button

2. Ensure the link only shows when user is authenticated

3. Use consistent styling with existing header elements

4. Add hover states for the settings link
```

**FILES_MODIFIED:**
- `app/builder/page.tsx`

### Prompt 3.2: Add Settings Link to AuthStatus
```
Update `components/AuthStatus.tsx` to include settings in the dropdown:

1. Add a "Settings" link in the user dropdown menu
2. Position it above the "Sign Out" option
3. Use a gear icon (⚙️ or from your icon library)
4. Link navigates to /settings

Ensure consistent styling with other dropdown items.
```

**FILES_MODIFIED:**
- `components/AuthStatus.tsx`

### Prompt 3.3: End-to-End Testing
```
Test the complete settings flow:

1. Sign in and navigate to /settings
2. Verify email displays correctly (read-only)
3. Change display name and save - verify it persists
4. Verify API key shows masked
5. Click Update - verify ApiKeyModal opens
6. Click Remove - verify confirmation appears
7. Confirm remove - verify key is cleared
8. Add new key - verify it appears masked
9. Test "Back to Builder" link
10. Test Delete Account (use test account!)

Fix any issues found during testing.
```

### Quality Gate 3 (Final)
```markdown
✅ Phase 3 Complete when:
- [ ] Settings accessible from builder header
- [ ] Settings accessible from AuthStatus dropdown
- [ ] All settings functionality works
- [ ] Navigation between pages is smooth
- [ ] Mobile responsive
- [ ] No console errors

Report: "🎉 Key Management Complete!"
```

---

## Rollback Points

| Phase | Rollback Action |
|-------|-----------------|
| Phase 1 | Delete app/settings/ directory |
| Phase 2 | Delete components/settings/ directory |
| Phase 3 | Revert builder/page.tsx and AuthStatus.tsx |

---

## Commit Message Template

```
feat: Add settings page with API key management

Phase 1: Layout
- Create /settings page with auth guard
- Set up section component structure

Phase 2: Components
- ProfileSection with editable display name
- ApiKeysSection with masked display, update, remove
- DangerZone with account deletion

Phase 3: Integration
- Add settings links to builder and AuthStatus
- End-to-end testing and polish
```

---

## Files Summary

**Created:**
- `app/settings/page.tsx`
- `components/settings/ProfileSection.tsx`
- `components/settings/ApiKeysSection.tsx`
- `components/settings/DangerZone.tsx`
- `components/settings/index.ts`

**Modified:**
- `app/builder/page.tsx`
- `components/AuthStatus.tsx`
