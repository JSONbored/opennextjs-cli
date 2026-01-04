/**
 * CLI Command Definitions
 *
 * Sets up Commander.js with all available commands for the OpenNext.js CLI.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import { initCommand } from './commands/init.js';
import { addCommand } from './commands/add.js';
import { configCommand } from './commands/config.js';

/**
 * Main CLI program instance
 *
 * @description
 * Creates and configures the Commander.js program with all available commands.
 * This is the entry point for all CLI interactions.
 *
 * @returns Configured Commander program
 *
 * @example
 * ```typescript
 * import { program } from './cli.js';
 * program.parse(process.argv);
 * ```
 */
export const program = new Command();

program
  .name('opennextjs-cli')
  .description('Interactive CLI/TUI tool for setting up and configuring OpenNext.js projects for Cloudflare Workers')
  .version('0.1.0');

// Register commands
program.addCommand(initCommand());
program.addCommand(addCommand());
program.addCommand(configCommand());
