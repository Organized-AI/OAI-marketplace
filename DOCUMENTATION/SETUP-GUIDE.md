# Autonomous Documentation System - Setup Guide

## 🎯 Quick Setup

Your autonomous documentation system is **ready to use**! Just add your API key and run.

### Step 1: Add API Key

Choose **ONE** of these options:

#### Option A: Anthropic API (Recommended)
```bash
# Add to .env file
echo "ANTHROPIC_API_KEY=sk-ant-..." >> .env
```
Get your key: https://console.anthropic.com/settings/keys

#### Option B: OpenRouter API
```bash
# Add to .env file
echo "OPENROUTER_API_KEY=sk-or-v1-..." >> .env
```
Get your key: https://openrouter.ai/keys

### Step 2: Run the Documentation Agent

```bash
# Generate comprehensive documentation
npm run docs:generate

# Or generate specific docs
npm run docs:readme      # Just README
npm run docs:api         # Just API docs
npm run docs:update      # Update existing docs
```

## 📁 What You Have

### Scripts Created

| File | Purpose |
|------|---------|
| `scripts/doc-agent.js` | Main autonomous documentation agent |
| `package.json` | Updated with doc commands |
| `DOCUMENTATION/AUTONOMOUS-DOCS.md` | Complete usage guide |
| `DOCUMENTATION/SETUP-GUIDE.md` | This file |

### NPM Commands Available

```bash
npm run docs:generate    # Generate ALL docs from scratch
npm run docs:update      # Update existing docs with code changes
npm run docs:api         # Generate API documentation only
npm run docs:readme      # Generate README only
```

## 🔧 System Features

### Intelligent File Scanning
- ✅ Prioritizes `.js`, `.ts`, `.jsx`, `.tsx`, `.md`, `.json` files
- ✅ Full content for Planning, Architecture, Specifications
- ✅ Truncates source files >10KB (summaries only)
- ✅ Skips `node_modules`, `.git`, test files
- ✅ Ignores files >100KB

### Multi-Provider Support
- ✅ **Anthropic API** (direct, fastest)
- ✅ **OpenRouter** (access to Claude + 100+ models)
- ⏳ **GLM** (planned)

### Documentation Modes

#### 1. Generate Mode (`--mode=generate`)
Creates **all documentation** from scratch:
- README.md
- DOCUMENTATION/API_DOCS.md
- DOCUMENTATION/DEPLOYMENT.md

**Use when**: Starting fresh or major changes

#### 2. Update Mode (`--mode=update`)
Updates **existing docs** to match current code:
- Preserves manual edits
- Adds new features
- Removes outdated info

**Use when**: After code changes, regular maintenance

#### 3. API Mode (`--mode=api`)
Generates **API documentation only**:
- Extracts functions from source
- Documents parameters, returns
- Includes usage examples

**Use when**: API endpoints changed

#### 4. README Mode (`--mode=readme`)
Generates **README.md only**:
- Project overview
- Setup instructions
- Feature highlights

**Use when**: Marketing copy needs refresh

## 🚀 Example Workflow

### First Time Setup
```bash
# 1. Add API key
echo "ANTHROPIC_API_KEY=sk-ant-your-key" >> .env

# 2. Generate all documentation
npm run docs:generate

# 3. Review generated files
git diff README.md
cat DOCUMENTATION/API_DOCS.md

# 4. Commit
git add .
git commit -m "docs: generate comprehensive documentation"
```

### After Adding Features
```bash
# 1. Code your new feature
# src/features/newFeature.js

# 2. Update planning docs
code PLANNING/02-requirements.md
# Add new feature requirements

# 3. Update documentation
npm run docs:update

# 4. Review changes
git diff DOCUMENTATION/

# 5. Commit
git add .
git commit -m "docs: update for new feature"
```

### Before Release
```bash
# Full regeneration
npm run docs:generate

# Manual review
code README.md
code DOCUMENTATION/API_DOCS.md

# Polish and commit
git add .
git commit -m "docs: regenerate for v1.0 release"
```

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY not found"

**Solution 1**: Check .env file
```bash
cat .env | grep ANTHROPIC_API_KEY
# Should show: ANTHROPIC_API_KEY=sk-ant-...
```

**Solution 2**: Add the key
```bash
echo "ANTHROPIC_API_KEY=your-key-here" >> .env
```

### "OpenRouter API error: 401"

This means your OpenRouter key is invalid/expired.

