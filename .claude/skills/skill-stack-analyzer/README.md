# Skill Stack Analyzer

> 🎯 Expert analyzer for understanding and designing skill stacks in the Organized AI Marketplace / AITMPL ecosystem

## What This Skill Does

The Skill Stack Analyzer helps you understand how **Skills** (capability definitions), **Agents** (coordinators), and **Sub-Agents** (executors) work together to create powerful hierarchical AI workflows.

## When to Use

Use this skill when you need to:

- 📋 **Design** a new agent workflow for a specific use case
- 🔍 **Analyze** an existing workflow to understand its structure
- ⚡ **Optimize** skill composition and execution patterns
- 📚 **Learn** about the AITMPL architecture and relationships
- 🎓 **Teach** others about agent-subagent-skill hierarchies

## Quick Start

### Activate the Skill

In Claude Code, simply invoke the skill by name:

```
Use the skill-stack-analyzer skill to help me design a deployment workflow
```

Or ask directly:

```
I need to understand how skills, agents, and sub-agents work together
```

### Example Questions

**Design a New Stack:**
```
Design a skill stack for automated code deployment with security scanning
```

**Analyze an Existing Stack:**
```
Analyze this workflow: Frontend Developer → code-reviewer → react-specialist → qa-expert
```

**Find Skill Gaps:**
```
I want to build an AI chatbot. What skills and agents do I need?
```

**Optimize Performance:**
```
How can I optimize this stack to reduce token usage and execution time?
```

**Understand Relationships:**
```
Explain how the Security Engineer agent uses skills to spawn sub-agents
```

## Core Concepts

### The Three Layers

```
┌─────────────────────────────────────────────┐
│ SKILLS (Capability Definitions)            │
│ • Stateless templates                       │
│ • What CAN be done                          │
│ • Example: "code-review", "data-analysis"   │
└─────────────────────────────────────────────┘
              ↓ equipped by
┌─────────────────────────────────────────────┐
│ AGENTS (Orchestrators)                      │
│ • Possess multiple skills                   │
│ • WHO coordinates the work                  │
│ • Example: Frontend Developer, Data Engineer│
└─────────────────────────────────────────────┘
              ↓ spawns
┌─────────────────────────────────────────────┐
│ SUB-AGENTS (Task Executors)                │
│ • Temporary, stateful workers               │
│ • WHO does specific tasks                   │
│ • Example: code-reviewer, test-generator    │
└─────────────────────────────────────────────┘
```

### Skill Stack Flow

```
User Request
    ↓
Required Skills Identified
    ↓
Agent Selected (has skills)
    ↓
Sub-Agents Spawned (use skills)
    ↓
Tasks Executed
    ↓
Results Returned
```

## Key Features

### 🎯 Stack Analysis
- Analyze existing workflows for efficiency and completeness
- Identify missing skills or sub-agents
- Suggest optimization opportunities

### 🏗️ Stack Design
- Design new workflows from scratch
- Map skills to agents and sub-agents
- Choose optimal execution patterns (sequential/parallel/hierarchical)

### ⚡ Performance Optimization
- Identify parallelization opportunities
- Suggest appropriate model selection (Haiku/Sonnet/Opus)
- Estimate token usage and costs

### 📊 Visualization
- Generate workflow diagrams
- Show skill-to-agent-to-subagent relationships
- Illustrate execution patterns

## Common Workflows

### Frontend Development Stack
```
Agent: Frontend Developer
Skills: frontend-development, react, ui-design
Spawns:
  ├── code-reviewer (quality check)
  ├── react-specialist (React optimization)
  ├── performance-engineer (optimization)
  └── qa-expert (testing)
```

### Security Audit Stack
```
Agent: Security Engineer
Skills: security-auditing, penetration-testing
Spawns:
  ├── security-auditor (vulnerability scanning)
  ├── penetration-tester (attack simulation)
  ├── secrets-detector (credential detection)
  └── code-reviewer (security code review)
```

### Data Pipeline Stack
```
Agent: Data Engineer
Skills: data-engineering, etl, pipeline-design
Spawns:
  ├── data-analyzer (analysis)
  ├── database-optimizer (query optimization)
  └── documentation-engineer (docs)
```

## Output Formats

The skill provides structured outputs including:

### Stack Overview
- Purpose and complexity
- Estimated duration and token budget
- Agent details and skills

