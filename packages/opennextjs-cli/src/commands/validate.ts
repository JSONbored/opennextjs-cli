/**
 * Validate Command
 *
 * Validates OpenNext.js Cloudflare configuration and checks for issues.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import {
  validateProjectStructureAsync,
  validateWranglerTomlAsync,
  validateOpenNextConfigAsync,
  validatePackageScriptsAsync,
  validateDependenciesAsync,
  validateCloudflareConnectionAsync,
  type ValidationCheck,
} from '../utils/validator.js';
import { detectProjectRoot } from '../utils/project-root-detector.js';

/**
 * Creates the `validate` command for validating configuration
 *
 * @description
 * This command validates all configuration files and checks for common issues,
 * providing actionable fix suggestions. Uses beautiful structured output
 * matching the status command style.
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

        // Detect project root (handles monorepos)
        const rootResult = detectProjectRoot();
        const projectRoot = rootResult.projectRoot;

        if (!rootResult.foundNextJs) {
          if (options.json) {
            console.log(JSON.stringify({
              valid: false,
              checks: [],
              errors: [{
                name: 'Next.js project',
                status: 'fail' as const,
                message: 'Not a Next.js project',
                fix: 'Run this command from a Next.js project directory',
              }],
              warnings: [],
            }, null, 2));
            return;
          }

          p.log.error('Not a Next.js project');
          p.log.info('Run this command from a Next.js project directory');
          process.exit(1);
        }

        // Collect validation checks as we run tasks
        const checks: ValidationCheck[] = [];

        // Use tasks() for sequential validation steps - actually run validation
        if (!options.json) {
          await p.tasks([
            {
              title: 'Validating project structure',
              task: async () => {
                const check = await validateProjectStructureAsync(projectRoot);
                checks.push(check);
              },
            },
            {
              title: 'Validating wrangler.toml',
              task: async () => {
                const check = await validateWranglerTomlAsync(projectRoot);
                checks.push(check);
              },
            },
            {
              title: 'Validating open-next.config.ts',
              task: async () => {
                const check = await validateOpenNextConfigAsync(projectRoot);
                checks.push(check);
              },
            },
            {
              title: 'Checking package.json scripts',
              task: async () => {
                const check = await validatePackageScriptsAsync(projectRoot);
                checks.push(check);
              },
            },
            {
              title: 'Checking dependencies',
              task: async () => {
                const check = await validateDependenciesAsync(projectRoot);
                checks.push(check);
              },
            },
            {
              title: 'Validating Cloudflare setup',
              task: async () => {
                const check = await validateCloudflareConnectionAsync();
                checks.push(check);
              },
            },
          ]);
        } else {
          // For JSON mode, run all checks synchronously
          checks.push(await validateProjectStructureAsync(projectRoot));
          checks.push(await validateWranglerTomlAsync(projectRoot));
          checks.push(await validateOpenNextConfigAsync(projectRoot));
          checks.push(await validatePackageScriptsAsync(projectRoot));
          checks.push(await validateDependenciesAsync(projectRoot));
          checks.push(await validateCloudflareConnectionAsync());
        }

        const errors = checks.filter((c) => c.status === 'fail');
        const warnings = checks.filter((c) => c.status === 'warning');
        const passing = checks.filter((c) => c.status === 'pass');

        const result = {
          valid: errors.length === 0,
          checks,
          errors,
          warnings,
        };

        if (options.json) {
          console.log(JSON.stringify(result, null, 2));
          return;
        }

        // Display results with beautiful structured output (matching status.ts style)
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Group 1: Passing checks
        if (passing.length > 0) {
          const passingInfo = passing.map((check) => {
            return `  ✓ ${check.name}: ${check.message}`;
          }).join('\n');

          await new Promise((resolve) => setTimeout(resolve, 100));
          p.note(passingInfo, 'Validation Results');
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        // Group 2: Warnings
        if (warnings.length > 0) {
          const warningsInfo = warnings.map((warning) => {
            let info = `  ⚠  ${warning.name}: ${warning.message}`;
            if (warning.fix) {
              info += `\n    Fix: ${warning.fix}`;
            }
            if (warning.docsUrl) {
              info += `\n    📖 Docs: ${warning.docsUrl}`;
            }
            return info;
          }).join('\n\n');

          await new Promise((resolve) => setTimeout(resolve, 100));
          p.note(warningsInfo, 'Warnings');
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        // Group 3: Errors
        if (errors.length > 0) {
          const errorsInfo = errors.map((error) => {
            let info = `  ✗ ${error.name}: ${error.message}`;
            if (error.fix) {
              info += `\n    Fix: ${error.fix}`;
            }
            if (error.docsUrl) {
              info += `\n    📖 Docs: ${error.docsUrl}`;
            }
            return info;
          }).join('\n\n');

          await new Promise((resolve) => setTimeout(resolve, 100));
          p.note(errorsInfo, 'Errors');
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        // Summary
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (result.valid) {
          if (warnings.length > 0) {
            p.note(
              `Configuration is valid with ${warnings.length} warning(s)\nReview warnings above and fix if needed`,
              'Summary'
            );
          } else {
            p.note('Configuration is valid! ✓', 'Summary');
          }
        } else {
          p.note(
            `Configuration has ${errors.length} error(s) that must be fixed\nReview errors above and apply the suggested fixes`,
            'Summary'
          );
        }

        await new Promise((resolve) => setTimeout(resolve, 150));
        p.outro('Validation complete');

        if (!result.valid) {
          process.exit(1);
        }
      } catch (error) {
        p.log.error('Failed to validate configuration');
        if (error instanceof Error) {
          p.log.error(error.message);
        }
        process.exit(1);
      }
    });

  return command;
}
