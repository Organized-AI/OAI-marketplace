# Component Story Framework

> **Purpose:** Create marketplace components that tell cohesive developer workflow stories, making the visual stack builder intuitive and the component relationships clear.

---

## 🎯 Core Principles

### 1. **Components Should Tell Stories**
Every component should fit into a realistic developer workflow. Instead of random tools, create **narrative arcs** like:
- "Full-Stack Web App Development"
- "E-commerce Platform Setup"
- "Data Science Pipeline"
- "DevOps Automation"

### 2. **Dependencies Create Visual Flow**
Use dependencies to show **natural progressions**:
```
React Developer Agent
  ↓ (depends on)
GitHub MCP
  ↓ (works with)
Testing Command
  ↓ (triggers)
Pre-commit Hook
```

### 3. **Conflicts Show Trade-offs**
Some components shouldn't coexist:
- `Dark Mode Pro` ⚔️ conflicts with `Light Mode Pro`
- `PostgreSQL MCP` ⚔️ conflicts with `MySQL MCP` (architectural decision)
- `Strict Linter` ⚔️ conflicts with `Relaxed Linter` (opposing philosophies)

---

## 📋 Component Metadata Schema

Based on [AITMPL documentation](../DOCUMENTATION/AITMPL/), each component should have:

```javascript
{
  // Identity
  id: 'unique-component-id',
  name: 'Human-Readable Name',
  icon: '🔥',  // Single emoji
  description: 'Clear, benefit-focused description (1-2 sentences)',

  // Classification
  category: 'agents|commands|mcps|hooks|settings|plugins|skills',
  company: 'Provider/Author',
  tags: ['keyword1', 'keyword2', 'keyword3'],  // 3-5 tags

  // Relationships (NEW - for visual builder)
  dependencies: ['component-id-1', 'component-id-2'],  // Required dependencies
  optionalDependencies: ['component-id-3'],  // Enhances but not required
  conflicts: ['incompatible-component-id'],  // Cannot coexist
  recommends: ['suggested-component-id'],  // Often used together

  // Configuration (AITMPL-aligned)
  requiredEnvVars: ['REQUIRED_VAR'],  // Must be set
  optionalEnvVars: ['OPTIONAL_VAR'],  // Enhances functionality
  settings: {},  // Component-specific settings

  // Installation (AITMPL-aligned)
  installationType: 'agent|command|mcp|hook|skill|plugin',
  files: {
    '.claude/path/file.ext': 'https://raw.githubusercontent.com/...'
  },
  postInstall: ['Step 1', 'Step 2'],  // Instructions after install

  // Compatibility
  compatibility: {
    os: ['macOS', 'Linux', 'Windows'],
    minClaudeVersion: '1.0.0',
    maxClaudeVersion: null
  },

  // Stats
  downloads: 10000,
  rating: 4.5,
  totalRatings: 250,

  // Metadata
  createdAt: '2025-01-15',
  updatedAt: '2025-10-20'
}
```

---

## 🎨 Developer Workflow Stories

### Story 1: **Full-Stack Web App**
**Narrative:** Developer building a modern React + Node.js app with authentication, payments, and deployment.

**Components:**
1. **React Developer Agent** (agents)
   - Dependencies: `github-mcp`, `testing-command`
   - Recommends: `frontend-performance-plugin`

2. **GitHub MCP** (mcps)
   - Required by: React Developer Agent
   - Env vars: `GITHUB_TOKEN`

3. **Testing Command** (commands)
   - Works with: React Developer Agent
   - Recommends: `pre-commit-hook`

4. **Stripe Payments MCP** (mcps)
   - Dependencies: None
   - Env vars: `STRIPE_SECRET_KEY`, `STRIPE_PUBLISHABLE_KEY`

5. **Vercel Deploy Command** (commands)
   - Dependencies: `github-mcp`
   - Recommends: `build-validator-hook`

**Visual Flow in Stack Builder:**
```
[React Developer Agent]
    ↓
[GitHub MCP] ──→ [Testing Command] ──→ [Pre-commit Hook]
    │
    └──→ [Vercel Deploy Command]

[Stripe Payments MCP] (standalone)
```

---

### Story 2: **E-commerce Platform**
**Narrative:** Building a complete e-commerce site with product management, payments, and customer analytics.

**Components:**
1. **E-commerce Architect Agent** (agents)
   - Dependencies: `stripe-mcp`, `database-mcp`
   - Recommends: `inventory-manager-command`

2. **Stripe Payments MCP** (mcps)
   - Conflicts: `paypal-mcp` (choose one payment processor)
   - Env vars: `STRIPE_SECRET_KEY`

