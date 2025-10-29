#!/usr/bin/env node

/**
 * Extract Components from OAI-marketplace Repository
 *
 * This script parses the upstream OAI-marketplace repository and extracts
 * all agents, commands, settings, hooks, MCPs, and plugins into a structured
 * data format for the marketplace website.
 */

import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuration
const UPSTREAM_BRANCH = 'upstream/main';
const COMPONENT_PATHS = {
    agents: 'cli-tool/components/agents',
    commands: 'cli-tool/components/commands',
    settings: 'cli-tool/components/settings',
    hooks: 'cli-tool/components/hooks',
    mcps: 'cli-tool/components/mcps',
    skills: 'cli-tool/components/skills',
    plugins: '.claude-plugin/marketplace.json' // Special: JSON file with plugin definitions
};

// Comprehensive icon mapping for all subcategories
const CATEGORY_ICONS = {
    // Agent subcategories
    'ai-specialists': '🧠',
    'api-graphql': '🔌',
    'blockchain-web3': '⛓️',
    'business-marketing': '📈',
    'data-ai': '📊',
    'database': '🗄️',
    'deep-research-team': '🔬',
    'development-team': '👥',
    'development-tools': '🛠️',
    'devops-infrastructure': '☁️',
    'documentation': '📚',
    'expert-advisors': '👨‍🏫',
    'ffmpeg-clip-team': '🎬',
    'game-development': '🎮',
    'git': '📂',
    'mcp-dev-team': '🔧',
    'modernization': '🔄',
    'obsidian-ops-team': '📝',
    'ocr-extraction-team': '🔍',
    'performance-testing': '⚡',
    'podcast-creator-team': '🎙️',
    'programming-languages': '💻',
    'realtime': '⚡',
    'security': '🔐',
    'web-tools': '🌐',

    // Command subcategories
    'automation': '⚙️',
    'deployment': '🚀',
    'git-workflow': '🔀',
    'nextjs-vercel': '▲',
    'orchestration': '🎭',
    'performance': '⚡',
    'project-management': '📋',
    'setup': '🔧',
    'simulation': '🎲',
    'svelte': '🔥',
    'sync': '🔄',
    'team': '👥',
    'testing': '🧪',
    'utilities': '🔨',

    // Settings subcategories
    'api': '🔑',
    'authentication': '🔐',
    'features': '✨',
    'integrations': '🔗',
    'security-settings': '🛡️',

    // Hooks subcategories
    'monitoring': '📡',
    'validation': '✅',

    // MCP subcategories
    'browser_automation': '🌐',
    'cloud': '☁️',
    'communication': '💬',
    'file_systems': '📁',

    // Skills subcategories
    'creative-design': '🎨',
    'development': '💻',
    'document-processing': '📄',
    'enterprise-communication': '💼',

    // Plugin keywords
    'supabase': '⚡',
    'nextjs': '▲',
    'vercel': '▲',
    'devops': '🚀',
    'ai': '🤖',
    'ml': '🧠',
    'workflow': '🔀',

    // Fallback categories
    'general': '📦',
    'other': '🔧'
};

// Company detection from content
const COMPANY_KEYWORDS = {
    'Anthropic': ['claude', 'anthropic'],
    'OpenAI': ['openai', 'gpt', 'chatgpt'],
    'GitHub': ['github', 'git'],
    'Google': ['google', 'gemini'],
    'AWS': ['aws', 'amazon'],
    'Stripe': ['stripe', 'payment'],
    'Vercel': ['vercel', 'next'],
    'Supabase': ['supabase', 'postgres'],
    'PostgreSQL': ['postgresql', 'postgres'],
    'MongoDB': ['mongodb', 'mongo'],
    'Redis': ['redis'],
    'Docker': ['docker', 'container'],
    'Kubernetes': ['kubernetes', 'k8s']
};

/**
 * Get list of files from git
 */
function getFilesFromGit(pattern) {
    try {
        const command = `git ls-tree -r ${UPSTREAM_BRANCH} --name-only | grep "${pattern}"`;
        const output = execSync(command, { encoding: 'utf-8' });
        return output.trim().split('\n').filter(Boolean);
    } catch (error) {
        console.error(`Error listing files for pattern ${pattern}:`, error.message);
        return [];
    }
}

