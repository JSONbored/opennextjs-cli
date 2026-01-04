/**
 * Validate Command
 *
 * Validates OpenNext.js Cloudflare configuration and checks for issues.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { validateConfiguration } from '../utils/validator.js';
import { logger } from '../utils/logger.js';

/**
 * Creates the `validate` command for validating configuration
 *
 * @description
 * This command validates all configuration files and checks for common issues,
 * providing actionable fix suggestions.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli validate
 * ```
 */
export function validateCommand(): Command {
  const command = new Command('validate');

  command
    .description('Validate OpenNext.js Cloudflare configuration and check for issues')
    .summary('Validate project configuration')
    .option(
      '--json',
      'Output validation results as JSON'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli validate              Validate configuration
  opennextjs-cli validate --json      Output as JSON

What it checks:
  • Next.js project structure
  • wrangler.toml syntax and required fields
  • open-next.config.ts validity
  • package.json scripts
  • Required dependencies
  • Cloudflare authentication
  • Common misconfigurations

This command helps identify issues before deployment and provides
actionable suggestions for fixing problems.
`
    )
    .action(async (options: { json?: boolean }) => {
      try {
        if (!options.json) {
          p.intro('🔍 Validating Configuration');
        }

        const projectRoot = process.cwd();
        const result = validateConfiguration(projectRoot);

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        // Display results
        logger.section('Validation Results');

        // Show passing checks
        const passing = result.checks.filter((c) => c.status === 'pass');
        if (passing.length > 0) {
          for (const check of passing) {
            logger.success(`${check.name}: ${check.message}`);
          }
        }

        // Show warnings
        if (result.warnings.length > 0) {
          logger.section('Warnings');
          for (const warning of result.warnings) {
            logger.warning(`${warning.name}: ${warning.message}`);
            if (warning.fix) {
              p.log.info(`  Fix: ${warning.fix}`);
            }
          }
        }

        // Show errors
        if (result.errors.length > 0) {
          logger.section('Errors');
          for (const error of result.errors) {
            logger.error(`${error.name}: ${error.message}`);
            if (error.fix) {
              p.log.info(`  Fix: ${error.fix}`);
            }
          }
        }

        // Summary
        logger.section('Summary');
        if (result.valid) {
          if (result.warnings.length > 0) {
            logger.warning(`Configuration is valid with ${result.warnings.length} warning(s)`);
            p.log.info('Review warnings above and fix if needed');
          } else {
            logger.success('Configuration is valid! ✓');
          }
        } else {
          logger.error(`Configuration has ${result.errors.length} error(s) that must be fixed`);
          p.log.info('Review errors above and apply the suggested fixes');
          process.exit(1);
        }

        p.outro('Validation complete');
      } catch (error) {
        logger.error('Failed to validate configuration', error);
        process.exit(1);
      }
    });

  return command;
}
