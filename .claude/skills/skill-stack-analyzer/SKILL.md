---
name: skill-stack-analyzer
description: Analyze and explain skill stacks by understanding how Skills (capabilities), Agents (coordinators), and Sub-Agents (executors) work together in hierarchical AI workflows. Use this when planning agent architectures, designing workflows, or understanding how AITMPL components compose into complete automation systems.
---

# Skill Stack Analyzer

Expert analyzer for understanding and designing skill stacks in the Organized AI Marketplace / AITMPL ecosystem. This skill helps you understand how Skills, Agents, and Sub-Agents compose into powerful hierarchical workflows.

## 🎯 Core Concepts

### Three Architectural Layers

#### 1. Skills (Capability Definitions)
- **What**: Reusable capability definitions describing what can be done
- **Nature**: Stateless, permanent, composable templates
- **Examples**: "data-analysis", "code-review", "api-integration"
- **Analogy**: Professional certifications or tool proficiencies

#### 2. Agents (Orchestrators)
- **What**: AI specialists that possess multiple skills and coordinate work
- **Nature**: High-level coordinators that can spawn sub-agents
- **Examples**: Frontend Developer, Security Engineer, Data Scientist
- **Analogy**: Senior engineers or team leads

#### 3. Sub-Agents (Task Executors)
- **What**: Autonomous AI entities spawned to accomplish specific tasks
- **Nature**: Temporary, stateful workers with focused missions
- **Examples**: code-reviewer, test-generator, security-scanner
- **Analogy**: Specialized contractors hired for specific jobs

### The Skill Stack Concept

A **Skill Stack** is the complete hierarchical workflow where:
```
User Request
    ↓
Required Skills Identified
    ↓
Agent Selected (has required skills)
    ↓
Sub-Agents Spawned (use specific skills)
    ↓
Tasks Executed (leveraging skills)
    ↓
Results Aggregated
```

## 🔑 When to Use This Skill

Use this skill when you need to:

### Planning & Design
- Design a new agent workflow for a specific use case
- Understand which skills an agent should possess
- Map out sub-agent spawning relationships
- Determine optimal skill-to-agent assignments

### Analysis & Understanding
- Analyze an existing workflow to understand its structure
- Identify which skills are being used in a process
- Understand agent-subagent hierarchies
- Evaluate skill stack efficiency and coverage

### Optimization
- Identify missing skills in an agent's capabilities
- Suggest better sub-agent combinations
- Optimize skill reusability across agents
- Reduce token usage through better skill composition

### Documentation & Communication
- Explain how a complex workflow operates
- Document skill requirements for new features
- Create visual representations of skill stacks
- Teach others about the AITMPL architecture

## 📚 Knowledge Base

### Relationship Patterns

#### Sequential Workflow
Agent spawns sub-agents one after another:
```javascript
1. code-reviewer → Identifies issues
2. refactoring-specialist → Suggests improvements
3. qa-expert → Adds tests
4. performance-engineer → Optimizes
```

#### Parallel Workflow
Agent spawns multiple sub-agents simultaneously:
```javascript
Agent: Fullstack Developer
Parallel Tasks:
├── frontend-developer → Builds UI
├── backend-developer → Builds API
├── documentation-engineer → Writes docs
└── qa-expert → Prepares tests
```

