# System Architecture

## Architecture Overview

This document outlines the high-level system architecture for the **Organized AI Marketplace**, with emphasis on the **Stack Builder** visual component composer and marketplace infrastructure.

**Key Design Decision**: Next.js 14 with App Router serves dual purposes:
1. **Marketing + Marketplace** (Server-Side Rendering for SEO)
2. **Stack Builder** (Client-Side Interactivity for drag-and-drop)

---

## High-Level Architecture

### System Context Diagram

```
┌─────────────────────────────────────────────────────────────────────┐
│                          External Users                             │
│  (Developers, Teams, Contributors, Marketplace Browsers)            │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CDN (Vercel Edge Network)                        │
│          Cache static assets, images, component metadata            │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                   Next.js 14 Application (Vercel)                   │
│  ┌────────────────┬──────────────────┬─────────────────────────┐   │
│  │ Marketing Pages│  Marketplace     │  Stack Builder          │   │
│  │ (SSR)          │  (SSR + Client)  │  (Client-heavy)         │   │
│  │ - Homepage     │  - /agents       │  - /builder             │   │
│  │ - /docs        │  - /mcps         │  - /stack/:id           │   │
│  │ - /about       │  - /commands     │  - Interactive canvas   │   │
│  └────────────────┴──────────────────┴─────────────────────────┘   │
└────────────────────────┬────────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    API Layer (Next.js API Routes)                   │
│  /api/components  │  /api/stacks  │  /api/analytics  │  /api/auth  │
└────────────────────────┬────────────────────────────────────────────┘
                         │
        ┌────────────────┼────────────────┐
        │                │                │
        ▼                ▼                ▼
┌───────────────┐  ┌──────────────┐  ┌─────────────────┐
│   Supabase    │  │   Redis      │  │  GitHub API     │
│  (PostgreSQL) │  │   (Cache)    │  │  (OAuth, Data)  │
│  - Stacks DB  │  │  - Metadata  │  │  - Auth         │
│  - Reviews    │  │  - Sessions  │  │  - Component    │
│  - Analytics  │  │              │  │    source code  │
└───────────────┘  └──────────────┘  └─────────────────┘
```

---

## Architecture Principles

1. **Progressive Enhancement**: Marketing works without JS, Stack Builder enhances with it
2. **Edge-First**: Leverage Vercel Edge for global low-latency
3. **API-Driven**: Separate concerns (UI ↔ Data) for future mobile apps
4. **Component Isolation**: Marketplace and Stack Builder share data, not UI
5. **Performance Budget**: <2s initial load, <500ms client-side navigation
6. **Offline-Capable**: Stack Builder uses localStorage for drafts

---

## Technology Stack

### Frontend Technology Stack

#### Core Framework

**Choice**: **Next.js 14 (App Router) with React 18**

**Rationale**:
- ✅ **Hybrid Rendering**: SSR for marketplace SEO, client components for Stack Builder interactivity
- ✅ **Built-in API Routes**: Component metadata API without separate backend
- ✅ **Edge Runtime**: Fast global delivery via Vercel Edge Network
- ✅ **React Server Components**: Reduce client bundle size for marketing pages
- ✅ **Image Optimization**: Built-in `next/image` for component icons
- ✅ **File-based Routing**: `app/builder/page.tsx` maps to `/builder`

**Pros**:
- Zero-config TypeScript, Fast Refresh, built-in optimizations
- Excellent developer experience (hot reload, error overlay)
- Vercel deployment is one-click (perfect for open-source)
- Large ecosystem (shadcn/ui, Tailwind plugins)

**Cons**:
- Learning curve for App Router (newer paradigm)
- Heavier than pure React SPA (but worth it for SEO)

**Alternatives Considered**:
- **React SPA + Vite**: Faster builds, but no SSR (bad for marketplace SEO)
- **Remix**: Great SSR, but smaller ecosystem than Next.js
- **SvelteKit**: Lighter bundle, but team less familiar with Svelte

---

#### Styling & UI

**CSS Framework**: **Tailwind CSS 3.4+**
- Utility-first, fast prototyping
- Excellent with Next.js (built-in PostCSS support)
- Purges unused CSS (tiny production bundles)

**Component Library**: **shadcn/ui** (Radix UI + Tailwind)
- Copy-paste components (no npm dependency bloat)
- Accessible by default (WCAG 2.1 AA)
- Customizable (Tailwind-based styling)
- Components used:
  - `Button`, `Card`, `Dialog`, `DropdownMenu`
  - `Input`, `Label`, `Select`, `Tabs`
  - `Tooltip`, `Sheet` (mobile drawer)

**Icons**: **Lucide Icons** (React library)
- Tree-shakeable (only import icons you use)
- Consistent with shadcn/ui design system

**Fonts**:
- **Sans-serif**: Inter (Google Fonts)
- **Monospace**: JetBrains Mono (code snippets, CLI commands)

---

#### State Management

**Library**: **Zustand** (for Stack Builder) + **React Server Components** (for marketplace)

**Rationale**:
- **Zustand** for Stack Builder:
  - Lightweight (1KB gzipped)
  - Simple API (`create()`, `useStore()`)
  - Perfect for canvas state (selected components, drag positions)
  - Built-in middleware (persist to localStorage, devtools)

- **React Server Components** for marketplace:
  - Fetch data server-side (no client-side state needed)
  - Automatic data deduplication
  - Zero client-side state management overhead

