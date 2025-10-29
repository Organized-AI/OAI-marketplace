# Organized AI Marketplace

> A comprehensive AI-powered development framework with intelligent agent orchestration, automated project management, and hybrid code editing capabilities.

## 🌟 Overview

The Organized AI Marketplace is a next-generation development platform that combines the power of Claude Agent SDK, Agent Booster, and intelligent project orchestration to create the ultimate AI-assisted development environment. It provides automated project setup, intelligent code editing, and comprehensive documentation generation.

## ✨ Key Features

### 🤖 Intelligent Agent System
- **9-Agent Specialist System** with Master Orchestrator
- **PM-Meta Framework** for quality-first development
- **Hybrid Agent Architecture** combining multiple AI providers
- **Autonomous project configuration** from planning documents

### ⚡ Ultra-Fast Code Editing
- **Agent Booster Integration** - 352x faster code transformations
- **Zero-cost local processing** with Rust + WebAssembly
- **Multi-language support** (JavaScript, TypeScript, Python, Rust, Go, Java, C, C++)
- **Template-based optimization** with 80-90% confidence scores

### 📋 Comprehensive Project Management
- **Automated project scaffolding** from planning documents
- **iCal session scheduling** with token budget management
- **Real-time token tracking** across all AI providers
- **Automated documentation generation**

### 🔧 Multi-Provider AI Support
- **Primary**: GLM/Z.ai API (GLM-4, CodeGeeX models)
- **Fallback**: OpenRouter API (Claude Opus 4.1, GPT-4, Gemini)
- **Local**: Agent Booster for instant code editing

### 🏗️ DevContainer Integration
- **Secure isolated environments** with firewall protection
- **45-second automated setup** from zero to productive
- **Pre-configured development tools** and extensions

## 🚀 Quick Start

### Prerequisites

- Node.js 18+ or Python 3.9+
- Docker (for DevContainer support)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/organized-ai-marketplace.git
   cd organized-ai-marketplace
   ```

2. **Install dependencies**
   ```bash
   npm install
   # or
   yarn install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   # Edit .env with your API keys
   ```

4. **Run the setup agent**
   ```bash
   npm run agent:setup
   ```

### Environment Variables

```bash
# Primary LLM Provider (GLM/Z.ai)
GLM_API_KEY=your_glm_api_key_here

# Fallback LLM Provider (OpenRouter)
OPENROUTER_API_KEY=your_openrouter_api_key_here

# Provider Selection (glm, openrouter, or auto)
DEFAULT_LLM_PROVIDER=auto

# Default Models
DEFAULT_GLM_MODEL=glm-4
DEFAULT_OPENROUTER_MODEL=anthropic/claude-opus-4-1-20250805

# Agent Booster Configuration
BOOSTER_CONFIDENCE_THRESHOLD=0.7
BOOSTER_MAX_CHUNKS=100

# Application Metadata
APP_NAME=Organized AI Marketplace
APP_URL=http://localhost:3000
```

## 📖 Usage Examples

### 1. Automated Project Setup

```bash
# Fill out your PLANNING documents first
# Then run the setup agent
node scripts/setup-agent.js
```

### 2. Hybrid Code Editing

```javascript
const { HybridAgent } = require('./src/agents/HybridAgent');

async function example() {
  const agent = new HybridAgent({
    defaultModel: 'glm-4',
    confidenceThreshold: 0.7
  });

  // Ultra-fast code editing
  const result = await agent.editCode(
    'function hello() { console.log("world"); }',
    'Add TypeScript types and error handling',
    'typescript'
  );

  console.log(`Edited in ${result.latency.total}ms`);
  console.log(`Speedup: ${result.latency.llm / result.latency.booster}x`);
}
```

### 3. CLI Usage

```bash
# Edit a file with AI assistance
hybrid-agent edit src/utils.ts "Add JSDoc comments to all functions"

# Analyze code
hybrid-agent analyze src/complex.ts "What are potential performance issues?"

# Multi-step refactoring
hybrid-agent refactor src/legacy.js "Modernize to ES6+ and add TypeScript types"

# View usage statistics
hybrid-agent stats
```

### 4. Documentation Generation

```bash
# Generate comprehensive documentation
node scripts/doc-agent.js --mode=generate

# Update existing documentation
node scripts/doc-agent.js --mode=update

# Generate API docs only
node scripts/doc-agent.js --mode=api
```

## 🏗️ Project Structure

```
organized-ai-marketplace/
│
├── 📁 PLANNING/                     # Project planning documents
│   ├── 01-project-brief.md
│   ├── 02-requirements.md
│   ├── 03-architecture.md
│   ├── 04-user-stories.md
│   └── 05-implementation-roadmap.md
│
├── 📁 ARCHITECTURE/                 # System design documents
│   └── system-design.md
│
├── 📁 SPECIFICATIONS/               # Functional specifications
│   └── functional-specs.md
│
├── 📁 src/                          # Source code
│   ├── agents/                      # AI agent implementations
│   ├── providers/                   # LLM provider adapters
│   ├── cli/                         # Command-line interface
│   └── utils/                       # Utility functions
│
├── 📁 scripts/                      # Automation scripts
│   ├── setup-agent.js              # Project setup automation
│   ├── doc-agent.js                 # Documentation generation
│   └── update-token-tracker.js      # Token usage tracking
│
├── 📁 CONFIG/                       # Configuration documentation
│   ├── ARCHITECTURE.md
│   ├── DEVCONTAINER_INTEGRATION.md
│   └── PROJECT_OVERVIEW_AND_QA_CHECKLIST.md
│
└── 📁 .devcontainer/               # Development container config
    ├── devcontainer.json
    └── setup-organized-codebase.sh
