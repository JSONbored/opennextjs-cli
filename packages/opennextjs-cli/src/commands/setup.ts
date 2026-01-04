/**
 * Setup Command
 *
 * Interactive setup wizard for CLI configuration.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { logger } from '../utils/logger.js';
import { writeGlobalConfig, writeProjectConfig, type CliConfig } from '../utils/config-manager.js';
import { promptPackageManager, promptConfirmation, promptCachingStrategy } from '../prompts.js';

/**
 * Creates the `setup` command for CLI configuration
 *
 * @description
 * This command helps users configure global and project-specific settings.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli setup
 * ```
 */
export function setupCommand(): Command {
  const command = new Command('setup');

  command
    .description('Interactive setup wizard for CLI configuration')
    .summary('Configure CLI settings')
    .option(
      '--global',
      'Configure global settings (default: project-specific)'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli setup              Configure project-specific settings
  opennextjs-cli setup --global     Configure global settings

What it configures:
  • Default package manager
  • Default caching strategy
  • Auto-backup preferences
  • Confirmation preferences
  • Verbose logging

Configuration files:
  • Global: ~/.opennextjs-cli/config.json
  • Project: .opennextjs-cli.json

Project-specific settings override global settings.
`
    )
    .action(async (options: { global?: boolean }) => {
      try {
        p.intro('⚙️  CLI Configuration Setup');

        const config: CliConfig = {};

        // Package manager
        logger.section('Default Package Manager');
        const packageManager = await promptPackageManager();
        config.defaultPackageManager = packageManager;

        // Caching strategy
        logger.section('Default Caching Strategy');
        const cachingStrategy = await promptCachingStrategy();
        config.defaultCachingStrategy = cachingStrategy;

        // Auto-backup
        logger.section('Auto-Backup');
        const autoBackup = await promptConfirmation(
          'Automatically backup files before making changes?',
          true
        );
        config.autoBackup = autoBackup;

        // Confirm destructive operations
        logger.section('Safety Settings');
        const confirmDestructive = await promptConfirmation(
          'Always confirm before destructive operations?',
          true
        );
        config.confirmDestructive = confirmDestructive;

        // Verbose mode
        const verbose = await promptConfirmation(
          'Enable verbose logging by default?',
          false
        );
        config.verbose = verbose;

        // Save configuration
        logger.section('Saving Configuration');
        if (options.global) {
          writeGlobalConfig(config);
          p.note(
            'Global configuration saved to ~/.opennextjs-cli/config.json\n\nThese settings apply to all projects unless overridden.',
            '🌍 Global Config'
          );
        } else {
          writeProjectConfig(config);
          p.note(
            'Project configuration saved to .opennextjs-cli.json\n\nThese settings apply only to this project.',
            '📁 Project Config'
          );
        }

        p.outro('Configuration saved successfully!');
      } catch (error) {
        logger.error('Failed to configure CLI', error);
        process.exit(1);
      }
    });

  return command;
}
