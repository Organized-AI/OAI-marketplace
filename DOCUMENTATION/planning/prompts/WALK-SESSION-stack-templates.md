# Walk Session: Stack Templates

> **Branch:** `feature/stack-templates`
> **Total Duration:** 1.5-2 hours (1 Claude Code Web session)
> **Phases:** 4
> **Token Budget:** ~120-150 Claude Code prompts
> **Prerequisites:** Core builder working, Supabase connected

---

## Session Budget Allocation

| Phase | Focus | Token Budget | Time |
|-------|-------|--------------|------|
| Phase 1 | Database Schema | 20% (~25 prompts) | 20 min |
| Phase 2 | API Layer | 25% (~35 prompts) | 25 min |
| Phase 3 | UI Components | 35% (~50 prompts) | 35 min |
| Phase 4 | Integration | 20% (~30 prompts) | 20 min |

---

## Pre-Flight Checklist

```markdown
Before starting, verify:
- [ ] Builder canvas renders and accepts components
- [ ] Supabase connection works (test with existing tables)
- [ ] Component drag-and-drop or add functionality exists
- [ ] No TypeScript errors in builder code
```

---

## Phase 1: Database Schema (25 prompts, 20 min)

### Prompt 1.1: Create Templates Table Migration
```
Create `supabase/migrations/003_stack_templates.sql` with:

1. stack_templates table:
   - id (UUID, primary key, default gen_random_uuid())
   - name (TEXT, not null)
   - description (TEXT)
   - author_id (UUID, references auth.users, nullable for system templates)
   - author_name (TEXT, default 'Organized AI')
   - components (JSONB, not null) - stores component array
   - tags (TEXT array)
   - is_featured (BOOLEAN, default false)
   - is_public (BOOLEAN, default true)
   - use_count (INTEGER, default 0)
   - created_at (TIMESTAMPTZ, default NOW())
   - updated_at (TIMESTAMPTZ, default NOW())

2. Indexes:
   - idx_templates_featured (is_featured WHERE true)
   - idx_templates_public (is_public WHERE true)
   - idx_templates_tags (GIN index on tags)

3. RLS policies:
   - Public templates viewable by all
   - Users can view their own templates
   - Users can create templates (author_id = auth.uid())

4. RPC function increment_template_use(template_id UUID) that increments use_count
```

**FILES_CREATED:**
- `supabase/migrations/003_stack_templates.sql`

### Prompt 1.2: Seed Featured Templates
```
Add seed data to the migration with 3 featured templates:

1. "Full-Stack Next.js" template:
   - Description: "Complete setup for Next.js development with React specialist, testing, and GitHub integration."
   - Components: react-specialist agent, test-writer subagent, github-mcp
   - Tags: ['nextjs', 'react', 'frontend', 'testing']
   - is_featured: true

2. "Python Data Science" template:
   - Description: "Data science workflow with Python specialist, Jupyter integration, and database connectivity."
   - Components: python-specialist agent, supabase-mcp, code-reviewer subagent, test-writer subagent
   - Tags: ['python', 'data-science', 'backend', 'database']
   - is_featured: true

3. "DevOps Pipeline" template:
   - Description: "Complete DevOps setup with infrastructure specialist, CI/CD hooks, and monitoring."
   - Components: devops-specialist agent, github-mcp, pre-commit hook, build command, performance setting
   - Tags: ['devops', 'ci-cd', 'infrastructure', 'automation']
   - is_featured: true

Each component should have: id, type, name, position {x, y}

Run `supabase db push` after creating.
```

**FILES_MODIFIED:**
- `supabase/migrations/003_stack_templates.sql`

### Quality Gate 1
```markdown
✅ Phase 1 Complete when:
- [ ] stack_templates table exists in Supabase
- [ ] 3 featured templates visible in table
- [ ] RLS policies are active
- [ ] Indexes created successfully
- [ ] increment_template_use RPC works

Report: "✅ Phase 1 Complete: Templates database ready"
```

---

## Phase 2: API Layer (35 prompts, 25 min)

