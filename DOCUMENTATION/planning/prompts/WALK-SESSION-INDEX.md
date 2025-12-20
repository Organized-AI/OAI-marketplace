# OAI Marketplace - Walk Session Prompts Index

> **Repository:** https://github.com/Organized-AI/OAI-marketplace
> **Generated:** December 20, 2025

## Feature Build Order

| # | Feature | Branch | Duration | Checkpoints | Dependencies |
|---|---------|--------|----------|-------------|--------------|
| 1 | Supabase Auth | `feature/supabase-auth` | 2-3h | 6 | BYOK auth merged |
| 2 | Key Management | `feature/key-management` | 1.5-2h | 4 | Supabase Auth |
| 3 | Stack Templates | `feature/stack-templates` | 1.5-2h | 5 | Core builder |
| 4 | Component Search | `feature/component-search` | 1-1.5h | 4 | Component library |
| 5 | Export Claude Code | `feature/export-claude-code` | 1.5-2h | 5 | Builder canvas |

**Total Estimated:** 8-11 hours across 5 sessions

---

## Starter Prompts for Claude Code Web

Copy these into Claude Code Web to start each session.

### 1. Supabase Auth

```
Read DOCUMENTATION/planning/prompts/WALK-SESSION-supabase-auth.md and execute it.

Create a new branch: feature/supabase-auth

Report progress at each checkpoint so I can monitor from my phone.
Format: "✅ Checkpoint X: [status]"
```

### 2. Key Management

```
Read DOCUMENTATION/planning/prompts/WALK-SESSION-key-management.md and execute it.

Create a new branch: feature/key-management

Report progress at each checkpoint so I can monitor from my phone.
Format: "✅ Checkpoint X: [status]"
```

### 3. Stack Templates

```
Read DOCUMENTATION/planning/prompts/WALK-SESSION-stack-templates.md and execute it.

Create a new branch: feature/stack-templates

Report progress at each checkpoint so I can monitor from my phone.
Format: "✅ Checkpoint X: [status]"
```

### 4. Component Search

```
Read DOCUMENTATION/planning/prompts/WALK-SESSION-component-search.md and execute it.

Create a new branch: feature/component-search

Report progress at each checkpoint so I can monitor from my phone.
Format: "✅ Checkpoint X: [status]"
```

### 5. Export to Claude Code

```
Read DOCUMENTATION/planning/prompts/WALK-SESSION-export-claude-code.md and execute it.

Create a new branch: feature/export-claude-code

Report progress at each checkpoint so I can monitor from my phone.
Format: "✅ Checkpoint X: [status]"
```

---

## Parallel Builds

These features can be built in parallel (no dependencies on each other):

**Track A:** Supabase Auth → Key Management (sequential)
**Track B:** Stack Templates (independent)
**Track C:** Component Search (independent)
**Track D:** Export Claude Code (independent)

---

## Session Workflow

1. **Prep (Desktop)**
   - Push prompt files to GitHub
   - Set up environment variables
   - Open Claude Code Web

2. **Start (Desktop or Mobile)**
   - Paste starter prompt
   - Claude creates branch and begins

3. **Monitor (Mobile)**
   - Watch for checkpoint reports
   - Answer any clarifying questions
   - Approve PRs when ready

4. **Review (Desktop)**
   - Pull changes locally
   - Test functionality
   - Merge or iterate
