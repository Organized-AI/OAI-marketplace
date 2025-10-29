# Option 1: Visual Stack Builder - Detailed Breakdown

## 🎯 Overview
Transform the current list-based Stack Builder into a full visual drag-and-drop canvas experience, matching the design described in `stack-builder-deep-dive.md`.

**Current State:** Simple list-based sidebar with add/remove functionality
**Target State:** Interactive visual canvas with drag-and-drop, dependency visualization, and configuration forms

---

## 📋 Implementation Breakdown

### **Phase 1: Setup & Library Integration** (1-2 hours)

#### 1.1 Choose Canvas Library
**Options:**
- **React Flow** (Recommended) - Modern, well-documented, great for node-based UIs
- **Xyflow** - More flexible but steeper learning curve
- **Plain D3.js** - Maximum control but more work

**Decision:** Use React Flow for balance of power and ease

#### 1.2 Install Dependencies
```bash
npm install reactflow @xyflow/react
npm install react react-dom
npm install -D @types/react @types/react-dom
```

#### 1.3 Restructure Project
- Convert to React-based architecture (or keep vanilla JS with lightweight approach)
- Set up build system (Vite or Parcel for fast iteration)
- Create component folder structure

**File Structure:**
```
src/
├── components/
│   ├── Canvas/
│   │   ├── Canvas.jsx
│   │   ├── ComponentNode.jsx
│   │   └── ConnectionLine.jsx
│   ├── Library/
│   │   ├── ComponentLibrary.jsx
│   │   └── ComponentCard.jsx
│   ├── Properties/
│   │   ├── PropertiesPanel.jsx
│   │   └── ConfigurationForm.jsx
│   └── StackBuilder.jsx
├── utils/
│   ├── canvasHelpers.js
│   └── validationEngine.js
└── app.jsx
```

---

### **Phase 2: Canvas Implementation** (2-3 hours)

#### 2.1 Create Basic Canvas Component
**File:** `src/components/Canvas/Canvas.jsx`

**Features:**
- Empty canvas with grid background
- Zoom and pan controls
- Minimap for navigation
- Component drop zones

**Core Implementation:**
```jsx
import ReactFlow, {
  Background,
  Controls,
  MiniMap
} from 'reactflow';
import 'reactflow/dist/style.css';

function Canvas({ nodes, edges, onNodesChange, onEdgesChange }) {
  return (
    <ReactFlow
      nodes={nodes}
      edges={edges}
      onNodesChange={onNodesChange}
      onEdgesChange={onEdgesChange}
      fitView
    >
      <Background variant="dots" gap={16} size={1} />
      <Controls />
      <MiniMap />
    </ReactFlow>
  );
}
```

#### 2.2 Create Component Nodes
**File:** `src/components/Canvas/ComponentNode.jsx`

**Features:**
- Visual representation of components (agents, MCPs, commands)
- Color-coded by category (blue for agents, purple for MCPs, etc.)
- Drag handles for repositioning
- Connection ports for dependency arrows
- Configuration status indicator (✓ configured, ⚠️ needs config, ❌ error)

**Node Structure:**
```jsx
function ComponentNode({ data }) {
  return (
    <div className="component-node" style={{ borderColor: data.categoryColor }}>
      <div className="node-header">
        <span className="drag-handle">⋮⋮</span>
        <span className="node-icon">{data.icon}</span>
        <span className="node-title">{data.name}</span>
        <span className="config-status">{data.configStatus}</span>
      </div>
      <div className="node-body">
        <div className="node-category">{data.category}</div>
        <div className="node-dependencies">
          {data.dependencies.length > 0 && (
            <span>Depends on: {data.dependencies.join(', ')}</span>
          )}
        </div>
      </div>
      {/* Connection ports */}
      <div className="connection-port port-top" />
      <div className="connection-port port-bottom" />
    </div>
  );
}
```

#### 2.3 Implement Drag-and-Drop
**Integration between Library and Canvas:**

**From Library (Left Sidebar):**
```jsx
function ComponentCard({ component }) {
  const onDragStart = (event) => {
    event.dataTransfer.setData('application/reactflow', JSON.stringify(component));
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <div draggable onDragStart={onDragStart}>
      {/* Component card content */}
    </div>
  );
}
```

