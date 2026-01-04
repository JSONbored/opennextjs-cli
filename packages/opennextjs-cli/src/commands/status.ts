/**
 * Status Command
 *
 * Displays current project status and configuration information.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { detectNextJsProject, getNextJsVersion } from '../utils/project-detector.js';
import { readWranglerToml, readOpenNextConfig, readPackageJson, extractWorkerName, extractAccountId, extractCachingStrategy, extractEnvironments } from '../utils/config-reader.js';
import { logger } from '../utils/logger.js';

/**
 * Creates the `status` command for displaying project status
 *
 * @description
 * This command shows comprehensive information about the current OpenNext.js
 * project including configuration, dependencies, and deployment status.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli status
 * ```
 */
export function statusCommand(): Command {
  const command = new Command('status');

  command
    .description('Display current project status and configuration information')
    .summary('Show OpenNext.js project status')
    .option(
      '--json',
      'Output status information as JSON'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli status              Display project status
  opennextjs-cli status --json       Output as JSON

What it shows:
  • Next.js version and project detection
  • OpenNext.js Cloudflare configuration status
  • Installed dependencies (@opennextjs/cloudflare, wrangler)
  • Cloudflare Worker name and account ID
  • Caching strategy
  • Environment configurations
  • Package manager detection

Use this command to quickly check your project setup and configuration.
`
    )
    .action(async (options: { json?: boolean }) => {
      try {
        if (!options.json) {
          p.intro('📊 Project Status');
        }

        const projectRoot = process.cwd();
        const detection = detectNextJsProject(projectRoot);
        const nextJsVersion = getNextJsVersion(projectRoot);
        const packageJson = readPackageJson(projectRoot);
        const wranglerToml = readWranglerToml(projectRoot);
        const openNextConfig = readOpenNextConfig(projectRoot);

        const status: {
          nextJs?: {
            detected: boolean;
            version?: string;
          };
          openNext?: {
            configured: boolean;
            workerName?: string;
            accountId?: string;
            cachingStrategy?: string;
            environments?: string[];
          };
          dependencies?: {
            opennextjsCloudflare?: string;
            wrangler?: string;
          };
          packageManager?: string;
        } = {};

        // Next.js status
  status.nextJs = {
    detected: detection.isNextJsProject,
    ...(nextJsVersion ? { version: nextJsVersion } : {}),
  };

        // OpenNext.js status
        if (detection.hasOpenNext && wranglerToml) {
          const workerName = extractWorkerName(wranglerToml);
          const accountId = extractAccountId(wranglerToml);
          const environments = extractEnvironments(wranglerToml);
          let cachingStrategy: string | undefined;

          if (openNextConfig) {
            cachingStrategy = extractCachingStrategy(openNextConfig);
          }

    status.openNext = {
      configured: true,
      ...(workerName ? { workerName } : {}),
      ...(accountId ? { accountId } : {}),
      ...(cachingStrategy ? { cachingStrategy } : {}),
      environments,
    };
        } else {
          status.openNext = {
            configured: false,
          };
        }

        // Dependencies
        if (packageJson) {
          const deps = {
            ...((packageJson['dependencies'] as Record<string, string>) || {}),
            ...((packageJson['devDependencies'] as Record<string, string>) || {}),
          };

          const opennextjsCloudflare = deps['@opennextjs/cloudflare'];
          const wrangler = deps['wrangler'];

          status.dependencies = {
            ...(opennextjsCloudflare ? { opennextjsCloudflare } : {}),
            ...(wrangler ? { wrangler } : {}),
          };
        }

        // Package manager
        if (detection.packageManager) {
          status.packageManager = detection.packageManager;
        }

        // Output
        if (options.json) {
          console.log(JSON.stringify(status, null, 2));
          return;
        }

        // Display status
        logger.section('Next.js Project');
        if (status.nextJs?.detected) {
          logger.success(`Next.js ${status.nextJs.version || 'unknown version'} detected`);
        } else {
          logger.warning('No Next.js project detected in current directory');
        }

        logger.section('OpenNext.js Cloudflare');
        if (status.openNext?.configured) {
          logger.success('OpenNext.js Cloudflare is configured');
          if (status.openNext.workerName) {
            p.log.info(`Worker Name: ${status.openNext.workerName}`);
          }
          if (status.openNext.accountId) {
            p.log.info(`Account ID: ${status.openNext.accountId}`);
          }
          if (status.openNext.cachingStrategy) {
            p.log.info(`Caching Strategy: ${status.openNext.cachingStrategy}`);
          }
          if (status.openNext.environments && status.openNext.environments.length > 0) {
            p.log.info(`Environments: ${status.openNext.environments.join(', ')}`);
          }
        } else {
          logger.warning('OpenNext.js Cloudflare is not configured');
          p.log.info('Run "opennextjs-cli add" to set up OpenNext.js');
        }

        logger.section('Dependencies');
        if (status.dependencies?.opennextjsCloudflare) {
          logger.success(`@opennextjs/cloudflare: ${status.dependencies.opennextjsCloudflare}`);
        } else {
          logger.warning('@opennextjs/cloudflare: not installed');
        }
        if (status.dependencies?.wrangler) {
          logger.success(`wrangler: ${status.dependencies.wrangler}`);
        } else {
          logger.warning('wrangler: not installed');
        }

        if (status.packageManager) {
          logger.section('Package Manager');
          p.log.info(`Detected: ${status.packageManager}`);
        }

        p.outro('Status check complete');
      } catch (error) {
        logger.error('Failed to get project status', error);
        process.exit(1);
      }
    });

  return command;
}
