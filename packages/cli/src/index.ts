#!/usr/bin/env node
/**
 * Organized AI CLI
 *
 * Command-line interface for managing Claude Code components.
 *
 * Usage:
 *   organized-ai install <components...>  Install components
 *   organized-ai check                    Check dependencies
 *   organized-ai list                     List installed components
 *   organized-ai help                     Show help
 */

import { Command } from 'commander';
import { installCommand } from './commands/install.js';
import { checkCommand } from './commands/check.js';
import { listCommand } from './commands/list.js';

const program = new Command();

program
  .name('organized-ai')
  .description('CLI for managing Claude Code components')
  .version('0.1.0');

// Register commands
program.addCommand(installCommand);
program.addCommand(checkCommand);
program.addCommand(listCommand);

// Error handling
program.showHelpAfterError('(add --help for additional information)');

// Parse arguments
program.parse();