**To Canvas (Center Area):**
```jsx
function Canvas({ nodes, setNodes }) {
  const onDrop = (event) => {
    event.preventDefault();
    const componentData = JSON.parse(
      event.dataTransfer.getData('application/reactflow')
    );

    // Calculate drop position
    const position = {
      x: event.clientX - canvasBounds.left,
      y: event.clientY - canvasBounds.top
    };

    // Create new node
    const newNode = {
      id: `node-${Date.now()}`,
      type: 'componentNode',
      position,
      data: componentData
    };

    setNodes((nds) => [...nds, newNode]);
  };

  return (
    <div onDrop={onDrop} onDragOver={(e) => e.preventDefault()}>
      <ReactFlow nodes={nodes} />
    </div>
  );
}
```

---

### **Phase 3: Dependency Visualization** (1-2 hours)

#### 3.1 Auto-Draw Dependency Arrows
**Logic:** When a component is added, automatically detect dependencies and draw arrows

**Example:**
```javascript
// Component metadata includes dependencies
const componentMetadata = {
  'react-agent': {
    dependencies: ['github-mcp'],
    optionalDependencies: ['testing-command']
  },
  'github-mcp': {
    dependencies: [],
    requiredEnvVars: ['GITHUB_TOKEN']
  }
};

function autoConnectDependencies(newNode, existingNodes) {
  const edges = [];
  const dependencies = componentMetadata[newNode.data.id]?.dependencies || [];

  dependencies.forEach(depId => {
    const dependencyNode = existingNodes.find(n => n.data.id === depId);
    if (dependencyNode) {
      edges.push({
        id: `edge-${newNode.id}-${dependencyNode.id}`,
        source: newNode.id,
        target: dependencyNode.id,
        type: 'smoothstep',
        animated: true,
        label: 'requires'
      });
    }
  });

  return edges;
}
```

#### 3.2 Visual Dependency Indicators
**Arrow Styles:**
- **Solid arrow**: Hard dependency (required)
- **Dashed arrow**: Optional dependency
- **Red arrow**: Conflict/incompatibility detected
- **Animated arrow**: Active/validated connection

**Styling:**
```css
/* React Flow edge customization */
.react-flow__edge-path {
  stroke: var(--color-primary);
  stroke-width: 2;
}

.react-flow__edge.dependency-required {
  stroke: #3b82f6; /* Blue */
}

.react-flow__edge.dependency-optional {
  stroke: #8b5cf6; /* Purple */
  stroke-dasharray: 5 5;
}

.react-flow__edge.dependency-conflict {
  stroke: #ef4444; /* Red */
  animation: pulse 1s infinite;
}
```

---

### **Phase 4: Properties Panel & Configuration** (2-3 hours)

#### 4.1 Properties Panel Component
**File:** `src/components/Properties/PropertiesPanel.jsx`

**Features:**
- Displays selected component details
- Shows configuration form
- Real-time validation
- Dependency requirements
- Compatibility checks

**Structure:**
```jsx
function PropertiesPanel({ selectedNode, onConfigUpdate }) {
  if (!selectedNode) {
    return (
      <div className="properties-panel empty">
        <p>Select a component to configure</p>
      </div>
    );
  }

  return (
    <div className="properties-panel">
      <h3>{selectedNode.data.name}</h3>
      <div className="panel-section">
        <h4>Configuration</h4>
        <ConfigurationForm
          component={selectedNode.data}
          onUpdate={onConfigUpdate}
        />
      </div>
      <div className="panel-section">
        <h4>Dependencies</h4>
        <DependencyList dependencies={selectedNode.data.dependencies} />
      </div>
      <div className="panel-section">
        <h4>Compatibility</h4>
        <CompatibilityCheck component={selectedNode.data} />
      </div>
    </div>
  );
}
```

#### 4.2 Configuration Forms
**Dynamic form generation based on component requirements:**

**Example for GitHub MCP:**
```jsx
function ConfigurationForm({ component, onUpdate }) {
  const [config, setConfig] = useState(component.config || {});
  const [validation, setValidation] = useState({});

  const handleChange = (field, value) => {
    const newConfig = { ...config, [field]: value };
    setConfig(newConfig);

    // Validate
    const errors = validateConfig(component, newConfig);
    setValidation(errors);

    // Update parent
    onUpdate(component.id, newConfig, errors);
  };

  return (
    <form className="config-form">
      {component.requiredEnvVars?.map(envVar => (
        <div key={envVar} className="form-field">
          <label>{envVar} *</label>
          <input
            type={envVar.includes('TOKEN') ? 'password' : 'text'}
            value={config[envVar] || ''}
            onChange={(e) => handleChange(envVar, e.target.value)}
            className={validation[envVar] ? 'error' : ''}
          />
          {validation[envVar] && (
            <span className="error-message">{validation[envVar]}</span>
          )}
          <small className="help-text">
            {getHelpText(component, envVar)}
          </small>
        </div>
      ))}

      <button type="button" onClick={testConnection}>
        Test Connection
      </button>
    </form>
  );
}
```