#### Hierarchical Workflow
Agents spawn sub-agents, which spawn their own sub-agents:
```javascript
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

### Common Agent-Skill-SubAgent Stacks

#### Frontend Development Stack
**Agent**: Frontend Developer
**Skills**: frontend-development, react, ui-design, performance-optimization
**Spawns Sub-Agents**:
- code-reviewer (uses: code-review skill)
- performance-engineer (uses: performance-optimization skill)
- react-specialist (uses: react, component-patterns skills)
- qa-expert (uses: testing, e2e-testing skills)
- refactoring-specialist (uses: code-quality, refactoring skills)

#### Security Audit Stack
**Agent**: Security Engineer
**Skills**: security-auditing, penetration-testing, compliance, threat-modeling
**Spawns Sub-Agents**:
- security-auditor (uses: vulnerability-scanning, security-patterns skills)
- penetration-tester (uses: security-testing, attack-simulation skills)
- code-reviewer (uses: security-code-review skill)
- secrets-detector (uses: secret-detection, compliance skills)

#### Data Pipeline Stack
**Agent**: Data Engineer
**Skills**: data-engineering, etl, data-warehousing, pipeline-design
**Spawns Sub-Agents**:
- data-analyzer (uses: data-analysis, statistical-analysis skills)
- database-optimizer (uses: query-optimization, indexing skills)
- performance-analyzer (uses: profiling, bottleneck-analysis skills)
- documentation-engineer (uses: technical-writing, api-documentation skills)

#### E-Commerce Product Launch Stack
**Agent**: E-Commerce Specialist
**Skills**: product-writing, seo-optimization, market-research, image-optimization
**Spawns Sub-Agents**:
- competitor-analyst (uses: market-research, competitive-analysis skills)
- product-writer (uses: content-writing, seo-optimization skills)
- image-optimizer (uses: image-processing, optimization skills)
- price-analyst (uses: pricing-strategy, data-analysis skills)

## 🛠️ Analysis Framework

### When Analyzing a Skill Stack, Consider:

#### 1. Skill Coverage
- Does the agent have all necessary skills for the task?
- Are there redundant skills across sub-agents?
- Are there missing skills that would improve outcomes?

#### 2. Agent Composition
- Is the right agent selected for the task?
- Could a more specialized agent be better?
- Should this be handled by multiple agents?

#### 3. Sub-Agent Selection
- Are the spawned sub-agents optimal for subtasks?
- Could tasks be parallelized more effectively?
- Are dependencies between sub-agents handled correctly?

#### 4. Execution Pattern
- Is sequential execution necessary or could tasks run in parallel?
- Are there conditional branches that optimize execution?
- Is the hierarchy too deep (too many nested sub-agents)?

#### 5. Resource Efficiency
- What's the estimated token usage for this stack?
- Are expensive models (Opus/Sonnet) used appropriately?
- Could Haiku handle simpler sub-tasks?

#### 6. Result Quality
- Does the workflow produce comprehensive results?
- Are all aspects of the task covered?
- Is there proper error handling and validation?

## 📋 Output Format

When analyzing or designing a skill stack, provide:

### Stack Overview
```markdown
# Skill Stack: [Name]

**Purpose**: [One-sentence description]
**Complexity**: [Low/Medium/High]
**Estimated Duration**: [Time estimate]
**Token Budget**: [Approximate tokens]
```

### Component Breakdown
```markdown
## 🤖 Agent
- **Name**: [Agent name]
- **Role**: [What this agent orchestrates]
- **Skills**: [List of skills the agent possesses]

## 🎨 Required Skills
1. **[Skill 1]** - [Why this skill is needed]
2. **[Skill 2]** - [Why this skill is needed]
3. **[Skill 3]** - [Why this skill is needed]

## 🔧 Sub-Agents Spawned
### [Sub-Agent 1 Name]
- **Task**: [Specific task this sub-agent handles]
- **Skills Used**: [Which skills from the list above]
- **Model**: [Recommended model: Haiku/Sonnet/Opus]
- **Priority**: [Critical/High/Medium/Low]

### [Sub-Agent 2 Name]
- **Task**: [Specific task]
- **Skills Used**: [Skills used]
- **Model**: [Model]
- **Priority**: [Priority]
```

### Execution Flow
```markdown
## 🔄 Workflow Pattern: [Sequential/Parallel/Hierarchical/Conditional]

### Execution Steps:
1. **[Step 1]**: [Sub-agent] performs [task]
   - Dependencies: [None or list dependent steps]
   - Output: [What this produces]

2. **[Step 2]**: [Sub-agent] performs [task]
   - Dependencies: [Depends on Step 1]
   - Output: [What this produces]

### Parallelization Opportunities:
- [Which steps can run in parallel]

### Conditional Logic:
- If [condition], then [alternative flow]
```

### Optimization Recommendations
```markdown
## 💡 Optimization Suggestions

### Skill Improvements
- ✅ Add [skill] to improve [capability]
- ✅ Consolidate [skill A] and [skill B] into [skill C]

### Execution Improvements
- ⚡ Parallelize [step X] and [step Y]
- ⚡ Use Haiku for [simple sub-task] to reduce costs

### Architecture Improvements
- 🏗️ Consider spawning [sub-agent] earlier in the flow
- 🏗️ Add conditional check before [expensive operation]
```

## 🎯 Usage Examples

### Example 1: Design a New Stack

**User Request**: "I need to build a skill stack for automated code deployment"

**Your Response**:
```markdown
# Skill Stack: Automated Code Deployment

**Purpose**: Deploy code to production with comprehensive validation, testing, and monitoring
**Complexity**: High
**Estimated Duration**: 5-10 minutes
**Token Budget**: 25,000 tokens

