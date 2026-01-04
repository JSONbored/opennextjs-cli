/**
 * Config Command
 *
 * Updates or modifies existing OpenNext.js Cloudflare configuration.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { logger } from '../utils/logger.js';
import { detectNextJsProject } from '../utils/project-detector.js';
import { promptCloudflareConfig } from '../platforms/cloudflare/prompts.js';
import { generateCloudflareConfig } from '../platforms/cloudflare/index.js';
import { backupFiles } from '../utils/backup.js';

/**
 * Creates the `config` command for updating configuration
 *
 * @description
 * This command allows users to update their existing OpenNext.js
 * Cloudflare configuration interactively.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli config
 * ```
 */
export function configCommand(): Command {
  const command = new Command('config');

  command
    .description('Update or reconfigure OpenNext.js Cloudflare settings for your project')
    .summary('Update OpenNext.js Cloudflare configuration')
    .option(
      '-y, --yes',
      'Skip all interactive prompts and use default configuration values'
    )
    .option(
      '--worker-name <name>',
      'Update Cloudflare Worker name'
    )
    .option(
      '--caching-strategy <strategy>',
      'Update caching strategy: static-assets, r2, r2-do-queue, r2-do-queue-tag-cache'
    )
    .option(
      '--reset',
      'Reset configuration to defaults (will prompt for confirmation)'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli config                          Interactive configuration update
  opennextjs-cli config --worker-name new-name   Update worker name only
  opennextjs-cli config --caching-strategy r2    Update caching strategy
  opennextjs-cli config --reset                  Reset to defaults

What it does:
  1. Detects your current OpenNext.js configuration
  2. Backs up existing configuration files
  3. Prompts for updated configuration options
  4. Regenerates wrangler.toml and open-next.config.ts
  5. Preserves your existing settings where possible

Configuration Options:
  • Worker name and account ID
  • Caching strategy (R2, Durable Objects, etc.)
  • Database bindings (D1, Hyperdrive)
  • Image optimization settings
  • Analytics Engine configuration
  • Environment-specific observability settings

Note:
  This command requires an existing OpenNext.js project.
  Use opennextjs-cli add if you haven't set up OpenNext.js yet.
`
    )
    .action(async (_options: { 
      yes?: boolean;
      workerName?: string;
      cachingStrategy?: string;
      reset?: boolean;
    }) => {
      try {
        // Check if OpenNext.js is configured
        const detection = detectNextJsProject();
        
        if (!detection.isNextJsProject) {
          logger.error('No Next.js project detected in the current directory.');
          logger.info('Please run this command from a Next.js project directory.');
          process.exit(1);
        }

        if (!detection.hasOpenNext) {
          logger.error('OpenNext.js Cloudflare is not configured in this project.');
          logger.info('Use opennextjs-cli add to set up OpenNext.js first.');
          process.exit(1);
        }

        logger.section('Configuration Update');
        logger.info('Updating OpenNext.js Cloudflare configuration...');

        // Backup existing files
        const filesToBackup = ['wrangler.toml', 'open-next.config.ts', 'next.config.mjs'];
        const backups = backupFiles(filesToBackup);
        if (backups.some((b) => b !== undefined)) {
          logger.info('Created backups of existing configuration files');
        }

        // Prompt for new configuration
        logger.section('New Configuration');
        const config = await promptCloudflareConfig({
          nextJsVersion: '15.1.0', // TODO: Detect from package.json
        });

        // Generate updated configuration files
        logger.section('Updating Files');
        const configSpinner = p.spinner();
        configSpinner.start('Updating configuration files...');
        await generateCloudflareConfig(config, process.cwd());
        configSpinner.stop('Configuration files updated');

        logger.success('OpenNext.js Cloudflare configuration has been updated!');
        p.note(
          `Next steps:\n\n  pnpm preview    # Preview with updated configuration\n  pnpm deploy     # Deploy to Cloudflare`,
          '✅ Configuration Updated'
        );
        p.outro('Configuration updated successfully!');
      } catch (error) {
        logger.error('Failed to update configuration', error);
        process.exit(1);
      }
    });

  return command;
}