**Help Text Examples:**
```javascript
const helpTextMap = {
  'GITHUB_TOKEN': {
    description: 'Personal access token from GitHub',
    link: 'https://github.com/settings/tokens',
    permissions: ['repo', 'read:user']
  },
  'STRIPE_SECRET_KEY': {
    description: 'Secret key from Stripe dashboard',
    link: 'https://dashboard.stripe.com/apikeys',
    permissions: ['Test mode recommended for development']
  }
};
```

---

### **Phase 5: Validation & Compatibility Checking** (1-2 hours)

#### 5.1 Validation Engine
**File:** `src/utils/validationEngine.js`

**Features:**
- Check for missing dependencies
- Detect incompatible components
- Validate environment variable formats
- OS compatibility checks

**Implementation:**
```javascript
class ValidationEngine {
  validateStack(nodes, edges) {
    const errors = [];
    const warnings = [];

    // Check dependencies
    nodes.forEach(node => {
      const missingDeps = this.checkDependencies(node, nodes);
      if (missingDeps.length > 0) {
        errors.push({
          nodeId: node.id,
          type: 'missing_dependency',
          message: `Missing dependencies: ${missingDeps.join(', ')}`
        });
      }
    });

    // Check conflicts
    const conflicts = this.detectConflicts(nodes);
    errors.push(...conflicts);

    // Check configuration completeness
    nodes.forEach(node => {
      const configErrors = this.validateConfiguration(node);
      errors.push(...configErrors);
    });

    return { errors, warnings, valid: errors.length === 0 };
  }

  checkDependencies(node, allNodes) {
    const required = componentMetadata[node.data.id]?.dependencies || [];
    const present = allNodes.map(n => n.data.id);
    return required.filter(dep => !present.includes(dep));
  }

  detectConflicts(nodes) {
    const conflicts = [];
    const incompatibilities = {
      'postgres-mcp': ['mysql-mcp'], // Can't have both
      'dark-mode-pro': ['light-mode-pro']
    };

    nodes.forEach(node => {
      const conflictsWith = incompatibilities[node.data.id] || [];
      const conflictingNodes = nodes.filter(n =>
        conflictsWith.includes(n.data.id)
      );

      if (conflictingNodes.length > 0) {
        conflicts.push({
          nodeId: node.id,
          type: 'conflict',
          message: `Conflicts with: ${conflictingNodes.map(n => n.data.name).join(', ')}`
        });
      }
    });

    return conflicts;
  }

  validateConfiguration(node) {
    const errors = [];
    const required = componentMetadata[node.data.id]?.requiredEnvVars || [];

    required.forEach(envVar => {
      const value = node.data.config?.[envVar];
      if (!value || value.trim() === '') {
        errors.push({
          nodeId: node.id,
          type: 'missing_config',
          field: envVar,
          message: `Missing required field: ${envVar}`
        });
      } else {
        // Format validation
        const formatError = this.validateFormat(envVar, value);
        if (formatError) {
          errors.push({
            nodeId: node.id,
            type: 'invalid_format',
            field: envVar,
            message: formatError
          });
        }
      }
    });

    return errors;
  }

  validateFormat(fieldName, value) {
    const patterns = {
      'GITHUB_TOKEN': /^gh[ps]_[a-zA-Z0-9]{36,}$/,
      'STRIPE_SECRET_KEY': /^sk_(test|live)_[a-zA-Z0-9]{24,}$/,
      'API_KEY': /^[a-zA-Z0-9_-]{20,}$/
    };

    const pattern = patterns[fieldName];
    if (pattern && !pattern.test(value)) {
      return `Invalid format for ${fieldName}`;
    }
    return null;
  }
}

export const validationEngine = new ValidationEngine();
```

#### 5.2 Visual Feedback for Validation
**Real-time indicators:**
- Node border turns **red** if errors
- Node border turns **yellow** if warnings
- Node border turns **green** if fully configured
- Error badge shows count of issues

