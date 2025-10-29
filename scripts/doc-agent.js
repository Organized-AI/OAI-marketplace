#!/usr/bin/env node

/**
 * Autonomous Documentation Agent
 *
 * This agent uses Claude Agent SDK to automatically:
 * 1. Analyze your codebase structure
 * 2. Read planning and architecture documents
 * 3. Generate comprehensive documentation
 * 4. Update existing docs to reflect code changes
 * 5. Create API documentation from code
 *
 * Usage:
 *   node scripts/doc-agent.js --mode=generate    # Generate all docs
 *   node scripts/doc-agent.js --mode=update      # Update existing docs
 *   node scripts/doc-agent.js --mode=api         # Generate API docs only
 *   node scripts/doc-agent.js --mode=readme      # Generate README only
 */

const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');

// Load environment variables
require('dotenv').config();

// OpenRouter API helper
async function callOpenRouter(messages, apiKey, model = 'anthropic/claude-sonnet-4') {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'HTTP-Referer': 'https://organized.ai',
      'X-Title': 'Organized AI Marketplace',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: model,
      messages: messages,
      max_tokens: 8000
    })
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// ANSI colors for terminal output
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  cyan: '\x1b[36m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  red: '\x1b[31m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function header(message) {
  console.log('\n' + '━'.repeat(70));
  log(message, 'bright');
  console.log('━'.repeat(70) + '\n');
}

async function analyzeCodebase() {
  log('🔍 Analyzing codebase structure...', 'cyan');

  const structure = {
    planning: [],
    architecture: [],
    specifications: [],
    source: [],
    scripts: [],
    config: [],
    tests: []
  };

  // File filtering configuration
  const PRIORITY_EXTENSIONS = ['.js', '.ts', '.jsx', '.tsx', '.md', '.json'];
  const MAX_FILE_SIZE = 100 * 1024; // 100KB
  const TRUNCATE_THRESHOLD = 10 * 1024; // 10KB - truncate source files larger than this
  const IGNORE_PATTERNS = ['node_modules', '.git', '.DS_Store', 'package-lock.json', 'dist', 'build', '.cache'];
  const TEST_PATTERNS = ['.test.', '.spec.', '__tests__'];

  // Scan directories with intelligent filtering
  const directories = {
    planning: { path: 'PLANNING', fullContent: true },
    architecture: { path: 'ARCHITECTURE', fullContent: true },
    specifications: { path: 'SPECIFICATIONS', fullContent: true },
    source: { path: 'src', fullContent: false },
    scripts: { path: 'scripts', fullContent: false },
    config: { path: 'CONFIG', fullContent: true },
    tests: { path: 'tests', fullContent: false }
  };

  for (const [key, config] of Object.entries(directories)) {
    try {
      const files = await scanDirectory(config.path, config.path, {
        priorityExtensions: PRIORITY_EXTENSIONS,
        maxFileSize: MAX_FILE_SIZE,
        truncateThreshold: config.fullContent ? Infinity : TRUNCATE_THRESHOLD,
        ignorePatterns: IGNORE_PATTERNS,
        testPatterns: TEST_PATTERNS,
        includeTests: key === 'tests'
      });
      structure[key] = files;
      log(`  ✓ Scanned ${config.path}: ${files.length} files`, 'green');
    } catch (error) {
      log(`  ⚠ Skipped ${config.path} (not found)`, 'yellow');
    }
  }

  return structure;
}

async function scanDirectory(dir, baseDir = dir, options = {}) {
  const files = [];
  const {
    priorityExtensions = ['.js', '.ts', '.jsx', '.tsx', '.md', '.json'],
    maxFileSize = 100 * 1024,
    truncateThreshold = 10 * 1024,
    ignorePatterns = ['node_modules', '.git'],
    testPatterns = ['.test.', '.spec.'],
    includeTests = false
  } = options;

  try {
    const entries = await fs.readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);

      // Skip ignored patterns
      if (ignorePatterns.some(pattern => entry.name.includes(pattern))) {
        continue;
      }

      if (entry.isDirectory()) {
        // Recursively scan subdirectories
        const subFiles = await scanDirectory(fullPath, baseDir, options);
        files.push(...subFiles);
      } else if (entry.isFile()) {
        // Check if file extension is prioritized
        const ext = path.extname(entry.name);
        if (!priorityExtensions.includes(ext)) {
          continue;
        }

        // Skip test files unless explicitly included
        const isTestFile = testPatterns.some(pattern => entry.name.includes(pattern));
        if (isTestFile && !includeTests) {
          continue;
        }

        // Read file content for analysis
        let content = await fs.readFile(fullPath, 'utf-8');
        const originalSize = content.length;

        // Skip files that are too large
        if (originalSize > maxFileSize) {
          log(`  ℹ Skipping ${entry.name} (${Math.round(originalSize / 1024)}KB > ${Math.round(maxFileSize / 1024)}KB)`, 'blue');
          continue;
        }

        // Truncate content if needed
        let truncated = false;
        if (originalSize > truncateThreshold) {
          content = content.slice(0, truncateThreshold) + '\n\n[... truncated ...]';
          truncated = true;
        }

        files.push({
          path: fullPath,
          relativePath: path.relative(baseDir, fullPath),
          name: entry.name,
          content: content,
          size: originalSize,
          truncated: truncated
        });
      }
    }
  } catch (error) {
    // Directory doesn't exist, return empty array
  }

  return files;
}

