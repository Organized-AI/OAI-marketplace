# Skill Stack Analyzer - Quick Reference

> 🚀 Fast reference for designing and analyzing agent workflows

## The 3 Layers (Remember This!)

```
SKILLS → What CAN be done (capabilities)
AGENTS → WHO coordinates (orchestrators)
SUB-AGENTS → WHO does the work (executors)
```

## Quick Commands

### Design a New Stack
```
"Design a skill stack for [your use case]"
```

### Analyze Existing Stack
```
"Analyze this workflow: [Agent → sub-agent → sub-agent]"
```

### Find Skill Gaps
```
"What skills do I need for [task]?"
```

### Optimize Performance
```
"Optimize this stack for [speed/cost/quality]"
```

## Common Stack Patterns

### 🔹 Sequential (One After Another)
```
Agent → sub-agent-1 → sub-agent-2 → sub-agent-3
```
**Use When**: Tasks depend on each other

### 🔹 Parallel (All at Once)
```
Agent → [sub-agent-1, sub-agent-2, sub-agent-3]
```
**Use When**: Tasks are independent

### 🔹 Hierarchical (Nested)
```
Agent → sub-agent-1
         ├── sub-sub-agent-1
         └── sub-sub-agent-2
```
**Use When**: Complex multi-level coordination needed

### 🔹 Conditional (Adaptive)
```
Agent → if (condition) → sub-agent-A
        else → sub-agent-B
```
**Use When**: Different paths based on context

## Model Selection Cheat Sheet

| Model | Cost | Speed | Use For |
|-------|------|-------|---------|
| **Haiku** | $ | ⚡⚡⚡ | Simple tasks, validation, formatting |
| **Sonnet** | $$ | ⚡⚡ | Complex analysis, code review, design |
| **Opus** | $$$ | ⚡ | Critical decisions, architecture, research |

## Token Budgets by Complexity

| Stack Type | Tokens | Duration | Cost |
|-----------|--------|----------|------|
| Simple | 2K-5K | < 1 min | $0.01 |
| Standard | 8K-15K | 2-5 min | $0.03 |
| Complex | 20K-40K | 5-15 min | $0.12 |
| Enterprise | 50K-100K | 15-30 min | $0.45 |

## Skill Categories Quick List

### Development
- `frontend-development` - React, Vue, UI
- `backend-development` - APIs, databases
- `fullstack-development` - End-to-end
- `mobile-development` - iOS, Android, React Native

### Quality & Security
- `code-review` - Best practices, quality
- `security-auditing` - Vulnerabilities, compliance
- `testing` - Unit, integration, E2E
- `performance-optimization` - Speed, efficiency

### Data & AI
- `data-analysis` - Statistical analysis
- `machine-learning` - Model training
- `nlp` - Natural language processing
- `data-engineering` - ETL, pipelines

### Business & Content
- `content-writing` - Blog posts, documentation
- `seo-optimization` - Search engine optimization
- `market-research` - Competitive analysis
- `project-management` - Planning, tracking

## Common Sub-Agents

### Code Quality
- `code-reviewer` → Quality checks
- `refactor-specialist` → Code improvements
- `test-generator` → Test creation

### Security
- `security-scanner` → Vulnerability scanning
- `secrets-detector` → Credential detection
- `penetration-tester` → Attack simulation

### Performance
- `performance-analyzer` → Bottleneck identification
- `database-optimizer` → Query optimization
- `docker-optimizer` → Container optimization

### Documentation
- `api-documenter` → API documentation
- `readme-generator` → README creation
- `changelog-manager` → Version tracking

## Pre-Built Stack Templates

### Frontend Feature
```
Agent: Frontend Developer
Skills: frontend-development, react, ui-design
Spawns: code-reviewer → react-specialist → performance-engineer → qa-expert
Pattern: Sequential with parallel validation
Duration: 3-5 min
```

### Security Audit
```
Agent: Security Engineer
Skills: security-auditing, penetration-testing
Spawns: [security-scanner, secrets-detector] → penetration-tester → code-reviewer
Pattern: Parallel then sequential
Duration: 4-6 min
```

### API Development
```
Agent: Backend Developer
Skills: backend-development, api-design, database-design
Spawns: api-designer → [backend-dev, database-optimizer] → [security-auditor, qa-expert]
Pattern: Sequential → Parallel → Parallel
Duration: 5-8 min
```

### Deployment Pipeline
```
Agent: DevOps Engineer
Skills: devops, ci-cd, containerization
Spawns: [code-reviewer, security-scanner, test-runner] → docker-optimizer → deploy-manager
Pattern: Parallel validation → Sequential deployment
Duration: 4-7 min
```

