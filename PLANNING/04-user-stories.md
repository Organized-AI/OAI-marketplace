# User Stories

## Overview
*This document contains user stories for the Organized AI Marketplace, focusing on the Stack Builder visual component composer and marketplace features. Stories are organized by epics, with acceptance criteria, definition of done, and MoSCoW prioritization (Must Have, Should Have, Could Have, Won't Have).*

## Story Writing Guidelines

### Format
**As a** [type of user]
**I want** [some goal or functionality]
**So that** [some reason/value/benefit]

### Story Sizes
- **Epic**: Large feature that spans multiple sprints (>13 story points)
- **Story**: Can be completed in one sprint (1-13 story points)
- **Task**: Technical work that supports a story
- **Spike**: Research or investigation work

### MoSCoW Prioritization
- **Must Have**: Core MVP features (Phase 1 - Weeks 3-5)
- **Should Have**: Important features for launch (Phase 1 - Weeks 6-8)
- **Could Have**: Nice-to-have features (Phase 2 - Post-launch)
- **Won't Have**: Out of scope for current release

---

## Epic 1: Stack Builder - Visual Component Composer

### Priority: CRITICAL | Estimated Effort: 80 hours (Weeks 3-8) | Sprint: 1-3

*The Stack Builder is the flagship feature: a visual, drag-and-drop interface for composing Claude Code configurations. Think Figma for AI development environments.*

---

#### Story 1.1: Browse Available Components in Library
**As a** developer exploring Claude Code components
**I want** to see a categorized library of agents, MCPs, commands, hooks, and settings
**So that** I can discover what components are available before adding them to my stack

**Acceptance Criteria:**
- [ ] Left sidebar displays component categories (🤖 Agents, 🔌 MCPs, ⚡ Commands, 🪝 Hooks, ⚙️ Settings)
- [ ] Each category is collapsible/expandable
- [ ] Components show icon, name, and short description (truncated to 80 chars)
- [ ] Search bar at top filters components by name or description
- [ ] Hover tooltip shows full description and metadata (downloads, rating)
- [ ] Components are sorted by popularity (downloads) by default
- [ ] Empty state shown when no components match search

**Definition of Done:**
- [ ] Component library renders from API data (`/api/components`)
- [ ] Search/filter logic works client-side (instant feedback)
- [ ] Accessibility: keyboard navigation through component list
- [ ] Loading state shown while fetching components
- [ ] Error handling for failed API requests
- [ ] Responsive design: sidebar collapses to drawer on mobile

**Story Points**: 5 | **Priority**: Must Have | **Sprint**: 1

---

#### Story 1.2: Drag Component to Canvas
**As a** developer building a stack
**I want** to drag a component from the library onto the canvas
**So that** I can visually compose my Claude Code configuration

**Acceptance Criteria:**
- [ ] Components are draggable from left sidebar
- [ ] Cursor changes to "grab" icon when hovering over draggable component
- [ ] Canvas shows drop zone highlight when dragging
- [ ] Component appears on canvas at drop location with smooth animation
- [ ] Each component has unique ID to allow multiple instances (e.g., two GitHub MCPs with different configs)
- [ ] Canvas supports zoom (mouse wheel) and pan (click-drag background)
- [ ] Grid snapping optional (toggle in settings)
- [ ] Undo/redo support for add/remove actions

**Technical Implementation:**
```typescript
// Use @xyflow/react for canvas
import { ReactFlow, Node, Edge, useNodesState, useEdgesState } from '@xyflow/react';
import { useStackBuilderStore } from '@/stores/stack-builder';

const onDrop = (event: DragEvent) => {
  const componentData = JSON.parse(event.dataTransfer.getData('component'));
  const position = {
    x: event.clientX - canvasRect.left,
    y: event.clientY - canvasRect.top
  };

  const newNode: Node = {
    id: `${componentData.id}-${Date.now()}`,
    type: componentData.type, // 'agent', 'mcp', 'command', 'hook', 'setting'
    position,
    data: {
      ...componentData,
      config: {} // Initialize empty config
    }
  };

  addNode(newNode);
};
```

**Definition of Done:**
- [ ] Drag-and-drop works smoothly on desktop (Chrome, Firefox, Safari)
- [ ] Canvas performance tested with 50+ components
- [ ] Touch support for mobile/tablet (long press to drag)
- [ ] Canvas state persists to localStorage (auto-save every 5 seconds)
- [ ] Keyboard shortcuts: Cmd/Ctrl+Z (undo), Cmd/Ctrl+Y (redo)
- [ ] Unit tests for addNode, removeNode, updateNode actions

**Story Points**: 8 | **Priority**: Must Have | **Sprint**: 1

---

#### Story 1.3: View Component Details Panel
**As a** developer who added a component to the canvas
**I want** to see detailed information about the component
**So that** I understand what it does and what dependencies it has

**Acceptance Criteria:**
- [ ] Clicking a component on canvas selects it (highlighted border)
- [ ] Right sidebar shows component details panel when component is selected
- [ ] Details panel displays:
  - Component name and icon
  - Full description (markdown support)
  - Author and GitHub repository link
  - Installation stats (downloads, stars)
  - Dependencies (other components required)
  - Compatible Claude models
  - Example usage (code snippet)
- [ ] "Remove from Canvas" button at bottom of panel
- [ ] Panel is scrollable if content overflows
- [ ] Clicking canvas background deselects component and hides panel

**Definition of Done:**
- [ ] Details panel renders markdown descriptions correctly
- [ ] Links to external repos open in new tab
- [ ] Dependencies are hyperlinks (clicking jumps to that component if on canvas)
- [ ] Panel animates in/out smoothly (slide from right)
- [ ] Responsive: panel becomes bottom sheet on mobile
- [ ] Accessibility: focus management when panel opens/closes

**Story Points**: 5 | **Priority**: Must Have | **Sprint**: 1

---

#### Story 1.4: Configure Component (Interactive Form)
**As a** developer customizing my stack
**I want** to configure component-specific settings (API keys, parameters)
**So that** the exported configuration works with my environment

**Acceptance Criteria:**
- [ ] Details panel shows "Configuration" tab (next to "Details" tab)
- [ ] Configuration form dynamically renders based on component schema
- [ ] Supported field types:
  - Text input (for API keys, URLs)
  - Number input (for timeouts, limits)
  - Select dropdown (for enums like model selection)
  - Checkbox (for boolean flags)
  - File upload (for credentials.json, etc.)
- [ ] Sensitive fields (API keys) have show/hide toggle (eye icon)
- [ ] Placeholder text shows example values
- [ ] Required fields marked with asterisk
- [ ] Validation errors shown inline (red text below field)
- [ ] "Save Configuration" button at bottom of form
- [ ] Changes auto-save to canvas state (Zustand store)

**Example Schema (JSON Schema-like)**:
```typescript
{
  "componentId": "github-mcp",
  "config": {
    "GITHUB_TOKEN": {
      "type": "string",
      "required": true,
      "sensitive": true,
      "description": "GitHub Personal Access Token with repo scope",
      "placeholder": "ghp_xxxxxxxxxxxxxxxxxxxx"
    },
    "DEFAULT_BRANCH": {
      "type": "string",
      "required": false,
      "default": "main",
      "description": "Default branch for repository operations"
    },
    "ENABLE_WEBHOOKS": {
      "type": "boolean",
      "default": false,
      "description": "Enable webhook integration for real-time updates"
    }
  }
}
```

**Definition of Done:**
- [ ] Form validation using Zod schema
- [ ] Configuration persists to localStorage (auto-save)
- [ ] File uploads stored as base64 in config (or uploaded to temporary storage)
- [ ] Form accessibility: proper labels, error announcements
- [ ] Unit tests for form validation logic
- [ ] Visual indicator on canvas node when configuration is incomplete (yellow warning icon)

**Story Points**: 8 | **Priority**: Must Have | **Sprint**: 2

---

#### Story 1.5: Export Stack as ZIP File
**As a** developer who finished building my stack
**I want** to download a ZIP file with all configuration files
**So that** I can install it in my local Claude Code environment

**Acceptance Criteria:**
- [ ] "Export Stack" button in top-right toolbar
- [ ] Export opens dialog with options:
  - Stack name (required)
  - Description (optional)
  - Include README.md (checkbox, default true)
  - Include .env.example (checkbox, default true)
- [ ] ZIP file contains:
  - `.claude/` folder with agent/command/hook/setting files
  - `mcp_config.json` with MCP configurations
  - `.env.example` with placeholder values for API keys
  - `README.md` with installation instructions
  - `package.json` (if MCPs require npm packages)
- [ ] Sensitive values replaced with `{{USER_INPUT}}` placeholders in .env.example
- [ ] ZIP downloads with filename: `{stack-name}-{timestamp}.zip`
- [ ] Success toast notification after download

**Technical Implementation:**
```typescript
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

async function generateZip(stack: Stack): Promise<Blob> {
  const zip = new JSZip();

  // Add agent files
  stack.components.agents.forEach(agent => {
    zip.file(`.claude/agents/${agent.name}.md`, agent.content);
  });

  // Add MCP config
  const mcpConfig = {
    mcpServers: stack.components.mcps.reduce((acc, mcp) => {
      acc[mcp.name] = {
        command: mcp.command,
        args: mcp.args,
        env: sanitizeEnv(mcp.env) // Replace secrets with placeholders
      };
      return acc;
    }, {})
  };
  zip.file('mcp_config.json', JSON.stringify(mcpConfig, null, 2));

  // Generate README
  const readme = generateReadme(stack);
  zip.file('README.md', readme);

  return await zip.generateAsync({ type: 'blob' });
}
```

**Definition of Done:**
- [ ] Exported ZIP installs correctly in Claude Code (manual testing)
- [ ] README includes step-by-step setup instructions
- [ ] File structure matches Claude Code conventions
- [ ] Sensitive data never included in export (validate with security review)
- [ ] Works on all browsers (Chrome, Firefox, Safari, Edge)
- [ ] Error handling for empty stacks (show warning dialog)

**Story Points**: 8 | **Priority**: Must Have | **Sprint**: 2

---

#### Story 1.6: Save Draft to Local Storage (Auto-Save)
**As a** developer working on a complex stack
**I want** my work to be automatically saved
**So that** I don't lose progress if I accidentally close the browser

**Acceptance Criteria:**
- [ ] Canvas state (nodes, edges, configurations) auto-saves every 5 seconds
- [ ] Draft saved to localStorage with key: `stack-builder-draft-{userId}`
- [ ] On page load, check for existing draft and show "Restore Draft" banner if found
- [ ] Banner shows timestamp of last save (e.g., "Draft saved 2 minutes ago")
- [ ] User can click "Restore" to load draft or "Discard" to start fresh
- [ ] Draft persists across browser sessions
- [ ] Draft is cleared after successful export or explicit "New Stack" action
- [ ] Visual indicator in UI showing last save time (e.g., "Saved at 3:45 PM")

**Definition of Done:**
- [ ] Zustand persist middleware configured correctly
- [ ] localStorage quota handling (show error if storage full)
- [ ] Restore draft animation (fade in components)
- [ ] Unit tests for save/restore logic
- [ ] Works in private/incognito mode (graceful fallback if localStorage blocked)
- [ ] Accessibility: banner announcement for screen readers

**Story Points**: 5 | **Priority**: Must Have | **Sprint**: 2

---

#### Story 1.7: Connect Components with Dependency Arrows
**As a** developer visualizing my stack architecture
**I want** to draw arrows between components that depend on each other
**So that** I can see the relationships and understand the flow

**Acceptance Criteria:**
- [ ] Clicking a component shows connection handles (small circles on edges)
- [ ] Dragging from source handle to target handle creates arrow (edge)
- [ ] Arrows are directional (arrow head points to dependent component)
- [ ] Arrow styles:
  - Solid line: Required dependency
  - Dashed line: Optional integration
- [ ] Hovering arrow shows tooltip with relationship description
- [ ] Arrows automatically route around other components (smart pathfinding)
- [ ] Deleting a component also deletes connected arrows
- [ ] Clicking arrow selects it (changes color, shows delete button)

**Definition of Done:**
- [ ] Arrows render smoothly with React Flow's edge rendering
- [ ] Custom edge types for solid/dashed styles
- [ ] Pathfinding avoids overlapping nodes (configurable)
- [ ] Accessibility: arrow relationships announced to screen readers
- [ ] Performance tested with 50+ components and 100+ edges
- [ ] Undo/redo support for add/remove edge actions

**Story Points**: 8 | **Priority**: Should Have | **Sprint**: 2

---

#### Story 1.8: Share Stack via Public URL
**As a** developer who built an amazing stack
**I want** to share a public link to my stack
**So that** others can view, upvote, and clone my configuration

**Acceptance Criteria:**
- [ ] "Share Stack" button in toolbar (next to Export)
- [ ] Clicking opens dialog with privacy options:
  - Public (anyone with link can view)
  - Unlisted (only people with link can view, not shown in marketplace)
  - Private (only you can view)
- [ ] After confirming, stack is saved to database (Supabase)
- [ ] User receives shareable URL: `aitmpl.com/stack/{stackId}`
- [ ] URL copied to clipboard automatically (with toast notification)
- [ ] Share dialog shows social media buttons (Twitter, LinkedIn, Reddit)
- [ ] Stack metadata saved: name, description, author, component list, screenshot (canvas thumbnail)

**Definition of Done:**
- [ ] API endpoint `/api/stacks` (POST) saves stack to database
- [ ] Stack ID generated as short, URL-safe string (nanoid)
- [ ] Database schema includes privacy settings
- [ ] Shared stacks are read-only (viewers can clone but not edit original)
- [ ] Rate limiting: max 10 shares per user per day
- [ ] Security: sanitize user-provided data (XSS prevention)

**Story Points**: 8 | **Priority**: Should Have | **Sprint**: 3

---

#### Story 1.9: Clone Shared Stack to Edit
**As a** developer who found a useful shared stack
**I want** to clone it to my own workspace
**So that** I can customize it for my needs

**Acceptance Criteria:**
- [ ] Shared stack page shows "Clone to My Workspace" button
- [ ] Clicking button copies stack data to user's local draft
- [ ] User is redirected to Stack Builder with cloned stack loaded
- [ ] Cloned stack is independent (editing doesn't affect original)
- [ ] Toast notification confirms: "Stack cloned successfully. You can now edit it."
- [ ] Original author credited in stack metadata (not visible in UI but tracked in DB)
- [ ] Clone count incremented on original stack

**Definition of Done:**
- [ ] API endpoint `/api/stacks/{id}/clone` (POST)
- [ ] Clone count displayed on shared stack page
- [ ] Attribution tracked in database
- [ ] Unit tests for clone logic
- [ ] Works for both logged-in and anonymous users (anonymous = localStorage only)

**Story Points**: 5 | **Priority**: Should Have | **Sprint**: 3

---

#### Story 1.10: Generate CLI Installation Command
**As a** developer who prefers terminal workflows
**I want** to generate a one-line CLI command to install my stack
**So that** I can skip manual configuration and install with a single command

**Acceptance Criteria:**
- [ ] "Generate CLI Command" button in export options
- [ ] Generated command format:
  ```bash
  npx claude-code-templates@latest install-stack https://aitmpl.com/stack/abc123
  ```
- [ ] Command includes flags for customization:
  - `--yes` (skip confirmation prompts)
  - `--config={path}` (specify custom config directory)
  - `--dry-run` (show what would be installed without installing)
- [ ] Command copied to clipboard with one click
- [ ] Tooltip shows "Requires npx or npm 7+" (installation note)

**Definition of Done:**
- [ ] CLI command syntax validated (actually works when run)
- [ ] Documentation updated with CLI installation guide
- [ ] Error handling for unsupported npm versions
- [ ] CLI tool updated to support `install-stack` subcommand

**Story Points**: 5 | **Priority**: Could Have | **Sprint**: 3

---

#### Story 1.11: Visual Validation Warnings
**As a** developer building a stack
**I want** to see warnings if my configuration has issues
**So that** I can fix problems before exporting

**Acceptance Criteria:**
- [ ] Validation runs automatically after each change (debounced 500ms)
- [ ] Warning types:
  - Missing required configuration fields (yellow badge on node)
  - Incompatible component combinations (e.g., duplicate conflicting agents)
  - Missing dependencies (MCP requires npm package not installed)
  - Security issues (API key hardcoded instead of placeholder)
- [ ] Warnings panel in bottom of screen (collapsible)
- [ ] Clicking warning highlights problematic component on canvas
- [ ] Export button disabled if critical errors exist (only warnings = still allowed)
- [ ] "Fix All" button attempts auto-remediation (e.g., add missing dependencies)

**Definition of Done:**
- [ ] Validation rules defined in JSON schema
- [ ] Validation runs without blocking UI (async)
- [ ] Unit tests for each validation rule
- [ ] Accessibility: warnings announced to screen readers
- [ ] Performance: validation completes in <100ms for typical stack

**Story Points**: 8 | **Priority**: Should Have | **Sprint**: 3

---

#### Story 1.12: Mobile-Optimized Stack Builder
**As a** developer working on my tablet/phone
**I want** the Stack Builder to work on touch devices
**So that** I can design stacks on the go

**Acceptance Criteria:**
- [ ] Responsive layout: sidebar becomes bottom drawer on mobile
- [ ] Touch gestures:
  - Pinch to zoom canvas
  - Two-finger pan to move canvas
  - Long press component to drag
  - Tap to select, double-tap to open config
- [ ] Larger tap targets (minimum 44x44px per iOS guidelines)
- [ ] Mobile-friendly component library (swipeable categories)
- [ ] Configuration forms use native mobile inputs (date picker, etc.)
- [ ] Simplified toolbar for small screens (hamburger menu)

**Definition of Done:**
- [ ] Tested on iOS Safari, Chrome Android, Samsung Internet
- [ ] Performance: 60 FPS scrolling and zooming on mid-range devices
- [ ] Accessibility: zoom text doesn't break layout
- [ ] Landscape and portrait orientations supported
- [ ] PWA-ready (installable on home screen)

**Story Points**: 13 | **Priority**: Could Have | **Phase**: 2 (Post-Launch)

---

## Epic 2: Component Marketplace

### Priority: HIGH | Estimated Effort: 40 hours (Weeks 3-6) | Sprint: 1-2

*The marketplace is where developers discover, browse, and search for Claude Code components before adding them to the Stack Builder.*

---

#### Story 2.1: Browse Components by Category
**As a** developer looking for specific functionality
**I want** to browse components by category (Agents, MCPs, Commands, etc.)
**So that** I can quickly find relevant components

**Acceptance Criteria:**
- [ ] Homepage shows category tiles (🤖 Agents, 🔌 MCPs, ⚡ Commands, 🪝 Hooks, ⚙️ Settings, 🎯 Skills)
- [ ] Clicking category navigates to `/marketplace/{category}`
- [ ] Category page shows grid of component cards (responsive: 1-3-4 columns based on screen size)
- [ ] Each card shows: icon, name, short description, author, downloads, rating
- [ ] Pagination or infinite scroll (load 20 components at a time)
- [ ] Sort options: Popularity, Newest, Most Downloaded, Highest Rated
- [ ] Filter sidebar: Compatible Models, Tags, License

**Definition of Done:**
- [ ] Category pages render from API (`/api/components?category=agents`)
- [ ] Responsive grid works on all device sizes
- [ ] Loading skeleton while fetching data
- [ ] Empty state for categories with no components
- [ ] Accessibility: keyboard navigation, ARIA labels

**Story Points**: 5 | **Priority**: Must Have | **Sprint**: 1

---

#### Story 2.2: Search Components Across All Categories
**As a** developer with a specific use case
**I want** to search for components by keyword
**So that** I can find exactly what I need regardless of category

**Acceptance Criteria:**
- [ ] Global search bar in top navigation
- [ ] Search suggestions appear as user types (autocomplete)
- [ ] Search results page shows matching components with highlighted keywords
- [ ] Filters apply to search results (category, tags, rating)
- [ ] Search supports:
  - Partial matches (e.g., "git" matches "GitHub MCP")
  - Synonyms (e.g., "database" matches "PostgreSQL", "Supabase")
  - Tags (e.g., "security" matches all security-related components)
- [ ] Search results ranked by relevance (TF-IDF or similar algorithm)
- [ ] "No results" page suggests related components or "Submit a Request"

**Definition of Done:**
- [ ] API endpoint `/api/components/search?q={query}`
- [ ] Search indexed in database (PostgreSQL full-text search or Algolia)
- [ ] Search performance: <200ms for typical queries
- [ ] Unit tests for search ranking algorithm
- [ ] Accessibility: search form properly labeled

**Story Points**: 8 | **Priority**: Must Have | **Sprint**: 1

---

#### Story 2.3: View Component Detail Page
**As a** developer evaluating a component
**I want** to see comprehensive details about the component
**So that** I can decide if it fits my needs

**Acceptance Criteria:**
- [ ] Component detail page at `/marketplace/{category}/{component-id}`
- [ ] Page sections:
  - Header: Name, icon, author, GitHub stars, downloads
  - Description: Full markdown documentation
  - Installation: CLI command + Stack Builder button ("Add to Canvas")
  - Configuration: Example .env variables
  - Dependencies: Required components, npm packages
  - Compatibility: Supported Claude models, OS requirements
  - Examples: Code snippets, screenshots
  - Reviews: User ratings and comments
  - Changelog: Version history
- [ ] "Add to Stack Builder" button opens Stack Builder with component pre-loaded
- [ ] Syntax highlighting for code examples (Prism.js or Highlight.js)
- [ ] Copy buttons for installation commands and code snippets

**Definition of Done:**
- [ ] Markdown rendering supports GitHub-flavored markdown
- [ ] Code syntax highlighting works for all common languages
- [ ] Page is SEO-optimized (meta tags, structured data)
- [ ] Responsive layout works on mobile
- [ ] Accessibility: heading hierarchy, alt text for images

**Story Points**: 8 | **Priority**: Must Have | **Sprint**: 2

---

#### Story 2.4: Upvote/Favorite Components
**As a** developer who found a useful component
**I want** to upvote or favorite it
**So that** I can save it for later and help others discover quality components

**Acceptance Criteria:**
- [ ] Upvote button (👍 icon) on component cards and detail pages
- [ ] Upvote count displayed next to button
- [ ] Clicking upvote increments count (optimistic UI update)
- [ ] Second click removes upvote (toggle behavior)
- [ ] Favorite button (⭐ icon) saves component to user's "My Favorites" list
- [ ] Favorites page at `/marketplace/favorites` shows all saved components
- [ ] Upvote/favorite state persists (localStorage for anonymous, DB for logged-in users)

**Definition of Done:**
- [ ] API endpoints: `POST /api/components/{id}/upvote`, `POST /api/components/{id}/favorite`
- [ ] Optimistic UI updates (no loading spinner for upvote)
- [ ] Rate limiting: max 100 upvotes per user per day (prevent manipulation)
- [ ] Unit tests for upvote/favorite logic
- [ ] Accessibility: button states announced to screen readers

**Story Points**: 5 | **Priority**: Should Have | **Sprint**: 2

---

#### Story 2.5: Community-Contributed Components Submission
**As a** developer who built a custom agent or MCP
**I want** to submit it to the marketplace
**So that** others can benefit from my work and I can get credit

**Acceptance Criteria:**
- [ ] "Submit Component" link in navigation (requires GitHub login)
- [ ] Submission form:
  - Component type (select: Agent, MCP, Command, Hook, Setting, Skill)
  - Name, description, icon (upload or emoji picker)
  - GitHub repository URL (required for open-source verification)
  - Tags (multi-select: security, database, frontend, etc.)
  - License (select: MIT, Apache 2.0, GPL, etc.)
  - Configuration schema (JSON upload or interactive form builder)
- [ ] Automated validation:
  - GitHub repo exists and is public
  - README.md contains installation instructions
  - Component files follow naming conventions
- [ ] Submission enters review queue (admin approval required before publish)
- [ ] User receives email notification when component is approved/rejected

**Definition of Done:**
- [ ] API endpoint `POST /api/components/submit`
- [ ] Admin review dashboard (separate story)
- [ ] GitHub API integration to verify repository
- [ ] Unit tests for validation logic
- [ ] Email integration (Supabase Auth or SendGrid)
- [ ] Submission guidelines documentation

**Story Points**: 13 | **Priority**: Could Have | **Phase**: 2 (Post-Launch)

---

## Epic 3: CLI Tool Enhancement

### Priority: HIGH | Estimated Effort: 32 hours (Weeks 4-6) | Sprint: 1-2

*Enhance the existing CLI tool with interactive mode and better UX.*

---

#### Story 3.1: Interactive TUI Mode with Component Preview
**As a** developer who prefers terminal workflows
**I want** an interactive CLI mode with visual component selection
**So that** I can browse and install components without leaving my terminal

**Acceptance Criteria:**
- [ ] Running `npx claude-code-templates@latest` (no args) launches interactive TUI
- [ ] TUI built with Ink (React for CLI) or Inquirer.js
- [ ] TUI features:
  - Category selection menu (arrow keys + Enter)
  - Component list with inline descriptions
  - Preview pane showing full details (split-screen layout)
  - Multi-select mode (Space to select, Enter to install)
  - Search mode (/ to activate, type to filter)
- [ ] Progress bars for downloads and installations
- [ ] Color-coded output (success=green, error=red, info=blue)
- [ ] Exit with Ctrl+C (graceful cleanup)

**Technical Stack**:
```typescript
import React from 'react';
import { render, Box, Text } from 'ink';
import SelectInput from 'ink-select-input';
import TextInput from 'ink-text-input';

const CLI = () => {
  const [mode, setMode] = useState('category');

  return (
    <Box flexDirection="column">
      <Text bold>Claude Code Templates - Interactive Mode</Text>
      {mode === 'category' && <CategorySelect />}
      {mode === 'components' && <ComponentList />}
    </Box>
  );
};

render(<CLI />);
```

**Definition of Done:**
- [ ] TUI works in all major terminals (iTerm2, Terminal.app, Windows Terminal)
- [ ] Responsive to terminal resize events
- [ ] Performance: renders 100+ components without lag
- [ ] Unit tests for TUI components (ink-testing-library)
- [ ] Documentation with screenshots/GIFs

**Story Points**: 13 | **Priority**: Should Have | **Sprint**: 2

---

#### Story 3.2: Bulk Install from Stack URL
**As a** developer installing a shared stack
**I want** to run a single CLI command to install all components
**So that** I can set up my environment quickly

**Acceptance Criteria:**
- [ ] New CLI subcommand: `npx claude-code-templates@latest install-stack <URL>`
- [ ] URL formats supported:
  - `https://aitmpl.com/stack/{stackId}`
  - `https://github.com/{user}/{repo}` (reads `.claude/stack.json`)
  - Local file path: `./my-stack.json`
- [ ] CLI fetches stack manifest (JSON with component list)
- [ ] CLI installs all components with single confirmation prompt
- [ ] Progress indicator shows: "Installing 3/10 components..."
- [ ] Handles failures gracefully (skip failed component, continue with rest)
- [ ] Final summary report:
  ```
  ✓ 8 components installed successfully
  ✗ 2 components failed:
    - github-mcp (missing GITHUB_TOKEN)
    - stripe-mcp (dependency conflict)
  ```

**Definition of Done:**
- [ ] Subcommand registered in CLI router
- [ ] Stack manifest parser handles v1 and v2 formats (future-proofing)
- [ ] Error handling for network failures, invalid URLs
- [ ] Unit tests for install-stack logic
- [ ] Integration test: install sample stack end-to-end

**Story Points**: 8 | **Priority**: Should Have | **Sprint**: 2

---

## Epic 4: Component Rating & Review System

### Priority: MEDIUM | Estimated Effort: 24 hours (Weeks 7-8) | Sprint: 3

*Allow users to rate and review components to help others make informed decisions.*

---

#### Story 4.1: Submit Component Rating and Review
**As a** developer who used a component
**I want** to leave a rating (1-5 stars) and written review
**So that** I can help others decide if the component is worth using

**Acceptance Criteria:**
- [ ] Review form on component detail page (requires login)
- [ ] Star rating input (1-5 stars, hover to preview)
- [ ] Review text area (100-2000 characters, markdown supported)
- [ ] Optional fields:
  - Use case description (dropdown: "Production", "Personal Project", "Learning")
  - Pros and cons (separate text areas)
- [ ] Validation: user can only review each component once
- [ ] User can edit their review after submission (shows "Edited" badge)
- [ ] Review moderation: flagged reviews hidden until admin review

**Definition of Done:**
- [ ] API endpoint `POST /api/components/{id}/reviews`
- [ ] Database schema for reviews table
- [ ] Review spam prevention (rate limiting, reCAPTCHA)
- [ ] Unit tests for review submission logic
- [ ] Email notification to component author on new review

**Story Points**: 8 | **Priority**: Could Have | **Sprint**: 3

---

#### Story 4.2: Display Aggregated Ratings
**As a** developer browsing components
**I want** to see average ratings and review summaries
**So that** I can quickly assess component quality

**Acceptance Criteria:**
- [ ] Component cards show average star rating (e.g., "4.7 ⭐")
- [ ] Detail page shows rating breakdown:
  ```
  5 stars: ████████████████░░ 80% (120)
  4 stars: ████░░░░░░░░░░░░ 15% (22)
  3 stars: ██░░░░░░░░░░░░░░  5% (8)
  2 stars: ░░░░░░░░░░░░░░░░  0% (0)
  1 star:  ░░░░░░░░░░░░░░░░  0% (0)
  ```
- [ ] Sort reviews by: Most Helpful, Newest, Highest Rating, Lowest Rating
- [ ] "Mark as Helpful" button on reviews (upvote)
- [ ] Verified badge for reviews from users who contributed to the component

**Definition of Done:**
- [ ] Rating calculation accurate (weighted average)
- [ ] Review sorting works correctly
- [ ] Helpful count persists to database
- [ ] Performance: rating aggregation doesn't slow down page load
- [ ] Unit tests for rating calculation logic

**Story Points**: 5 | **Priority**: Could Have | **Sprint**: 3

---

## Epic 5: Analytics Dashboard (Phase 2 - Post-Launch)

### Priority: LOW | Estimated Effort: 24 hours | Sprint: 4 (Post-Launch)

---

#### Story 5.1: Real-Time Claude Session Monitoring
**As a** developer using Claude Code
**I want** to see real-time metrics of my Claude usage
**So that** I can track token consumption and optimize my workflow

**Acceptance Criteria:**
- [ ] Dashboard at `/analytics` shows:
  - Current session status (active/idle)
  - Tokens used today (progress bar toward daily limit)
  - Tokens used this week (chart)
  - Most expensive operations (sorted by token cost)
  - Model usage breakdown (Opus vs Sonnet vs Haiku)
- [ ] Real-time updates (WebSocket or polling every 5 seconds)
- [ ] Mobile-optimized view (widget-style cards)
- [ ] Export data as CSV or JSON

**Definition of Done:**
- [ ] Analytics API reads from `~/.claude/projects/*.jsonl`
- [ ] Real-time connection using WebSocket or SSE
- [ ] Dashboard performance: <500ms load time
- [ ] Privacy: analytics data stays local (no server upload)
- [ ] Documentation for self-hosting analytics service

**Story Points**: 13 | **Priority**: Could Have | **Phase**: 2

## Non-Functional Stories

### Performance Stories

#### Story P1: Page Load Performance
**As a** developer using the marketplace
**I want** pages to load quickly
**So that** I have a smooth, productive experience

**Acceptance Criteria:**
- [ ] Initial page load under 2 seconds on 3G connection (as per [03-architecture.md](03-architecture.md:67))
- [ ] Client-side navigation under 500ms (as per architecture principles)
- [ ] Images optimized (WebP format, lazy loading)
- [ ] Code splitting for Stack Builder (heavy @xyflow/react only loads on `/builder`)
- [ ] Loading indicators for operations > 1 second
- [ ] Lighthouse score: 90+ Performance, 100 Accessibility

**Definition of Done:**
- [ ] Performance budget enforced in CI/CD (fail build if exceeded)
- [ ] Real User Monitoring (RUM) implemented
- [ ] CDN edge caching configured (Vercel Edge Network)
- [ ] Bundle size < 200KB gzipped for initial load

**Story Points**: 5 | **Priority**: Must Have | **Sprint**: 3

---

#### Story P2: Mobile Responsiveness
**As a** mobile developer
**I want** the marketplace to work perfectly on my phone
**So that** I can browse components during commute or away from desk

**Acceptance Criteria:**
- [ ] All features work on iOS Safari, Chrome Android, Samsung Internet
- [ ] Touch targets minimum 44x44px (iOS guidelines)
- [ ] Responsive breakpoints: 320px (mobile), 768px (tablet), 1024px (desktop)
- [ ] Font sizes scale appropriately (minimum 16px for body text)
- [ ] No horizontal scrolling on mobile
- [ ] Mobile navigation: hamburger menu, bottom tab bar

**Definition of Done:**
- [ ] Tested on iPhone SE (small), iPhone 15 Pro (medium), iPad Pro (large)
- [ ] Tested on Android: Pixel 7, Samsung Galaxy S24
- [ ] Responsive design tested with Chrome DevTools (all device emulators)
- [ ] Text remains readable when user zooms to 200%
- [ ] PWA manifest configured (installable on home screen)

**Story Points**: 8 | **Priority**: Must Have | **Sprint**: 2

---

### Security Stories

#### Story S1: Data Security & Privacy
**As a** developer sharing API keys in configuration
**I want** my sensitive data protected
**So that** I can trust the marketplace with my credentials

**Acceptance Criteria:**
- [ ] All data transmission encrypted (HTTPS only, HSTS enabled)
- [ ] Sensitive config data (API keys) never sent to server unencrypted
- [ ] Exported ZIP files replace secrets with `{{USER_INPUT}}` placeholders
- [ ] No API keys logged in server logs or error messages
- [ ] localStorage data encrypted in browser (Web Crypto API)
- [ ] Security headers configured:
  - Content-Security-Policy (CSP)
  - X-Frame-Options: DENY
  - X-Content-Type-Options: nosniff

**Definition of Done:**
- [ ] Security audit completed (OWASP Top 10 checklist)
- [ ] Penetration testing on authentication and data flows
- [ ] No secrets committed to Git (git-secrets hook installed)
- [ ] Environment variables properly secured in Vercel
- [ ] Security.txt file published at `/.well-known/security.txt`

**Story Points**: 13 | **Priority**: Must Have | **Sprint**: 2

---

#### Story S2: Input Validation & XSS Prevention
**As a** marketplace administrator
**I want** all user input sanitized
**So that** malicious users cannot inject scripts or SQL

**Acceptance Criteria:**
- [ ] All form inputs validated server-side (never trust client)
- [ ] Markdown rendering uses DOMPurify to sanitize HTML
- [ ] SQL parameterized queries (Supabase client handles this)
- [ ] Component names/descriptions escaped in UI
- [ ] File uploads restricted to safe types (no .exe, .sh)
- [ ] Rate limiting on API endpoints (max 100 requests/minute per IP)

**Definition of Done:**
- [ ] Input validation library (Zod) used on all API routes
- [ ] XSS testing completed (automated with OWASP ZAP)
- [ ] SQL injection testing completed
- [ ] File upload security tested (malicious file rejection)
- [ ] API rate limiting tested (returns 429 Too Many Requests)

**Story Points**: 8 | **Priority**: Must Have | **Sprint**: 2

---

### Accessibility Stories

#### Story A1: WCAG 2.1 AA Compliance
**As a** developer with visual impairment
**I want** the marketplace to be fully accessible
**So that** I can use screen readers and keyboard navigation

**Acceptance Criteria:**
- [ ] All interactive elements keyboard accessible (Tab, Enter, Escape)
- [ ] Focus indicators visible on all focusable elements
- [ ] Color contrast ratio ≥ 4.5:1 for text, ≥ 3:1 for UI components
- [ ] All images have descriptive alt text
- [ ] Form labels properly associated with inputs
- [ ] ARIA labels on custom components (Stack Builder canvas nodes)
- [ ] Skip navigation link at top of page
- [ ] Heading hierarchy correct (h1 → h2 → h3, no skipping levels)

**Definition of Done:**
- [ ] Axe DevTools audit: 0 violations, 0 serious issues
- [ ] NVDA screen reader testing (Windows)
- [ ] VoiceOver testing (macOS, iOS)
- [ ] Keyboard-only navigation testing (no mouse)
- [ ] WCAG 2.1 AA compliance badge on footer

**Story Points**: 13 | **Priority**: Should Have | **Sprint**: 3

---

### SEO & Discoverability Stories

#### Story SEO1: Search Engine Optimization
**As a** marketplace owner
**I want** component pages to rank well in Google
**So that** developers discover our marketplace organically

**Acceptance Criteria:**
- [ ] Server-side rendering (SSR) for all marketing and marketplace pages
- [ ] Semantic HTML (header, nav, main, article, footer)
- [ ] Meta tags on all pages:
  - Title (unique, 50-60 chars)
  - Description (unique, 150-160 chars)
  - Open Graph tags (og:title, og:description, og:image)
  - Twitter Card tags
- [ ] Structured data (JSON-LD) for components:
  ```json
  {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "GitHub MCP",
    "description": "...",
    "aggregateRating": { "@type": "AggregateRating", "ratingValue": 4.8 }
  }
  ```
- [ ] Sitemap.xml generated automatically
- [ ] robots.txt configured correctly
- [ ] Canonical URLs on all pages

**Definition of Done:**
- [ ] Google Search Console verified
- [ ] Sitemap submitted to Google
- [ ] Lighthouse SEO score: 100
- [ ] Rich snippets appear in Google search results (star ratings)
- [ ] Core Web Vitals pass (LCP <2.5s, FID <100ms, CLS <0.1)

**Story Points**: 8 | **Priority**: Should Have | **Sprint**: 3

---

## Acceptance Testing Scenarios

## Acceptance Testing Scenarios

### User Journey Testing

#### New User Onboarding Journey
1. **Scenario**: First-time user visits the application
2. **Steps**:
   - User lands on homepage
   - User clicks "Sign Up"
   - User completes registration
   - User verifies email
   - User logs in for first time
   - User completes profile setup
   - User accesses main features
3. **Success Criteria**: User can complete entire journey without confusion or errors

#### Daily User Workflow
1. **Scenario**: Returning user performs typical daily tasks
2. **Steps**:
   - User logs in
   - User navigates to main feature
   - User performs core actions
   - User views results/data
   - User logs out
3. **Success Criteria**: All tasks complete efficiently with positive user experience

## Story Backlog Management

### Backlog Prioritization
Stories are prioritized based on:
1. **Business Value**: Impact on user experience and business goals
2. **Technical Dependencies**: Prerequisites for other features
3. **Risk Mitigation**: Stories that reduce project risk
4. **User Feedback**: Direct requests from user research

### Story States
- **New**: Story identified but not yet refined
- **Ready**: Story refined and ready for development
- **In Progress**: Story currently being developed
- **Code Review**: Development complete, under review
- **Testing**: Story in QA testing phase
- **Done**: Story completed and deployed

### Definition of Ready
A story is ready for development when:
- [ ] Acceptance criteria are clear and testable
- [ ] UI/UX designs are available (if needed)
- [ ] Technical approach is understood
- [ ] Dependencies have been identified
- [ ] Story has been estimated
- [ ] Questions have been answered

## Story Retrospective

### Metrics to Track
- **Velocity**: Story points completed per sprint
- **Cycle Time**: Time from start to completion
- **Defect Rate**: Bugs found after story completion
- **User Satisfaction**: Feedback on completed features

### Regular Review Process
- **Sprint Planning**: Select stories for upcoming sprint
- **Daily Standups**: Update story progress
- **Sprint Review**: Demo completed stories
- **Sprint Retrospective**: Improve story process

---

**Document Version**: 1.0
**Product Owner**: [Name]
**Last Updated**: [Date]
**Next Review**: [Date]

*This document should be updated regularly as new stories are identified and existing stories are refined based on user feedback and changing requirements.*