3. **Database MCP** (mcps)
   - Conflicts: `mysql-mcp` (if PostgreSQL)
   - Env vars: `DATABASE_URL`

4. **Product Generator Command** (commands)
   - Dependencies: `database-mcp`
   - Description: "Generate product schemas and CRUD operations"

5. **Analytics Dashboard Plugin** (plugins)
   - Dependencies: None
   - Recommends: `e-commerce-architect`

---

### Story 3: **Data Science Pipeline**
**Narrative:** Researcher building ML models with Python, Jupyter notebooks, and cloud deployment.

**Components:**
1. **Data Science Expert Skill** (skills)
   - Dependencies: `python-env-mcp`, `jupyter-mcp`
   - Recommends: `visualization-plugin`

2. **Python Environment MCP** (mcps)
   - Env vars: `PYTHON_VERSION` (optional)

3. **Jupyter Notebook MCP** (mcps)
   - Dependencies: `python-env-mcp`

4. **Model Deploy Command** (commands)
   - Dependencies: `aws-mcp` OR `azure-mcp`
   - Description: "Deploy ML models to cloud"

5. **Data Validation Hook** (hooks)
   - Description: "Validate datasets before training"

---

### Story 4: **Security-First Development**
**Narrative:** Building applications with security as top priority - automated scanning, compliance checks, and safe deployment.

**Components:**
1. **Security Auditor Agent** (agents)
   - Dependencies: `security-scan-command`
   - Recommends: `dependency-checker-hook`

2. **Security Scan Command** (commands)
   - Dependencies: None
   - Description: "OWASP Top 10 vulnerability scanning"

3. **Secrets Detector Hook** (hooks)
   - Description: "Prevent committing API keys and tokens"
   - Required: Always runs pre-commit

4. **Compliance Reporter Plugin** (plugins)
   - Dependencies: `security-auditor`
   - Description: "Generate SOC 2 / GDPR compliance reports"

---

## 🧩 Component Patterns

### Pattern 1: **Foundation → Enhancement**
```javascript
// Foundation component (no dependencies)
{
  id: 'github-mcp',
  dependencies: [],
  // Widely used by other components
}

// Enhancement component (builds on foundation)
{
  id: 'react-developer',
  dependencies: ['github-mcp'],
  // Requires foundation to work
}
```

### Pattern 2: **Workflow Chain**
```javascript
// Step 1: Development
{ id: 'react-developer', dependencies: ['github-mcp'] }
  ↓
// Step 2: Testing
{ id: 'testing-command', dependencies: ['react-developer'] }
  ↓
// Step 3: Quality Assurance
{ id: 'pre-commit-hook', dependencies: ['testing-command'] }
  ↓
// Step 4: Deployment
{ id: 'deploy-command', dependencies: ['github-mcp', 'pre-commit-hook'] }
```

### Pattern 3: **Mutually Exclusive**
```javascript
// Option A
{
  id: 'postgresql-mcp',
  conflicts: ['mysql-mcp', 'mongodb-mcp']
}

// Option B (cannot coexist with A)
{
  id: 'mysql-mcp',
  conflicts: ['postgresql-mcp', 'mongodb-mcp']
}
```

---

## 🎓 Naming Conventions

### Agents
**Format:** `[Role/Domain] [Type]`
- ✅ Good: `React Developer`, `Security Auditor`, `API Designer`
- ❌ Bad: `Agent 1`, `Helper`, `Tool`

### Commands
**Format:** `/{action}` or `[Action Verb] [Object]`
- ✅ Good: `/deploy`, `/test`, `Generate Tests`, `Optimize Bundle`
- ❌ Bad: `Command 1`, `Do Thing`

### MCPs
**Format:** `[Service/Tool] Integration` or `[Service] MCP`
- ✅ Good: `GitHub Integration`, `Stripe MCP`, `AWS Connector`
- ❌ Bad: `Plugin 1`, `External Thing`

### Hooks
**Format:** `[Trigger Point] [Action]` or `[Action] Hook`
- ✅ Good: `Pre-commit Linter`, `Build Validator`, `Dependency Checker`
- ❌ Bad: `Hook 1`, `Automation`

---

## 📝 Description Guidelines

### Good Descriptions (Benefit-Focused)
```
✅ "Automatically reviews code for security vulnerabilities and performance issues"
✅ "Generates comprehensive test suites in seconds, boosting code confidence"
✅ "One-command deployment to Vercel, Netlify, and AWS"
```

### Bad Descriptions (Feature-Focused)
```
❌ "A tool that does code review"
❌ "Test generator using AI"
❌ "Deploys stuff"
```