## 🤖 Agent
- **Name**: DevOps Engineer
- **Role**: Orchestrates deployment pipeline with safety checks
- **Skills**: devops, ci-cd, containerization, monitoring, infrastructure-as-code

## 🎨 Required Skills
1. **code-review** - Validate code quality before deployment
2. **security-auditing** - Scan for vulnerabilities
3. **testing** - Run comprehensive test suites
4. **containerization** - Build and optimize Docker images
5. **infrastructure-as-code** - Deploy with Terraform/CloudFormation
6. **monitoring** - Set up observability and alerts

## 🔧 Sub-Agents Spawned

### Code Reviewer
- **Task**: Review code changes for quality and best practices
- **Skills Used**: code-review, security-patterns
- **Model**: Sonnet
- **Priority**: Critical

### Security Scanner
- **Task**: Scan for vulnerabilities and compliance issues
- **Skills Used**: security-auditing, vulnerability-scanning
- **Model**: Sonnet
- **Priority**: Critical

### Test Runner
- **Task**: Execute unit, integration, and E2E tests
- **Skills Used**: testing, test-automation
- **Model**: Haiku
- **Priority**: Critical

### Docker Optimizer
- **Task**: Build optimized container images
- **Skills Used**: containerization, optimization
- **Model**: Sonnet
- **Priority**: High

### Infrastructure Provisioner
- **Task**: Provision/update cloud infrastructure
- **Skills Used**: infrastructure-as-code, terraform
- **Model**: Sonnet
- **Priority**: High

### Monitoring Setup
- **Task**: Configure monitoring and alerting
- **Skills Used**: monitoring, observability
- **Model**: Haiku
- **Priority**: Medium

## 🔄 Workflow Pattern: Sequential with Parallel Groups

### Execution Steps:

**Parallel Group 1** (Pre-Deployment Validation):
├── Code Reviewer: Quality check
├── Security Scanner: Vulnerability scan
└── Test Runner: Execute test suites
    ↓
**Decision Point**: All checks passed?
    ├── ✅ Yes → Continue to deployment
    └── ❌ No → Stop and report issues
    ↓
**Parallel Group 2** (Deployment):
├── Docker Optimizer: Build images
└── Infrastructure Provisioner: Prepare infrastructure
    ↓
**Sequential Step** (Post-Deployment):
└── Monitoring Setup: Configure observability

### Conditional Logic:
- If security issues found: Stop deployment, notify team
- If tests fail: Stop deployment, create detailed failure report
- If infrastructure changes: Run additional validation

## 💡 Optimization Suggestions

### Skill Improvements
- ✅ Add "rollback-automation" skill for automatic rollback on failures
- ✅ Add "smoke-testing" skill for post-deployment validation

### Execution Improvements
- ⚡ Cache Docker layers to speed up builds
- ⚡ Run security scan and code review in parallel (both use Sonnet)
- ⚡ Use Haiku for monitoring setup (simpler task)

### Architecture Improvements
- 🏗️ Add canary deployment sub-agent for gradual rollout
- 🏗️ Include database migration sub-agent if schema changes detected
- 🏗️ Add notification sub-agent to alert team of deployment status
```

### Example 2: Analyze an Existing Stack

**User Request**: "Analyze this workflow: Frontend Developer → code-reviewer → react-specialist → qa-expert"

**Your Response**:
```markdown
# Stack Analysis: Frontend Development Workflow

## Current Stack Structure

**Agent**: Frontend Developer
**Skills**: frontend-development, react, ui-design
**Sub-Agents**: code-reviewer, react-specialist, qa-expert
**Pattern**: Sequential execution

## Analysis

### ✅ Strengths
- Clear sequential flow ensures each step builds on previous
- Comprehensive coverage: quality check → specialization → testing
- Appropriate skill assignments for each sub-agent

### ⚠️ Areas for Improvement

#### 1. Parallelization Opportunity
**Current**: Sequential (code-reviewer → react-specialist → qa-expert)
**Suggested**:
```
Step 1: code-reviewer (quality check)
    ↓
Step 2 (Parallel):
├── react-specialist (React optimization)
└── qa-expert (Test creation - can start in parallel)
```
**Benefit**: Reduce execution time by ~30%

#### 2. Missing Performance Consideration
**Issue**: No performance optimization sub-agent
**Suggested**: Add performance-engineer after react-specialist
**Skills Used**: performance-optimization, profiling, bundle-analysis
**Benefit**: Ensure optimal rendering and bundle size

