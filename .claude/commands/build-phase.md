---
name: build-phase
description: Execute a build phase from the prompts directory
---

# /build-phase [phase-name]

Execute a specific build phase.

## Usage
```
/build-phase marketplace-phase-a
/build-phase credentials-phase-1
```

## Behavior
1. Read the specified phase file from `DOCUMENTATION/planning/prompts/`
2. Execute all tasks in order
3. Verify each task before proceeding
4. Report completion status

## Available Phases
- `marketplace-phase-a` - Real AI validation (START HERE)
- `credentials-phase-0` - Monorepo setup
- `credentials-phase-1` - Database schema
- `credentials-phase-2` - SDK + encryption
- `phase0-all-phases` - Dependency detection
- `stack-builder-all-phases` - CLI installer