**Stack Builder State Structure**:
```typescript
interface StackBuilderState {
  // Canvas state
  components: ComponentNode[]; // Dragged components on canvas
  connections: Connection[];   // Arrows between components
  selectedNodeId: string | null;

  // Configuration state
  configurations: Record<string, ComponentConfig>;

  // Actions
  addComponent: (component: Component) => void;
  removeComponent: (id: string) => void;
  updateConfig: (id: string, config: Partial<ComponentConfig>) => void;
  connectNodes: (sourceId: string, targetId: string) => void;

  // Export
  generateZip: () => Promise<Blob>;
  generateCLICommand: () => string;
  saveStack: () => Promise<string>; // Returns stack ID
}
```

---

#### Drag & Drop System

**Library**: **@xyflow/react** (formerly React Flow)

**Why Xyflow**:
- ✅ Purpose-built for node-based UIs (Figma-like experience)
- ✅ Handles complex canvas interactions (zoom, pan, select, drag)
- ✅ Built-in edge rendering (arrows between components)
- ✅ Extensible (custom node types for agents/MCPs/commands)
- ✅ Performance-optimized (virtual rendering for 100+ nodes)

**Node Types**:
```typescript
const componentNodeTypes = {
  agent: AgentNode,      // Blue border, robot icon
  mcp: MCPNode,          // Purple border, plug icon
  command: CommandNode,  // Green border, lightning icon
  hook: HookNode,        // Orange border, hook icon
  setting: SettingNode   // Gray border, gear icon
};

<ReactFlow
  nodes={components}
  edges={connections}
  nodeTypes={componentNodeTypes}
  onConnect={handleConnect}
  onNodeClick={handleSelectNode}
/>
```

---

### Backend Technology Stack

#### API Layer

**Choice**: **Next.js API Routes** (Serverless Functions on Vercel)

**Endpoints**:

```typescript
// Component Metadata API
GET  /api/components           // List all components
GET  /api/components/[id]      // Get component details
GET  /api/components/search?q= // Search components

// Stack Management API
GET  /api/stacks               // List public stacks
POST /api/stacks               // Create new stack
GET  /api/stacks/[id]          // Get stack config
PUT  /api/stacks/[id]          // Update stack (auth required)
POST /api/stacks/[id]/upvote   // Upvote stack

// Analytics API (Phase 2)
GET  /api/analytics/usage      // Token usage stats
POST /api/analytics/track      // Track component install

// Auth API (GitHub OAuth)
GET  /api/auth/callback        // OAuth callback
POST /api/auth/logout          // Clear session
```

---

#### Database

**Choice**: **Supabase (PostgreSQL + Realtime)**

**Schema Design**:

```sql
-- Shared Stacks Table
CREATE TABLE stacks (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  author VARCHAR(100),
  components JSONB NOT NULL,
  configuration JSONB,
  is_public BOOLEAN DEFAULT false,
  upvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Component Reviews (Phase 2)
CREATE TABLE reviews (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  component_id VARCHAR(100) NOT NULL,
  component_type VARCHAR(20) NOT NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  author VARCHAR(100),
  created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_stacks_public ON stacks(is_public) WHERE is_public = true;
CREATE INDEX idx_reviews_component ON reviews(component_id, component_type);
```

---

## Next.js App Router Structure

```
app/
├── (marketing)/
│   ├── layout.tsx
│   ├── page.tsx              # Homepage
│   └── docs/
│       └── page.tsx
│
├── (marketplace)/
│   ├── agents/
│   │   ├── page.tsx          # /agents
│   │   └── [id]/
│   │       └── page.tsx      # /agents/react-specialist
│   ├── mcps/
│   │   └── page.tsx
│   └── commands/
│       └── page.tsx
│
├── builder/
│   └── page.tsx              # /builder (Stack Builder)
│
├── stack/
│   └── [id]/
│       └── page.tsx          # /stack/abc123
│
└── api/
    ├── components/
    │   └── route.ts
    └── stacks/
        └── route.ts
```

---

## Deployment Architecture

**Platform**: **Vercel**

**Why Vercel**:
- ✅ Native Next.js support
- ✅ Zero-config deployment
- ✅ Edge functions globally distributed
- ✅ Automatic HTTPS
- ✅ Preview deployments for PRs

---

## Technology Decision Summary

| Component | Technology | Why |
|-----------|-----------|-----|
| **Frontend Framework** | Next.js 14 | SSR for SEO + client interactivity |
| **UI Library** | React 18 | Component reusability, large ecosystem |
| **Styling** | Tailwind CSS + shadcn/ui | Fast prototyping, accessible components |
| **State Management** | Zustand | Lightweight, perfect for canvas state |
| **Drag & Drop** | @xyflow/react | Purpose-built for node-based UIs |
| **Backend** | Next.js API Routes | Serverless, co-located with frontend |
| **Database** | Supabase (PostgreSQL) | Free tier, built-in auth, realtime |
| **Hosting** | Vercel | Zero-config, Edge network |

---

`★ Insight ─────────────────────────────────────`
**Why Next.js 14 App Router is Perfect for This Project**:

The App Router's **hybrid rendering** model solves a classic dilemma: *How do you build a site that's both SEO-friendly AND highly interactive?*

**For the Marketplace** (`/agents`, `/mcps`):
- Server Components fetch metadata on the server
- Google sees fully-rendered HTML (great SEO)
- Fast initial page load

**For Stack Builder** (`/builder`):
- Client Components with `"use client"` directive
- Full React interactivity (drag, drop, canvas)
- No wasted server resources

**The magic**: Both share the same codebase, same component library, same API. You don't maintain two separate apps.
`─────────────────────────────────────────────────`

---

**Last Updated**: October 28, 2025
**Version**: 1.0
**Status**: ✅ Ready for Implementation
