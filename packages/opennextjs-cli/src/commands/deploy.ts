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

        const projectRoot = process.cwd();
        const detection = detectNextJsProject(projectRoot);

        if (!detection.isNextJsProject) {
          logger.error('Not a Next.js project');
          logger.info('Run this command from a Next.js project directory');
          process.exit(1);
        }

        if (!detection.hasOpenNext) {
          logger.error('OpenNext.js Cloudflare is not configured');
          logger.info('Run "opennextjs-cli add" to set up OpenNext.js first');
          process.exit(1);
        }

        // Validate configuration
        if (!options.skipValidation) {
          logger.section('Validation');
          const validationSpinner = p.spinner();
          validationSpinner.start('Validating configuration...');
          
          const validation = validateConfiguration(projectRoot);
          validationSpinner.stop();

          if (!validation.valid) {
            logger.error(`Configuration has ${validation.errors.length} error(s)`);
            logger.info('Run "opennextjs-cli validate" to see details');
            process.exit(1);
          }

          if (validation.warnings.length > 0) {
            logger.warning(`Configuration has ${validation.warnings.length} warning(s)`);
            const continueAnyway = await p.confirm({
              message: 'Continue with deployment?',
              initialValue: true,
            });

            if (continueAnyway === false) {
              logger.info('Deployment cancelled');
              return;
            }
          } else {
            logger.success('Configuration is valid');
          }
        }

        if (options.dryRun) {
          logger.section('Dry Run');
          p.log.info('This would deploy to:');
          if (options.preview) {
            p.log.info('  Type: Preview deployment');
          } else {
            p.log.info(`  Environment: ${options.env || 'production'}`);
          }
          p.log.info('  Worker: (from wrangler.toml)');
          p.outro('Dry run complete - no changes made');
          return;
        }

        // Build project
        logger.section('Build');
        const packageManager = detectPackageManager(projectRoot);
        const buildSpinner = p.spinner();
        buildSpinner.start('Building Next.js project...');

        try {
          // Build Next.js
          execSync(`${packageManager} run build`, {
            cwd: projectRoot,
            stdio: 'inherit',
          });
          buildSpinner.stop('Next.js build complete');

          // Build OpenNext.js
          const opennextSpinner = p.spinner();
          opennextSpinner.start('Building OpenNext.js Cloudflare adapter...');
          execSync('npx opennextjs-cloudflare build', {
            cwd: projectRoot,
            stdio: 'inherit',
          });
          opennextSpinner.stop('OpenNext.js build complete');
        } catch (error) {
          buildSpinner.stop('Build failed');
          logger.error('Build failed', error);
          process.exit(1);
        }

        // Deploy
        logger.section('Deployment');
        const deploySpinner = p.spinner();
        deploySpinner.start('Deploying to Cloudflare...');

        try {
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

          deploySpinner.stop('Deployment complete');
          logger.success('Successfully deployed to Cloudflare!');
          
          p.note(
            'Your deployment is live! Check the Cloudflare dashboard for the URL.',
            '🎉 Deployment Successful'
          );
        } catch (error) {
          deploySpinner.stop('Deployment failed');
          logger.error('Deployment failed', error);
          process.exit(1);
        }

        p.outro('Deployment complete');
      } catch (error) {
        logger.error('Failed to deploy', error);
        process.exit(1);
      }
    });

  return command;
}
