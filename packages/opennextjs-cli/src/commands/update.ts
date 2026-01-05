/**
 * Update Command
 *
 * Updates OpenNext.js configuration and dependencies.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { detectNextJsProject } from '../utils/project-detector.js';
import { detectPackageManager } from '../utils/package-manager.js';
import { checkForUpdates, updatePackage } from '../utils/updater.js';
import { readPackageJson } from '../utils/config-reader.js';
import { logger } from '../utils/logger.js';
import { promptConfirmation } from '../prompts.js';
import { detectProjectRoot } from '../utils/project-root-detector.js';

/**
 * Creates the `update` command for updating packages
 *
 * @description
 * This command checks for and updates OpenNext.js related packages.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli update
 * ```
 */
export function updateCommand(): Command {
  const command = new Command('update');

  command
    .description('Update OpenNext.js configuration and dependencies')
    .summary('Update packages')
    .option(
      '--check',
      'Only check for updates, do not install'
    )
    .option(
      '--force',
      'Update even if already at latest version'
    )
    .option(
      '--package <name>',
      'Update specific package only'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli update                 Check and update all packages
  opennextjs-cli update --check        Only check for updates
  opennextjs-cli update --package @opennextjs/cloudflare  Update specific package
  opennextjs-cli update --force       Force update all packages

What it updates:
  • @opennextjs/cloudflare
  • wrangler
  • next (optional)

This command helps keep your OpenNext.js setup up to date with the latest versions.
`
    )
    .action(async (options: {
      check?: boolean;
      force?: boolean;
      package?: string;
    }) => {
      try {
        p.intro('🔄 Checking for Updates');

        // Detect project root (handles monorepos)
        const rootResult = detectProjectRoot();
        const projectRoot = rootResult.projectRoot;

        if (!rootResult.foundNextJs) {
          p.log.error('Not a Next.js project');
          p.log.info('Run this command from a Next.js project directory');
          process.exit(1);
        }

        const detection = detectNextJsProject(projectRoot);
        if (!detection.hasOpenNext) {
          p.log.error('OpenNext.js Cloudflare is not configured');
          p.log.info('Run "opennextjs-cli add" to set up OpenNext.js first');
          process.exit(1);
        }

        logger.section('Checking for Updates');
        
        const packageJson = readPackageJson(projectRoot);
        const deps = {
          ...((packageJson?.['dependencies'] as Record<string, string>) || {}),
          ...((packageJson?.['devDependencies'] as Record<string, string>) || {}),
        };

        let packagesToCheck: string[];

        if (options.package) {
          packagesToCheck = [options.package];
        } else {
          packagesToCheck = ['@opennextjs/cloudflare', 'wrangler'];
          // Only check Next.js if it's installed
          if (deps['next']) {
            packagesToCheck.push('next');
          }
        }

        // Use tasks() for checking updates
        let updates: ReturnType<typeof checkForUpdates> = [];
        await p.tasks([
          {
            title: 'Fetching latest versions',
            task: async () => {
              // This is synchronous but we wrap it in async for tasks()
              updates = checkForUpdates(projectRoot);
            },
          },
        ]);

        // Filter to only requested packages
        const relevantUpdates = updates.filter((u) => packagesToCheck.includes(u.name));

        if (relevantUpdates.length === 0) {
          logger.warning('No packages found to check');
          p.outro('Update check complete');
          return;
        }

        // Display update information
        logger.section('Update Status');
        const needsUpdate = relevantUpdates.filter((u) => u.needsUpdate || options.force);
        const upToDate = relevantUpdates.filter((u) => !u.needsUpdate && !options.force);

        if (upToDate.length > 0) {
          for (const pkg of upToDate) {
            logger.success(`${pkg.name}: ${pkg.current} (latest)`);
          }
        }

        if (needsUpdate.length > 0) {
          for (const pkg of needsUpdate) {
            if (pkg.needsUpdate) {
              logger.warning(`${pkg.name}: ${pkg.current} → ${pkg.latest}`);
            } else {
              logger.info(`${pkg.name}: ${pkg.current} (will force update)`);
            }
          }
        } else if (!options.check) {
          logger.success('All packages are up to date!');
          p.outro('No updates needed');
          return;
        }

        if (options.check) {
          p.outro('Update check complete');
          return;
        }

        // Confirm update
        if (needsUpdate.length > 0) {
          const confirmed = await promptConfirmation(
            `Update ${needsUpdate.length} package(s)?`,
            true
          );

          if (!confirmed) {
            logger.info('Update cancelled');
            return;
          }

          // Update packages using tasks()
          logger.section('Updating Packages');
          const packageManager = detectPackageManager(projectRoot);

          await p.tasks(
            needsUpdate.map((pkg) => {
              const isDev = pkg.name === 'wrangler';
              return {
                title: `Updating ${pkg.name} to ${pkg.latest}`,
                task: async () => {
                  const success = updatePackage(pkg.name, isDev, projectRoot, packageManager);
                  if (!success) {
                    throw new Error(`Failed to update ${pkg.name}`);
                  }
                },
              };
            })
          );

          logger.success('Updates complete!');
          p.note(
            'You may need to rebuild your project after updating packages.',
            '📦 Updates Applied'
          );
        }

        p.outro('Update complete');
      } catch (err) {
        logger.error('Failed to update packages', err);
        process.exit(1);
      }
    });

  return command;
}
