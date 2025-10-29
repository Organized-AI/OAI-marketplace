# Autonomous Documentation System

> 🤖 **AI-powered documentation that stays in sync with your codebase**

This system uses the Claude Agent SDK to automatically generate and maintain comprehensive documentation by analyzing your codebase, planning documents, and architecture files.

## 🚀 Quick Start

### Prerequisites

1. **API Key Setup**: Add your Anthropic API key to `.env`:
   ```bash
   ANTHROPIC_API_KEY=your_key_here
   ```

2. **Install Dependencies** (if not already done):
   ```bash
   npm install
   ```

### Generate Documentation

```bash
# Generate ALL documentation from scratch
npm run docs:generate

# Update existing documentation to match current code
npm run docs:update

# Generate API documentation only
npm run docs:api

# Generate README only
npm run docs:readme
```

## 📋 What Gets Generated

The documentation agent analyzes your codebase and creates:

| File | Description |
|------|-------------|
| `README.md` | Comprehensive project overview with setup, features, and usage |
| `DOCUMENTATION/API_DOCS.md` | API documentation extracted from source code |
| `DOCUMENTATION/DEPLOYMENT.md` | Deployment guide based on architecture specs |

## 🎯 How It Works

### 1. Intelligent Codebase Analysis

The agent scans your project with smart filtering:

```javascript
✅ Prioritizes:  .js, .ts, .jsx, .tsx, .md, .json files
✅ Full content: Planning, Architecture, Specifications docs
✅ Truncated:    Source files (>10KB summarized)
✅ Skips:        node_modules, .git, test files, files >100KB
```

### 2. Context Preparation

Different modes prepare different context:

- **Generate Mode**: Full project analysis + planning + architecture + source
- **Update Mode**: Current docs + codebase changes
- **API Mode**: Source code focus for endpoint/function extraction
- **README Mode**: Planning docs + code structure

### 3. Claude Analysis

Sends curated context to Claude Sonnet 4 with specific prompts for:
- Technical accuracy
- Clear, professional writing
- Code examples and usage
- Proper file cross-references

### 4. File Generation

Automatically writes documentation files with:
- Proper directory structure creation
- File backups (existing docs preserved)
- Success/failure reporting

## 🛠️ Advanced Usage

### Custom Filtering

Edit `scripts/doc-agent.js` to customize file discovery:

```javascript
const PRIORITY_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.md', '.json'];
const MAX_FILE_SIZE = 100 * 1024; // 100KB
const TRUNCATE_THRESHOLD = 10 * 1024; // 10KB
const IGNORE_PATTERNS = ['node_modules', '.git', '.DS_Store', 'package-lock.json'];
```

### Add New Documentation Types

Extend `prepareContext()` function with new modes:

```javascript
const contexts = {
  generate: '...',
  update: '...',
  api: '...',
  readme: '...',
  // Add your custom mode here
  architecture: `Create architecture diagrams and system design docs...`
};
```

Then add npm script:
```json
"docs:architecture": "node scripts/doc-agent.js --mode=architecture"
```

## 📊 Token Optimization

The system is designed to minimize token usage:

| Category | Treatment | Reason |
|----------|-----------|--------|
| Planning docs | Full content | Critical context for understanding project |
| Architecture | Full content | Essential for technical decisions |
| Source files | Truncated @ 10KB | Extract structure, not implementation details |
| Large files (>100KB) | Skipped | Diminishing returns vs token cost |
| Test files | Excluded | Not needed for user-facing docs |

**Typical Usage**: 20-50K tokens per full generation (~$0.15-0.40 with Sonnet 4)

## 🔄 Recommended Workflow

### Initial Documentation
```bash
# 1. Fill out your planning documents
# PLANNING/01-project-brief.md
# PLANNING/02-requirements.md
# PLANNING/03-architecture.md

# 2. Generate initial docs
npm run docs:generate

# 3. Review and manually refine
code README.md
code DOCUMENTATION/API_DOCS.md
```