**Example:**
```jsx
function ComponentNode({ data, validation }) {
  const borderColor = validation?.errors.length > 0
    ? '#ef4444' // Red
    : validation?.warnings.length > 0
    ? '#f59e0b' // Yellow
    : data.configured
    ? '#10b981' // Green
    : '#6b7280'; // Gray

  return (
    <div className="component-node" style={{ borderColor }}>
      {validation?.errors.length > 0 && (
        <div className="error-badge">{validation.errors.length}</div>
      )}
      {/* Rest of node */}
    </div>
  );
}
```

---

### **Phase 6: Export Functionality** (1-2 hours)

#### 6.1 Multiple Export Formats

**Format 1: ZIP Download**
```javascript
async function exportAsZip(nodes) {
  const zip = new JSZip();

  // Create .claude/ structure
  nodes.forEach(node => {
    const category = node.data.category;
    const config = generateComponentConfig(node);
    zip.file(`.claude/${category}/${node.data.id}.json`, JSON.stringify(config, null, 2));
  });

  // Create .env.example
  const envVars = extractEnvVars(nodes);
  const envExample = envVars.map(v => `${v}=your_${v.toLowerCase()}_here`).join('\n');
  zip.file('.env.example', envExample);

  // Create README
  const readme = generateReadme(nodes);
  zip.file('README.md', readme);

  // Create setup script
  const setupScript = generateSetupScript(nodes);
  zip.file('setup.sh', setupScript);

  // Download
  const blob = await zip.generateAsync({ type: 'blob' });
  saveAs(blob, 'my-stack.zip');
}
```

**Format 2: CLI Install Command**
```javascript
function generateCLICommand(nodes) {
  const components = nodes.map(n => n.data.id);
  return `npx @organized-ai/marketplace install ${components.join(' ')}`;
}
```

**Format 3: GitHub Template**
```javascript
async function exportToGitHub(nodes, stackName) {
  // Use GitHub API to create template repository
  const response = await fetch('https://api.github.com/user/repos', {
    method: 'POST',
    headers: {
      'Authorization': `token ${GITHUB_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      name: `stack-${stackName}`,
      description: `Stack created with Organized AI Marketplace`,
      is_template: true,
      auto_init: true
    })
  });

  const repo = await response.json();

  // Push stack files to repo
  // ... (implementation using GitHub API)

  return repo.html_url;
}
```

**Format 4: Share URL**
```javascript
function generateShareURL(nodes) {
  // Encode stack configuration
  const stackData = {
    version: '1.0',
    components: nodes.map(n => ({
      id: n.data.id,
      config: n.data.config,
      position: n.position
    })),
    edges: edges.map(e => ({
      source: e.source,
      target: e.target
    }))
  };

  // Compress and encode
  const encoded = btoa(JSON.stringify(stackData));

  // Generate short URL (use URL shortener API or database)
  const shortId = generateShortId(); // e.g., "abc123"
  saveStackToDatabase(shortId, stackData);

  return `https://aitmpl.com/stack/${shortId}`;
}
```

---

### **Phase 7: Polish & UX Enhancements** (1-2 hours)

#### 7.1 Keyboard Shortcuts
```javascript
function useKeyboardShortcuts() {
  useEffect(() => {
    const handleKeyPress = (e) => {
      // Delete selected node
      if (e.key === 'Delete' || e.key === 'Backspace') {
        deleteSelectedNodes();
      }

      // Undo/Redo
      if (e.ctrlKey || e.metaKey) {
        if (e.key === 'z') {
          e.preventDefault();
          undo();
        }
        if (e.key === 'y' || (e.shiftKey && e.key === 'z')) {
          e.preventDefault();
          redo();
        }
      }

      // Select all
      if ((e.ctrlKey || e.metaKey) && e.key === 'a') {
        e.preventDefault();
        selectAllNodes();
      }
    };

    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, []);
}
```

#### 7.2 Undo/Redo System
```javascript
class HistoryManager {
  constructor() {
    this.history = [];
    this.currentIndex = -1;
    this.maxHistory = 50;
  }

  push(state) {
    // Remove any future states if we're not at the end
    this.history = this.history.slice(0, this.currentIndex + 1);

    // Add new state
    this.history.push(JSON.parse(JSON.stringify(state)));
    this.currentIndex++;

    // Limit history size
    if (this.history.length > this.maxHistory) {
      this.history.shift();
      this.currentIndex--;
    }
  }

  undo() {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      return this.history[this.currentIndex];
    }
    return null;
  }

  redo() {
    if (this.currentIndex < this.history.length - 1) {
      this.currentIndex++;
      return this.history[this.currentIndex];
    }
    return null;
  }
}
```

#### 7.3 Auto-Save & LocalStorage
```javascript
function useAutoSave(nodes, edges) {
  useEffect(() => {
    const saveInterval = setInterval(() => {
      const state = { nodes, edges, timestamp: Date.now() };
      localStorage.setItem('stack-builder-autosave', JSON.stringify(state));
    }, 5000); // Save every 5 seconds

    return () => clearInterval(saveInterval);
  }, [nodes, edges]);
}

