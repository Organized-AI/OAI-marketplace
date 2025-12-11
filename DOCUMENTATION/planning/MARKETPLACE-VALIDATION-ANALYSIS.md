# Marketplace Validation Analysis

**Date:** December 11, 2025  
**Project:** Organized AI Marketplace

## Current State Assessment

### ✅ What EXISTS

| Component | Status | Notes |
|-----------|--------|-------|
| Next.js Frontend | ✅ Working | React Flow stack builder UI |
| Stack Builder Canvas | ✅ Working | Visual component arrangement |
| StackAnalyzer Service | ⚠️ Heuristic Only | No real AI - just pattern matching |
| AI Analysis Modal | ⚠️ Fake | Uses setTimeout(800ms) to simulate "AI" |
| Component Data | ⚠️ Mock | Static JSON, not from database |
| @anthropic-ai/sdk | ✅ Installed | v0.30.1 in package.json |
| Supabase SDK | ✅ Installed | v2.77.0 in package.json |

### ❌ What's MISSING

| Component | Priority | Notes |
|-----------|----------|-------|
| Real AI Validation | HIGH | Current "AI Analysis" is fake |
| Backend API Routes | HIGH | No /api/validate-stack endpoint |
| Supabase Tables | HIGH | No component registry in database |
| Credential Storage | HIGH | Can't store user API keys |
| Usage Tracking | MEDIUM | Can't limit free tier validations |
| Phase 0 System | MEDIUM | Dependency detection not built |

## Claude Agent SDK - When to Use

**NOT in MVP.** The Agent SDK is for Pro tier (Phase D):

| Use Case | Tier | Method |
|----------|------|--------|
| Basic stack analysis | Free | Direct Anthropic API |
| Detailed validation | BYOK | Direct Anthropic API (user key) |
| Repository validation | Pro | Claude Agent SDK |
| Automated testing | Pro | Claude Agent SDK |

The Agent SDK requires:
- Server-side Python or Node.js execution
- User's API key stored in Organized Credentials
- ~60-100MB CLI bundle

## Validation Tier Architecture

```
FREE TIER (3 validations/day)
├── Anthropic API (platform key, rate limited)
├── Basic stack analysis
├── Complexity estimation
└── Component compatibility check

BYOK TIER (Unlimited)
├── User provides ANTHROPIC_API_KEY
├── Stored in Organized Credentials (encrypted)
├── All FREE tier features
├── Detailed dependency analysis
└── Cost estimation per stack

PRO TIER (Future - Agent SDK)
├── Full Claude Agent SDK integration
├── Repository validation (clone & analyze)
├── Automated testing of components
└── Multi-step agentic workflows
```

## Build Order for MVP

1. Phase A: Marketplace MVP (API routes, real AI, Supabase)
2. Phase B: Organized Credentials (encryption, SDK, CLI)
3. Phase C: Phase 0 + Stack Builder (detection, installer)
4. Phase D: Advanced Features (Agent SDK, dashboard)
