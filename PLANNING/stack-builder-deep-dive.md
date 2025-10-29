# Stack Builder - Deep Dive & Design Comparison

## 🎯 What is Stack Builder?

**Stack Builder** is a **visual, interactive component composer** that allows developers to construct complete Claude Code configurations by selecting and arranging agents, MCPs, commands, hooks, settings, and templates through a drag-and-drop interface.

Think of it as:
- **Figma for Claude Code configurations** (visual composition)
- **Stackblitz for AI tooling** (instant preview and export)
- **npm for Claude Code** (component discovery and installation)

---

## 🏗️ Core Concept: From Selection to Deployment

### The Problem Stack Builder Solves

**Current Workflow** (Manual Configuration):
```
1. Browse marketplace → Find agents/MCPs
2. Read documentation → Understand configuration
3. Create .claude/ folder manually
4. Write JSON config files by hand
5. Set environment variables
6. Test if everything works together
7. Fix compatibility issues
8. Repeat for each new project
```

**Time**: 30-60 minutes per project
**Error-prone**: Typos, missing configs, compatibility issues

**Stack Builder Workflow**:
```
1. Open Stack Builder
2. Drag components into canvas
3. Configure (fill in API keys via forms)
4. Click "Export" → Get complete .claude/ folder
5. Download/install in 1 click
```

**Time**: 5 minutes
**Error-free**: Validated configurations, compatibility checks

---

## 🎨 Design Comparison: Current aitmpl.com vs Stack Builder

### Current aitmpl.com/agents Design

**Layout Structure**:
```
┌─────────────────────────────────────────────────────────────┐
│                      HEADER (ASCII Art)                     │
│  Claude Code Templates | Blog | Discord | GitHub            │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  🤖 agents  ⚡ commands  ⚙️ settings  🪝 hooks  🔌 mcps     │
│                                                             │
├──────────────────────────────┬──────────────────────────────┤
│                              │                              │
│    MAIN CONTENT AREA         │    STACK BUILDER SIDEBAR     │
│    (Component Grid)          │    (Right Side)              │
│                              │                              │
│  [Search Bar]                │  Your Stack:                 │
│  [Sort: Most Downloaded ▼]   │  • 0 agents                  │
│                              │  • 0 mcps                    │
│  ┌──────┐  ┌──────┐          │  • 0 commands                │
│  │ Card │  │ Card │          │                              │
│  │ Logo │  │ Logo │          │  Generated Command:          │
│  │ Name │  │ Name │          │  [Copy] [Share] [Social]     │
│  └──────┘  └──────┘          │                              │
│                              │                              │
│  ┌──────┐  ┌──────┐          │                              │
│  │ Card │  │ Card │          │                              │
│  └──────┘  └──────┘          │                              │
│                              │                              │
└──────────────────────────────┴──────────────────────────────┘
```

**Key Characteristics**:
- ✅ **Static Sidebar**: Stack Builder is always visible on right
- ✅ **Grid Layout**: Components displayed as cards
- ✅ **Simple Selection**: Click to add to stack
- ✅ **Text-Based Output**: Generates CLI command
- ❌ **No Visual Composition**: Can't see how components relate
- ❌ **Limited Configuration**: No forms for API keys/settings
- ❌ **No Preview**: Can't see final .claude/ structure

---

### Proposed Stack Builder Design (Enhanced)