function loadAutoSave() {
  const saved = localStorage.getItem('stack-builder-autosave');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to load autosave:', e);
    }
  }
  return null;
}
```

---

## 🎨 Visual Design Specifications

### Color Scheme
```css
:root {
  /* Category Colors */
  --category-agents: #3b82f6;      /* Blue */
  --category-mcps: #8b5cf6;        /* Purple */
  --category-commands: #10b981;    /* Green */
  --category-hooks: #f59e0b;       /* Orange */
  --category-settings: #6b7280;    /* Gray */
  --category-plugins: #ec4899;     /* Pink */
  --category-skills: #06b6d4;      /* Cyan */

  /* Status Colors */
  --status-valid: #10b981;         /* Green */
  --status-warning: #f59e0b;       /* Yellow */
  --status-error: #ef4444;         /* Red */
  --status-unconfigured: #9ca3af;  /* Light Gray */
}
```

### Component Node Styling
```css
.component-node {
  min-width: 200px;
  border-radius: 8px;
  border: 2px solid;
  background: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.2s ease;
}

.component-node:hover {
  box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  transform: translateY(-2px);
}

.component-node.selected {
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.node-header {
  display: flex;
  align-items: center;
  padding: 12px;
  background: rgba(0, 0, 0, 0.02);
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.drag-handle {
  cursor: grab;
  opacity: 0.5;
  margin-right: 8px;
}

.drag-handle:active {
  cursor: grabbing;
}

.connection-port {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: var(--color-primary);
  border: 2px solid white;
  position: absolute;
}

.connection-port.port-top {
  top: -6px;
  left: 50%;
  transform: translateX(-50%);
}

.connection-port.port-bottom {
  bottom: -6px;
  left: 50%;
  transform: translateX(-50%);
}
```

---

## 📊 Success Metrics

After implementing the Visual Stack Builder, measure:

1. **User Engagement:**
   - Time spent on canvas vs old list view
   - Number of components added per session
   - Share rate of stacks

2. **Usability:**
   - Error rate in configuration
   - Time to create first working stack
   - User feedback scores

3. **Technical Performance:**
   - Canvas rendering time with 50+ nodes
   - Export generation time
   - Validation speed

**Target Metrics:**
- ✅ Canvas supports 100+ nodes without lag
- ✅ Export generates in <2 seconds
- ✅ Validation runs in <500ms
- ✅ 80% of users successfully create a working stack

---

## 🚀 Implementation Timeline

| Phase | Description | Time | Dependencies |
|-------|-------------|------|--------------|
| **Phase 1** | Setup & Library Integration | 1-2 hours | None |
| **Phase 2** | Canvas Implementation | 2-3 hours | Phase 1 |
| **Phase 3** | Dependency Visualization | 1-2 hours | Phase 2 |
| **Phase 4** | Properties Panel | 2-3 hours | Phase 2 |
| **Phase 5** | Validation Engine | 1-2 hours | Phase 3, 4 |
| **Phase 6** | Export Functionality | 1-2 hours | Phase 2-5 |
| **Phase 7** | Polish & UX | 1-2 hours | All phases |
| **TOTAL** | **Full Implementation** | **9-15 hours** | |

---

## 🎓 Learning Opportunities

**Technologies You'll Master:**
- React Flow / Xyflow (node-based UIs)
- Advanced drag-and-drop with HTML5 API
- State management for complex UIs
- Form validation patterns
- File generation and compression (JSZip)
- LocalStorage persistence strategies

**Design Patterns:**
- Composition pattern for flexible components
- Observer pattern for validation updates
- Command pattern for undo/redo
- Strategy pattern for export formats

---

## 🔗 Next Steps

After completing this option:
1. Test with real user workflows
2. Gather feedback on drag-and-drop UX
3. Add keyboard shortcut tutorial
4. Create video demo for documentation
5. Integrate with Option 2 (Real Data)

---

**Ready to start building?** Let me know which phase you'd like to tackle first! 🚀