### Component Breakdown
- Required skills with justifications
- Sub-agents with tasks and model recommendations
- Execution flow diagrams

### Optimization Suggestions
- Skill improvements
- Execution optimizations
- Architecture enhancements

## Best Practices

### ✅ DO
- Match skills to sub-agent capabilities precisely
- Use parallel execution when tasks are independent
- Assign simpler sub-tasks to Haiku to save tokens
- Include error handling and validation sub-agents

### ❌ DON'T
- Spawn unnecessary sub-agents (increases cost)
- Use Opus for simple tasks (expensive)
- Create deeply nested hierarchies (> 3 levels)
- Ignore parallelization opportunities

## Related Documentation

- **Architecture Definition**: `DOCUMENTATION/subagents-vs-skills-architecture.md`
- **Agent-Subagent Relationships**: `DOCUMENTATION/agent-subagent-relationships.md`
- **AITMPL Skills Reference**: `DOCUMENTATION/AITMPL/components/skills.md`
- **AITMPL Agents Reference**: `DOCUMENTATION/AITMPL/components/agents.md`
- **AITMPL Sub-Agents Reference**: `DOCUMENTATION/AITMPL/components/subagents.md`

## Stack Complexity Matrix

| Stack Type | Skills | Sub-Agents | Duration | Tokens | Models |
|-----------|--------|------------|----------|--------|--------|
| Simple | 1-3 | 1-2 | < 1 min | 2K-5K | Haiku |
| Standard | 3-5 | 2-4 | 2-5 min | 8K-15K | Haiku + Sonnet |
| Complex | 5-10 | 4-8 | 5-15 min | 20K-40K | Sonnet |
| Enterprise | 10+ | 8-15 | 15-30 min | 50K-100K | Sonnet + Opus |

## Examples

### Example 1: Design a Deployment Stack

**Prompt:**
```
Design a skill stack for automated code deployment with security checks
```

**Output:**
- Complete agent definition with skills
- 6 sub-agents (code-reviewer, security-scanner, test-runner, docker-optimizer, infrastructure-provisioner, monitoring-setup)
- Execution flow with parallel groups
- Token budget: ~25,000 tokens
- Optimization suggestions

### Example 2: Analyze Existing Stack

**Prompt:**
```
Analyze: Frontend Dev → code-reviewer → react-specialist → qa-expert
```

**Output:**
- Current structure analysis
- Strengths and weaknesses
- Parallelization opportunities
- Model optimization suggestions
- Token savings: ~17%

### Example 3: Skill Gap Analysis

**Prompt:**
```
What skills do I need to build an AI chatbot?
```

**Output:**
- Required skills list (critical/important/nice-to-have)
- Agent recommendation (AI Engineer)
- 8 sub-agents across 4 phases
- Complete execution flow
- Resource estimates

## Tips for Best Results

1. **Be Specific**: Describe your use case clearly
   - Good: "Design a stack for deploying Node.js APIs to AWS with security scanning"
   - Better: "Design a stack for automated deployment that includes code review, security scanning, Docker optimization, and monitoring setup"

2. **Ask Follow-Up Questions**: The skill can dive deeper
   - "Can you optimize this for cost?"
   - "What if I need to add database migrations?"
   - "Show me the parallel execution opportunities"

3. **Request Visualizations**: Get clear diagrams
   - "Show me the execution flow as a diagram"
   - "Visualize the skill-to-agent relationships"

4. **Compare Options**: Evaluate different approaches
   - "Compare a sequential vs parallel approach for this stack"
   - "What's the difference between using Frontend Developer vs Fullstack Developer?"

## Learning Path

### Beginner
1. Understand Skills vs Agents vs Sub-Agents
2. Analyze simple sequential workflows
3. Identify required skills for basic tasks

### Intermediate
1. Design skill stacks with parallel execution
2. Optimize model selection for efficiency
3. Create 2-3 level hierarchical workflows

### Advanced
1. Design conditional workflows
2. Optimize complex multi-agent systems
3. Create reusable patterns

## Support

For questions or issues:
- Check the [AITMPL Documentation](https://docs.aitmpl.com/)
- Review the architecture docs in `DOCUMENTATION/`
- Ask Claude Code: "Explain how skill stacks work"

---

**Version**: 1.0
**Last Updated**: October 30, 2025
**Skill Type**: Analysis & Design
**Complexity**: Medium-High