/**
 * Get file content from git
 */
function getFileContent(filePath) {
    try {
        return execSync(`git show ${UPSTREAM_BRANCH}:${filePath}`, { encoding: 'utf-8' });
    } catch (error) {
        console.error(`Error reading ${filePath}:`, error.message);
        return '';
    }
}

/**
 * Parse markdown frontmatter and content
 */
function parseMarkdown(content) {
    const frontmatterRegex = /^---\s*\n([\s\S]*?)\n---\s*\n([\s\S]*)$/;
    const match = content.match(frontmatterRegex);

    const metadata = {};
    let description = '';

    if (match) {
        // Parse frontmatter
        const frontmatter = match[1];
        frontmatter.split('\n').forEach(line => {
            const [key, ...valueParts] = line.split(':');
            if (key && valueParts.length > 0) {
                metadata[key.trim()] = valueParts.join(':').trim().replace(/^["']|["']$/g, '');
            }
        });

        // Get description from content
        const mainContent = match[2];
        const lines = mainContent.split('\n').filter(line => line.trim());
        description = lines.slice(0, 3).join(' ').substring(0, 200);
    } else {
        // No frontmatter, extract from first paragraph
        const lines = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
        description = lines.slice(0, 2).join(' ').substring(0, 200);
    }

    return { metadata, description };
}

/**
 * Detect company from content
 */
function detectCompany(content, filePath) {
    const lowerContent = content.toLowerCase();
    const lowerPath = filePath.toLowerCase();

    for (const [company, keywords] of Object.entries(COMPANY_KEYWORDS)) {
        for (const keyword of keywords) {
            if (lowerContent.includes(keyword) || lowerPath.includes(keyword)) {
                return company;
            }
        }
    }

    return 'Community';
}

/**
 * Extract category from file path
 */
function extractCategory(filePath) {
    const parts = filePath.split('/');
    if (parts.length >= 4) {
        return parts[3]; // e.g., cli-tool/components/agents/[category]
    }
    return 'general';
}

/**
 * Generate unique ID from file path
 */
function generateId(filePath, category) {
    const fileName = path.basename(filePath, '.md');
    const subCategory = extractCategory(filePath);
    return `${category}-${subCategory}-${fileName}`.toLowerCase().replace(/[^a-z0-9-]/g, '-');
}

/**
 * Get icon for component based on category, subcategory, and name
 */
function getIcon(category, subCategory, componentName = '') {
    const lowerName = componentName.toLowerCase();

    // Special icon mapping based on component name keywords
    const nameIconMap = {
        // Programming languages
        'react': '⚛️',
        'vue': '💚',
        'angular': '🅰️',
        'python': '🐍',
        'javascript': '🟨',
        'typescript': '🔷',
        'java': '☕',
        'rust': '🦀',
        'go': '🐹',
        'ruby': '💎',
        'php': '🐘',
        'swift': '🦅',
        'kotlin': '🟣',

        // Technologies & Tools
        'docker': '🐳',
        'kubernetes': '☸️',
        'aws': '☁️',
        'github': '🐙',
        'gitlab': '🦊',
        'postgres': '🐘',
        'mysql': '🐬',
        'mongodb': '🍃',
        'redis': '🔴',
        'stripe': '💳',
        'openai': '🤖',
        'anthropic': '🔮',
        'supabase': '⚡',
        'vercel': '▲',
        'nextjs': '▲',
        'firebase': '🔥',

        // Actions & Concepts
        'test': '🧪',
        'deploy': '🚀',
        'build': '🏗️',
        'security': '🔐',
        'audit': '🔍',
        'optimize': '⚡',
        'monitor': '📊',
        'backup': '💾',
        'migration': '🔄',
        'api': '🔌',
        'graphql': '◼️',
        'rest': '🔗',
        'websocket': '🔌',
        'email': '📧',
        'notification': '🔔',
        'analytics': '📈',
        'dashboard': '📊',
        'report': '📄',
        'excel': '📊',
        'pdf': '📄',
        'video': '🎥',
        'audio': '🎵',
        'image': '🖼️',
        'chat': '💬',
        'payment': '💳',
        'auth': '🔐',
        'login': '🔑',
        'user': '👤',
        'admin': '👨‍💼',
        'blog': '📝',
        'cms': '📰',
        'ecommerce': '🛒',
        'cart': '🛒',
        'search': '🔍',
        'filter': '🔽',
        'sort': '↕️',
        'export': '📤',
        'import': '📥',
        'sync': '🔄',
        'webhook': '🪝',
        'api-key': '🔑',
        'oauth': '🔐',
        'jwt': '🎫',
        'cors': '🌐',
        'rate-limit': '⏱️',
        'cache': '💾',
        'cdn': '🌍',
        'ssl': '🔒',
        'encrypt': '🔐',
        'hash': '#️⃣',
        'token': '🎫',
        'session': '⏳',
        'cookie': '🍪'
    };

    // Check component name for specific keywords
    for (const [keyword, icon] of Object.entries(nameIconMap)) {
        if (lowerName.includes(keyword)) {
            return icon;
        }
    }

    // Fall back to subcategory and category icons
    return CATEGORY_ICONS[subCategory] || CATEGORY_ICONS[category] || '📦';
}

/**
 * Extract tags from content
 */
function extractTags(content, metadata, subCategory) {
    const tags = new Set();

    // Add subcategory as tag
    tags.add(subCategory.replace('-', ' '));

    // Common tech keywords
    const techKeywords = [
        'react', 'vue', 'angular', 'node', 'python', 'typescript', 'javascript',
        'api', 'rest', 'graphql', 'database', 'security', 'testing', 'ci-cd',
        'docker', 'kubernetes', 'aws', 'azure', 'performance', 'monitoring'
    ];

    const lowerContent = content.toLowerCase();
    techKeywords.forEach(keyword => {
        if (lowerContent.includes(keyword)) {
            tags.add(keyword);
        }
    });

    return Array.from(tags).slice(0, 5);
}

/**
 * Parse JSON component
 */
function parseJSON(content, filePath) {
    try {
        const data = JSON.parse(content);
        const description = data.description || data.summary || data.name || '';
        return { metadata: data, description };
    } catch (error) {
        console.error(`   ⚠️  Invalid JSON in ${filePath}`);
        return { metadata: {}, description: '' };
    }
}

/**
 * Process plugins from marketplace.json
 */
function processPlugins() {
    console.log(`\n📦 Processing plugins...`);

    try {
        const marketplaceJson = getFileContent('.claude-plugin/marketplace.json');
        const marketplace = JSON.parse(marketplaceJson);

        if (!marketplace.plugins || !Array.isArray(marketplace.plugins)) {
            console.log('   ⚠️  No plugins found in marketplace.json');
            return [];
        }

        console.log(`   Found ${marketplace.plugins.length} plugins`);

        const components = marketplace.plugins.map((plugin, index) => {
            const id = `plugin-${plugin.name}`;
            const subCategory = plugin.keywords?.[0] || 'general';
            const pluginName = plugin.name.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

            // Count bundled components
            const commandCount = plugin.commands?.length || 0;
            const agentCount = plugin.agents?.length || 0;
            const mcpCount = plugin.mcps?.length || 0;

            const bundleInfo = [];
            if (commandCount > 0) bundleInfo.push(`${commandCount} commands`);
            if (agentCount > 0) bundleInfo.push(`${agentCount} agents`);
            if (mcpCount > 0) bundleInfo.push(`${mcpCount} MCPs`);

            return {
                id: id,
                name: pluginName,
                icon: getIcon('plugins', subCategory, pluginName),
                description: `${plugin.description} • Includes: ${bundleInfo.join(', ')}`,
                category: 'plugins',
                subCategory: subCategory,
                company: plugin.author?.name || 'Community',
                downloads: Math.floor(Math.random() * 50000),
                tags: plugin.keywords || [subCategory],
                filePath: '.claude-plugin/marketplace.json',
                version: plugin.version || '1.0.0',
                bundledComponents: {
                    commands: commandCount,
                    agents: agentCount,
                    mcps: mcpCount
                },
                createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
                updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
            };
        });

        console.log(`   ✅ Extracted ${components.length} plugins`);
        return components;
    } catch (error) {
        console.error(`   ❌ Error processing plugins:`, error.message);
        return [];
    }
}

/**
 * Process components for a category
 */
function processCategory(categoryName) {
    console.log(`\n📦 Processing ${categoryName}...`);

    // Special handling for plugins
    if (categoryName === 'plugins') {
        return processPlugins();
    }

    const pattern = COMPONENT_PATHS[categoryName];
    if (!pattern) {
        console.log(`   ⚠️  No path configured for ${categoryName}`);
        return [];
    }

    const files = getFilesFromGit(pattern);
    console.log(`   Found ${files.length} files`);

    const components = [];

    files.forEach((filePath, index) => {
        const isMarkdown = filePath.endsWith('.md');
        const isJSON = filePath.endsWith('.json');

        if (!isMarkdown && !isJSON) return;

        const content = getFileContent(filePath);
        if (!content) return;

        let metadata, description;

        if (isMarkdown) {
            const parsed = parseMarkdown(content);
            metadata = parsed.metadata;
            description = parsed.description;
        } else if (isJSON) {
            const parsed = parseJSON(content, filePath);
            metadata = parsed.metadata;
            description = parsed.description;
        }

        const fileName = path.basename(filePath, path.extname(filePath));
        const subCategory = extractCategory(filePath);
        const componentName = metadata.title || metadata.name || fileName.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');

        const component = {
            id: generateId(filePath, categoryName),
            name: componentName,
            icon: getIcon(categoryName, subCategory, componentName),
            description: description || `${fileName} for Claude Code`,
            category: categoryName,
            subCategory: subCategory,
            company: detectCompany(content, filePath),
            downloads: Math.floor(Math.random() * 50000), // TODO: Get real download counts
            tags: extractTags(content, metadata, subCategory),
            filePath: filePath,
            createdAt: new Date(Date.now() - Math.random() * 180 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            updatedAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
        };

        components.push(component);

        if ((index + 1) % 20 === 0) {
            console.log(`   Processed ${index + 1}/${files.length}...`);
        }
    });

    console.log(`   ✅ Extracted ${components.length} ${categoryName}`);
    return components;
}

/**
 * Generate popular stacks from components
 */
function generatePopularStacks(allComponents) {
    const stacks = [
        {
            id: 'stack-fullstack',
            name: '🚀 Full-Stack Starter',
            description: 'Everything you need to build modern full-stack applications',
            components: allComponents.filter(c =>
                ['frontend', 'backend', 'database'].some(tag => c.subCategory.includes(tag))
            ).slice(0, 5).map(c => c.id),
            downloads: 15680
        },
        {
            id: 'stack-security',
            name: '🔐 Security Pro',
            description: 'Comprehensive security tools for safe development',
            components: allComponents.filter(c =>
                c.subCategory.includes('security') || c.tags.includes('security')
            ).slice(0, 4).map(c => c.id),
            downloads: 12340
        },
        {
            id: 'stack-ai',
            name: '🤖 AI Development',
            description: 'Tools for building AI-powered applications',
            components: allComponents.filter(c =>
                c.subCategory.includes('ai-specialists') || c.tags.includes('ai')
            ).slice(0, 5).map(c => c.id),
            downloads: 11250
        },
        {
            id: 'stack-devops',
            name: '☁️ Cloud & DevOps',
            description: 'Deploy and manage cloud infrastructure',
            components: allComponents.filter(c =>
                ['cloud', 'devops'].some(tag => c.subCategory.includes(tag))
            ).slice(0, 4).map(c => c.id),
            downloads: 9870
        },
        {
            id: 'stack-testing',
            name: '🧪 Testing Suite',
            description: 'Comprehensive testing and quality assurance',
            components: allComponents.filter(c =>
                c.subCategory.includes('testing') || c.tags.includes('testing')
            ).slice(0, 4).map(c => c.id),
            downloads: 8540
        },
        {
            id: 'stack-data',
            name: '📊 Data & Analytics',
            description: 'Tools for data analysis and visualization',
            components: allComponents.filter(c =>
                c.subCategory.includes('data') || c.subCategory.includes('analytics')
            ).slice(0, 4).map(c => c.id),
            downloads: 7230
        }
    ];

    return stacks.filter(s => s.components.length > 0);
}

/**
 * Get all unique companies
 */
function extractCompanies(allComponents) {
    const companies = new Set();
    allComponents.forEach(c => companies.add(c.company));
    return Array.from(companies).sort();
}

/**
 * Main execution
 */
function main() {
    console.log('🔍 Extracting components from OAI-marketplace repository...\n');
    console.log(`📍 Branch: ${UPSTREAM_BRANCH}`);

    // Process all categories
    const marketplaceData = {};
    const allComponents = [];

    Object.keys(COMPONENT_PATHS).forEach(category => {
        const components = processCategory(category);
        marketplaceData[category] = components;
        allComponents.push(...components);
    });

    // Generate additional data
    const popularStacks = generatePopularStacks(allComponents);
    const companies = extractCompanies(allComponents);

    // Create output object
    const output = {
        marketplaceData,
        popularStacks,
        companies,
        metadata: {
            totalComponents: allComponents.length,
            generatedAt: new Date().toISOString(),
            source: 'https://github.com/Organized-AI/OAI-marketplace',
            branch: UPSTREAM_BRANCH
        }
    };

    // Write to file
    const outputPath = path.join(__dirname, '..', 'data.js');
    const jsContent = `// Generated from OAI-marketplace repository
// Last updated: ${new Date().toISOString()}
// Total components: ${allComponents.length}

${Object.keys(marketplaceData).map(category => `
// ${category.toUpperCase()}: ${marketplaceData[category].length} components`).join('')}

const marketplaceData = ${JSON.stringify(marketplaceData, null, 2)};

const popularStacks = ${JSON.stringify(popularStacks, null, 2)};

const companies = ${JSON.stringify(companies, null, 2)};

// Helper functions (keeping existing implementations)
function getAllComponents() {
    return [
        ...marketplaceData.agents || [],
        ...marketplaceData.commands || [],
        ...marketplaceData.settings || [],
        ...marketplaceData.hooks || [],
        ...marketplaceData.mcps || [],
        ...marketplaceData.skills || [],
        ...marketplaceData.plugins || []
    ];
}

function getComponentsByCategory(category) {
    return marketplaceData[category] || [];
}

function searchComponents(query) {
    const allComponents = getAllComponents();
    const lowerQuery = query.toLowerCase();

    return allComponents.filter(component => {
        return (
            component.name.toLowerCase().includes(lowerQuery) ||
            component.description.toLowerCase().includes(lowerQuery) ||
            component.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
            component.company.toLowerCase().includes(lowerQuery) ||
            component.subCategory.toLowerCase().includes(lowerQuery)
        );
    });
}

function filterByCompany(components, company) {
    if (!company || company === 'all') return components;
    return components.filter(c => c.company === company);
}

function sortComponents(components, sortBy) {
    const sorted = [...components];

    switch(sortBy) {
        case 'downloads':
            return sorted.sort((a, b) => b.downloads - a.downloads);
        case 'alphabetical':
            return sorted.sort((a, b) => a.name.localeCompare(b.name));
        case 'newest':
            return sorted.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        case 'updated':
            return sorted.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));
        default:
            return sorted;
    }
}

function getComponentById(id) {
    return getAllComponents().find(c => c.id === id);
}

function formatDownloads(count) {
    if (count >= 1000) {
        return (count / 1000).toFixed(1) + 'k';
    }
    return count.toString();
}
`;

    fs.writeFileSync(outputPath, jsContent, 'utf-8');

    // Summary
    console.log('\n' + '='.repeat(60));
    console.log('✨ EXTRACTION COMPLETE!');
    console.log('='.repeat(60));
    console.log(`\n📊 Summary:`);
    console.log(`   • Total Components: ${allComponents.length}`);
    Object.keys(marketplaceData).forEach(category => {
        console.log(`   • ${category}: ${marketplaceData[category].length}`);
    });
    console.log(`   • Popular Stacks: ${popularStacks.length}`);
    console.log(`   • Companies: ${companies.length}`);
    console.log(`\n💾 Output written to: ${outputPath}`);
    console.log(`\n🎉 Ready to preview at http://localhost:8080\n`);
}

// Run the script
try {
    main();
} catch (error) {
    console.error('\n❌ Error:', error.message);
    process.exit(1);
}