#### 3. Model Selection
**Current**: All sub-agents likely using Sonnet (default)
**Optimized**:
- code-reviewer: Sonnet (complex reasoning needed) ✅
- react-specialist: Sonnet (React expertise needed) ✅
- qa-expert: Haiku (test generation is straightforward) ⚡ SAVE TOKENS

#### 4. Missing Skills in Agent
**Agent Current Skills**: frontend-development, react, ui-design
**Missing**: performance-optimization (needed for performance-engineer sub-agent)
**Recommendation**: Add performance-optimization skill to agent

## Optimized Stack

### Updated Agent Definition
- **Name**: Frontend Developer
- **Skills**: frontend-development, react, ui-design, performance-optimization ← ADDED
- **Spawns**: code-reviewer, react-specialist, performance-engineer ← ADDED, qa-expert

### Optimized Execution Flow
```
Frontend Developer Agent
    ↓
1. code-reviewer (Sequential)
    ↓
2. Parallel Group:
   ├── react-specialist
   ├── performance-engineer ← ADDED
   └── qa-expert
    ↓
3. Result aggregation and final review
```

## Impact Assessment

### Time Savings
- **Before**: ~90 seconds (sequential)
- **After**: ~60 seconds (with parallelization)
- **Improvement**: 33% faster

### Quality Improvements
- Added performance optimization
- Better test coverage through parallel execution
- More comprehensive code review

### Cost Impact
- **Before**: ~12,000 tokens (all Sonnet)
- **After**: ~10,000 tokens (qa-expert using Haiku)
- **Savings**: ~17% token reduction
```

### Example 3: Skill Gap Analysis

**User Request**: "I want to build an AI chatbot. What skills and agents do I need?"

**Your Response**:
```markdown
# Skill Stack Design: AI Chatbot Development

## Requirements Analysis
Building an AI chatbot requires skills across:
- Natural language processing
- Conversational design
- API integration
- Performance optimization
- Deployment and monitoring

## Recommended Skill Stack

### Primary Agent: AI Engineer
**Core Skills**:
- nlp (natural language processing)
- conversational-ai
- prompt-engineering
- api-integration
- model-selection

### Supporting Skills Needed
- **Performance optimization** (for response time)
- **Security auditing** (for user data protection)
- **Testing** (for conversation flow validation)
- **Documentation** (for API docs and user guides)

## Sub-Agent Workflow

### Phase 1: Design & Architecture
**Sub-Agent**: API Designer
- **Task**: Design conversation API endpoints
- **Skills**: api-design, rest-api, authentication
- **Model**: Sonnet
- **Output**: API specification, endpoint definitions

**Sub-Agent**: Conversation Designer
- **Task**: Design conversation flows and intents
- **Skills**: conversational-design, ux-design
- **Model**: Sonnet
- **Output**: Conversation flow diagrams, intent mappings

### Phase 2: Implementation
**Sub-Agent**: NLP Engineer
- **Task**: Implement natural language understanding
- **Skills**: nlp, entity-recognition, intent-classification
- **Model**: Sonnet
- **Output**: NLP pipeline, trained models

**Sub-Agent**: Prompt Optimizer
- **Task**: Optimize prompts for best responses
- **Skills**: prompt-engineering, testing
- **Model**: Sonnet
- **Output**: Optimized prompt templates

### Phase 3: Quality & Security
**Sub-Agent**: Security Auditor (Parallel)
- **Task**: Audit for security vulnerabilities
- **Skills**: security-auditing, data-privacy
- **Model**: Sonnet

**Sub-Agent**: QA Expert (Parallel)
- **Task**: Test conversation flows
- **Skills**: testing, conversation-testing
- **Model**: Haiku

**Sub-Agent**: Performance Engineer (Parallel)
- **Task**: Optimize response times
- **Skills**: performance-optimization, caching
- **Model**: Sonnet

### Phase 4: Deployment
**Sub-Agent**: DevOps Engineer
- **Task**: Deploy chatbot to production
- **Skills**: deployment, monitoring, ci-cd
- **Model**: Haiku

**Sub-Agent**: Documentation Engineer
- **Task**: Create user and API documentation
- **Skills**: technical-writing, api-documentation
- **Model**: Haiku

## Complete Execution Flow

```
User Request: "Build AI Chatbot"
    ↓
Agent: AI Engineer (orchestrates)
    ↓
Phase 1 (Sequential):
├── API Designer
└── Conversation Designer
    ↓
Phase 2 (Sequential):
├── NLP Engineer
└── Prompt Optimizer
    ↓
Phase 3 (Parallel):
├── Security Auditor
├── QA Expert
└── Performance Engineer
    ↓
Phase 4 (Sequential):
├── DevOps Engineer
└── Documentation Engineer
    ↓
Final Result: Production-ready AI chatbot
```

