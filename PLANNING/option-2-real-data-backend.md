# Option 2: Real Data & Backend Integration - Detailed Breakdown

## 🎯 Overview
Replace mock data with real Claude Code components from the [claude-code-templates](https://github.com/davila7/claude-code-templates) repository and implement working installation script generation.

**Current State:** Using hardcoded sample data in `data.js`
**Target State:** Live component data, working CLI installation, component validation

---

## 📋 Implementation Breakdown

### **Phase 1: Data Source Integration** (1-2 hours)

#### 1.1 Analyze claude-code-templates Repository Structure
**Repository:** https://github.com/davila7/claude-code-templates

**Key Directories:**
```
claude-code-templates/
├── agents/
│   ├── code-reviewer.json
│   ├── test-generator.json
│   └── ...
├── commands/
│   ├── commit.json
│   ├── deploy.json
│   └── ...
├── mcps/
│   ├── github.json
│   ├── stripe.json
│   └── ...
├── settings/
├── hooks/
├── plugins/
└── templates/
```

**Component File Structure Example:**
```json
{
  "name": "Code Reviewer",
  "description": "Automatically reviews code for best practices",
  "category": "agents",
  "version": "1.0.0",
  "author": "Organized AI",
  "dependencies": [],
  "envVars": {
    "required": [],
    "optional": ["OPENAI_API_KEY"]
  },
  "files": {
    ".claude/agents/code-reviewer.json": { ... }
  }
}
```

#### 1.2 Create Data Fetcher Module
**File:** `src/services/dataFetcher.js`

**Features:**
- Fetch component metadata from GitHub API
- Cache responses for performance
- Handle rate limiting
- Fallback to local data if offline

**Implementation:**
```javascript
class DataFetcher {
  constructor() {
    this.baseURL = 'https://api.github.com/repos/davila7/claude-code-templates';
    this.cache = new Map();
    this.cacheDuration = 5 * 60 * 1000; // 5 minutes
  }

  async fetchAllComponents() {
    try {
      // Try cache first
      const cached = this.getFromCache('all-components');
      if (cached) return cached;

      // Fetch from GitHub
      const categories = ['agents', 'commands', 'settings', 'hooks', 'mcps', 'plugins', 'skills'];
      const components = {};

      for (const category of categories) {
        components[category] = await this.fetchCategory(category);
      }

      // Cache results
      this.saveToCache('all-components', components);

      return components;
    } catch (error) {
      console.error('Failed to fetch components:', error);
      // Fallback to local data
      return this.loadLocalFallback();
    }
  }

  async fetchCategory(category) {
    const cacheKey = `category-${category}`;
    const cached = this.getFromCache(cacheKey);
    if (cached) return cached;

    try {
      // Get directory contents
      const response = await fetch(
        `${this.baseURL}/contents/${category}?ref=main`
      );

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const files = await response.json();

      // Filter JSON files only
      const jsonFiles = files.filter(f => f.name.endsWith('.json'));

      // Fetch each component file
      const components = await Promise.all(
        jsonFiles.map(file => this.fetchComponentFile(file.download_url))
      );

      // Filter out failed fetches
      const validComponents = components.filter(c => c !== null);

      this.saveToCache(cacheKey, validComponents);
      return validComponents;

    } catch (error) {
      console.error(`Failed to fetch category ${category}:`, error);
      return [];
    }
  }

  async fetchComponentFile(downloadURL) {
    try {
      const response = await fetch(downloadURL);
      if (!response.ok) return null;

      const component = await response.json();
      return this.normalizeComponent(component);
    } catch (error) {
      console.error(`Failed to fetch component from ${downloadURL}:`, error);
      return null;
    }
  }

  normalizeComponent(rawComponent) {
    // Normalize data structure to match our marketplace format
    return {
      id: this.generateId(rawComponent.name),
      name: rawComponent.name,
      description: rawComponent.description,
      category: rawComponent.category,
      icon: this.getIconForCategory(rawComponent.category),
      company: rawComponent.author || 'Community',
      downloads: rawComponent.downloads || 0,
      tags: rawComponent.tags || [],
      version: rawComponent.version || '1.0.0',
      dependencies: rawComponent.dependencies || [],
      requiredEnvVars: rawComponent.envVars?.required || [],
      optionalEnvVars: rawComponent.envVars?.optional || [],
      files: rawComponent.files || {},
      createdAt: rawComponent.createdAt || new Date().toISOString(),
      updatedAt: rawComponent.updatedAt || new Date().toISOString()
    };
  }

  generateId(name) {
    return name.toLowerCase().replace(/\s+/g, '-');
  }

  getIconForCategory(category) {
    const icons = {
      agents: '🤖',
      commands: '⚡',
      settings: '⚙️',
      hooks: '🪝',
      mcps: '🔌',
      plugins: '🧩',
      skills: '💡'
    };
    return icons[category] || '📦';
  }

  getFromCache(key) {
    const cached = this.cache.get(key);
    if (!cached) return null;

    const isExpired = Date.now() - cached.timestamp > this.cacheDuration;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return cached.data;
  }

  saveToCache(key, data) {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  loadLocalFallback() {
    // Return existing mock data from data.js
    return marketplaceData;
  }
}

export const dataFetcher = new DataFetcher();
```

#### 1.3 Update App Initialization
**File:** `app.js` (modify init function)

```javascript
async function init() {
  setupEventListeners();

  // Show loading state
  showLoadingState();

  try {
    // Fetch real component data
    const components = await dataFetcher.fetchAllComponents();

    // Update global marketplaceData
    Object.assign(marketplaceData, components);

    // Render UI
    renderCompanyFilter();
    renderPopularStacks();
    updateView();
    loadStackFromURL();

    hideLoadingState();
  } catch (error) {
    console.error('Failed to initialize marketplace:', error);
    showErrorNotification('Failed to load components. Using cached data.');

    // Still render with fallback data
    renderCompanyFilter();
    renderPopularStacks();
    updateView();
  }
}

function showLoadingState() {
  elements.componentsGrid.innerHTML = `
    <div class="loading-container">
      <div class="spinner"></div>
      <p>Loading components from GitHub...</p>
    </div>
  `;
}

function hideLoadingState() {
  // Loading state will be replaced by renderComponents()
}
```

---

### **Phase 2: Component Validation System** (1-2 hours)

#### 2.1 Enhance claude-integration.js
**File:** `claude-integration.js` (currently exists but basic)

**Current Implementation Review:**
```javascript
// Check if file exists
const fs = require('fs');
const path = require('path');

// Read current file
```

Let me first check what's already in this file:

<function_calls>
<invoke name="Read">
<parameter name="file_path">/Users/jordaaan/Library/Mobile Documents/com~apple~CloudDocs/BHT Promo iCloud/Organized AI/Windsurf/organized-ai-marketplace/claude-integration.js