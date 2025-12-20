# OAI Marketplace - Walk Session Prompts Index

> **Repository:** https://github.com/Organized-AI/OAI-marketplace
> **Format:** Phased Planning (Token/Session-Based)
> **Generated:** December 20, 2025

---

## Session Budget Overview

| # | Feature | Branch | Phases | Token Budget | Time |
|---|---------|--------|--------|--------------|------|
| 1 | Supabase Auth | `feature/supabase-auth` | 4 | 150-200 prompts | 2-3h |
| 2 | Key Management | `feature/key-management` | 3 | 100-130 prompts | 1.5-2h |
| 3 | Stack Templates | `feature/stack-templates` | 4 | 120-150 prompts | 1.5-2h |
| 4 | Component Search | `feature/component-search` | 3 | 80-100 prompts | 1-1.5h |
| 5 | Export Claude Code | `feature/export-claude-code` | 4 | 120-150 prompts | 1.5-2h |

**Total:** ~570-730 prompts across 5 sessions (8-11 hours)

---

## Phased Format Structure

Each walk session follows this uniform structure:

```
# Walk Session: [Feature Name]

> Branch, Duration, Phases, Token Budget, Prerequisites

## Session Budget Allocation
- Token budget per phase with percentages

## Pre-Flight Checklist
- Verification items before starting

## Phase N: [Focus Area]

### Prompt N.X: [Task Name]
- Exact prompt to copy/paste
- FILES_CREATED / FILES_MODIFIED

### Quality Gate N
- Checklist before next phase
- Report format

## Rollback Points
- Recovery instructions per phase

## Commit Message Template
- Conventional commit format

## Files Summary
- All created/modified files
```

---

## Parallel Build Tracks

```
Track A (Sequential):
  Supabase Auth (4 phases) → Key Management (3 phases)
  
Track B (Independent):
  Stack Templates (4 phases)
  
Track C (Independent):
  Component Search (3 phases)
  
Track D (Independent):
  Export Claude Code (4 phases)
```

---

## Starter Prompts for Claude Code Web

### 1. Supabase Auth (150-200 prompts)
```
Read DOCUMENTATION/planning/prompts/WALK-SESSION-supabase-auth.md

Execute each phase in order. After each prompt:
1. Implement the code
2. Verify FILES_CREATED/MODIFIED exist
3. Complete Quality Gate checklist
4. Report: "✅ Phase X Complete: [description]"

Create branch: feature/supabase-auth
Start with Phase 1, Prompt 1.1
```

### 2. Key Management (100-130 prompts)
```
Read DOCUMENTATION/planning/prompts/WALK-SESSION-key-management.md

Execute each phase in order. After each prompt:
1. Implement the code
2. Verify FILES_CREATED/MODIFIED exist
3. Complete Quality Gate checklist
4. Report: "✅ Phase X Complete: [description]"

Create branch: feature/key-management
Start with Phase 1, Prompt 1.1
```

### 3. Stack Templates (120-150 prompts)
```
Read DOCUMENTATION/planning/prompts/WALK-SESSION-stack-templates.md

Execute each phase in order. After each prompt:
1. Implement the code
2. Verify FILES_CREATED/MODIFIED exist
3. Complete Quality Gate checklist
4. Report: "✅ Phase X Complete: [description]"

Create branch: feature/stack-templates
Start with Phase 1, Prompt 1.1
```

### 4. Component Search (80-100 prompts)
```
Read DOCUMENTATION/planning/prompts/WALK-SESSION-component-search.md

Execute each phase in order. After each prompt:
1. Implement the code
2. Verify FILES_CREATED/MODIFIED exist
3. Complete Quality Gate checklist
4. Report: "✅ Phase X Complete: [description]"

Create branch: feature/component-search
Start with Phase 1, Prompt 1.1
```

### 5. Export to Claude Code (120-150 prompts)
```
Read DOCUMENTATION/planning/prompts/WALK-SESSION-export-claude-code.md

Execute each phase in order. After each prompt:
1. Implement the code
2. Verify FILES_CREATED/MODIFIED exist
3. Complete Quality Gate checklist
4. Report: "✅ Phase X Complete: [description]"

Create branch: feature/export-claude-code
Start with Phase 1, Prompt 1.1
```

---

## Session Workflow

### 1. Pre-Session (5 min)
- Open walk session prompt file
- Verify pre-flight checklist items
- Create feature branch
- Note token budget for session

### 2. Execute Phases
For each phase:
1. Copy prompt into Claude Code
2. Let Claude implement
3. Verify files created/modified
4. Run quality gate checks
5. Report phase completion
6. Continue to next prompt

### 3. Quality Gates
Before moving to next phase:
- [ ] All checklist items pass
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] Feature works as described

### 4. Rollback If Needed
If a phase fails:
1. Check rollback instructions
2. Execute rollback action
3. Re-attempt phase
4. Ask for clarification if stuck

### 5. Post-Session
- Run full quality gate
- Create PR with commit message template
- Update INDEX with completion status

---

## Troubleshooting

### "Phase failing repeatedly"
1. Check pre-flight requirements
2. Verify previous phase completed
3. Read error messages carefully
4. Use rollback point, try again

### "Token budget exceeded"
1. Note which phase you stopped at
2. Take break (5-hour reset)
3. Resume with: "Continue Phase X, Prompt X.X"

### "Quality gate failing"
1. Re-run specific failing check
2. May need minor fix prompt
3. Don't proceed until gate passes

---

## Status Tracking

| Feature | Phase 1 | Phase 2 | Phase 3 | Phase 4 | Merged |
|---------|---------|---------|---------|---------|--------|
| Supabase Auth | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Key Management | ⬜ | ⬜ | ⬜ | - | ⬜ |
| Stack Templates | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |
| Component Search | ⬜ | ⬜ | ⬜ | - | ⬜ |
| Export Claude Code | ⬜ | ⬜ | ⬜ | ⬜ | ⬜ |

Legend: ⬜ Not Started | 🟡 In Progress | ✅ Complete

---

## Files to Push

```
DOCUMENTATION/planning/prompts/
├── WALK-SESSION-INDEX.md (this file)
├── WALK-SESSION-supabase-auth.md
├── WALK-SESSION-key-management.md
├── WALK-SESSION-stack-templates.md
├── WALK-SESSION-component-search.md
└── WALK-SESSION-export-claude-code.md
```