**Solutions**:
1. Get new key: https://openrouter.ai/keys
2. OR use Anthropic API instead (add `ANTHROPIC_API_KEY` to .env)

### "Could not parse JSON from response"

The AI returned invalid format. Try:

```bash
# Use simpler mode
npm run docs:readme

# Or reduce context size by editing filters in doc-agent.js
```

### Files Too Large / High Token Usage

Edit `scripts/doc-agent.js`:
```javascript
const TRUNCATE_THRESHOLD = 5 * 1024; // Reduce from 10KB to 5KB
const MAX_FILE_SIZE = 50 * 1024;     // Reduce from 100KB to 50KB
```

## 💰 Cost Estimates

### Anthropic Direct API

| Mode | Tokens | Cost (Sonnet 4) |
|------|--------|-----------------|
| `docs:readme` | ~50K | $0.15 |
| `docs:api` | ~30K | $0.10 |
| `docs:update` | ~40K | $0.12 |
| `docs:generate` | ~80K | $0.25 |

### OpenRouter (Same models, similar costs)

Claude Sonnet 4 pricing through OpenRouter is competitive with direct API.

**Budget tip**: Use `docs:update` instead of `docs:generate` to minimize token usage.

## 🎓 Advanced Customization

### Add New Documentation Type

1. **Edit** `scripts/doc-agent.js`
2. **Find** `prepareContext()` function
3. **Add** new mode:

```javascript
const contexts = {
  generate: '...',
  update: '...',
  api: '...',
  readme: '...',
  // Your new mode
  changelog: `You are a changelog expert. Extract git commits and create CHANGELOG.md...`
};
```

4. **Add npm script** in `package.json`:
```json
"docs:changelog": "node scripts/doc-agent.js --mode=changelog"
```

### Customize File Filtering

Edit `analyzeCodebase()` in `scripts/doc-agent.js`:

```javascript
const PRIORITY_EXTENSIONS = ['.js', '.ts', '.py', '.go']; // Add languages
const TRUNCATE_THRESHOLD = 20 * 1024; // Increase for more context
const IGNORE_PATTERNS = ['node_modules', '.git', 'vendor']; // Add patterns
```

### Change AI Model

For Anthropic:
```javascript
const model = 'claude-opus-4-20250514'; // More powerful, higher cost
```

For OpenRouter:
```javascript
const model = 'anthropic/claude-opus-4'; // Or any other model
```

## 📊 System Architecture

```
┌─────────────────────────────────────────────┐
│         Doc Agent (doc-agent.js)            │
│                                             │
│  1. Scan Codebase                          │
│     ├─ Planning docs (full)                │
│     ├─ Architecture (full)                 │
│     ├─ Source code (truncated)             │
│     └─ Config (full)                       │
│                                             │
│  2. Prepare Context                        │
│     ├─ Filter by extension                 │
│     ├─ Skip ignored patterns               │
│     ├─ Truncate large files                │
│     └─ Build prompt                        │
│                                             │
│  3. Call AI Provider                       │
│     ├─ Try Anthropic (direct)              │
│     ├─ Try OpenRouter (fallback)           │
│     └─ Return documentation                │
│                                             │
│  4. Write Files                            │
│     ├─ Create directories                  │
│     ├─ Write documentation                 │
│     └─ Report success                      │
└─────────────────────────────────────────────┘
```

## 🔗 Related Documentation

- **Full Usage Guide**: [AUTONOMOUS-DOCS.md](AUTONOMOUS-DOCS.md)
- **Project Overview**: [../README.md](../README.md)
- **Contributing**: [CONTRIBUTING.md](CONTRIBUTING.md)

## ✅ Next Steps

1. ✅ **Add API Key** - Choose Anthropic or OpenRouter
2. ✅ **Test System** - Run `npm run docs:readme`
3. ✅ **Review Output** - Check generated README.md
4. ✅ **Iterate** - Customize prompts and filters as needed
5. ✅ **Integrate** - Add to your CI/CD pipeline

## 🎉 You're Ready!

Your autonomous documentation system is fully functional. It will:
- ✅ Analyze your entire codebase
- ✅ Read planning and architecture docs
- ✅ Generate professional documentation
- ✅ Keep docs in sync with code
- ✅ Save hours of manual work

**Start here**:
```bash
npm run docs:readme
```

Questions? See [AUTONOMOUS-DOCS.md](AUTONOMOUS-DOCS.md) for detailed usage.

---

🤖 Built with Claude Agent SDK • Part of Organized AI Marketplace
