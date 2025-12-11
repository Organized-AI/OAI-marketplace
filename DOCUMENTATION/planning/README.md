# Organized AI Marketplace - Documentation

**Last Updated:** December 11, 2025

## Architecture Documents

| Document | Description |
|----------|-------------|
| [skills-architecture.md](./skills-architecture.md) | Skills packaging system, CLI tool design, distribution methods |
| [subagent-framework.md](./subagent-framework.md) | Sub-agent lifecycle, orchestration, multi-agent collaboration |
| [phase-0-dependency-resolution.md](./phase-0-dependency-resolution.md) | Pre-install verification, dependency detection, conflict resolution |
| [organized-credentials.md](./organized-credentials.md) | Supabase-based credential vault, validation engine, SDK |
| [complete-stack-install-flow.md](./complete-stack-install-flow.md) | End-to-end UX flow from browse → verify → install |
| [implementation-handoff.md](./implementation-handoff.md) | Claude Code handoff document with tasks |

## Product Ecosystem

```
🛒 Marketplace (FREE)
   └── Browse 530+ components, build stacks, one-click install
            │
            ▼
🔐 Organized Credentials (FREE → $5/mo)
   └── Secure vault, validation, cross-device sync
            │
            ▼
💼 Organized Codebase ($29/mo)
   └── Templates, sub-agents, orchestration, private skills
```

## Key Features

### One-Click Stack Install
1. Browse marketplace
2. Add components to stack
3. Click "Verify Stack" → Phase 0 checks everything
4. Click "Install" → Components + credentials + .env in 30 seconds

### Organized Credentials Integration
- Auto-detects missing credentials during verification
- Opens browser to exact API key page
- Validates before storing
- Generates .env automatically

### Component Types
- **Agents** - AI personas with domain expertise
- **Commands** - Slash commands for quick actions
- **Settings** - Configuration presets
- **Hooks** - Event-triggered automation
- **MCPs** - External service integrations
- **Skills** - Complex capability packages

## Implementation Priority

1. Phase 0 verification endpoint
2. Organized Credentials Supabase backend
3. CLI tool (`npx organized-ai`)
4. Marketplace UI updates
5. Full integration testing

---

For Claude Code: Start with `implementation-handoff.md`
