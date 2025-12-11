# Component Relationships - Visual Guide

> 🎨 Quick visual reference for understanding how all Claude Code components connect

## The Big Picture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USER ACTIONS                             │
│  Types commands, commits code, saves files, requests features   │
└─────────────────────────────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────┐
        │         EVENT DETECTION                │
        │  • Hooks (auto-detect events)          │
        │  • Commands (user invokes)             │
        └────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────┐
        │      AI ORCHESTRATION LAYER            │
        │                                        │
        │  1. Agent Selected (has Skills)        │
        │  2. Agent Creates Plan                 │
        │  3. Agent Spawns Sub-Agents            │
        │  4. Sub-Agents Execute (use Skills)    │
        │                                        │
        └────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────┐
        │     EXTERNAL INTEGRATION               │
        │  • MCPs (databases, APIs, services)    │
        │  • Settings (permissions, config)      │
        └────────────────────────────────────────┘
                              ↓
        ┌────────────────────────────────────────┐
        │          RESULTS & SIDE EFFECTS        │
        │  • Code changes                        │
        │  • Notifications (via Hooks)           │
        │  • Updated documentation               │
        │  • Performance metrics                 │
        └────────────────────────────────────────┘
```

---

## Component Connection Map

### 🤖 Agent Connections

```
                    AGENT
                      │
        ┌─────────────┼─────────────┐
        ↓             ↓             ↓
    HAS Skills   SPAWNS          USES
                Sub-Agents        MCPs
        │             │             │
        │             ↓             │
        │      Execute Tasks        │
        │      Report Back          │
        │                           │
        └─────────────┬─────────────┘
                      ↓
              RESPECTS Settings
                TRIGGERS Hooks
                INVOKES Commands
```

**What Agents Do**:
- ✅ Coordinate complex workflows
- ✅ Make high-level decisions
- ✅ Spawn and manage sub-agents
- ✅ Aggregate results
- ❌ Don't execute tasks directly (sub-agents do)
- ❌ Don't bypass settings

**Example Flow**:
```
User: "Deploy to production"
    ↓
Agent: DevOps Engineer
├── Has Skills: [devops, ci-cd, monitoring]
├── Spawns Sub-Agents:
│   ├── security-scanner
│   ├── test-runner
│   └── deployment-manager
├── Uses MCPs:
│   └── aws-integration
├── Respects Settings:
│   └── bash-timeouts
└── Triggers Hooks:
    └── slack-notifications
```

---

### 🔧 Sub-Agent Connections

```
              SUB-AGENT
                  │
    ┌─────────────┼─────────────┐
    ↓             ↓             ↓
SPAWNED BY    USES Skills    ACCESSES
  Agent                         MCPs
    │             │             │
    │             ↓             │
    │      Apply Capability     │
    │                           │
    └─────────────┬─────────────┘
                  ↓
          FOLLOWS Settings
          REPORTS to Agent
          MAY TRIGGER Hooks
```

**What Sub-Agents Do**:
- ✅ Execute focused, specific tasks
- ✅ Use specific skills to accomplish goals
- ✅ Report results to parent agent
- ✅ Can access MCPs for external data
- ❌ Don't spawn other sub-agents (except in hierarchical patterns)
- ❌ Don't orchestrate complex workflows

**Example Flow**:
```
Sub-Agent: code-reviewer
├── Spawned by: Agent (Security Engineer)
├── Uses Skills: [code-review, security-patterns]
├── Accesses MCPs: github-integration (get PR diff)
├── Follows Settings: read-only-mode
├── Executes: Analyzes code for vulnerabilities
├── May Trigger Hook: If issues found → slack-notification
└── Reports Back: List of security issues to Agent
```

---

### 🎨 Skill Connections

```
               SKILL
        (Capability Definition)
                 │
      ┌──────────┼──────────┐
      ↓          ↓          ↓
  POSSESSED  USED BY   ENHANCED
   by Agent  Sub-Agent   by MCP
      │          │          │
      │          ↓          │
      │    Enables Task     │
      │    Execution        │
      │                     │
      └──────────┬──────────┘
                 ↓
         Defines What's Possible
```

**What Skills Do**:
- ✅ Define capabilities (stateless templates)
- ✅ Describe what can be done
- ✅ Used by agents and sub-agents
- ✅ Composed into complex abilities
- ❌ Don't execute anything themselves
- ❌ Don't have state or memory

**Example**:
```
Skill: "data-analysis"
├── Possessed by Agents:
│   ├── Data Scientist
│   ├── Business Analyst
│   └── ML Engineer
├── Used by Sub-Agents:
│   ├── data-analyzer
│   ├── report-generator
│   └── trend-identifier
└── Enhanced by MCPs:
    └── supabase (adds database query capability)
```

---

### 🪝 Hook Connections

```
                HOOK
          (Event Listener)
                │
      ┌─────────┼─────────┐
      ↓         ↓         ↓
  DETECTS   INVOKES    USES
   Events   Commands   MCPs
      │         │         │
      │         ↓         │
      │   May Spawn       │
      │     Agent         │
      │                   │
      └─────────┬─────────┘
                ↓
        RESPECTS Settings
        RUNS Automatically
