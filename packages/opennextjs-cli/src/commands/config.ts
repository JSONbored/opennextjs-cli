/**
 * Config Command
 *
 * Updates or modifies existing OpenNext.js Cloudflare configuration.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import { detectNextJsProject } from '../utils/project-detector.js';
import { promptCloudflareConfig } from '../platforms/cloudflare/prompts.js';
import { generateCloudflareConfig } from '../platforms/cloudflare/index.js';
import { backupFiles } from '../utils/backup.js';
import { performSafetyChecks, isSafeToWrite } from '../utils/safety.js';
import { detectMonorepo, isInMonorepo } from '../utils/monorepo-detector.js';
import { getRollbackManager } from '../utils/rollback.js';
import { getMergedConfig } from '../utils/config-manager.js';
import { promptConfirmation } from '../prompts.js';
import { detectProjectRoot } from '../utils/project-root-detector.js';

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
      const rollbackManager = getRollbackManager();
      
      // Detect project root (handles monorepos)
      const rootResult = detectProjectRoot();
      const projectRoot = rootResult.projectRoot;

      try {
        if (!rootResult.foundNextJs) {
          p.log.error('Not a Next.js project');
          p.log.info('Run this command from a Next.js project directory');
          process.exit(1);
        }

        // Safety checks
        logger.section('Safety Checks');
        const safetyCheck = performSafetyChecks(projectRoot, 'config');
        
        if (safetyCheck.errors.length > 0) {
          logger.error('Safety checks failed:');
          for (const error of safetyCheck.errors) {
            logger.error(`  • ${error}`);
          }
          process.exit(1);
        }

        // Monorepo detection
        if (isInMonorepo(projectRoot)) {
          const monorepo = detectMonorepo(projectRoot);
          logger.section('Monorepo Detected');
          p.log.info(`Type: ${monorepo.type}`);
          p.log.info(`Root: ${monorepo.rootPath}`);
        }

        // Load CLI configuration
        const cliConfig = getMergedConfig(projectRoot);

        // Check if OpenNext.js is configured
        const detection = detectNextJsProject(projectRoot);
        
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

        // Confirm destructive operation
        if (_options.reset && !_options.yes) {
          const confirmed = await promptConfirmation(
            'This will reset your configuration to defaults. Continue?',
            false
          );
          if (!confirmed) {
            logger.info('Operation cancelled.');
            return;
          }
        }

        logger.section('Configuration Update');
        logger.info('Updating OpenNext.js Cloudflare configuration...');

        // Validate file paths are safe
        const filesToUpdate = ['wrangler.toml', 'open-next.config.ts'];
        for (const file of filesToUpdate) {
          if (!isSafeToWrite(file, projectRoot)) {
            logger.error(`Unsafe file path: ${file}`);
            process.exit(1);
          }
        }

        // Backup existing files
        if (cliConfig.autoBackup !== false) {
          const filesToBackup = ['wrangler.toml', 'open-next.config.ts', 'next.config.mjs'];
          const backups = backupFiles(filesToBackup, join(projectRoot, '.backup'));
          if (backups.some((b) => b !== undefined)) {
            logger.info('Created backups of existing configuration files');
            // Record backups for rollback
            backups.forEach((backupPath, i) => {
              if (backupPath) {
                rollbackManager.recordBackup(filesToBackup[i]!, backupPath);
              }
            });
          }
        }

        // Prompt for new configuration
        logger.section('New Configuration');
        const cloudflareConfig = await promptCloudflareConfig({
          nextJsVersion: '15.1.0', // TODO: Detect from package.json
        });

        // Generate updated configuration files using tasks()
        logger.section('Updating Files');
        await p.tasks([
          {
            title: 'Updating configuration files',
            task: async () => {
              await generateCloudflareConfig(cloudflareConfig, process.cwd());
            },
          },
        ]);

        // Clear rollback manager on success
        rollbackManager.clear();

        logger.success('OpenNext.js Cloudflare configuration has been updated!');
        p.note(
          `Next steps:\n\n  pnpm preview    # Preview with updated configuration\n  pnpm deploy     # Deploy to Cloudflare`,
          '✅ Configuration Updated'
        );
        p.outro('Configuration updated successfully!');
      } catch (error) {
        logger.error('Failed to update configuration', error);
        
        // Attempt rollback
        try {
          const rollback = await promptConfirmation(
            'Operation failed. Attempt to rollback changes?',
            true
          );
          if (rollback) {
            rollbackManager.rollback();
          }
        } catch (rollbackError) {
          logger.warning('Rollback failed:', rollbackError);
        }
        
        process.exit(1);
      }
    });

  return command;
}
