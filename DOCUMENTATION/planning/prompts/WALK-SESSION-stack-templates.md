# Walk Session: Stack Templates

> **Branch:** `feature/stack-templates`
> **Estimated Duration:** 1.5-2 hours
> **Checkpoints:** 5
> **Prerequisites:** Core builder working

## Overview

Add pre-built stack templates that users can one-click load into the builder. Templates showcase best practices and help users get started quickly.

**Current State:** Users start with blank canvas
**End State:** Template gallery with one-click loading

---

## Architecture

```
/builder
├── [Templates] button in header
│   ↓
├── Templates Modal
│   ├── Featured Templates
│   │   ├── Full-Stack Next.js (3 components)
│   │   ├── Python Data Science (4 components)
│   │   └── DevOps Pipeline (5 components)
│   ├── Community Templates
│   └── Search/Filter
│   ↓
└── Click template → Load into canvas
```

---

## Pre-Flight Check

- [ ] Builder canvas works
- [ ] Components can be added to canvas
- [ ] Supabase connected

**Create branch:** `git checkout -b feature/stack-templates`

---

## Checkpoint 1: Database Schema (15 min)

Create `supabase/migrations/003_stack_templates.sql` with stack_templates table and 3 featured templates.

**Report:** "✅ Checkpoint 1: Templates table created with 3 featured templates"

---

## Checkpoint 2: Templates API (20 min)

Create `app/api/templates/route.ts` with search and usage tracking.

**Report:** "✅ Checkpoint 2: Templates API with search and usage tracking"

---

## Checkpoint 3: Templates Modal Component (30 min)

Create `components/stack-builder/TemplatesModal.tsx` with grid view and filters.

**Report:** "✅ Checkpoint 3: Templates modal with search, tags, and grid"

---

## Checkpoint 4: Integrate with Builder (20 min)

Add Templates button to header and integrate template loading with canvas.

**Report:** "✅ Checkpoint 4: Templates integrated with builder"

---

## Checkpoint 5: Save as Template Feature (20 min)

Create `components/stack-builder/SaveTemplateModal.tsx` and `app/api/templates/save/route.ts`.

**Report:** "✅ Checkpoint 5: Save as template feature added"

---

## Final Verification

1. [ ] Click Templates button - modal opens
2. [ ] See 3 featured templates
3. [ ] Search works
4. [ ] Tag filtering works
5. [ ] Click template - loads into canvas
6. [ ] Save current stack as template
7. [ ] New template appears in list

**Final Report:** "🎉 Stack Templates Complete! Users can browse, load, and create templates."

---

## Commit Message

```
feat: Add stack templates system

- Create stack_templates table with featured templates
- Add templates API with search and usage tracking
- Create TemplatesModal with grid view and filters
- Integrate template loading with builder canvas
- Add Save as Template feature for user-created templates
```