```

## ⚙️ Configuration

### Framework Selection

Choose your development framework in `src/config/framework.js`:

- **PM-Meta Agent System**: Quality-first with strict review processes
- **Hybrid System**: Balanced approach with selective automation
- **Custom System**: Maximum flexibility for unique requirements

### Agent Configuration

Customize agents in `.claude/agents/`:

```javascript
// Example agent configuration
{
  "name": "Frontend Specialist",
  "role": "React and TypeScript development",
  "capabilities": [
    "component development",
    "state management",
    "performance optimization"
  ],
  "reviewThreshold": 0.8
}
```

### Token Management

Automatic token tracking with hourly updates:

```bash
# View current usage
cat ~/.claude/token-tracker.json | jq .

# Set up automated tracking
bash scripts/setup-cron.sh
```

## 🧪 Testing

### Run All Tests

```bash
npm test
```

### Performance Benchmarks

```bash
# Run hybrid agent benchmarks
node tests/benchmark.test.js

# Expected results:
# - LLM calls: ~500ms average
# - Agent Booster: ~1ms average
# - Overall speedup: 350x+
```

### Quality Assurance

Use the comprehensive QA checklist:

```bash
# Review all system components
open CONFIG/PROJECT_OVERVIEW_AND_QA_CHECKLIST.md
```

## 🔧 Development

### DevContainer Setup

1. Open in VS Code
2. Install "Remote - Containers" extension
3. Click "Reopen in Container"
4. Wait 45 seconds for automated setup

### Manual Development Setup

```bash
# Install dependencies
npm install agent-booster axios openai dotenv

# Set up git hooks
npm run prepare

# Start development server
npm run dev
```

### Adding New Agents

1. Create agent file in `src/agents/`
2. Implement required interfaces
3. Add to agent registry
4. Update documentation

## 📊 Performance

### Benchmarks

| Operation | Traditional LLM | Hybrid System | Improvement |
|-----------|----------------|---------------|-------------|
| Simple Edit | 352ms | 1ms | **352x faster** |
| Code Analysis | 2.1s | 0.8s | **2.6x faster** |
| Batch Refactoring | 6 minutes | 1.5 minutes | **4x faster** |
| Monthly Cost | $1,000 | $500 | **50% savings** |

### System Requirements

- **Memory**: 4GB+ RAM recommended
- **Storage**: 2GB+ free space
- **Network**: Stable internet for AI API calls
- **CPU**: Modern multi-core processor

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Process

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Make your changes**
4. **Add tests** for new functionality
5. **Update documentation** as needed
6. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
7. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
8. **Open a Pull Request**

### Code Style

- Use ESLint and Prettier for JavaScript/TypeScript
- Follow conventional commits for commit messages
- Maintain 80%+ test coverage
- Document all public APIs

### Reporting Issues

Please use our issue templates:

- 🐛 **Bug Report**: For reporting bugs
- 💡 **Feature Request**: For suggesting new features
- 📚 **Documentation**: For documentation improvements
- 🔧 **DevX**: For developer experience issues

## 📜 License

**Dual License**: MIT OR Apache-2.0

- **MIT License**: For open-source and personal projects
- **Apache-2.0 License**: For commercial use with patent protection

See [LICENSE-MIT](LICENSE-MIT) and [LICENSE-APACHE](LICENSE-APACHE) files for full license text.

### Commercial Use

This project is free for:
- ✅ Personal projects
- ✅ Open-source projects
- ✅ Educational use
- ✅ Commercial use (under Apache-2.0)

## 🔗 Links

- **Documentation**: [Full Documentation](docs/)
- **Agent Booster**: [npm package](https://www.npmjs.com/package/agent-booster)
- **Claude Agent SDK**: [Official Documentation](https://docs.anthropic.com/)
- **Community**: [Discord Server](https://discord.gg/organized-ai)
- **Issues**: [GitHub Issues](https://github.com/your-org/organized-ai-marketplace/issues)

## 👥 Team

- **Architecture**: Comprehensive system design
- **AI Integration**: Multi-provider agent orchestration  
- **Performance**: Ultra-fast code editing with Agent Booster
- **DevX**: Seamless developer experience

## 🙏 Acknowledgments

- **Claude Agent SDK** - Intelligent agent orchestration
- **Agent Booster** - Ultra-fast local code editing
- **OpenRouter** - Multi-model AI access
- **GLM/Z.ai** - Advanced reasoning capabilities
- **DevContainers** - Secure development environments
- **Open Source Community** - Continuous inspiration

---

**Built with ❤️ for the AI-powered development community**

*Transform your development workflow with intelligent automation, ultra-fast code editing, and comprehensive project orchestration.*