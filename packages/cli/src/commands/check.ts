/**
 * Check Command
 *
 * Check dependencies for a component or the current project.
 */

import { Command } from 'commander';
import { Phase0 } from '@organized-ai/phase-0';
import type { ComponentManifest } from '@organized-ai/phase-0';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load manifest from file or use defaults
 */
function loadManifest(manifestPath?: string): ComponentManifest | null {
  const searchPaths = manifestPath
    ? [manifestPath]
    : ['organized.json', 'package.json', '.claude/manifest.json'];

  for (const searchPath of searchPaths) {
    const fullPath = path.resolve(process.cwd(), searchPath);
    if (fs.existsSync(fullPath)) {
      try {
        const content = fs.readFileSync(fullPath, 'utf-8');
        const data = JSON.parse(content);

        // Handle package.json format
        if (searchPath === 'package.json') {
          return {
            name: data.name || 'unknown',
            version: data.version || '0.0.0',
            dependencies: data.organizedAi?.dependencies || {},
          };
        }

        return data as ComponentManifest;
      } catch {
        continue;
      }
    }
  }

  return null;
}

export const checkCommand = new Command('check')
  .description('Check dependencies for a component')
  .option('-m, --manifest <path>', 'Path to manifest file')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const phase0 = new Phase0();

    // Load manifest
    const manifest = loadManifest(options.manifest);

    if (!manifest) {
      console.error(
        'No manifest found. Create organized.json or add organizedAi section to package.json'
      );
      process.exit(1);
    }

    // Run detection
    const result = await phase0.detect(manifest);

    // JSON output
    if (options.json) {
      console.log(JSON.stringify(result, null, 2));
      return;
    }

    // Human-readable output
    console.log(`\nDependency Check: ${result.component}\n`);
    console.log('=' .repeat(50));

    // Group by type
    const byType = new Map<string, typeof result.dependencies>();
    for (const dep of result.dependencies) {
      if (!byType.has(dep.type)) {
        byType.set(dep.type, []);
      }
      byType.get(dep.type)!.push(dep);
    }

    for (const [type, deps] of byType) {
      console.log(`\n${type.toUpperCase()}:`);

      for (const dep of deps) {
        const icon =
          dep.status === 'present'
            ? '\u2713'
            : dep.status === 'outdated'
            ? '\u26A0'
            : '\u2717';
        const status =
          dep.status === 'present'
            ? dep.currentValue || 'configured'
            : dep.status;

        console.log(`  ${icon} ${dep.name}: ${status}`);

        if (dep.suggestion && dep.status !== 'present') {
          console.log(`    \u2514\u2500 ${dep.suggestion}`);
        }
      }
    }

    console.log('\n' + '=' .repeat(50));

    if (result.allSatisfied) {
      console.log('\n\u2713 All dependencies satisfied\n');
    } else {
      console.log(
        `\n\u2717 ${result.missingRequired.length} missing required dependencies\n`
      );

      // Generate resolution plan
      const plan = phase0.getResolutionPlan(result);

      if (plan.autoSteps.length > 0) {
        console.log('Auto-install command:');
        console.log(
          `  ${plan.autoSteps.map((s) => s.command).join(' && ')}\n`
        );
      }

      if (plan.manualSteps.length > 0) {
        console.log('Manual steps required:');
        for (const step of plan.manualSteps) {
          console.log(`  - ${step.instructions?.join(' ') || step.dependency.name}`);
          if (step.url) {
            console.log(`    ${step.url}`);
          }
        }
        console.log('');
      }

      process.exit(1);
    }
  });

export default checkCommand;
