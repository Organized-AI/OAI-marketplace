# Walk Session: Component Search

> **Branch:** `feature/component-search`
> **Total Duration:** 1-1.5 hours (1 Claude Code Web session)
> **Phases:** 3
> **Token Budget:** ~80-100 Claude Code prompts
> **Prerequisites:** Components table with data, builder canvas working

---

## Session Budget Allocation

| Phase | Focus | Token Budget | Time |
|-------|-------|--------------|------|
| Phase 1 | Database Enhancement | 25% (~22 prompts) | 20 min |
| Phase 2 | API Enhancement | 30% (~27 prompts) | 25 min |
| Phase 3 | UI & Integration | 45% (~40 prompts) | 35 min |

---

## Pre-Flight Checklist

```markdown
Before starting, verify:
- [ ] components table exists with sample data
- [ ] Builder canvas can add components
- [ ] Supabase connection works
- [ ] Current component list/sidebar exists (will be replaced)
```

---

## Phase 1: Database Enhancement (22 prompts, 20 min)

### Prompt 1.1: Add Search Columns and Indexes
```
Create `supabase/migrations/004_component_search.sql` with:

1. Add new columns to components table:
   - search_vector (tsvector) for full-text search
   - category (TEXT) for component categorization
   - icon (TEXT) for display emoji/icon

2. Update existing data:
   - Set category = type where category is null
   - Set icon based on type:
     - agent → '🤖'
     - mcp → '🔌'
     - hook → '🪝'
     - command → '⚡'
     - setting → '⚙️'
     - default → '📦'

3. Create search_vector from name, description, and tags:
   - Name gets weight 'A' (highest)
   - Description gets weight 'B'
   - Tags get weight 'C'

4. Create trigger function update_components_search_vector() that:
   - Builds the weighted tsvector on INSERT or UPDATE
   - Assigns to NEW.search_vector

5. Create trigger on components table for search vector updates

6. Create indexes:
   - GIN index on search_vector
   - B-tree index on category
   - GIN index on tags
```

**FILES_CREATED:**
- `supabase/migrations/004_component_search.sql`

### Prompt 1.2: Run and Verify Migration
```
Run the migration and verify:

1. Execute: supabase db push

2. Check in Supabase dashboard:
   - search_vector column populated
   - category column has values
   - icon column has emojis
   - All indexes created

3. Test a simple search query:
   SELECT * FROM components 
   WHERE search_vector @@ to_tsquery('english', 'react');

Fix any issues before proceeding.
```

### Quality Gate 1
```markdown
✅ Phase 1 Complete when:
- [ ] search_vector column exists and populated
- [ ] category column has correct values
- [ ] icon column has emojis
- [ ] GIN index on search_vector exists
- [ ] Test search query returns results

Report: "✅ Phase 1 Complete: Search indexes ready"
```

---

## Phase 2: API Enhancement (27 prompts, 25 min)

### Prompt 2.1: Enhance Components API with Search
```
Update `app/api/components/route.ts` with advanced search:

1. Accept query parameters:
   - search (string, min 2 chars for search)
   - category (string, 'all' or specific category)
   - tag (can appear multiple times for multi-tag filter)
   - limit (number, default 50)

2. Build query:
   - Start with select('*')
   - Filter is_active = true
   - Order by name

3. If search provided (2+ chars):
   - Use textSearch on search_vector
   - Config: 'websearch' type, 'english' config

4. If category provided and not 'all':
   - Filter by category equals

5. If tags provided:
   - Use contains to require all tags (AND logic)

6. Apply limit

Return structure:
{
  components: [...],
  meta: {
    total: number,
    tags: string[] (unique tags from all components),
    categories: { agent: 5, mcp: 3, ... } (count per category)
  }
}
```

**FILES_MODIFIED:**
- `app/api/components/route.ts`

### Prompt 2.2: Add Meta Data Queries
```
Enhance the API to return metadata for filters:

1. After main query, run separate queries for meta:

2. Get unique tags:
   - Select tags from all active components
   - Flatten and deduplicate
   - Sort alphabetically

3. Get category counts:
   - Select category from active components
   - Reduce to count per category

4. Include in response meta object

5. Handle empty results gracefully

This metadata powers the filter UI.
```

**FILES_MODIFIED:**
- `app/api/components/route.ts`

### Prompt 2.3: Test API Endpoints
```
Test the enhanced API:

1. GET /api/components - returns all with meta
2. GET /api/components?search=react - returns matching
3. GET /api/components?category=agent - filters by type
4. GET /api/components?tag=frontend - filters by tag
5. GET /api/components?tag=frontend&tag=testing - multi-tag
6. GET /api/components?search=py&category=agent - combined

Verify meta.tags and meta.categories are correct.
Fix any issues.
```

### Quality Gate 2
```markdown
✅ Phase 2 Complete when:
- [ ] Search returns relevant results
- [ ] Category filter works
- [ ] Tag filter works (AND logic)
- [ ] Combined filters work
- [ ] Meta includes tags array
- [ ] Meta includes category counts

Report: "✅ Phase 2 Complete: Search API ready"
```

---

## Phase 3: UI & Integration (40 prompts, 35 min)

### Prompt 3.1: Create useDebounce Hook
```
Create `hooks/useDebounce.ts`:

1. Generic hook: useDebounce<T>(value: T, delay: number): T

2. Uses useState to store debounced value

3. useEffect that:
   - Sets timeout to update debounced value
   - Clears timeout on value change or unmount

4. Returns debounced value

5. Export the hook

This prevents API spam during typing.
```

**FILES_CREATED:**
- `hooks/useDebounce.ts`

