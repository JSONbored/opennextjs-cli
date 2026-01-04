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
import { getAvailableThemes, applyTheme } from '../utils/theme.js';

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

        // Group all configuration prompts
        logger.section('Configuration');
        const configValues = await p.group(
          {
            packageManager: () => promptPackageManager(),
            cachingStrategy: () => promptCachingStrategy(),
            theme: () => p.select({
              message: 'Select CLI theme:',
              options: getAvailableThemes(),
              initialValue: 'default',
            }),
            autoBackup: () => promptConfirmation(
              'Automatically backup files before making changes?',
              true
            ),
            confirmDestructive: () => promptConfirmation(
              'Always confirm before destructive operations?',
              true
            ),
            verbose: () => promptConfirmation(
              'Enable verbose logging by default?',
              false
            ),
          },
          {
            onCancel: () => {
              p.cancel('Operation cancelled.');
              process.exit(0);
            },
          }
        );

        // Apply theme immediately
        applyTheme(configValues.theme as 'default' | 'minimal' | 'colorful' | 'high-contrast');

        const config: CliConfig = {
          defaultPackageManager: configValues.packageManager,
          defaultCachingStrategy: configValues.cachingStrategy,
          theme: configValues.theme as 'default' | 'minimal' | 'colorful' | 'high-contrast',
          autoBackup: configValues.autoBackup,
          confirmDestructive: configValues.confirmDestructive,
          verbose: configValues.verbose,
        };

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