**Layout Structure** (Full-Screen App):
```
┌─────────────────────────────────────────────────────────────────────────┐
│  HEADER: Stack Builder | [Save] [Share] [Export ▼]     [@username]     │
├──────────────┬──────────────────────────────────────────┬───────────────┤
│              │                                          │               │
│  COMPONENT   │         CANVAS AREA                      │  PROPERTIES   │
│  LIBRARY     │       (Drag & Drop Zone)                 │  PANEL        │
│  (Left)      │                                          │  (Right)      │
│              │                                          │               │
│ 🔍 Search    │  ┌────────────────────────────────┐      │ Selected:     │
│              │  │  ┌──────────┐                  │      │ React Agent   │
│ 🤖 Agents    │  │  │  React   │                  │      │               │
│  ☐ React     │  │  │  Agent   │◀─────────────────┼──────┤ Config:       │
│  ☐ Security  │  │  └──────────┘                  │      │ ┌───────────┐ │
│  ☐ Database  │  │       │                        │      │ │ API_KEY   │ │
│              │  │       ▼                        │      │ └───────────┘ │
│ 🔌 MCPs      │  │  ┌──────────┐   ┌──────────┐  │      │               │
│  ☐ GitHub    │  │  │ GitHub   │   │ Supabase │  │      │ Dependencies: │
│  ☐ Supabase  │  │  │   MCP    │   │   MCP    │  │      │ ✓ None        │
│  ☐ Stripe    │  │  └──────────┘   └──────────┘  │      │               │
│              │  │       │               │        │      │ Compatible:   │
│ ⚡ Commands  │  │       └───────┬───────┘        │      │ ✓ All OS      │
│  ☐ Gen Tests │  │               ▼                │      │               │
│  ☐ Optimize  │  │       ┌──────────┐             │      │ [Add to Stack]│
│              │  │       │Generate  │             │      │               │
│ 🪝 Hooks     │  │       │Tests Cmd │             │      │               │
│  ☐ Pre-commit│  │       └──────────┘             │      │               │
│              │  │                                │      │               │
│ + Add Custom │  └───────────────────────────────���┘      │               │
│              │                                          │               │
│              │  [Preview .claude/ Structure]            │               │
└──────────────┴──────────────────────────────────────────┴───────────────┘
```

**Key Enhancements**:
1. ✅ **Visual Canvas**: See component relationships (arrows showing dependencies)
2. ✅ **Drag & Drop**: Intuitive interaction (grab components from left, drop on canvas)
3. ✅ **Configuration Forms**: Right panel with input fields for API keys
4. ✅ **Dependency Visualization**: Arrows/lines connecting dependent components
5. ✅ **Live Validation**: Real-time compatibility checking (red highlight if incompatible)
6. ✅ **Preview Mode**: Toggle to see generated .claude/ folder structure
7. ✅ **Multiple Export Options**: ZIP, CLI command, Git template, DeepLink

---

## 🔄 User Flow Comparison

### Current aitmpl.com Flow

**Discovery → Selection → Installation** (Linear, 3 steps)

```
Step 1: BROWSE
User visits /agents
├─ Sees grid of component cards
├─ Uses search bar to filter
└─ Clicks "View All" to see more

Step 2: SELECT
User clicks component card
├─ Component auto-adds to sidebar
├─ Sidebar shows count (e.g., "3 agents")
└─ Generated command updates

Step 3: INSTALL
User copies CLI command
├─ Opens terminal
├─ Pastes command
├─ Runs npx claude-code-templates@latest --agents=X --mcps=Y
└─ Components installed
```

**Strengths**:
- ✅ Simple, 3-step flow
- ✅ Fast for experienced users
- ✅ CLI-first (developer-friendly)

**Weaknesses**:
- ❌ No configuration preview before install
- ❌ Can't see component dependencies
- ❌ No API key setup guidance
- ❌ Manual .env configuration needed post-install

---

### Stack Builder Flow

**Discovery → Compose → Configure → Export** (Visual, 4 steps)

```
Step 1: DISCOVER (Component Library - Left Sidebar)
User opens Stack Builder
├─ Browses categorized components (Agents, MCPs, Commands)
├─ Uses search to find "React" → Sees React Agent, React Testing MCP
├─ Clicks component to see details in Properties Panel
└─ Drags component to canvas

Step 2: COMPOSE (Canvas - Center)
User arranges components visually
├─ Drags "React Agent" to canvas
├─ Drags "GitHub MCP" below it
├─ System auto-draws dependency arrow (React Agent → GitHub MCP)
├─ Adds "Generate Tests Command"
└─ Canvas shows visual stack structure

Step 3: CONFIGURE (Properties Panel - Right)
User clicks each component to configure
├─ Selects "GitHub MCP"
├─ Properties panel shows:
│   ├─ Required: GITHUB_TOKEN (input field)
│   ├─ Optional: GITHUB_ORG (input field)
│   └─ Help: "Get token from github.com/settings/tokens"
├─ User enters GITHUB_TOKEN (or uses placeholder {{GITHUB_TOKEN}})
├─ Validation: ✓ Token format correct
└─ Repeat for all components requiring config

Step 4: EXPORT (Multiple Options)
User clicks "Export" dropdown
├─ Option A: Download ZIP
│   └─ Gets .claude/ folder + README with setup instructions
├─ Option B: Copy CLI Command
│   └─ Gets: npx claude-code-templates@latest --stack=abc123
├─ Option C: Generate Git Template
│   └─ Gets: GitHub repo URL to clone
└─ Option D: Share Stack
    └─ Gets: Public URL to share stack with team
```