```

**What Hooks Do**:
- ✅ Detect events automatically (file changes, commits, etc.)
- ✅ Trigger actions without user intervention
- ✅ Can invoke commands or spawn agents
- ✅ Send notifications via MCPs
- ❌ Don't require user action
- ❌ Don't replace agents (use agents for complex workflows)

**Example Flow**:
```
Hook: pre-commit-validation
├── Detects Event: git commit
├── Invokes Command: /quality-check
│   └── Command spawns Agent: Code Quality Manager
│       └── Agent spawns Sub-Agents:
│           ├── code-reviewer
│           ├── security-scanner
│           └── test-runner
├── Uses MCP: github-integration (check PR status)
├── Respects Settings: bash-timeouts
└── If Issues Found:
    ├── Block commit
    └── Use MCP: slack-integration (alert team)
```

---

### ⚡ Command Connections

```
              COMMAND
           (User Action)
                │
      ┌─────────┼─────────┐
      ↓         ↓         ↓
  INVOKED   SPAWNS    ACCESSES
   by User   Agent      MCPs
      │         │         │
      │         ↓         │
      │   Coordinates     │
      │    Workflow       │
      │                   │
      └─────────┬─────────┘
                ↓
        FOLLOWS Settings
        MAY TRIGGER Hooks
        REQUIRES Skills
```

**What Commands Do**:
- ✅ Provide user-invoked actions (slash commands)
- ✅ Execute predictable workflows
- ✅ Often spawn agents for complex tasks
- ✅ Immediate execution
- ❌ Don't run automatically (use hooks for that)
- ❌ Don't replace agents (commands invoke agents)

**Example Flow**:
```
Command: /deploy-to-production
├── Invoked by: User types /deploy-to-production
├── Spawns Agent: DevOps Engineer
│   └── Agent orchestrates full deployment
├── Accesses MCPs:
│   └── aws-integration (deploy to ECS)
├── Follows Settings:
│   ├── read-only-mode: false (allows deployment)
│   └── bash-timeouts: 600000 (10 min max)
├── Triggers Hooks (as side effects):
│   ├── slack-notifications (deployment started)
│   └── changelog-generator (update release notes)
└── Returns: Deployment status and metrics
```

---

### 🔌 MCP Connections

```
                MCP
        (External Service)
                │
      ┌─────────┼─────────┐
      ↓         ↓         ↓
   USED BY   ACCESSED   CONFIGURED
   Agent     Sub-Agent   by Settings
      │         │         │
      │         ↓         │
      │   Provides Data   │
      │   or Actions      │
      │                   │
      └─────────┬─────────┘
                ↓
        ENHANCES Skills
        ENABLES Real-time Data
```

**What MCPs Do**:
- ✅ Connect to external services (databases, APIs)
- ✅ Provide real-time data access
- ✅ Enable external actions (notifications, deployments)
- ✅ Enhance agent/sub-agent capabilities
- ❌ Don't operate independently (invoked by other components)
- ❌ Don't replace agents or sub-agents

**Example Flow**:
```
MCP: supabase
├── Used by Agent: Data Engineer
│   └── Query database for analysis
├── Accessed by Sub-Agents:
│   ├── data-analyzer (run queries)
│   ├── database-optimizer (analyze indexes)
│   └── schema-validator (check structure)
├── Configured by Settings:
│   ├── Environment: SUPABASE_URL
│   └── Timeout: mcp-timeouts setting
├── Enhances Skills:
│   └── data-analysis skill gains database query capability
└── Provides: Real-time database access and operations
```

---

### ⚙️ Settings Connections

```
             SETTINGS
          (Configuration)
                │
      ┌─────────┼─────────┐
      ↓         ↓         ↓
  CONSTRAINS ENABLES  CONFIGURES
   Agents    Hooks      MCPs
      │         │         │
      │         ↓         │
      │   Controls What   │
      │   Can Execute     │
      │                   │
      └─────────┬─────────┘
                ↓
        GLOBAL Effect
        SECURITY Layer
```

**What Settings Do**:
- ✅ Control permissions and behavior globally
- ✅ Configure external integrations (API keys)
- ✅ Enable/disable features
- ✅ Set performance parameters
- ❌ Don't execute anything themselves
- ❌ Don't bypass security (enforce it)

**Example**:
```
Setting: read-only-mode
├── Constrains Agents:
│   └── DevOps Engineer cannot modify files
├── Constrains Sub-Agents:
│   └── code-writer cannot create new files
├── Enables Hooks:
│   └── deny-file-write hook enforces restriction
├── Configures Behavior:
│   └── All write operations blocked
└── Effect: System-wide read-only enforcement

