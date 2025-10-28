# AI Assistance Tracking

This directory contains token usage tracking and AI assistance optimization tools for your project.

## 📊 Files

### `token-tracker.json`
Main configuration for token budgets, pricing, and usage tracking.

**Weekly Budgets:**
- Opus: 500,000 tokens (~$7.50/week at capacity)
- Sonnet: 2,000,000 tokens (~$6/week at capacity)
- Haiku: 5,000,000 tokens (~$1.25/week at capacity)

### `reports/sessions/`
Individual session summaries with token usage, operations, and efficiency metrics.

### `reports/weekly/`
Weekly analytics reports showing budget performance, efficiency trends, and optimization opportunities.

### `patterns/`
Machine learning patterns database for improving token estimation accuracy over time.

## 🚀 Quick Start

### View Current Budget Status
```bash
# Simple check (manual)
cat .ai/token-tracker.json | grep -A 3 "weekly_budgets"

# Automated tracking (after hooks setup)
node scripts/token-report.js
```

### Model Selection Guide

**Use Opus 4 when:**
- Making architectural decisions affecting the entire system
- Conducting security audits or reviewing sensitive code
- Solving complex technical problems with multiple constraints
- Planning major features or system redesigns

**Use Sonnet 4.5 when:**
- Implementing features and components (80% of development work)
- Writing API endpoints and business logic
- Creating UI components and frontend code
- Writing comprehensive tests
- Refactoring existing code

**Use Haiku 3.5 when:**
- Writing documentation and comments
- Simple code formatting and style fixes
- Generating boilerplate code
- Basic data transformations
- Answering simple technical questions

## 💡 Best Practices

### 1. Plan Before You Code
Start planning sessions with **Sonnet** to draft architecture, then review with **Opus** for critical validation. This preserves your Opus budget for implementation!

**Example Planning Flow:**
```
1. Initial architecture with Sonnet: 15-20k tokens
2. Draft technical spec with Sonnet: 10-15k tokens
3. Final review with Opus: 5-10k tokens
4. Total planning cost: ~35-45k tokens (saves Opus for later!)
```

### 2. Reserve Opus for High-Value Decisions
Don't use Opus for:
- ❌ Simple documentation
- ❌ Routine refactoring
- ❌ Boilerplate generation
- ❌ Basic questions

Do use Opus for:
- ✅ Critical architecture decisions
- ✅ Security-sensitive code reviews
- ✅ Complex algorithm design
- ✅ Major system redesigns

### 3. Track and Learn
Review your weekly reports to understand:
- Which tasks consume most tokens
- Where you can optimize
- When to switch models
- Patterns that improve estimation

## 📈 Expected Costs

**Typical 12-week project:**
- Planning: 150,000 tokens (~$1.50)
- Implementation: 680,000 tokens (~$2-3)
- Testing & Polish: 170,000 tokens (~$1)
- **Total: ~$5-6 for entire project**

## 🔔 Alert Thresholds

The system alerts at:
- **75%** (Warning): Review remaining tasks, consider lighter models
- **90%** (Critical): Immediate review required, switch models
- **95%** (Emergency): Stop and reassess, cannot continue without approval

## 📚 Additional Resources

- [PLANNING/01-project-brief.md](../PLANNING/01-project-brief.md#L98-L138) - AI Assistance Budget section
- [PLANNING/05-implementation-roadmap.md](../PLANNING/05-implementation-roadmap.md#L12-L78) - Token budget by phase
- [PLANNING/07-token-tracking-implementation.md](../PLANNING/07-token-tracking-implementation.md) - Full implementation guide

## 🔧 Setup (Optional Advanced Tracking)

For real-time notifications and automated tracking:

1. Copy monitoring script:
```bash
cp PLANNING/07-token-tracking-implementation.md .ai/IMPLEMENTATION_GUIDE.md
```

2. Follow implementation guide for hooks setup

3. Enable desktop notifications for budget alerts

---

**Pro tip:** The best way to stay on budget is to use the right model for each task. When in doubt, start with Sonnet and escalate to Opus only when needed!