/**
 * List Command
 *
 * List installed Claude Code components.
 */

import { Command } from 'commander';
import { Installer } from '@organized-ai/stack-builder';
import type { ComponentType } from '@organized-ai/stack-builder';

const COMPONENT_TYPES: ComponentType[] = [
  'skill',
  'agent',
  'mcp',
  'command',
  'hook',
  'setting',
];

export const listCommand = new Command('list')
  .alias('ls')
  .description('List installed components')
  .option('-t, --type <type>', 'Filter by component type')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    const installer = new Installer();
    const types = options.type ? [options.type as ComponentType] : COMPONENT_TYPES;

    const installed: Record<string, string[]> = {};
    let totalCount = 0;

    for (const type of types) {
      const components = installer.listInstalled(type);
      if (components.length > 0) {
        installed[type] = components;
        totalCount += components.length;
      }
    }

    // JSON output
    if (options.json) {
      console.log(JSON.stringify(installed, null, 2));
      return;
    }

    // Human-readable output
    if (totalCount === 0) {
      console.log('\nNo components installed.\n');
      console.log('Use "organized-ai install <component>" to install components.\n');
      return;
    }

    console.log(`\nInstalled Components (${totalCount}):\n`);

    for (const [type, components] of Object.entries(installed)) {
      console.log(`${type.toUpperCase()}S:`);
      for (const component of components) {
        console.log(`  - ${component}`);
      }
      console.log('');
    }
  });

export default listCommand;
