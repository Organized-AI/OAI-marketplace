'use client';

/**
 * Export Modal Component
 *
 * Presents two options for exporting a stack:
 * 1. Start a project in Organized Codebase (recommended)
 * 2. Just export as ZIP file
 *
 * Features:
 * - Git clone link generation for Organized Codebase
 * - Stack metadata form (name, description)
 * - ZIP generation with all config files
 * - Visual comparison of both options
 */

import { useState } from 'react';
import { useStackBuilderStore } from '@/stores/stack-builder-store';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const { nodes, stackName, stackDescription, setStackName, setStackDescription } =
    useStackBuilderStore();
  const [isExporting, setIsExporting] = useState(false);
  const [exportOption, setExportOption] = useState<'organized' | 'zip' | null>(null);

  if (!isOpen) return null;

  // Generate the git clone command for Organized Codebase
  const generateOrganizedCodebaseCommand = () => {
    const name = stackName || 'my-stack';
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-');

    // This will clone your Organized Codebase template
    return `git clone https://github.com/Organized-AI/organized-codebase.git ${slug} && cd ${slug}`;
  };

  // Generate configuration files for the stack
  const generateStackFiles = () => {
    const files: Record<string, string> = {};

    // Group components by type
    const agents = nodes.filter((n) => n.data.type === 'agent');
    const mcps = nodes.filter((n) => n.data.type === 'mcp');
    const commands = nodes.filter((n) => n.data.type === 'command');
    const hooks = nodes.filter((n) => n.data.type === 'hook');
    const settings = nodes.filter((n) => n.data.type === 'setting');

    // Generate agent files
    agents.forEach((agent) => {
      const fileName = `.claude/agents/${agent.data.name.toLowerCase().replace(/\s+/g, '-')}.md`;
      files[fileName] = `# ${agent.data.name}\n\n${agent.data.description}\n\n## Configuration\n\n${JSON.stringify(agent.data.config, null, 2)}`;
    });

    // Generate MCP config
    if (mcps.length > 0) {
      const mcpConfig = {
        mcpServers: mcps.reduce((acc, mcp) => {
          acc[mcp.data.id] = {
            command: mcp.data.installCommand || 'npx',
            args: mcp.data.npmPackages || [],
            env: Object.entries(mcp.data.config).reduce((envAcc, [key, value]) => {
              // Replace sensitive values with placeholders
              if (mcp.data.configSchema?.[key]?.sensitive) {
                envAcc[key] = '{{USER_INPUT}}';
              } else {
                envAcc[key] = String(value);
              }
              return envAcc;
            }, {} as Record<string, string>),
          };
          return acc;
        }, {} as Record<string, any>),
      };
      files['mcp_config.json'] = JSON.stringify(mcpConfig, null, 2);
    }

    // Generate commands
    commands.forEach((command) => {
      const fileName = `.claude/commands/${command.data.name.toLowerCase().replace(/\s+/g, '-')}.md`;
      files[fileName] = `# ${command.data.name}\n\n${command.data.description}`;
    });

    // Generate hooks
    hooks.forEach((hook) => {
      const fileName = `.claude/hooks/${hook.data.name.toLowerCase().replace(/\s+/g, '-')}.sh`;
      files[fileName] = `#!/bin/bash\n# ${hook.data.name}\n# ${hook.data.description}`;
    });

    // Generate .env.example
    const envVars = nodes.flatMap((node) => {
      if (!node.data.configSchema) return [];
      return Object.entries(node.data.configSchema)
        .filter(([_, field]) => field.sensitive || field.required)
        .map(([key, field]) => `${key}=${field.placeholder || ''} # ${field.description}`);
    });

    if (envVars.length > 0) {
      files['.env.example'] = envVars.join('\n');
    }

    // Generate README
    files['README.md'] = `# ${stackName || 'My Stack'}

${stackDescription || 'A custom Claude Code configuration stack'}

## Components

${nodes.map((n) => `- **${n.data.name}** (${n.data.type}): ${n.data.description}`).join('\n')}

## Installation

### Option 1: Use with Organized Codebase (Recommended)

1. Clone the Organized Codebase template:
\`\`\`bash
${generateOrganizedCodebaseCommand()}
\`\`\`

2. Copy these configuration files to your project:
   - Copy \`.claude/\` folder to your project root
   - Copy \`mcp_config.json\` to your project root
   - Rename \`.env.example\` to \`.env\` and fill in your credentials

3. Run the setup:
\`\`\`bash
npm install
npm run agent:setup
\`\`\`

### Option 2: Manual Installation

1. Extract this ZIP to your project root
2. Copy \`.env.example\` to \`.env\` and configure:
${envVars.length > 0 ? '\`\`\`\n' + envVars.join('\n') + '\n\`\`\`' : 'No environment variables required'}

3. Start using Claude Code with your configured stack!

## Created with

🤖 Generated with [Stack Builder](https://aitmpl.com/builder) - Organized AI Marketplace

---

**Stack Metadata:**
- Components: ${nodes.length}
- Created: ${new Date().toISOString()}
`;

    return files;
  };

  // Handle Organized Codebase option
  const handleOrganizedCodebase = () => {
    setExportOption('organized');
  };

  // Handle ZIP export option
  const handleZipExport = async () => {
    setIsExporting(true);
    setExportOption('zip');

    try {
      const zip = new JSZip();
      const files = generateStackFiles();

      // Add all files to ZIP
      Object.entries(files).forEach(([path, content]) => {
        zip.file(path, content);
      });

      // Generate and download ZIP
      const blob = await zip.generateAsync({ type: 'blob' });
      const filename = `${(stackName || 'my-stack').toLowerCase().replace(/\s+/g, '-')}-${Date.now()}.zip`;
      saveAs(blob, filename);

      // Close modal after brief delay
      setTimeout(() => {
        onClose();
        setIsExporting(false);
        setExportOption(null);
      }, 1000);
    } catch (error) {
      console.error('Export failed:', error);
      alert('Failed to export stack. Please try again.');
      setIsExporting(false);
      setExportOption(null);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Export Your Stack</h2>
              <p className="text-sm text-slate-600 mt-1">
                Choose how you want to use your configuration
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-slate-600 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stack metadata form */}
        <div className="p-6 bg-slate-50 border-b border-slate-200">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Stack Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={stackName}
                onChange={(e) => setStackName(e.target.value)}
                placeholder="My Awesome Stack"
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-900 mb-1">
                Description (optional)
              </label>
              <textarea
                value={stackDescription}
                onChange={(e) => setStackDescription(e.target.value)}
                placeholder="A brief description of what this stack does..."
                rows={3}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Export options */}
        <div className="p-6">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Choose Export Method</h3>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Option 1: Organized Codebase */}
            <button
              onClick={handleOrganizedCodebase}
              disabled={!stackName || isExporting}
              className="text-left p-6 border-2 border-blue-200 bg-blue-50 rounded-xl hover:border-blue-400 hover:bg-blue-100 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">🚀</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    Start in Organized Codebase
                  </h4>
                  <span className="inline-block px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full">
                    Recommended
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Get a fully structured project with your stack pre-configured. Includes:
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Complete folder structure
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Agent Booster integration
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Documentation templates
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-green-500">✓</span>
                  Best practices built-in
                </li>
              </ul>
            </button>

            {/* Option 2: Just Export ZIP */}
            <button
              onClick={handleZipExport}
              disabled={!stackName || isExporting}
              className="text-left p-6 border-2 border-slate-200 bg-white rounded-xl hover:border-slate-300 hover:bg-slate-50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-start gap-3 mb-3">
                <div className="text-3xl">📦</div>
                <div className="flex-1">
                  <h4 className="font-semibold text-slate-900 mb-1">
                    Just Export ZIP
                  </h4>
                  <span className="inline-block px-2 py-0.5 bg-slate-200 text-slate-700 text-xs rounded-full">
                    Advanced users
                  </span>
                </div>
              </div>
              <p className="text-sm text-slate-600 mb-3">
                Download configuration files only. You'll need to:
              </p>
              <ul className="text-sm text-slate-600 space-y-1">
                <li className="flex items-center gap-2">
                  <span className="text-slate-400">○</span>
                  Extract files manually
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-400">○</span>
                  Set up project structure
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-400">○</span>
                  Configure environment
                </li>
                <li className="flex items-center gap-2">
                  <span className="text-slate-400">○</span>
                  Integrate with existing project
                </li>
              </ul>
            </button>
          </div>

          {/* Organized Codebase instructions (shown after selection) */}
          {exportOption === 'organized' && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h4 className="font-semibold text-slate-900 mb-3">📋 Next Steps:</h4>
              <ol className="space-y-2 text-sm text-slate-700">
                <li className="flex gap-2">
                  <span className="font-semibold">1.</span>
                  <span>Open your terminal and run:</span>
                </li>
                <li>
                  <div className="ml-5 bg-slate-900 text-green-400 p-3 rounded font-mono text-xs overflow-x-auto">
                    {generateOrganizedCodebaseCommand()}
                  </div>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">2.</span>
                  <span>Download your stack configuration:</span>
                </li>
                <li className="ml-5">
                  <button
                    onClick={handleZipExport}
                    disabled={isExporting}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
                  >
                    {isExporting ? 'Generating...' : 'Download Config Files'}
                  </button>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">3.</span>
                  <span>Extract the ZIP into your cloned project directory</span>
                </li>
                <li className="flex gap-2">
                  <span className="font-semibold">4.</span>
                  <span>Follow the README instructions to complete setup</span>
                </li>
              </ol>
            </div>
          )}

          {/* Export status */}
          {isExporting && exportOption === 'zip' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
              <div className="text-green-600 font-medium">✓ Generating your stack...</div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 bg-slate-50 border-t border-slate-200 flex justify-end gap-3">
          <button
            onClick={onClose}
            disabled={isExporting}
            className="px-4 py-2 text-slate-700 bg-white border border-slate-300 rounded-lg text-sm font-medium hover:bg-slate-50 transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
