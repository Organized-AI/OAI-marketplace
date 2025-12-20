# Walk Session: Component Search

> **Branch:** `feature/component-search`
> **Estimated Duration:** 1-1.5 hours
> **Checkpoints:** 4
> **Prerequisites:** Component library in Supabase

## Overview

Enhance the component library with advanced search, filtering, and categorization. Make it easy to find the right agent, MCP, hook, command, or setting.

**Current State:** Basic component list
**End State:** Searchable, filterable component browser with categories

---

## Architecture

```
Component Sidebar
├── Search Bar (instant filter)
├── Category Tabs
│   ├── All (default)
│   ├── Agents
│   ├── MCPs
│   ├── Hooks
│   ├── Commands
│   └── Settings
├── Tag Filters (multi-select)
│   ├── frontend, backend, testing
│   ├── database, api, devops
│   └── ...
└── Component Cards
    ├── Icon + Name
    ├── Description (truncated)
    ├── Tags
    └── [Add to Canvas]
```

---

## Pre-Flight Check

- [ ] Components table has data
- [ ] Builder canvas can receive new components

**Create branch:** `git checkout -b feature/component-search`

---

## Checkpoint 1: Enhance Components Schema (15 min)

Create `supabase/migrations/004_component_search.sql` with search_vector, category, icon columns and full-text search indexes.

**Report:** "✅ Checkpoint 1: Search indexes and vectors created"

---

## Checkpoint 2: Enhanced Components API (20 min)

Update `app/api/components/route.ts` with full-text search, category filter, and tag filtering.

**Report:** "✅ Checkpoint 2: Search API with full-text search and filters"

---

## Checkpoint 3: Component Browser UI (30 min)

Create `components/stack-builder/ComponentBrowser.tsx` with search, category tabs, tag filters, and component cards. Also create `hooks/useDebounce.ts`.

**Report:** "✅ Checkpoint 3: Component browser with search, categories, and tags"

---

## Checkpoint 4: Integration & Polish (15 min)

Update builder layout to use ComponentBrowser and add Cmd+K keyboard shortcut.

**Report:** "✅ Checkpoint 4: Integration complete with keyboard shortcuts"

---

## Final Verification

1. [ ] Search returns relevant results instantly
2. [ ] Category tabs filter correctly
3. [ ] Tag filters work (AND logic)
4. [ ] Clear filters resets everything
5. [ ] Click component adds to canvas
6. [ ] Cmd+K focuses search

**Final Report:** "🎉 Component Search Complete! Fast, filterable component discovery."

---

## Commit Message

```
feat: Add advanced component search and filtering

- Add full-text search with PostgreSQL tsvector
- Create ComponentBrowser with category tabs
- Add tag-based filtering with multi-select
- Add keyboard shortcut (Cmd+K) for search focus
- Integrate with builder layout
```