Setting: bash-timeouts
├── Affects all bash commands run by:
│   ├── Agents
│   ├── Sub-Agents
│   ├── Commands
│   └── Hooks
└── Prevents hanging processes
```

---

## Interaction Patterns

### Pattern A: User-Initiated Workflow

```
1. USER types Command → /security-audit
2. COMMAND invokes Agent → Security Engineer
3. AGENT checks Settings → Permissions OK
4. AGENT spawns Sub-Agents (parallel):
   ├── security-scanner
   ├── secrets-detector
   └── penetration-tester
5. SUB-AGENTS use Skills:
   └── security-auditing, vulnerability-scanning
6. SUB-AGENTS access MCPs:
   └── github-integration (get code)
7. SUB-AGENTS report to Agent
8. AGENT aggregates results
9. HOOK triggers → slack-notifications
10. Results returned to USER
```

### Pattern B: Event-Driven Automation

```
1. EVENT occurs → File saved
2. HOOK detects → lint-on-save
3. HOOK checks Settings → Enabled
4. HOOK spawns Sub-Agent → linter
5. SUB-AGENT uses Skill → code-quality
6. SUB-AGENT executes task
7. If issues found:
   ├── HOOK uses MCP → slack-integration
   └── Notifies developer
8. Automatic completion
```

### Pattern C: External Data Integration

```
1. AGENT needs data → DevOps Engineer
2. AGENT uses MCP → aws-integration
3. MCP checks Settings → API key configured
4. MCP connects to AWS
5. MCP returns data
6. AGENT processes with Skills
7. AGENT spawns Sub-Agents with context
8. SUB-AGENTS complete with enhanced data
```

---

## Decision Tree: Which Component to Use?

### Need automatic action on events?
→ **USE HOOK**
```
Example: Auto-stage files on change
Hook: auto-git-add
```

### Need user-triggered workflow?
→ **USE COMMAND**
```
Example: User types /deploy
Command: deploy-to-production
```

### Need to coordinate multiple tasks?
→ **USE AGENT**
```
Example: Build complete feature
Agent: Fullstack Developer
```

### Need focused task execution?
→ **USE SUB-AGENT**
```
Example: Review specific file
Sub-Agent: code-reviewer
```

### Need to define capabilities?
→ **USE SKILL**
```
Example: Define "data-analysis" ability
Skill: data-analysis
```

### Need external service access?
→ **USE MCP**
```
Example: Query database
MCP: supabase
```

### Need to control behavior?
→ **USE SETTING**
```
Example: Restrict file writes
Setting: read-only-mode
```

---

## Common Combinations

### 1. Complete Deployment Stack
```
Command: /deploy
    ↓
Agent: DevOps Engineer
├── Skills: devops, ci-cd
├── Sub-Agents: security-scanner, test-runner, deployer
├── MCPs: aws-integration
├── Settings: bash-timeouts
└── Hooks: slack-notifications (triggered)
```

### 2. Automated Quality Check
```
Hook: pre-commit-validation
    ↓
Agent: Code Quality Manager
├── Skills: code-review, testing
├── Sub-Agents: linter, test-runner, security-scanner
├── MCPs: github-integration
├── Settings: read-only-mode (check only)
└── Command: /fix-issues (suggested to user)
```

### 3. Data Analysis Pipeline
```
Command: /analyze-data
    ↓
Agent: Data Scientist
├── Skills: data-analysis, visualization
├── Sub-Agents: data-cleaner, analyzer, visualizer
├── MCPs: supabase, aws-integration
├── Settings: memory-optimization
└── Hooks: performance-monitor (tracking)
```

---

## Quick Reference

### Component Summary Table

| Component | Type | Triggers | Executes | Uses | Constrained By |
|-----------|------|----------|----------|------|----------------|
| **Agent** | Orchestrator | User/Hook/Command | Sub-Agents | Skills, MCPs | Settings |
| **Sub-Agent** | Executor | Agent | Tasks | Skills, MCPs | Settings, Agent |
| **Skill** | Definition | N/A | Nothing | N/A | N/A |
| **Hook** | Automation | Events | Commands, Agents | MCPs | Settings |
| **Command** | Action | User | Agents | MCPs | Settings |
| **MCP** | Integration | Agent/Sub-Agent/Hook | External API | N/A | Settings |
| **Setting** | Configuration | N/A | Nothing | N/A | N/A |

---

## Remember

**The Flow**:
```
Events/Commands → Agents → Sub-Agents → Results
        ↓            ↓           ↓
    (via Hooks)  (with Skills) (using MCPs)
                      ↓
              (all controlled by Settings)
```

**Key Principle**:
- **Skills** = What CAN be done (capabilities)
- **Agents** = WHO coordinates (orchestrators)
- **Sub-Agents** = WHO executes (workers)
- **Hooks** = WHEN it happens (events)
- **Commands** = USER triggers (actions)
- **MCPs** = WHERE data comes from (integrations)
- **Settings** = HOW it's controlled (configuration)

---

**For more details, see**:
- [Complete Ecosystem Architecture](../../DOCUMENTATION/claude-code-ecosystem-architecture.md)
- [Skill Stack Integration Guide](../../DOCUMENTATION/skill-stack-integration.md)
- [Main Skill Documentation](./SKILL.md)