### Prompt 3.2: Create Component Browser
```
Create `components/stack-builder/ComponentBrowser.tsx`:

1. Props: onAddComponent: (component: Component) => void

2. State:
   - components: Component[]
   - isLoading: boolean
   - search: string
   - activeCategory: string (default 'all')
   - selectedTags: string[]
   - availableTags: string[]
   - categoryCounts: Record<string, number>

3. Use useDebounce on search with 300ms delay

4. CATEGORIES constant:
   [
     { id: 'all', label: 'All', icon: '📦' },
     { id: 'agent', label: 'Agents', icon: '🤖' },
     { id: 'mcp', label: 'MCPs', icon: '🔌' },
     { id: 'hook', label: 'Hooks', icon: '🪝' },
     { id: 'command', label: 'Commands', icon: '⚡' },
     { id: 'setting', label: 'Settings', icon: '⚙️' }
   ]

5. fetchComponents function:
   - Build URL with search, category, tags
   - Fetch from /api/components
   - Update state with results and meta

6. useEffect to fetch on debounced search, category, or tags change

7. Helper functions:
   - toggleTag(tag) - add/remove from selectedTags
   - clearFilters() - reset all filters
   - hasFilters - computed boolean
```

**FILES_CREATED:**
- `components/stack-builder/ComponentBrowser.tsx`

### Prompt 3.3: Build Component Browser UI
```
Complete the ComponentBrowser UI:

1. Container: w-72 border-r, flex flex-col, full height

2. Search section:
   - Search icon (🔍) on left
   - Input with placeholder "Search components..."
   - Clear button (✕) when search has value

3. Category tabs:
   - Horizontal scroll container
   - Button for each category
   - Active state: blue background
   - Show count from categoryCounts

4. Tag filters (if tags exist):
   - Flex wrap container
   - Pill buttons for first 10 tags
   - Active state: blue tint
   - "Clear filters" link when hasFilters

5. Component list:
   - Scrollable flex-1 container
   - Loading state
   - Empty state "No components found"
   - Map components to ComponentCard
```

**FILES_MODIFIED:**
- `components/stack-builder/ComponentBrowser.tsx`

### Prompt 3.4: Create Component Card
```
Add ComponentCard to ComponentBrowser (or separate file):

1. Props: component: Component, onAdd: () => void

2. Card layout:
   - Border, rounded, padding
   - Hover: blue border, cursor pointer
   - Click: calls onAdd

3. Content:
   - Left: icon (from component.icon)
   - Center: name (font-medium), description (text-xs, 2 lines)
   - Right: + icon on hover (opacity transition)

4. Tags row:
   - Show first 2 tags as small pills
   - Gray background

5. Dark mode compatible

6. onClick calls onAdd
```

**FILES_MODIFIED:**
- `components/stack-builder/ComponentBrowser.tsx`

### Prompt 3.5: Add Keyboard Shortcut
```
Add Cmd+K keyboard shortcut to focus search:

1. In ComponentBrowser, add useEffect for keydown listener

2. Check for (metaKey || ctrlKey) && key === 'k'

3. Prevent default browser behavior

4. Focus the search input:
   - Use ref on input, or
   - Query selector for placeholder text

5. Clean up listener on unmount

6. Consider adding visual hint "⌘K" near search
```

**FILES_MODIFIED:**
- `components/stack-builder/ComponentBrowser.tsx`

### Prompt 3.6: Integrate with Builder
```
Update builder layout to use ComponentBrowser:

1. In `app/builder/page.tsx`:
   - Import ComponentBrowser
   - Replace existing component sidebar/list

2. Layout structure:
   <div className="flex h-screen">
     <ComponentBrowser onAddComponent={handleAddComponent} />
     <div className="flex-1">
       <StackBuilderCanvas ... />
     </div>
   </div>

3. Ensure handleAddComponent works:
   - Adds component to canvas
   - Positions at reasonable location

4. Remove old component list code if present
```

**FILES_MODIFIED:**
- `app/builder/page.tsx`

### Prompt 3.7: End-to-End Testing
```
Test the complete search flow:

1. Open builder - see ComponentBrowser sidebar
2. Type in search - results filter (debounced)
3. Press Cmd+K - search focuses
4. Click category tab - filters correctly
5. Click multiple tags - AND filter works
6. Click "Clear filters" - resets
7. Click component - adds to canvas
8. Verify responsive on mobile

Fix any issues found.
```

### Quality Gate 3 (Final)
```markdown
✅ Phase 3 Complete when:
- [ ] ComponentBrowser renders in sidebar
- [ ] Search filters with debounce
- [ ] Category tabs filter correctly
- [ ] Tags filter with AND logic
- [ ] Clear filters works
- [ ] Cmd+K focuses search
- [ ] Click adds component to canvas
- [ ] Dark mode works
- [ ] No console errors

Report: "🎉 Component Search Complete!"
```

---

## Rollback Points

| Phase | Rollback Action |
|-------|-----------------|
| Phase 1 | Remove migration, drop columns |
| Phase 2 | Revert app/api/components/route.ts |
| Phase 3 | Delete ComponentBrowser, revert builder |

---

## Commit Message Template

```
feat: Add advanced component search and filtering

Phase 1: Database
- Add search_vector column with tsvector
- Add category and icon columns
- Create GIN index for full-text search

Phase 2: API
- Enhance /api/components with text search
- Add category and tag filters
- Return metadata for filter UI

Phase 3: UI
- Create ComponentBrowser with search
- Add category tabs and tag filters
- Add Cmd+K keyboard shortcut
- Integrate with builder layout
```

---

## Files Summary

**Created:**
- `supabase/migrations/004_component_search.sql`
- `hooks/useDebounce.ts`
- `components/stack-builder/ComponentBrowser.tsx`

**Modified:**
- `app/api/components/route.ts`
- `app/builder/page.tsx`
