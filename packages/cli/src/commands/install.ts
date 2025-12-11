/**
 * Install Command
 *
 * Installs Claude Code components from the registry.
 */

import { Command } from 'commander';
import { StackBuilder } from '@organized-ai/stack-builder';
import type { Component, ComponentType } from '@organized-ai/stack-builder';

/**
 * Fetch component details from registry
 * In production, this would call the Supabase API
 */
async function fetchComponents(ids: string[]): Promise<Component[]> {
  // TODO: Replace with actual registry fetch
  // const response = await fetch(`${API_URL}/api/components?ids=${ids.join(',')}`);
  // return response.json();

  // For now, return mock data based on IDs
  return ids.map((id) => {
    // Try to infer type from ID prefix
    let type: ComponentType = 'skill';
    if (id.startsWith('agent-') || id.endsWith('-agent')) type = 'agent';
    if (id.startsWith('mcp-') || id.endsWith('-mcp')) type = 'mcp';
    if (id.startsWith('hook-') || id.endsWith('-hook')) type = 'hook';
    if (id.startsWith('cmd-') || id.endsWith('-command')) type = 'command';

    return {
      id,
      name: id
        .split('-')
        .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
        .join(' '),
      type,
      repository: `https://github.com/organized-ai/${id}`,
      version: '1.0.0',
    };
  });
}

/**
 * Format duration for display
 */
function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
}

export const installCommand = new Command('install')
  .description('Install Claude Code components')
  .argument('<components...>', 'Component IDs to install')
  .option('-f, --force', 'Force reinstall if component exists')
  .option('--skip-deps', 'Skip dependency checking')
  .option('-q, --quiet', 'Quiet mode - minimal output')
  .action(async (componentIds: string[], options) => {
    const builder = new StackBuilder();
    const quiet = options.quiet;

    if (!quiet) {
      console.log(`\nInstalling ${componentIds.length} component(s)...\n`);
    }

    // Fetch component details
    const components = await fetchComponents(componentIds);

    // Install with progress
    const results = await builder.install(components, {
      force: options.force,
      skipDependencyCheck: options.skipDeps,
      onProgress: (progress) => {
        if (!quiet && progress.current) {
          const pct = Math.round((progress.completed / progress.total) * 100);
          process.stdout.write(
            `\r[${pct}%] Installing ${progress.current}...`
          );
        }
      },
    });

    // Clear progress line
    if (!quiet) {
      process.stdout.write('\r' + ' '.repeat(60) + '\r');
    }

    // Report results
    const successful = results.filter((r) => r.success);
    const failed = results.filter((r) => !r.success);

    if (!quiet) {
      console.log('Results:\n');

      for (const result of results) {
        const icon = result.success ? '\u2713' : '\u2717';
        const status = result.success
          ? `installed (${formatDuration(result.duration)})`
          : `failed: ${result.error}`;
        console.log(`  ${icon} ${result.component} - ${status}`);
        if (result.path) {
          console.log(`    \u2514\u2500 ${result.path}`);
        }
      }

      console.log(
        `\n${successful.length} succeeded, ${failed.length} failed\n`
      );
    }

    // Exit with error if any failed
    if (failed.length > 0) {
      process.exit(1);
    }
  });

export default installCommand;
