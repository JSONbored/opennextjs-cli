/**
 * Add Command
 *
 * Adds OpenNext.js Cloudflare configuration to an existing Next.js project.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { join } from 'path';
import { detectNextJsProject, getNextJsVersion } from '../utils/project-detector.js';
import { promptCloudflareConfig } from '../platforms/cloudflare/prompts.js';
import { generateCloudflareConfig } from '../platforms/cloudflare/index.js';
import { addDependency, installDependencies } from '../utils/package-manager.js';
import { logger } from '../utils/logger.js';
import { promptConfirmation } from '../prompts.js';
import { backupFiles } from '../utils/backup.js';
import { verifyCloudflareSetup } from '../utils/cloudflare-check.js';
import { performSafetyChecks, isSafeToWrite } from '../utils/safety.js';
import { detectMonorepo, isInMonorepo } from '../utils/monorepo-detector.js';
import { getRollbackManager } from '../utils/rollback.js';
import { getMergedConfig } from '../utils/config-manager.js';

/**
 * Creates the `add` command for adding OpenNext to existing projects
 *
 * @description
 * This command detects an existing Next.js project and guides users
 * through adding OpenNext.js Cloudflare configuration.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli add
 * ```
 */
export function addCommand(): Command {
  const command = new Command('add');

  command
    .description('Add OpenNext.js Cloudflare configuration to an existing Next.js project')
    .summary('Add OpenNext.js to your current Next.js project')
    .option(
      '-y, --yes',
      'Skip all interactive prompts and use default configuration values'
    )
    .option(
      '--worker-name <name>',
      'Cloudflare Worker name (default: detected from package.json)'
    )
    .option(
      '--caching-strategy <strategy>',
      'Caching strategy: static-assets, r2, r2-do-queue, r2-do-queue-tag-cache',
      'r2'
    )
    .option(
      '--skip-cloudflare-check',
      'Skip Cloudflare authentication and wrangler installation check'
    )
    .option(
      '--skip-backup',
      'Skip creating backups of existing configuration files'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli add                          Interactive setup with prompts
  opennextjs-cli add --yes                     Use all defaults, no prompts
  opennextjs-cli add --worker-name my-worker   Custom worker name
  opennextjs-cli add --caching-strategy r2     Specify caching strategy

Prerequisites:
  • Must be run from a Next.js project directory
  • Project should have package.json with Next.js dependency
  • Cloudflare account and wrangler CLI recommended (but not required)

What it does:
  1. Detects your Next.js project and version
  2. Backs up existing configuration files (wrangler.toml, etc.)
  3. Prompts for Cloudflare configuration options
  4. Generates wrangler.toml and open-next.config.ts
  5. Installs @opennextjs/cloudflare and wrangler
  6. Updates package.json with preview and deploy scripts

Caching Strategies:
  static-assets           SSG-only, no R2 needed
  r2                      R2 Incremental Cache (recommended)
  r2-do-queue            ISR with time-based revalidation
  r2-do-queue-tag-cache  Full-featured with on-demand revalidation

Next Steps:
  After adding OpenNext.js, you can:
  pnpm preview    # Preview with Cloudflare Workers
  pnpm deploy     # Deploy to Cloudflare

Troubleshooting:
  If you encounter issues:
  • Ensure you're in a Next.js project directory
  • Check that package.json exists and has Next.js dependency
  • Verify Node.js version is 18+ (check with: node --version)
`
    )
    .action(async (_options: { 
      yes?: boolean;
      workerName?: string;
      cachingStrategy?: string;
      skipCloudflareCheck?: boolean;
      skipBackup?: boolean;
    }) => {
      const rollbackManager = getRollbackManager();
      const projectRoot = process.cwd();

      try {
        // Safety checks
        logger.section('Safety Checks');
        const safetyCheck = performSafetyChecks(projectRoot, 'add');
        
        if (safetyCheck.errors.length > 0) {
          logger.error('Safety checks failed:');
          for (const error of safetyCheck.errors) {
            logger.error(`  • ${error}`);
          }
          process.exit(1);
        }

        if (safetyCheck.warnings.length > 0) {
          logger.warning('Warnings:');
          for (const warning of safetyCheck.warnings) {
            logger.warning(`  • ${warning}`);
          }
          
          if (!_options.yes) {
            const continueAnyway = await promptConfirmation(
              'Continue despite warnings?',
              false
            );
            if (!continueAnyway) {
              logger.info('Operation cancelled.');
              return;
            }
          }
        }

        // Monorepo detection
        if (isInMonorepo(projectRoot)) {
          const monorepo = detectMonorepo(projectRoot);
          logger.section('Monorepo Detected');
          p.log.info(`Type: ${monorepo.type}`);
          p.log.info(`Root: ${monorepo.rootPath}`);
          
          if (!_options.yes) {
            const confirmed = await promptConfirmation(
              `You're in a ${monorepo.type} monorepo. Continue with setup in this package?`,
              true
            );
            if (!confirmed) {
              logger.info('Operation cancelled.');
              return;
            }
          }
        }

        // Load CLI configuration
        const cliConfig = getMergedConfig(projectRoot);
        if (cliConfig.autoBackup === false && !_options.skipBackup) {
          _options.skipBackup = true;
        }

        logger.section('Project Detection');
        const detectSpinner = p.spinner();
        detectSpinner.start('Detecting Next.js project...');

        // Detect project
        const detection = detectNextJsProject(projectRoot);
        const nextJsVersion = getNextJsVersion(projectRoot);
        
        detectSpinner.stop('Project detected');

        if (!detection.isNextJsProject) {
          logger.error('No Next.js project detected in the current directory.');
          logger.info('Please run this command from a Next.js project directory, or use "init" to create a new project.');
          process.exit(1);
        }

        if (detection.hasOpenNext) {
          const confirmed = await promptConfirmation(
            'OpenNext.js Cloudflare is already configured. Do you want to reconfigure it?',
            false
          );

          if (!confirmed) {
            logger.info('Operation cancelled.');
            return;
          }
        }

        if (detection.isNextJsProject) {
          logger.success(`Detected Next.js ${nextJsVersion || 'unknown version'}`);
        }

        // Verify Cloudflare setup
        logger.section('Cloudflare Setup');
        const cloudflareCheck = verifyCloudflareSetup();
        if (!cloudflareCheck.wranglerInstalled || !cloudflareCheck.authenticated) {
          logger.warning(cloudflareCheck.message || 'Cloudflare setup issue detected');
          const continueAnyway = await promptConfirmation(
            'Continue anyway? (You can set up Cloudflare later)',
            true
          );
          if (!continueAnyway) {
            logger.info('Operation cancelled.');
            return;
          }
        }

        // Validate file paths are safe
        const filesToCreate = ['wrangler.toml', 'open-next.config.ts'];
        for (const file of filesToCreate) {
          if (!isSafeToWrite(file, projectRoot)) {
            logger.error(`Unsafe file path: ${file}`);
            process.exit(1);
          }
        }

        // Backup existing files
        if (!_options.skipBackup) {
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

        // Prompt for Cloudflare configuration
        logger.section('Configuration');
        const config = await promptCloudflareConfig({
          nextJsVersion: nextJsVersion || '15.1.0',
        });
        
        logger.section('Setup');

        // Generate configuration files
        const configSpinner = p.spinner();
        configSpinner.start('Generating configuration files...');
        await generateCloudflareConfig(config, process.cwd());
        configSpinner.stop('Configuration files generated');

        // Install OpenNext.js Cloudflare if not already installed
        if (!detection.hasOpenNext) {
          const installSpinner = p.spinner();
          installSpinner.start('Installing @opennextjs/cloudflare...');
          await addDependency('@opennextjs/cloudflare', false);
          installSpinner.stop('@opennextjs/cloudflare installed');
        }

        // Install wrangler as dev dependency
        const wranglerSpinner = p.spinner();
        wranglerSpinner.start('Installing wrangler...');
        await addDependency('wrangler', true);
        wranglerSpinner.stop('wrangler installed');

        // Install all dependencies
        const depsSpinner = p.spinner();
        depsSpinner.start('Installing dependencies...');
        await installDependencies();
        depsSpinner.stop('Dependencies installed');

        logger.success('OpenNext.js Cloudflare has been added to your project!');
        p.note(
          `Next steps:\n\n  pnpm preview    # Preview with Cloudflare Workers\n  pnpm deploy     # Deploy to Cloudflare`,
          '🚀 Ready to Deploy'
        );
        p.outro('OpenNext.js Cloudflare added successfully!');
        // Clear rollback manager on success
        rollbackManager.clear();
      } catch (error) {
        logger.error('Failed to add OpenNext.js Cloudflare configuration', error);
        
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