async function readExistingDocs() {
  log('📖 Reading existing documentation...', 'cyan');

  const docs = {};
  const docFiles = [
    'README.md',
    'DOCUMENTATION/README.md',
    'DOCUMENTATION/API_DOCS.md',
    'DOCUMENTATION/DEPLOYMENT.md'
  ];

  for (const file of docFiles) {
    try {
      const content = await fs.readFile(file, 'utf-8');
      docs[file] = content;
      log(`  ✓ Read ${file}`, 'green');
    } catch (error) {
      log(`  ℹ ${file} not found (will create)`, 'blue');
    }
  }

  return docs;
}

async function generateDocumentation(mode, structure, existingDocs) {
  header('🤖 Generating Documentation with Claude');

  // Try multiple API key sources with priority
  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  const openrouterKey = process.env.OPENROUTER_API_KEY;
  const glmKey = process.env.GLM_API_KEY;

  let responseText, provider;

  // Prepare context for Claude
  const context = prepareContext(mode, structure, existingDocs);

  log(`Context size: ${context.length} characters`, 'blue');

  // Priority: Anthropic (direct) > OpenRouter > GLM
  if (anthropicKey) {
    provider = 'Anthropic (direct)';
    const model = 'claude-sonnet-4-20250514';
    log(`Using ${provider} with ${model}`, 'green');

    const client = new Anthropic({ apiKey: anthropicKey });
    const message = await client.messages.create({
      model: model,
      max_tokens: 8000,
      messages: [{
        role: 'user',
        content: context
      }]
    });
    responseText = message.content[0].text;

  } else if (openrouterKey) {
    provider = 'OpenRouter (Claude Sonnet 4)';
    const model = 'anthropic/claude-sonnet-4';
    log(`Using ${provider}`, 'green');

    responseText = await callOpenRouter([{
      role: 'user',
      content: context
    }], openrouterKey, model);

  } else if (glmKey) {
    log('⚠️  GLM API not yet supported for this agent', 'yellow');
    log('Please set ANTHROPIC_API_KEY or OPENROUTER_API_KEY', 'yellow');
    process.exit(1);
  } else {
    log('❌ Error: No API key found in environment', 'red');
    log('Please set one of: ANTHROPIC_API_KEY, OPENROUTER_API_KEY, GLM_API_KEY', 'yellow');
    process.exit(1);
  }

  log(`✓ Received response from ${provider}`, 'green');
  return parseResponse(responseText, mode);
}