## Skill Gap Identification

### If Starting from Scratch, Acquire These Skills:
1. **Critical** (Must Have):
   - nlp
   - prompt-engineering
   - api-integration
   - conversational-ai

2. **Important** (Should Have):
   - security-auditing
   - performance-optimization
   - testing

3. **Nice to Have** (Enhances Quality):
   - ux-design
   - analytics
   - a-b-testing

## Resource Estimates
- **Total Duration**: 15-25 minutes (full workflow)
- **Token Budget**: 40,000-60,000 tokens
- **Skill Count**: 15 skills across 8 sub-agents
- **Estimated Cost**: $0.60-$0.90 (using Sonnet/Haiku mix)
```

## 🚀 Quick Reference

### Skill Categories by Complexity

**Low Complexity** (Haiku suitable):
- content-writing, text-formatting, simple-validation, basic-testing

**Medium Complexity** (Sonnet recommended):
- code-review, api-integration, data-analysis, security-scanning

**High Complexity** (Sonnet/Opus required):
- system-architecture, ml-training, advanced-security-auditing, performance-engineering

### Common Workflow Patterns

**Quality Assurance Stack**:
Agent → code-reviewer → security-scanner → test-generator → performance-analyzer

**Full-Stack Development**:
Agent → (parallel: frontend-developer + backend-developer) → (parallel: qa-expert + security-auditor) → devops-engineer

**Data Pipeline**:
Agent → data-engineer → (parallel: data-validator + performance-optimizer) → documentation-engineer

**Content Creation**:
Agent → market-researcher → content-writer → seo-optimizer → editor

## 💡 Best Practices

### DO ✅
- Match skills to sub-agent capabilities precisely
- Use parallel execution when tasks are independent
- Assign simpler sub-tasks to Haiku to save tokens
- Include error handling and validation sub-agents
- Document skill dependencies clearly

### DON'T ❌
- Spawn unnecessary sub-agents (increases complexity and cost)
- Use Opus for simple tasks (expensive and slow)
- Create deeply nested hierarchies (> 3 levels)
- Ignore parallelization opportunities
- Forget to include security and testing sub-agents

## 🔗 Related Documentation

- **Architecture**: See `DOCUMENTATION/subagents-vs-skills-architecture.md`
- **Agent-Subagent Relationships**: See `DOCUMENTATION/agent-subagent-relationships.md`
- **AITMPL Skills**: See `DOCUMENTATION/AITMPL/components/skills.md`
- **AITMPL Agents**: See `DOCUMENTATION/AITMPL/components/agents.md`
- **AITMPL Sub-Agents**: See `DOCUMENTATION/AITMPL/components/subagents.md`

## 📊 Stack Complexity Matrix

| Stack Type | Skills Needed | Sub-Agents | Avg Duration | Token Budget | Recommended Models |
|-----------|---------------|------------|--------------|--------------|-------------------|
| Simple Task | 1-3 | 1-2 | < 1 min | 2K-5K | Haiku |
| Standard Feature | 3-5 | 2-4 | 2-5 min | 8K-15K | Haiku + Sonnet |
| Complex Workflow | 5-10 | 4-8 | 5-15 min | 20K-40K | Sonnet |
| Enterprise System | 10+ | 8-15 | 15-30 min | 50K-100K | Sonnet + Opus |

## 🎓 Learning Path

### Beginner: Understanding the Basics
1. Learn the difference between Skills, Agents, and Sub-Agents
2. Analyze simple sequential workflows
3. Identify required skills for basic tasks

### Intermediate: Designing Workflows
1. Design skill stacks with parallel execution
2. Optimize model selection for cost efficiency
3. Create hierarchical workflows with 2-3 levels

### Advanced: Complex Orchestration
1. Design conditional workflows with dynamic sub-agent spawning
2. Optimize complex multi-agent systems
3. Create reusable skill stack patterns for common scenarios

## 🤝 Remember

**Skill Stack = Skills (capabilities) + Agent (coordinator) + Sub-Agents (executors)**

A well-designed skill stack:
- ✅ Has clear skill assignments
- ✅ Uses appropriate workflow patterns
- ✅ Optimizes for cost and speed
- ✅ Includes validation and error handling
- ✅ Produces comprehensive, high-quality results
