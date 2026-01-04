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
  .description(
    'Interactive CLI tool for setting up and configuring OpenNext.js projects for Cloudflare Workers deployments'
  )
  .version('0.1.0', '-v, --version', 'Display version number')
  .addHelpText(
    'after',
    `
Examples:
  opennextjs-cli init              Create a new Next.js project with OpenNext.js
  opennextjs-cli init my-app        Create a project with a specific name
  opennextjs-cli add                Add OpenNext.js to an existing Next.js project
  opennextjs-cli config             Update configuration for an existing project

Documentation:
  https://github.com/JSONbored/opennextjs-cli

Quick Start:
  1. Create a new project: opennextjs-cli init
  2. Or add to existing:    opennextjs-cli add
  3. Deploy:                pnpm deploy
`
  )
  .configureHelp({
    subcommandTerm: (cmd) => cmd.name(),
  });

// Register commands
program.addCommand(initCommand());
program.addCommand(addCommand());
program.addCommand(configCommand());