### Prompt 2.1: Create Templates GET API
```
Create `app/api/templates/route.ts` with GET handler:

1. Accept query parameters:
   - featured (boolean) - filter to featured only
   - search (string) - search name and description
   - tag (string) - filter by tag

2. Build Supabase query:
   - Select all columns
   - Filter is_public = true
   - Order by use_count descending
   - Apply optional filters

3. For search, use .or() with ilike on name and description

4. For tag filter, use .contains('tags', [tag])

5. Return JSON: { templates: data }

6. Handle errors with 500 status
```

**FILES_CREATED:**
- `app/api/templates/route.ts`

### Prompt 2.2: Add Templates POST for Usage Tracking
```
Add POST handler to `app/api/templates/route.ts`:

1. Accept JSON body: { templateId: string }

2. Call the increment_template_use RPC function:
   supabase.rpc('increment_template_use', { template_id: templateId })

3. Return { success: true }

4. No authentication required (anonymous usage tracking)
```

**FILES_MODIFIED:**
- `app/api/templates/route.ts`

### Prompt 2.3: Create Save Template API
```
Create `app/api/templates/save/route.ts` for user-created templates:

1. Use createRouteHandlerClient with cookies

2. Verify user is authenticated (return 401 if not)

3. Accept JSON body:
   - name (required)
   - description
   - components (required)
   - tags (array)
   - isPublic (boolean)

4. Insert into stack_templates:
   - Set author_id to user.id
   - Set author_name to user.email split before @
   - Set is_featured to false

5. Return { template: insertedData }

6. Handle errors appropriately
```

**FILES_CREATED:**
- `app/api/templates/save/route.ts`

### Quality Gate 2
```markdown
✅ Phase 2 Complete when:
- [ ] GET /api/templates returns 3 featured templates
- [ ] Search filter works (test with "Next")
- [ ] Tag filter works (test with "frontend")
- [ ] POST /api/templates increments use_count
- [ ] POST /api/templates/save creates new template (auth required)

Report: "✅ Phase 2 Complete: Templates API ready"
```

---

## Phase 3: UI Components (50 prompts, 35 min)

### Prompt 3.1: Create Templates Modal
```
Create `components/stack-builder/TemplatesModal.tsx`:

1. Props interface:
   - isOpen: boolean
   - onClose: () => void
   - onSelectTemplate: (components: any[]) => void

2. State:
   - templates: Template[]
   - isLoading: boolean
   - search: string
   - activeTag: string | null

3. Template interface:
   - id, name, description, author_name
   - components: any[]
   - tags: string[]
   - is_featured: boolean
   - use_count: number

4. Fetch templates on open and when search/tag changes

5. Modal layout:
   - Header: "Stack Templates" with close button
   - Search input
   - Tag filter buttons (derived from templates)
   - Content area with grid

6. Separate featured templates from community templates

7. handleSelect function:
   - POST to /api/templates to track usage
   - Call onSelectTemplate with components
   - Call onClose
```

**FILES_CREATED:**
- `components/stack-builder/TemplatesModal.tsx`

### Prompt 3.2: Create Template Card Component
```
Create a TemplateCard component (can be in same file or separate):

1. Props: template: Template, onSelect: (t) => void

2. Card layout:
   - Name with component count badge
   - Description (2 line clamp)
   - Tags (show first 3)
   - Use count in corner
   - Hover border effect

3. onClick calls onSelect with template

4. Responsive: works in 2-column grid on desktop, 1 column mobile

Style with Tailwind, dark mode compatible.
```

**FILES_MODIFIED:**
- `components/stack-builder/TemplatesModal.tsx`

### Prompt 3.3: Create Save Template Modal
```
Create `components/stack-builder/SaveTemplateModal.tsx`:

1. Props:
   - isOpen: boolean
   - onClose: () => void
   - components: any[] (current canvas components)

2. State:
   - name, description, tags (comma-separated string)
   - isPublic: boolean
   - isSaving: boolean

3. Form fields:
   - Name input (required)
   - Description textarea
   - Tags input with hint "comma-separated"
   - Public checkbox with explanation

4. Save handler:
   - Validate name and components exist
   - POST to /api/templates/save
   - Close modal on success

5. Show component count being saved

6. Cancel and Save buttons with loading state
```