### Formula
```
[Action Verb] + [What It Does] + [Key Benefit]

Examples:
- "Automatically reviews" + "your code for security" + "preventing vulnerabilities"
- "Generates" + "test suites" + "boosting confidence"
- "Deploys" + "to multiple platforms" + "with one command"
```

---

## 🔗 Dependency Rules

### 1. **Hard Dependencies** (required)
```javascript
{
  id: 'react-developer',
  dependencies: ['github-mcp'],
  // Cannot function without GitHub MCP
}
```

### 2. **Optional Dependencies** (enhances)
```javascript
{
  id: 'react-developer',
  optionalDependencies: ['testing-plugin'],
  // Works alone, better with testing plugin
}
```

### 3. **Recommendations** (commonly paired)
```javascript
{
  id: 'react-developer',
  recommends: ['frontend-performance'],
  // Often used together but independent
}
```

### 4. **Conflicts** (incompatible)
```javascript
{
  id: 'postgresql-mcp',
  conflicts: ['mysql-mcp'],
  // Architectural decision: choose one database
}
```

---

## 🎯 Tags Strategy

### Tag Categories
1. **Technology:** `react`, `python`, `typescript`, `nodejs`
2. **Function:** `testing`, `deployment`, `security`, `performance`
3. **Domain:** `frontend`, `backend`, `devops`, `data-science`
4. **Level:** `beginner`, `advanced`, `expert`
5. **Integration:** `github`, `aws`, `stripe`, `vercel`

### Tag Examples
```javascript
{
  id: 'react-developer',
  tags: ['react', 'frontend', 'typescript', 'testing', 'github']
  // Mix of technology, domain, and integration
}
```

---

## 🚀 Implementation Checklist

When creating components with this framework:

- [ ] **Story Fit:** Does it fit a realistic developer workflow?
- [ ] **Dependencies:** Are dependencies logical and necessary?
- [ ] **Conflicts:** Did you identify incompatible components?
- [ ] **Description:** Is it benefit-focused, not feature-focused?
- [ ] **Tags:** Does it have 3-5 relevant, searchable tags?
- [ ] **Env Vars:** Are required env vars clearly specified?
- [ ] **Visual Flow:** Will it create clear arrows in the stack builder?
- [ ] **AITMPL Aligned:** Does it match the CLI tool's expectations?

---

## 📊 Example: Complete Component

```javascript
{
  // Identity
  id: 'react-performance-optimizer',
  name: 'React Performance Optimizer',
  icon: '⚡',
  description: 'Automatically identifies and fixes React performance bottlenecks, reducing re-renders by up to 80%',

  // Classification
  category: 'agents',
  company: 'Meta',
  tags: ['react', 'performance', 'optimization', 'frontend', 'profiling'],

  // Relationships
  dependencies: ['github-mcp'],  // Needs version control
  optionalDependencies: ['testing-command'],  // Better with tests
  conflicts: [],  // No conflicts
  recommends: ['react-developer', 'bundle-analyzer-plugin'],

  // Configuration
  requiredEnvVars: [],
  optionalEnvVars: ['OPENAI_API_KEY'],  // For AI-powered suggestions
  settings: {
    optimizationLevel: {
      type: 'select',
      options: ['conservative', 'aggressive'],
      default: 'conservative'
    }
  },

  // Installation
  installationType: 'agent',
  files: {
    '.claude/agents/react-performance-optimizer.md': 'https://raw.githubusercontent.com/...'
  },
  postInstall: [
    'Run /optimize to analyze your React components',
    'Review suggestions in the Performance panel'
  ],

  // Compatibility
  compatibility: {
    os: ['macOS', 'Linux', 'Windows'],
    minClaudeVersion: '1.0.0',
    maxClaudeVersion: null
  },

  // Stats
  downloads: 18750,
  rating: 4.8,
  totalRatings: 342,

  // Metadata
  createdAt: '2025-03-15',
  updatedAt: '2025-10-28'
}
```

---

## 🎨 Using This Framework with Claude Agent SDK

### Step 1: Generate Component Ideas
```
Prompt: "Using the Component Story Framework, generate 5 components
for the 'Full-Stack Web App' workflow that have interesting dependencies
and create a visual flow in the stack builder."
```

### Step 2: Validate Relationships
```
Prompt: "Check these components for:
1. Circular dependencies
2. Missing required dependencies
3. Illogical conflicts
4. Better recommendation opportunities"
```

### Step 3: Enhance Descriptions
```
Prompt: "Rewrite these descriptions to be benefit-focused following
the formula: [Action Verb] + [What It Does] + [Key Benefit]"
```

---

**Ready to use this framework?** This will help Claude Agent SDK create components that make your visual stack builder intuitive and engaging! 🚀
