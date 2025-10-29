# Agent-Subagent Relationship System

## Overview

The Agent-Subagent relationship system creates hierarchical AI workflows where high-level agents can spawn and coordinate specialized subagents. This mirrors real-world team structures where senior engineers delegate specific tasks to domain specialists.

## Architecture

### Relationship Schema

Each agent can have a `spawnsSubagents` field that lists subagent IDs it can coordinate with:

```javascript
{
  "id": "agents-development-team-frontend-developer",
  "name": "frontend-developer",
  "icon": "👥",
  "description": "Frontend developer specializing in modern React applications",
  "category": "agents",
  "subCategory": "development-team",
  // ... other fields ...
  "spawnsSubagents": [
    "subagents-quality-security-code-reviewer",
    "subagents-quality-security-performance-engineer",
    "subagents-language-specialists-react-specialist",
    "subagents-quality-security-qa-expert",
    "subagents-developer-experience-refactoring-specialist"
  ]
}
```

## Relationship Patterns

### 1. Development Agents

#### Frontend Developer Agent
**Spawns:**
- `code-reviewer` - Code quality checks
- `performance-engineer` - Optimize rendering and bundle size
- `react-specialist` - React-specific patterns
- `qa-expert` - Component testing
- `refactoring-specialist` - Code improvements

**Workflow Example:**
```
Frontend Developer Agent
├── code-reviewer: Reviews component code
├── react-specialist: Implements hooks/patterns
├── performance-engineer: Optimizes rendering
└── qa-expert: Creates component tests
```

#### Backend Developer Agent
**Spawns:**
- `code-reviewer` - API code review
- `security-auditor` - Security vulnerabilities
- `performance-engineer` - Query optimization
- `api-designer` - API architecture
- `qa-expert` - API testing

#### Fullstack Developer Agent
**Spawns:**
- `frontend-developer` (subagent) - UI implementation
- `backend-developer` (subagent) - API implementation
- `code-reviewer` - Full-stack review
- `devops-engineer` - Deployment
- `qa-expert` - E2E testing

### 2. Infrastructure Agents

#### Cloud Architect Agent
**Spawns:**
- `terraform-engineer` - Infrastructure as Code
- `kubernetes-specialist` - Container orchestration
- `sre-engineer` - Reliability patterns
- `security-auditor` - Cloud security
- `devops-engineer` - CI/CD pipelines

#### DevOps Engineer Agent
**Spawns:**
- `terraform-engineer` - Infrastructure provisioning
- `kubernetes-specialist` - Deployment
- `sre-engineer` - Monitoring setup
- `security-auditor` - Pipeline security

### 3. Data & AI Agents

#### AI Engineer Agent
**Spawns:**
- `machine-learning-engineer` - Model training
- `nlp-engineer` - Language processing
- `data-engineer` - Data pipelines
- `performance-engineer` - Inference optimization
- `code-reviewer` - AI code quality

#### Data Scientist Agent
**Spawns:**
- `data-engineer` - Data preparation
- `data-researcher` - Data discovery
- `machine-learning-engineer` - Model implementation
- `research-analyst` - Statistical analysis

### 4. Quality & Security Agents

#### Security Engineer Agent
**Spawns:**
- `security-auditor` - Vulnerability scanning
- `penetration-tester` - Security testing
- `code-reviewer` - Security patterns
- `devops-engineer` - Secure pipelines

#### QA Lead Agent
**Spawns:**
- `qa-expert` - Test automation
- `performance-engineer` - Load testing
- `security-auditor` - Security testing
- `code-reviewer` - Test quality

### 5. Product & Business Agents

#### Product Manager Agent
**Spawns:**
- `business-analyst` - Requirements gathering
- `market-researcher` - Market analysis
- `competitive-analyst` - Competitor research
- `trend-analyst` - Industry trends
- `technical-writer` - Documentation