### Continuous Updates
```bash
# After making code changes, update docs
npm run docs:update

# Or regenerate specific sections
npm run docs:api     # After adding new endpoints
npm run docs:readme  # After major feature changes
```

### Before Releases
```bash
# Full regeneration to ensure accuracy
npm run docs:generate

# Manual review
git diff README.md DOCUMENTATION/
```

## 🎓 Best Practices

### 1. Keep Planning Docs Current
The agent uses planning documents as source of truth. Update them when:
- Project scope changes
- New features are added
- Architecture evolves

### 2. Review AI Output
Always review generated docs for:
- **Accuracy**: Does it match your implementation?
- **Clarity**: Is it understandable to your audience?
- **Completeness**: Are edge cases documented?

### 3. Use Version Control
```bash
# Commit before regenerating
git add .
git commit -m "docs: pre-generation checkpoint"

# Regenerate
npm run docs:update

# Review changes
git diff
```

### 4. Customize Prompts
Edit `prepareContext()` in `scripts/doc-agent.js` to:
- Match your documentation style
- Include domain-specific requirements
- Add custom sections or formats

## 🐛 Troubleshooting

### "ANTHROPIC_API_KEY not found"
```bash
# Check .env file exists and contains key
cat .env | grep ANTHROPIC_API_KEY

# If missing, add it
echo "ANTHROPIC_API_KEY=your_key_here" >> .env
```

### "Could not parse JSON from response"
The agent falls back to markdown extraction. If this happens:
1. Check the console output for partial results
2. Try regenerating with a simpler mode (`npm run docs:readme`)
3. Reduce codebase size by adjusting filters

### "No planning documents found"
Fill out at least `PLANNING/01-project-brief.md` first:
```bash
code PLANNING/01-project-brief.md
```

### Large Token Usage
If costs are high:
1. Increase `TRUNCATE_THRESHOLD` to reduce source code sent
2. Add more patterns to `IGNORE_PATTERNS`
3. Use `--mode=api` or `--mode=readme` instead of `--mode=generate`

## 💡 Examples

### Example 1: New Project Setup
```bash
# Day 1: Create planning docs
code PLANNING/01-project-brief.md
# Fill out vision, goals, features

# Generate initial documentation
npm run docs:generate

# Outputs:
# ✓ README.md (project overview)
# ✓ DOCUMENTATION/API_DOCS.md (API reference)
# ✓ DOCUMENTATION/DEPLOYMENT.md (deployment guide)
```

### Example 2: Feature Addition
```bash
# After implementing new feature
git add src/features/newFeature.js

# Update docs to include new feature
npm run docs:update

# Review changes
git diff DOCUMENTATION/API_DOCS.md
```

### Example 3: API-Only Updates
```bash
# After modifying API endpoints
npm run docs:api

# Only regenerates API_DOCS.md
# Leaves README.md and other docs unchanged
```

## 🔮 Future Enhancements

Planned improvements:
- [ ] **Incremental updates**: Only regenerate sections that changed
- [ ] **Multi-language support**: Generate docs in multiple languages
- [ ] **Diagram generation**: Auto-create architecture diagrams
- [ ] **Link validation**: Ensure all internal links work
- [ ] **Changelog generation**: Auto-generate CHANGELOG.md from commits
- [ ] **Tutorial generation**: Create step-by-step guides from code

## 📚 Related Documentation

- [Claude Agent SDK](https://github.com/anthropics/anthropic-sdk-typescript)
- [Project Setup Guide](../README.md)
- [Contributing Guidelines](CONTRIBUTING.md)

## 🤝 Contributing

Found ways to improve the documentation agent? We'd love your contributions:

1. **Share prompts**: Better prompts = better docs
2. **Add modes**: New documentation types
3. **Improve filtering**: Smarter file selection
4. **Fix bugs**: Report issues or submit fixes

---

**Questions?** Open an issue or reach out to the [Organized AI community](https://lu.ma/Organizedai).

🤖 *This documentation system was built using Claude Agent SDK and follows the Organized Codebase methodology.*
