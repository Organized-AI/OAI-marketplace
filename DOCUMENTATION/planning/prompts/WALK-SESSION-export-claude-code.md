# Walk Session: Export to Claude Code

> **Branch:** `feature/export-claude-code`
> **Estimated Duration:** 1.5-2 hours
> **Checkpoints:** 5
> **Prerequisites:** Builder canvas with components working

## Overview

Generate installable `.claude/` directory configurations from stacks built in the UI. Users can download a zip or copy commands to set up Claude Code with their selected agents, MCPs, hooks, commands, and settings.

**Current State:** Build stacks visually but no export
**End State:** Download ready-to-use `.claude/` configs or copy install commands

---

## Architecture

```
Stack Canvas
│
├── [Export] button
│   ↓
├── Export Modal
│   ├── Preview generated files
│   │   ├── CLAUDE.md
│   │   ├── settings.json
│   │   └── commands/*.md
│   ├── Download ZIP
│   ├── Copy Install Command
│   └── View Documentation
│   ↓
└── User gets working Claude Code setup
```

---

## Export Format

```
.claude/
├── CLAUDE.md           # Project context with agents
├── settings.json       # Claude Code settings
└── commands/
    ├── build.md        # Custom commands
    └── test.md
```

---

## Pre-Flight Check

- [ ] Builder has components on canvas
- [ ] Components have proper metadata (config, prompts)

**Create branch:** `git checkout -b feature/export-claude-code`

---

## Checkpoint 1: Export Generator Service (25 min)

Create `lib/export-generator.ts` with functions to generate CLAUDE.md, settings.json, command files, and ZIP.

**Report:** "✅ Checkpoint 1: Export generator with CLAUDE.md, settings, and commands"

---

## Checkpoint 2: Export API Endpoint (15 min)

Create `app/api/export/route.ts` with JSON preview and ZIP download support.

**Report:** "✅ Checkpoint 2: Export API with JSON preview and ZIP download"

---

## Checkpoint 3: Export Modal Component (30 min)

Create `components/stack-builder/ExportModal.tsx` with file tree, content preview, copy buttons, and download ZIP.

**Report:** "✅ Checkpoint 3: Export modal with file preview and download"

---

## Checkpoint 4: Quick Copy Commands (20 min)

Create `lib/generate-install-script.ts` and add quick setup section to ExportModal.

**Report:** "✅ Checkpoint 4: Install script and quick copy options"

---

## Checkpoint 5: Integration with Builder (15 min)

Add Export button to builder header with project name input. Install jszip dependency.

**Report:** "✅ Checkpoint 5: Export integrated with builder"

---

## Final Verification

1. [ ] Add components to canvas
2. [ ] Click Export - modal opens
3. [ ] Preview shows CLAUDE.md, settings.json, commands
4. [ ] File content is correct
5. [ ] Download ZIP works
6. [ ] Copy all works
7. [ ] MCP install commands shown if applicable

**Final Report:** "🎉 Export to Claude Code Complete! Users can download ready-to-use configs."

---

## Commit Message

```
feat: Add export to Claude Code functionality

- Create export generator for CLAUDE.md, settings.json, commands
- Add /api/export endpoint with ZIP and JSON support
- Build ExportModal with file preview and copy options
- Generate MCP install commands automatically
- Integrate export button with builder header
```