#### Project Manager Agent
**Spawns:**
- `task-distributor` - Task allocation
- `workflow-orchestrator` - Workflow management
- `business-analyst` - Requirements
- `product-manager` - Strategy alignment

### 6. Meta & Orchestration

#### Multi-Agent Coordinator
**Spawns:**
- `workflow-orchestrator` - Complex workflows
- `task-distributor` - Task allocation
- `error-coordinator` - Error handling
- `knowledge-synthesizer` - Result synthesis

## Orchestration Patterns

### Sequential Workflow
Agent spawns subagents one after another:

```javascript
// Example: Code review workflow
1. code-reviewer → Identifies issues
2. refactoring-specialist → Suggests improvements
3. qa-expert → Adds tests
4. performance-engineer → Optimizes
```

### Parallel Workflow
Agent spawns multiple subagents simultaneously:

```javascript
// Example: Full-stack feature implementation
Agent: Fullstack Developer
Parallel Tasks:
├── frontend-developer → Builds UI
├── backend-developer → Builds API
├── documentation-engineer → Writes docs
└── qa-expert → Prepares tests
```

### Conditional Workflow
Agent spawns subagents based on context:

```javascript
// Example: Smart deployment
if (hasSecurityChanges) {
  spawn: security-auditor
  if (criticalVulnerabilities) {
    spawn: penetration-tester
  }
}
spawn: devops-engineer
spawn: sre-engineer
```

### Hierarchical Workflow
Agents spawn subagents, which spawn their own subagents:

```javascript
// Example: Complex feature development
Agent: Technical Lead
├── frontend-developer
│   ├── react-specialist
│   ├── code-reviewer
│   └── performance-engineer
├── backend-developer
│   ├── api-designer
│   ├── security-auditor
│   └── performance-engineer
└── devops-engineer
    ├── terraform-engineer
    ├── kubernetes-specialist
    └── sre-engineer
```

## Implementation

### Data Structure

```javascript
const agentSubagentMap = {
  "agents-development-team-frontend-developer": [
    "subagents-quality-security-code-reviewer",
    "subagents-quality-security-performance-engineer",
    "subagents-language-specialists-react-specialist",
    "subagents-quality-security-qa-expert"
  ]
  // ... more mappings
};
```

### Spawning Logic

```javascript
function spawnSubagents(agentId, task) {
  const agent = getAgentById(agentId);
  const subagentIds = agent.spawnsSubagents || [];

  // Select relevant subagents based on task
  const relevantSubagents = selectRelevantSubagents(subagentIds, task);

  // Execute subagents in appropriate pattern
  if (task.parallel) {
    return executeParallel(relevantSubagents, task);
  } else {
    return executeSequential(relevantSubagents, task);
  }
}
```

### UI Indicators

Display agent-subagent relationships in the marketplace:

```html
<div class="agent-card">
  <h3>Frontend Developer</h3>
  <div class="spawns-subagents">
    <span class="badge">Can coordinate 5 subagents</span>
    <ul class="subagent-list">
      <li>🔍 Code Reviewer</li>
      <li>⚡ Performance Engineer</li>
      <li>⚛️ React Specialist</li>
      <li>✅ QA Expert</li>
      <li>♻️ Refactoring Specialist</li>
    </ul>
  </div>
</div>
```

## Benefits

### 1. **Specialization**
- Agents focus on high-level coordination
- Subagents handle specific technical tasks
- Clear separation of concerns

### 2. **Reusability**
- Subagents can be shared across multiple agents
- Common patterns (code review, testing) are centralized
- Consistent quality across workflows

### 3. **Scalability**
- Easy to add new subagents
- Agents can adapt to new capabilities
- Flexible workflow composition

### 4. **Transparency**
- Clear visibility into workflow steps
- Traceable decision-making
- Auditable processes

### 5. **Efficiency**
- Parallel execution where possible
- Targeted expertise for each subtask
- Reduced token usage through specialization

## Best Practices

### Relationship Design

