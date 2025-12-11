# Organized AI Marketplace - Master Build Plan

**Created:** December 11, 2025  
**Target:** Claude Code Implementation  
**Total Estimated Time:** 4-6 weeks

---

## Project Overview

The Organized AI Marketplace is a comprehensive ecosystem for installing, managing, and running AI development components. It consists of four major subsystems:

1. **Organized Credentials** - Cross-platform credential vault with Supabase backend
2. **Phase 0 Dependency Resolution** - Intelligent dependency detection and resolution
3. **Stack Builder & Installer** - One-click component installation system
4. **Skills & Subagent Framework** - Component architecture for skills, agents, MCPs

---

## Build Order & Dependencies

```
┌─────────────────────────────────────────────────────────────────┐
│                    BUILD DEPENDENCY GRAPH                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  WEEK 1-2: FOUNDATIONS                                         │
│  ┌──────────────────┐    ┌──────────────────┐                  │
│  │ Organized        │    │ Core CLI         │                  │
│  │ Credentials      │    │ Framework        │                  │
│  │ (Supabase)       │    │ (Commander)      │                  │
│  └────────┬─────────┘    └────────┬─────────┘                  │
│           │                       │                             │
│           └───────────┬───────────┘                             │
│                       ▼                                         │
│  WEEK 2-3: INTELLIGENCE                                        │
│  ┌──────────────────────────────────────────┐                  │
│  │ Phase 0 Dependency Resolution             │                  │
│  │ (Detection + Credential Integration)      │                  │
│  └────────────────────┬─────────────────────┘                  │
│                       ▼                                         │
│  WEEK 3-4: INSTALLATION                                        │
│  ┌──────────────────────────────────────────┐                  │
│  │ Stack Builder + Complete Install Flow     │                  │
│  │ (Visual UI + One-Click Experience)        │                  │
│  └────────────────────┬─────────────────────┘                  │
│                       ▼                                         │
│  WEEK 4-5: MARKETPLACE                                         │
│  ┌──────────────────────────────────────────┐                  │
│  │ Web Marketplace + Component Registry      │                  │
│  │ (Next.js + Supabase)                      │                  │
│  └────────────────────┬─────────────────────┘                  │
│                       ▼                                         │
│  WEEK 5-6: POLISH                                              │
│  ┌──────────────────────────────────────────┐                  │
│  │ Documentation + Testing + Launch          │                  │
│  └──────────────────────────────────────────┘                  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## Monorepo Structure

```
organized-ai-marketplace/
├── apps/
│   ├── marketplace/          # Next.js web marketplace
│   ├── credentials-dashboard/ # Credentials web UI
│   └── docs/                  # Documentation site
├── packages/
│   ├── credentials/          # @organized-ai/credentials SDK
│   ├── phase-0/              # Dependency detection/resolution
│   ├── stack-builder/        # Installation engine
│   ├── cli/                  # Main CLI tool
│   └── shared/               # Shared types, utils
├── supabase/
│   ├── migrations/           # Database migrations
│   └── functions/            # Edge functions
├── DOCUMENTATION/
│   └── planning/             # Architecture docs + prompts
└── .claude/                  # Claude Code config
```

---

## Phase Prompts Location

All Claude Code prompts are in:
```
DOCUMENTATION/planning/prompts/
├── 00-INDEX.md                    # This file - navigation
├── credentials-phase-0.md         # Project setup
├── credentials-phase-1.md         # Database schema
├── credentials-phase-2.md         # SDK + CLI
├── phase0-all-phases.md           # Dependency detection
└── stack-builder-all-phases.md    # Visual installer
```

## Quick Start

```bash
# Start with credentials foundation
cd organized-ai-marketplace
claude --prompt-file DOCUMENTATION/planning/prompts/credentials-phase-0.md
```

---

## Success Metrics

| Metric | Target |
|--------|--------|
| Install time (10 component stack) | < 8 minutes |
| Credential validation coverage | > 95% of common services |
| First-time user success rate | > 90% |
| CLI command coverage | All planned features |