**FILES_CREATED:**
- `components/stack-builder/SaveTemplateModal.tsx`

### Quality Gate 3
```markdown
✅ Phase 3 Complete when:
- [ ] TemplatesModal renders with 3 featured templates
- [ ] Search filters templates in real-time
- [ ] Tag buttons filter correctly
- [ ] Clicking template triggers onSelectTemplate
- [ ] SaveTemplateModal form works
- [ ] Both modals have dark mode support

Report: "✅ Phase 3 Complete: Template UI components ready"
```

---

## Phase 4: Integration (30 prompts, 20 min)

### Prompt 4.1: Add Templates Button to Builder
```
Update `app/builder/page.tsx` to integrate templates:

1. Add state:
   - showTemplates: boolean
   - showSaveTemplate: boolean

2. Add to header:
   - "📋 Templates" button that opens TemplatesModal
   - "💾 Save" button that opens SaveTemplateModal (only when canvas has components)

3. Create handleSelectTemplate function:
   - Clear current canvas (if clearCanvas exists in store)
   - Add each component from template to canvas
   - Position components using template positions

4. Pass current canvas components to SaveTemplateModal

5. Import both modals and render with appropriate props
```

**FILES_MODIFIED:**
- `app/builder/page.tsx`

### Prompt 4.2: Add clearCanvas to Store
```
Update `stores/stack-builder-store.ts` (or wherever canvas state lives):

1. Add clearCanvas action that:
   - Sets nodes to empty array
   - Sets edges to empty array
   - Resets any selection state

2. Export the action for use in builder page

If using Zustand, add to the store actions.
If using React state, add the function to context.
```

**FILES_MODIFIED:**
- `stores/stack-builder-store.ts` (or equivalent)

### Prompt 4.3: End-to-End Testing
```
Test the complete templates flow:

1. Open builder with empty canvas
2. Click Templates button - modal opens
3. See 3 featured templates
4. Search for "Python" - filters correctly
5. Click a tag - filters correctly
6. Select a template - components load on canvas
7. Verify component positions match template
8. Add another component manually
9. Click Save Template
10. Fill in name/description, save
11. Open Templates modal again
12. Verify new template appears (may need refresh)

Fix any issues found.
```

### Quality Gate 4 (Final)
```markdown
✅ Phase 4 Complete when:
- [ ] Templates button visible in builder header
- [ ] Clicking template loads components to canvas
- [ ] Component positions are preserved
- [ ] Save Template creates user template
- [ ] User templates appear in community section
- [ ] Use count increments on template select
- [ ] No console errors

Report: "🎉 Stack Templates Complete!"
```

---

## Rollback Points

| Phase | Rollback Action |
|-------|-----------------|
| Phase 1 | `supabase db reset` or drop table |
| Phase 2 | Delete app/api/templates/ directory |
| Phase 3 | Delete components/stack-builder/*Template*.tsx |
| Phase 4 | Revert builder/page.tsx, remove clearCanvas |

---

## Commit Message Template

```
feat: Add stack templates system

Phase 1: Database
- Create stack_templates table with RLS
- Seed 3 featured templates
- Add usage tracking RPC

Phase 2: API
- GET /api/templates with search and filter
- POST for usage tracking
- POST /api/templates/save for user templates

Phase 3: UI
- TemplatesModal with grid and filters
- SaveTemplateModal for saving stacks

Phase 4: Integration
- Templates button in builder header
- Load template to canvas
- Save current stack as template
```

---

## Files Summary

**Created:**
- `supabase/migrations/003_stack_templates.sql`
- `app/api/templates/route.ts`
- `app/api/templates/save/route.ts`
- `components/stack-builder/TemplatesModal.tsx`
- `components/stack-builder/SaveTemplateModal.tsx`

**Modified:**
- `app/builder/page.tsx`
- `stores/stack-builder-store.ts`