1. **Logical Connections**: Only connect agents to subagents they would realistically coordinate with
2. **Limited Scope**: Each agent should spawn 3-7 subagents (not too few, not overwhelming)
3. **Complementary Skills**: Subagents should enhance, not duplicate, the agent's capabilities
4. **Clear Hierarchy**: Maintain clear parent-child relationships

### Workflow Patterns

1. **Start Simple**: Begin with sequential workflows before adding parallelism
2. **Error Handling**: Always include error-coordinator for complex workflows
3. **Result Synthesis**: Use knowledge-synthesizer to combine outputs
4. **Monitoring**: Track subagent execution and performance

### Documentation

1. **Document Relationships**: Explain why each agent-subagent pair exists
2. **Workflow Examples**: Provide real-world usage scenarios
3. **Performance Metrics**: Track execution time and success rates
4. **Update Regularly**: Keep relationships current as capabilities evolve

## Future Enhancements

### Dynamic Spawning
Agents automatically select optimal subagents based on:
- Task requirements
- Current context
- Historical performance
- Resource availability

### Learning System
Track which subagent combinations are most effective:
```javascript
{
  "agentId": "agents-development-team-frontend-developer",
  "successfulPatterns": [
    {
      "subagents": ["code-reviewer", "react-specialist", "qa-expert"],
      "successRate": 0.95,
      "avgTime": "45s"
    }
  ]
}
```

### Conflict Resolution
Handle scenarios where subagents provide conflicting recommendations:
- Voting mechanisms
- Priority weighting
- Agent arbitration

### Cost Optimization
Optimize token usage by:
- Caching common subagent responses
- Reusing results across similar tasks
- Smart subagent selection

## Examples

### Example 1: Feature Development

```javascript
// User request: "Build a user authentication feature"

Agent: Fullstack Developer
├── 1. api-designer → Designs auth API
├── 2. backend-developer → Implements API
├── 3. security-auditor → Reviews security
├── 4. frontend-developer → Builds login UI
├── 5. qa-expert → Creates tests
└── 6. documentation-engineer → Writes docs

// Parallel execution where possible
Parallel Group 1: [api-designer]
Parallel Group 2: [backend-developer, frontend-developer]
Parallel Group 3: [security-auditor, qa-expert, documentation-engineer]
```

### Example 2: Performance Optimization

```javascript
// User request: "Optimize application performance"

Agent: Performance Engineer (Main)
├── 1. code-reviewer → Identifies bottlenecks
├── 2. frontend-developer (subagent) → Frontend optimization
│   ├── performance-engineer → Bundle optimization
│   └── react-specialist → Component optimization
├── 3. backend-developer (subagent) → Backend optimization
│   ├── performance-engineer → Query optimization
│   └── database-optimizer → DB tuning
└── 4. sre-engineer → Infrastructure optimization

// Sequential with nested parallelism
```

### Example 3: Security Audit

```javascript
// User request: "Perform complete security audit"

Agent: Security Engineer
├── 1. Parallel: Analysis
│   ├── security-auditor → Code vulnerabilities
│   ├── penetration-tester → Attack vectors
│   └── code-reviewer → Security patterns
├── 2. knowledge-synthesizer → Combine findings
├── 3. Conditional: Remediation
│   └── if (criticalIssues) {
│       ├── refactoring-specialist → Fix issues
│       ├── code-reviewer → Verify fixes
│       └── qa-expert → Security tests
│     }
└── 4. documentation-engineer → Security report
```

## Conclusion

The Agent-Subagent relationship system creates powerful, flexible workflows that mirror real-world development teams. By carefully designing these relationships, we can build sophisticated automation that combines the coordination skills of senior agents with the specialized expertise of focused subagents.

This system enables:
- **Complex task decomposition**
- **Parallel execution for efficiency**
- **Specialized expertise for quality**
- **Transparent, auditable workflows**
- **Scalable automation patterns**

As the system evolves, agents will learn optimal subagent combinations, automatically adapt to new capabilities, and provide increasingly sophisticated development assistance.
