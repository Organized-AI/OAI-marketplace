# Documentation

Welcome to the Organized AI Marketplace documentation system! This directory contains both **user-facing documentation** and tools for **autonomous documentation generation**.

## 📚 Documentation Files

| File | Description | Status |
|------|-------------|--------|
| [SETUP-GUIDE.md](SETUP-GUIDE.md) | Quick start guide for autonomous doc system | ✅ Ready |
| [AUTONOMOUS-DOCS.md](AUTONOMOUS-DOCS.md) | Detailed usage and customization guide | ✅ Ready |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute to this project | 📝 Template |
| [API_DOCS.md](API_DOCS.md) | API reference documentation | 🤖 Auto-generated |
| [DEPLOYMENT.md](DEPLOYMENT.md) | Deployment instructions | 🤖 Auto-generated |

## 🤖 Autonomous Documentation System

This project includes an **AI-powered documentation generator** that keeps your docs in sync with your codebase automatically.

### Quick Start

```bash
# 1. Add your API key to .env
echo "ANTHROPIC_API_KEY=sk-ant-your-key" >> .env

# 2. Generate documentation
npm run docs:generate

# That's it! ✨
```

### Available Commands

```bash
npm run docs:generate    # Generate all documentation from scratch
npm run docs:update      # Update existing docs to match code
npm run docs:api         # Generate API documentation only
npm run docs:readme      # Generate README only
```

### How It Works

The documentation agent:
1. 📖 **Reads** your planning, architecture, and source files
2. 🧠 **Analyzes** the codebase structure and intent
3. ✍️ **Generates** professional technical documentation
4. 💾 **Writes** documentation files automatically

### Features

- ✅ **Intelligent Scanning** - Prioritizes important files, skips noise
- ✅ **Multi-Mode** - Generate, update, API-only, README-only
- ✅ **Token Optimized** - Truncates source files to reduce costs
- ✅ **Multi-Provider** - Supports Anthropic API and OpenRouter
- ✅ **Context-Aware** - Uses planning docs for accurate output

## 📖 Documentation Guides

### For Users

If you're using this marketplace:
- **Setup**: See [SETUP-GUIDE.md](SETUP-GUIDE.md)
- **API Reference**: See [API_DOCS.md](API_DOCS.md) (auto-generated)
- **Contributing**: See [CONTRIBUTING.md](CONTRIBUTING.md)

### For Developers

If you're working on this codebase:
- **Architecture**: See [../ARCHITECTURE/system-design.md](../ARCHITECTURE/system-design.md)
- **Planning Docs**: See [../PLANNING/](../PLANNING/)
- **Agent Details**: See [AUTONOMOUS-DOCS.md](AUTONOMOUS-DOCS.md)

## 🎯 Documentation Philosophy

### Always Up-to-Date
Run `npm run docs:update` after code changes to keep docs fresh.

### AI-Assisted, Human-Reviewed
The agent generates drafts. **You should review and refine** the output.

### Version Controlled
All documentation is committed to git and versioned with the code.

### Multiple Formats
- **README.md** - Quick overview for GitHub
- **API_DOCS.md** - Technical reference
- **DEPLOYMENT.md** - Operations guide
- **AUTONOMOUS-DOCS.md** - Meta documentation about the doc system

## 🔄 Documentation Workflow

### Initial Setup (One-time)
```bash
# 1. Fill planning documents
code PLANNING/01-project-brief.md
code PLANNING/02-requirements.md
code PLANNING/03-architecture.md

# 2. Generate initial docs
npm run docs:generate

# 3. Review and commit
git add DOCUMENTATION/
git commit -m "docs: initial generation"
```

### Regular Updates (After Changes)
```bash
# 1. Make code changes
# src/features/newFeature.js

# 2. Update docs
npm run docs:update

# 3. Review changes
git diff DOCUMENTATION/

# 4. Commit
git add .
git commit -m "docs: update for new feature"
```

### Before Releases
```bash
# Full regeneration
npm run docs:generate

# Manual polish
code README.md
code DOCUMENTATION/API_DOCS.md

# Commit
git add .
git commit -m "docs: v1.0 release documentation"
```