**Strengths**:
- ✅ Visual understanding of stack architecture
- ✅ Guided configuration (forms prevent errors)
- ✅ Dependency validation (warns if incompatible)
- ✅ Multiple export formats (suits different workflows)
- ✅ Shareable stacks (team collaboration)

**Weaknesses**:
- ❌ More steps (4 vs 3)
- ❌ Requires more UI complexity
- ❌ Steeper learning curve for first-time users

---

## 🎨 Visual Design: Side-by-Side

### Current aitmpl.com (Minimalist, CLI-First)

**Design Philosophy**: Terminal aesthetic, text-heavy, fast

```
┌────────────────────────────────┐
│  Search components             │
├────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │ 💼   │  │ 🔒   │  │ 🎨   │ │
│  │ Corp │  │ Auth │  │ UI   │ │
│  │ Agent│  │ Agent│  │ Agent│ │
│  └──────┘  └──────┘  └──────┘ │
│                                │
│  ┌──────┐  ┌──────┐  ┌──────┐ │
│  │ 📊   │  │ 🧪   │  │ 🌐   │ │
│  │ Data │  │ Test │  │ API  │ │
│  │ Agent│  │ Agent│  │ Agent│ │
│  └──────┘  └──────┘  └──────┘ │
└────────────────────────────────┘
```

**Visual Elements**:
- Emoji icons (🤖, ⚡, 🔌)
- Card-based grid layout
- Clean typography (Inter or similar)
- Generous white space
- Monospace code snippets

---

### Stack Builder (Rich, Visual, Interactive)

**Design Philosophy**: Design tool aesthetic, drag-and-drop, visual feedback

```
CANVAS (Interactive Workspace)
┌─────────────────────────────────────────────┐
│                                             │
│        ┏━━━━━━━━━━━━━┓                      │
│        ┃  React Agent ┃  ⬅️ Draggable      │
│        ┗━━━━━━━━━━━━━┛                      │
│               │                             │
│               │ (Dependency Arrow)          │
│               ▼                             │
│        ┏━━━━━━━━━━━━━┓                      │
│        ┃  GitHub MCP  ┃                     │
│        ┗━━━━━━━━━━━━━┛                      │
│               │                             │
│               │                             │
│               ▼                             │
│        ┏━━━━━━━━━━━━━━━┓                    │
│        ┃ Generate Tests ┃                   │
│        ┗━━━━━━━━━━━━━━━┘                    │
│                                             │
│  [Drop components here or click + to add]  │
│                                             │
└─────────────────────────────────────────────┘
```

**Visual Elements**:
- Drag handles (⋮⋮ icon on components)
- Connection lines/arrows (SVG paths)
- Hover states (shadow, highlight)
- Validation indicators (✓ green, ⚠️ yellow, ❌ red)
- Smooth animations (drag, drop, expand/collapse)
- Color-coded categories:
  - Agents: Blue
  - MCPs: Purple
  - Commands: Green
  - Hooks: Orange
  - Settings: Gray

---

## 🧩 Component Representation

### Current aitmpl.com: Simple Cards

```
┌────────────────────┐
│   🎨 LOGO/ICON     │
│                    │
│  Component Name    │
│  Brief description │
│  that explains it  │
│                    │
│  [Add to Stack] →  │
└────────────────────┘
```