## Optimization Checklist

### ⚡ Speed Optimization
- [ ] Identify parallel execution opportunities
- [ ] Use Haiku for simple sub-tasks
- [ ] Cache repeated operations
- [ ] Reduce unnecessary sub-agents

### 💰 Cost Optimization
- [ ] Replace Sonnet with Haiku where possible
- [ ] Consolidate similar sub-agent tasks
- [ ] Reduce token usage in prompts
- [ ] Reuse results across sub-agents

### 🎯 Quality Optimization
- [ ] Add validation sub-agents
- [ ] Include security scanning
- [ ] Add comprehensive testing
- [ ] Implement error handling

## Design Workflow (5 Steps)

1. **Identify Required Skills**
   - What capabilities are needed?
   - List 3-7 core skills

2. **Select Agent**
   - Which agent has these skills?
   - Can it spawn needed sub-agents?

3. **Map Sub-Agents**
   - What specific tasks are needed?
   - Which sub-agents handle each?

4. **Choose Execution Pattern**
   - Sequential, parallel, or hierarchical?
   - What are the dependencies?

5. **Optimize & Validate**
   - Can tasks be parallelized?
   - Are models appropriate?
   - Is anything missing?

## Common Issues & Solutions

| Problem | Solution |
|---------|----------|
| **Too slow** | Add parallel execution |
| **Too expensive** | Use Haiku for simple tasks |
| **Missing capabilities** | Add skills to agent |
| **Incomplete results** | Add validation sub-agent |
| **Security concerns** | Add security-auditor |
| **No error handling** | Add conditional error paths |

## Example Questions

### Design Questions
- "Design a stack for deploying microservices"
- "What's the best workflow for data processing?"
- "How should I structure a full-stack feature?"

### Analysis Questions
- "Is this workflow optimal?"
- "Where are the bottlenecks?"
- "Can I reduce token usage?"

### Optimization Questions
- "How can I make this faster?"
- "What's the most cost-effective approach?"
- "Should I use parallel or sequential execution?"

### Comparison Questions
- "Frontend Dev vs Fullstack Dev for this task?"
- "Sonnet vs Haiku for code review?"
- "Sequential vs parallel for security audit?"

## Pro Tips

### ✅ DO
- Start with required skills
- Use parallel execution when possible
- Match model to task complexity
- Include validation sub-agents
- Document dependencies

### ❌ DON'T
- Over-complicate workflows
- Use Opus for simple tasks
- Create > 3-level hierarchies
- Ignore parallelization
- Skip error handling

## Formulas

### Execution Time Estimate
```
Sequential: Sum of all sub-agent durations
Parallel: Longest sub-agent in group
Hierarchical: Sum of level durations
```

### Token Budget Estimate
```
Simple sub-agent: 1-3K tokens (Haiku)
Standard sub-agent: 3-7K tokens (Sonnet)
Complex sub-agent: 7-15K tokens (Sonnet/Opus)

Total = Sum of all sub-agents + 10% overhead
```

### Cost Estimate
```
Haiku: $0.003 per 1K tokens
Sonnet: $0.009 per 1K tokens
Opus: $0.045 per 1K tokens

Cost = (Tokens ÷ 1000) × Model_rate
```

## When to Use Which Pattern

### Use Sequential When:
- Tasks must happen in specific order
- Each task needs previous task's output
- Example: Design → Build → Test → Deploy

### Use Parallel When:
- Tasks are independent
- Speed is priority
- Example: Run tests + security scan + lint

### Use Hierarchical When:
- Complex multi-stage coordination
- Sub-agents need their own sub-agents
- Example: Tech Lead coordinating multiple teams

### Use Conditional When:
- Different paths based on results
- Adaptive workflows needed
- Example: If tests fail, run diagnostics

## Quick Reference URLs

- **Full Skill Doc**: `.claude/skills/skill-stack-analyzer/SKILL.md`
- **README**: `.claude/skills/skill-stack-analyzer/README.md`
- **Integration Guide**: `DOCUMENTATION/skill-stack-integration.md`
- **Architecture**: `DOCUMENTATION/subagents-vs-skills-architecture.md`
- **Relationships**: `DOCUMENTATION/agent-subagent-relationships.md`

## Need Help?

### In Claude Code:
```
"Use skill-stack-analyzer to explain [topic]"
"Help me understand how [agent/skill/subagent] works"
"Show me examples of [pattern type] workflows"
```

### Common Patterns:
- Frontend development
- Security audits
- Data pipelines
- Deployment workflows
- Testing strategies

---

**Tip**: Print this and keep it handy! 🖨️

**Version**: 1.0 | **Last Updated**: Oct 30, 2025