## 💡 Best Practices

### 1. Keep Planning Docs Current
The doc agent uses `PLANNING/` and `ARCHITECTURE/` as the source of truth.

Update these when:
- ✅ Project scope changes
- ✅ New features are added
- ✅ Architecture evolves
- ✅ Requirements shift

### 2. Review AI Output
Always review generated documentation for:
- ✅ **Accuracy** - Does it match implementation?
- ✅ **Clarity** - Is it understandable?
- ✅ **Completeness** - Are edge cases covered?

### 3. Use Version Control
```bash
# Before regenerating
git commit -m "docs: pre-generation checkpoint"

# After review
git add DOCUMENTATION/
git commit -m "docs: AI-generated, human-reviewed"
```

### 4. Choose the Right Mode

| Scenario | Command | Why |
|----------|---------|-----|
| New project | `docs:generate` | Start fresh |
| After feature | `docs:update` | Incremental changes |
| API changes | `docs:api` | Focus on endpoints |
| Marketing | `docs:readme` | Polish project overview |

## 🎓 Learning Resources

### Understanding the System
- [AUTONOMOUS-DOCS.md](AUTONOMOUS-DOCS.md) - Deep dive into how it works
- [SETUP-GUIDE.md](SETUP-GUIDE.md) - Quick start and troubleshooting
- [../scripts/doc-agent.js](../scripts/doc-agent.js) - Source code (well-commented)

### Customization Examples
```bash
# Add new documentation type
# Edit: scripts/doc-agent.js
# Add mode to: prepareContext()
# Add command: package.json scripts

# Adjust file filtering
# Edit: analyzeCodebase() in doc-agent.js
# Change: PRIORITY_EXTENSIONS, TRUNCATE_THRESHOLD

# Switch AI models
# Edit: generateDocumentation() in doc-agent.js
# Change: model = 'claude-opus-4-20250514'
```

## 🐛 Troubleshooting

### Common Issues

**API Key Not Found**
```bash
# Check .env
cat .env | grep ANTHROPIC_API_KEY

# Add if missing
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```

**High Token Usage**
```bash
# Use update instead of generate
npm run docs:update

# Or edit filters in doc-agent.js
# Reduce TRUNCATE_THRESHOLD and MAX_FILE_SIZE
```

**Parse Errors**
```bash
# Try simpler mode
npm run docs:readme

# Check console output for partial results
```

See [SETUP-GUIDE.md](SETUP-GUIDE.md) for more troubleshooting.

## 📊 System Stats

| Metric | Value |
|--------|-------|
| Supported file types | `.js`, `.ts`, `.jsx`, `.tsx`, `.md`, `.json` |
| Documentation modes | 4 (generate, update, api, readme) |
| AI providers | 2 (Anthropic, OpenRouter) |
| Avg tokens per run | 20K-80K |
| Avg cost per run | $0.10-$0.25 |
| Time to generate | 10-30 seconds |

## 🤝 Contributing

### Improve Documentation
1. Use the doc agent to generate drafts
2. Manually refine and polish
3. Submit PR with improvements

### Improve the Doc Agent
1. Fork and clone the repo
2. Make changes to `scripts/doc-agent.js`
3. Test with `npm run docs:generate`
4. Submit PR

See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guidelines.

## 🔗 Quick Links

- **[Setup Guide](SETUP-GUIDE.md)** - Get started in 5 minutes
- **[Autonomous Docs](AUTONOMOUS-DOCS.md)** - Complete system documentation
- **[Project README](../README.md)** - Main project overview
- **[Planning Docs](../PLANNING/)** - Project requirements and architecture

---

## ✨ Next Steps

1. **Read** [SETUP-GUIDE.md](SETUP-GUIDE.md)
2. **Add** your API key to `.env`
3. **Run** `npm run docs:readme`
4. **Review** the generated output
5. **Iterate** and customize as needed

**Need help?** Check [AUTONOMOUS-DOCS.md](AUTONOMOUS-DOCS.md) or open an issue.

🤖 *This documentation system was built with Claude Agent SDK* • [Organized AI](https://organized.ai)
