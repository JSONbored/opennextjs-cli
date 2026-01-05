/**
 * Deploy Command
 *
 * Builds and deploys the project to Cloudflare Workers.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import { detectNextJsProject } from '../utils/project-detector.js';
import { detectPackageManager } from '../utils/package-manager.js';
import { logger } from '../utils/logger.js';
import { validateConfiguration } from '../utils/validator.js';
import { detectProjectRoot } from '../utils/project-root-detector.js';

/**
 * Creates the `deploy` command for deploying to Cloudflare
 *
 * @description
 * This command builds the project and deploys it to Cloudflare Workers.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli deploy
 * ```
 */
export function deployCommand(): Command {
  const command = new Command('deploy');

  command
    .description('Build and deploy the project to Cloudflare Workers')
    .summary('Deploy to Cloudflare')
    .option(
      '--env <name>',
      'Deploy to specific environment (default: production)'
    )
    .option(
      '--preview',
      'Deploy as preview deployment'
    )
    .option(
      '--dry-run',
      'Show what would be deployed without actually deploying'
    )
    .option(
      '--skip-validation',
      'Skip configuration validation before deployment'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli deploy                    Deploy to production
  opennextjs-cli deploy --env staging     Deploy to staging environment
  opennextjs-cli deploy --preview         Deploy as preview
  opennextjs-cli deploy --dry-run         Show deployment preview

What it does:
  1. Validates configuration (unless --skip-validation)
  2. Builds the Next.js project
  3. Builds OpenNext.js Cloudflare adapter
  4. Deploys to Cloudflare Workers
  5. Shows deployment URL

Prerequisites:
  • Must be authenticated with Cloudflare (wrangler login)
  • Configuration must be valid
  • All dependencies must be installed
`
    )
    .action(async (options: {
      env?: string;
      preview?: boolean;
      dryRun?: boolean;
      skipValidation?: boolean;
    }) => {
      try {
        p.intro('🚀 Deploying to Cloudflare');

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

        // Validate configuration
        if (!options.skipValidation) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          const validationSpinner = p.spinner();
          validationSpinner.start('Validating configuration...');
          
          const validation = validateConfiguration(projectRoot);
          validationSpinner.stop();

          if (!validation.valid) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            p.note(
              `Configuration has ${validation.errors.length} error(s)\nRun "opennextjs-cli validate" to see details`,
              'Validation Failed'
            );
            process.exit(1);
          }

          if (validation.warnings.length > 0) {
            await new Promise((resolve) => setTimeout(resolve, 100));
            p.note(
              `Configuration has ${validation.warnings.length} warning(s)`,
              'Validation Warnings'
            );
            const continueAnyway = await p.confirm({
              message: 'Continue with deployment?',
              initialValue: true,
            });

            if (continueAnyway === false) {
              p.log.info('Deployment cancelled');
              return;
            }
          } else {
            await new Promise((resolve) => setTimeout(resolve, 100));
            p.note('Configuration is valid', 'Validation');
            await new Promise((resolve) => setTimeout(resolve, 150));
          }
        }

        if (options.dryRun) {
          await new Promise((resolve) => setTimeout(resolve, 150));
          const dryRunInfo: string[] = [];
          if (options.preview) {
            dryRunInfo.push('  Type: Preview deployment');
          } else {
            dryRunInfo.push(`  Environment: ${options.env || 'production'}`);
          }
          dryRunInfo.push('  Worker: (from wrangler.toml)');
          p.note(dryRunInfo.join('\n'), 'Dry Run');
          await new Promise((resolve) => setTimeout(resolve, 150));
          p.outro('Dry run complete - no changes made');
          return;
        }

        // Build and deploy using tasks()
        await new Promise((resolve) => setTimeout(resolve, 150));
        const packageManager = detectPackageManager(projectRoot);

        await p.tasks([
          {
            title: 'Building Next.js project',
            task: async () => {
              execSync(`${packageManager} run build`, {
                cwd: projectRoot,
                stdio: 'inherit',
              });
            },
          },
          {
            title: 'Building OpenNext.js Cloudflare adapter',
            task: async () => {
              execSync('npx opennextjs-cloudflare build', {
                cwd: projectRoot,
                stdio: 'inherit',
              });
            },
          },
          {
            title: 'Deploying to Cloudflare',
            task: async () => {
              let deployCommand = 'wrangler deploy';
              
              if (options.preview) {
                deployCommand += ' --preview';
              } else if (options.env) {
                deployCommand += ` --env ${options.env}`;
              }

              execSync(deployCommand, {
                cwd: projectRoot,
                stdio: 'inherit',
              });
            },
          },
        ]);

        await new Promise((resolve) => setTimeout(resolve, 150));
        p.note(
          'Your deployment is live! Check the Cloudflare dashboard for the URL.',
          '🎉 Deployment Successful'
        );
        await new Promise((resolve) => setTimeout(resolve, 150));
        p.outro('Deployment complete');
      } catch (error) {
        logger.error('Failed to deploy', error);
        process.exit(1);
      }
    });

  return command;
}