**Information Displayed**:
- Icon/emoji
- Name
- 1-2 sentence description
- Implicit "click to add" action

---

### Stack Builder: Rich Component Nodes

```
┌──────────────���─────────────────┐
│  ⋮⋮  React Agent         ⚙️    │  ⬅️ Drag handle | Settings icon
├────────────────────────────────┤
│  ⚛️  Frontend Development      │  ⬅️ Icon | Category
├────────────────────────────────┤
│  Dependencies: None            │  ⬅️ Compatibility info
│  Requires: None                │
│  Compatible: ✓ All OS          │
└────────────────────────────────┘
    │
    │ (Connecting line to next component)
    ▼
```

**Information Displayed**:
- Drag handle (⋮⋮)
- Component name
- Category icon + label
- Dependencies list
- Requirements (API keys, env vars)
- Compatibility badges
- Configuration status (✓ configured, ⚠️ needs config, ❌ error)
- Connection ports (dots for dragging arrows)

---

## 🔧 Configuration Experience

### Current: Post-Installation Manual Setup

**After running CLI command**:
```bash
npx claude-code-templates@latest --agents=react --mcps=github
```

**User must**:
1. Open `.env` file manually
2. Read component docs to find required vars
3. Add: `GITHUB_TOKEN=your_token_here`
4. Repeat for each component
5. Test to see if anything breaks