function prepareContext(mode, structure, existingDocs) {
  const contexts = {
    generate: `You are an expert technical documentation writer. Analyze this codebase and generate comprehensive documentation.

PROJECT STRUCTURE:
${JSON.stringify(structure, null, 2)}

PLANNING DOCUMENTS:
${structure.planning.map(f => `\n### ${f.name}\n${f.content}`).join('\n')}

ARCHITECTURE DOCUMENTS:
${structure.architecture.map(f => `\n### ${f.name}\n${f.content}`).join('\n')}

SOURCE CODE FILES:
${structure.source.map(f => `\n### ${f.relativePath}\n\`\`\`\n${f.content.slice(0, 1000)}\n\`\`\`\n`).join('\n')}

TASK: Generate the following documentation files:
1. **README.md** - Comprehensive project overview with setup, features, and usage
2. **DOCUMENTATION/API_DOCS.md** - API documentation extracted from source
3. **DOCUMENTATION/DEPLOYMENT.md** - Deployment guide based on architecture

For each file, provide:
- Clear, professional technical writing
- Code examples where appropriate
- Links to related files
- Accurate reflection of the actual codebase

Return your response in this JSON format:
{
  "README.md": "content here",
  "DOCUMENTATION/API_DOCS.md": "content here",
  "DOCUMENTATION/DEPLOYMENT.md": "content here"
}`,

    update: `You are an expert technical documentation writer. Update the existing documentation to reflect current codebase state.

CURRENT DOCUMENTATION:
${Object.entries(existingDocs).map(([file, content]) => `\n### ${file}\n${content}`).join('\n')}

CURRENT CODEBASE:
${JSON.stringify(structure, null, 2)}

SOURCE CODE:
${structure.source.map(f => `\n### ${f.relativePath}\n\`\`\`\n${f.content.slice(0, 1000)}\n\`\`\`\n`).join('\n')}

TASK: Update the documentation files to match the current codebase. Focus on:
- New features or changes not documented
- Outdated information that needs updating
- Missing API endpoints or functions
- Configuration changes

Return your response in this JSON format:
{
  "README.md": "updated content",
  "DOCUMENTATION/API_DOCS.md": "updated content"
}`,

    api: `You are an expert API documentation writer. Extract and document all APIs from this codebase.

SOURCE CODE:
${structure.source.map(f => `\n### ${f.relativePath}\n\`\`\`\n${f.content}\n\`\`\`\n`).join('\n')}

TASK: Create comprehensive API documentation including:
- All exported functions and their signatures
- Parameters and return types
- Usage examples
- Error handling
- Authentication requirements (if any)

Return your response in this JSON format:
{
  "DOCUMENTATION/API_DOCS.md": "api documentation content"
}`,

    readme: `You are an expert technical writer. Create a compelling README.md for this project.

PLANNING:
${structure.planning.map(f => `\n### ${f.name}\n${f.content}`).join('\n')}

CODEBASE:
${JSON.stringify(structure, null, 2)}

SOURCE CODE:
${structure.source.map(f => `\n### ${f.relativePath}\n\`\`\`\n${f.content.slice(0, 500)}\n\`\`\`\n`).join('\n')}

TASK: Create a README.md that includes:
- Project title and description
- Key features
- Installation instructions
- Usage examples
- Configuration guide
- Contributing guidelines
- License

Return your response in this JSON format:
{
  "README.md": "readme content"
}`
  };

  return contexts[mode] || contexts.generate;
}

function parseResponse(responseText, mode) {
  try {
    // Extract JSON from response (might be wrapped in markdown)
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('Could not parse JSON from response');
    }

    return JSON.parse(jsonMatch[0]);
  } catch (error) {
    log(`⚠️ Warning: Failed to parse JSON response`, 'yellow');
    log('Attempting to extract markdown sections...', 'yellow');

    // Fallback: try to extract markdown sections
    const docs = {};
    const sections = responseText.split('###');

    for (const section of sections) {
      const lines = section.trim().split('\n');
      const filename = lines[0].trim();
      const content = lines.slice(1).join('\n').trim();

      if (filename && content) {
        docs[filename] = content;
      }
    }

    return docs;
  }
}

async function writeDocs(docs) {
  header('💾 Writing Documentation Files');

  for (const [filepath, content] of Object.entries(docs)) {
    try {
      // Ensure directory exists
      const dir = path.dirname(filepath);
      await fs.mkdir(dir, { recursive: true });

      // Write file
      await fs.writeFile(filepath, content, 'utf-8');
      log(`  ✓ Wrote ${filepath}`, 'green');
    } catch (error) {
      log(`  ✗ Failed to write ${filepath}: ${error.message}`, 'red');
    }
  }
}

async function main() {
  try {
    header('📚 Autonomous Documentation Agent');

    // Parse command line arguments
    const args = process.argv.slice(2);
    const modeArg = args.find(arg => arg.startsWith('--mode='));
    const mode = modeArg ? modeArg.split('=')[1] : 'generate';

    const validModes = ['generate', 'update', 'api', 'readme'];
    if (!validModes.includes(mode)) {
      log(`❌ Invalid mode: ${mode}`, 'red');
      log(`Valid modes: ${validModes.join(', ')}`, 'yellow');
      process.exit(1);
    }

    log(`Mode: ${mode}`, 'bright');
    console.log('');

    // Analyze codebase
    const structure = await analyzeCodebase();

    // Read existing docs (for update mode)
    const existingDocs = await readExistingDocs();

    // Generate documentation with Claude
    const docs = await generateDocumentation(mode, structure, existingDocs);

    // Write documentation files
    await writeDocs(docs);

    header('✅ Documentation Generation Complete!');

    log('📋 Generated Files:', 'bright');
    Object.keys(docs).forEach(file => {
      log(`  • ${file}`, 'cyan');
    });

    console.log('');
    log('💡 Next Steps:', 'magenta');
    log('  1. Review generated documentation', 'magenta');
    log('  2. Make any necessary manual adjustments', 'magenta');
    log('  3. Commit documentation to version control', 'magenta');
    log('  4. Run "node scripts/doc-agent.js --mode=update" to sync later', 'magenta');
    console.log('');

  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    console.error(error);
    process.exit(1);
  }
}

main();
