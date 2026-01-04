/**
 * Add Command
 *
 * Adds OpenNext.js Cloudflare configuration to an existing Next.js project.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import { detectNextJsProject, getNextJsVersion } from '../utils/project-detector.js';
import { promptCloudflareConfig } from '../platforms/cloudflare/prompts.js';
import { generateCloudflareConfig } from '../platforms/cloudflare/index.js';
import { addDependency, installDependencies } from '../utils/package-manager.js';
import { logger } from '../utils/logger.js';
import { promptConfirmation } from '../prompts.js';
import { backupFiles } from '../utils/backup.js';
import { verifyCloudflareSetup } from '../utils/cloudflare-check.js';

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
    .description('Add OpenNext.js Cloudflare to an existing Next.js project')
    .option('-y, --yes', 'Skip interactive prompts and use defaults')
    .action(async (_options: { yes?: boolean }) => {
      try {
        logger.info('Detecting Next.js project...');

        // Detect project
        const detection = detectNextJsProject();
        const nextJsVersion = getNextJsVersion();

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

        logger.info(`Detected Next.js ${nextJsVersion || 'unknown version'}`);

        // Verify Cloudflare setup
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

        // Backup existing files
        const filesToBackup = ['wrangler.toml', 'open-next.config.ts', 'next.config.mjs'];
        const backups = backupFiles(filesToBackup);
        if (backups.some((b) => b !== undefined)) {
          logger.info('Created backups of existing configuration files');
        }

        // Prompt for Cloudflare configuration
        const config = await promptCloudflareConfig({
          nextJsVersion: nextJsVersion || '15.1.0',
        });

        // Generate configuration files
        logger.info('Generating configuration files...');
        await generateCloudflareConfig(config, process.cwd());

        // Install OpenNext.js Cloudflare if not already installed
        if (!detection.hasOpenNext) {
          logger.info('Installing @opennextjs/cloudflare...');
          await addDependency('@opennextjs/cloudflare', false);
        }

        // Install wrangler as dev dependency
        logger.info('Installing wrangler...');
        await addDependency('wrangler', true);

        // Install all dependencies
        logger.info('Installing dependencies...');
        await installDependencies();

        logger.success('OpenNext.js Cloudflare has been added to your project!');
        logger.info(`Next steps:`);
        logger.info(`  pnpm preview    # Preview with Cloudflare Workers`);
        logger.info(`  pnpm deploy     # Deploy to Cloudflare`);
      } catch (error) {
        logger.error('Failed to add OpenNext.js Cloudflare', error);
        process.exit(1);
      }
    });

  return command;
}