**Pain Points**:
- ❌ Trial and error (what's required?)
- ❌ Documentation hunting (where do I get this token?)
- ❌ No validation (typo in var name = broken setup)

---

### Stack Builder: Guided Configuration Wizard

**During Stack Building** (Properties Panel):

```
┌────────────────────────────────────┐
│  GitHub MCP Configuration          │
├────────────────────────────────────┤
│                                    │
│  GITHUB_TOKEN * (Required)         │
│  ┌──────────────────────────────┐  │
│  │ ghp_xxxxxxxxxxxxxxxxxxxx     │  │
│  └──────────────────────────────┘  │
│  ℹ️ Get token from:                │
│  github.com/settings/tokens        │
│  Permissions needed: repo, read    │
│                                    │
│  GITHUB_ORG (Optional)             │
│  ┌──────────────────────────────┐  │
│  │ my-organization              │  │
│  └──────────────────────────────┘  │
│                                    │
│  [Test Connection] ✓ Connected     │
│                                    │
└────────────────────────────────────┘
```

**Features**:
- ✅ Inline help text (explains where to get tokens)
- ✅ Validation (checks token format)
- ✅ Test button (verifies connection)
- ✅ Visual feedback (✓ green when valid)
- ✅ Placeholder templates ({{GITHUB_TOKEN}} for team sharing)

---

## 📤 Export Options Comparison

### Current: Single Export Method

**What you get**:
```bash
# CLI command (copy to clipboard)
npx claude-code-templates@latest \
  --agents=react,security \
  --mcps=github,supabase \
  --commands=generate-tests
```

**User must then**:
1. Run command in terminal
2. Manually create .env file
3. Configure each component
4. Test setup

---

### Stack Builder: Multi-Format Export

**Option 1: ZIP Download**
```
📦 my-stack.zip
├── .claude/
│   ├── agents/
│   │   ├── react-specialist.json
│   │   └── security-auditor.json
│   ├── mcps/
│   │   ├── github.json
│   │   └── supabase.json
│   └── commands/
│       └── generate-tests.json
├── .env.example  (with all required vars)
├── README.md     (setup instructions)
└── setup.sh      (automated setup script)
```

**Option 2: CLI Install Command**
```bash
# Single command install with stack ID
npx claude-code-templates@latest --stack=abc123

# Auto-downloads stack configuration
# Prompts for required env vars interactively
# Validates configuration
# Ready to use in 30 seconds
```

**Option 3: Git Template**
```bash
# Creates GitHub repo with stack configuration
git clone https://github.com/organized-ai/stack-abc123.git
cd stack-abc123
npm install
# Follow README.md for setup
```

**Option 4: Share URL**
```
https://aitmpl.com/stack/abc123

# Others can:
# - View your stack composition
# - Clone to their Stack Builder
# - Modify and create variants
# - Upvote if helpful
```

---

## 🎯 Use Case Scenarios

### Scenario 1: Solo Developer, New to Claude Code

**Current aitmpl.com**:
1. Browses /agents → Overwhelmed by choices
2. Reads docs to understand what each agent does
3. Guesses which agents work well together
4. Runs CLI → Installs 5 agents
5. Gets errors (incompatible combination)
6. Uninstalls, tries again
7. **Time**: 45 minutes

**Stack Builder**:
1. Opens Stack Builder → Sees empty canvas
2. Searches "web development" → Suggested stacks appear
3. Clicks "Full-Stack Web App" template
4. Sees pre-composed stack (React Agent + Supabase MCP + GitHub MCP)
5. Fills in API keys via guided forms
6. Clicks "Export ZIP" → Downloads configured setup
7. Unzips, runs, ready to code
8. **Time**: 10 minutes

---

### Scenario 2: Team Lead, Standardizing Setup

**Current aitmpl.com**:
1. Manually writes doc with install commands
2. Team members copy-paste commands
3. Each person configures .env differently
4. Inconsistent setups → bugs
5. Debug configuration mismatches
6. **Time**: 2 hours (team-wide)

**Stack Builder**:
1. Team lead builds stack in Stack Builder
2. Configures with placeholder values ({{API_KEY}})
3. Clicks "Share Stack" → Gets URL
4. Sends URL to team
5. Team clicks "Use This Stack" → Clone to their Builder
6. Each person fills in their API keys
7. Export → Everyone has identical setup
8. **Time**: 20 minutes (team-wide)

---

### Scenario 3: Contributor, Discovering Your Agent

**Current aitmpl.com**:
1. Submits agent to marketplace
2. Agent appears in grid with others
3. Users must read full docs to understand value
4. Low discovery (lost in grid of 100+ components)

**Stack Builder**:
1. Submits agent with metadata (dependencies, compatible MCPs)
2. Agent appears in Component Library
3. When dragged to canvas, Stack Builder suggests:
   - "This works well with GitHub MCP"
   - "Users who added this also use Testing Command"
4. Visual canvas shows how agent fits into workflows
5. Higher discovery (suggestions surface your agent)

---

## 🚀 Technical Architecture Preview

### Data Flow

```
User Action               Stack Builder                API/Backend
───────────               ─────────────                ───────────

[Drag Component] ────────▶ updateCanvas() ────────▶ (Client-side only)
                          ├─ Validate compatibility
                          ├─ Draw connection lines
                          └─ Update properties panel

[Configure Field] ───────▶ updateConfig() ─────────▶ (localStorage save)
                          ├─ Validate input
                          ├─ Test connection (if API)
                          └─ Mark component as configured

[Export ZIP] ────────────▶ generateStack() ────────▶ POST /api/stacks
                          ├─ Bundle .claude/ files      │
                          ├─ Create .env.example        │
                          ├─ Generate README            ▼
                          └─ Download ZIP          [Save to DB]
                                                   [Return stack ID]

[Share Stack] ───────────▶ shareStack() ───────────▶ POST /api/stacks/share
                          └─ Get shareable URL         │
                                                       ▼
                                                   [Create public record]
                                                   [Return: aitmpl.com/stack/abc123]
```

### Key Technologies

**Frontend**:
- **React**: Component-based UI
- **React DnD** or **dnd-kit**: Drag-and-drop functionality
- **React Flow** or **Xyflow**: Canvas with nodes and edges
- **Tailwind CSS + shadcn/ui**: Styling and components
- **Zustand** or **Jotai**: State management (canvas state, selected components)
- **Zod**: Configuration validation

**Backend** (Lightweight):
- **Next.js API Routes** or **Vercel Serverless**: API endpoints
- **Supabase**: Database for shared stacks, user auth
- **Redis** (optional): Caching component metadata

**Data Storage**:
- **localStorage**: Auto-save in-progress stacks (client-side)
- **PostgreSQL** (Supabase): Shared/public stacks
- **Static JSON**: Component metadata (cached CDN)

---

## 📊 Comparison Summary Table

| Feature | Current aitmpl.com | Stack Builder |
|---------|-------------------|---------------|
| **Component Discovery** | Grid + Search | Grid + Search + Visual Canvas |
| **Configuration** | Post-install manual | Pre-export guided forms |
| **Dependency Visualization** | ❌ None | ✅ Visual arrows/connections |
| **Validation** | ❌ Runtime errors | ✅ Pre-export checks |
| **Export Formats** | 1 (CLI command) | 4 (ZIP, CLI, Git, Share) |
| **Team Collaboration** | ❌ Copy/paste commands | ✅ Shareable stack URLs |
| **Learning Curve** | ⚡ Fast (3 clicks) | 🎓 Moderate (4 steps) |
| **Setup Time** | 30-60 min | 5-10 min |
| **Error Prevention** | ❌ Trial and error | ✅ Guided validation |
| **Mobile Experience** | ✅ Works well | 🤔 Read-only (tablet OK) |
| **Developer Focus** | Terminal-first | Visual-first |

---

## 🎓 Why Stack Builder is a Game-Changer

### 1. **Lowers Barrier to Entry**
- New Claude Code users can build production-ready setups without reading docs
- Visual composition is intuitive (like building with Lego blocks)
- Guided configuration prevents common mistakes

### 2. **Accelerates Experienced Users**
- Drag-and-drop is faster than typing commands
- Pre-built templates for common use cases (web app, API, data pipeline)
- Share stacks across teams (no more "it works on my machine")

### 3. **Drives Component Discovery**
- Visual canvas surfaces related components (suggestions)
- Dependency visualization shows "this works well with that"
- Community-shared stacks promote best practices

### 4. **Enables New Use Cases**
- **Marketplace Creators**: Sell pre-configured stacks (e.g., "Stripe Integration Stack - $49")
- **Consultants**: Deliver client setups as shareable Stack Builder URLs
- **Educators**: Create learning paths (beginner → intermediate → advanced stacks)
- **Enterprise**: Mandate compliance stacks (security, audit, monitoring agents)

---

`★ Insight ─────────────────────────────────────`
**Design Philosophy Difference**:

**Current aitmpl.com** = **Command Line Power User**
- Fast, text-based, CLI-first
- Assumes user knows what they want
- Low friction for experts
- High friction for beginners

**Stack Builder** = **Visual Composition Studio**
- Exploratory, visual, GUI-first
- Guides user to discover possibilities
- Higher friction initially (more steps)
- **But**: Much lower error rate, faster time-to-production

**The key insight**: Stack Builder isn't replacing the current marketplace - it's **augmenting** it. Power users can still use CLI. Visual learners get a GUI. Both export to the same `.claude/` format, so they're **interoperable**.

Think of it like: **npm CLI vs npm website** - both serve the same ecosystem, different interaction models.
`─────────────────────────────────────────────────`

---

## 🎬 Recommended Implementation Strategy

### Phase 1: MVP Stack Builder (Week 3-4)
- ✅ Basic drag-and-drop canvas (React Flow)
- ✅ Component library sidebar (static list)
- ✅ Properties panel (read-only initially)
- ✅ Export as ZIP (no configuration yet)

### Phase 2: Configuration & Validation (Week 5-6)
- ✅ Add configuration forms in properties panel
- ✅ Implement dependency validation
- ✅ Add "Test Connection" for MCPs
- ✅ localStorage auto-save

### Phase 3: Sharing & Templates (Week 7-8)
- ✅ Share stack via URL
- ✅ Public stack gallery
- ✅ Pre-built templates (3-5 stacks)
- ✅ Upvote/downvote system

### Phase 4: Polish & Advanced (Week 9-10)
- ✅ Mobile-responsive (tablet support)
- ✅ Keyboard shortcuts (power users)
- ✅ Undo/redo
- ✅ Version history for shared stacks

---

**Ready to design the architecture?** Let me know if you want me to create the `03-architecture.md` document with these concepts, or if you have questions about the Stack Builder design! 🚀
