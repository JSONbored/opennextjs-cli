/**
 * Doctor Command
 *
 * Diagnoses and fixes common issues with OpenNext.js Cloudflare setup.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import { existsSync } from 'fs';
import { join } from 'path';
import { detectNextJsProject, getNextJsVersion } from '../utils/project-detector.js';
import { detectPackageManager } from '../utils/package-manager.js';
import { validateConfiguration } from '../utils/validator.js';
import { logger } from '../utils/logger.js';
import { readPackageJson } from '../utils/config-reader.js';
import { addDependency } from '../utils/package-manager.js';
import { detectProjectRoot } from '../utils/project-root-detector.js';

/**
 * Health check result
 */
interface HealthCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  fix?: () => Promise<void> | void;
}

/**
 * Creates the `doctor` command for health checks
 *
 * @description
 * This command runs comprehensive health checks and can auto-fix common issues.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli doctor
 * ```
 */
export function doctorCommand(): Command {
  const command = new Command('doctor');

  command
    .description('Diagnose and fix common issues with OpenNext.js Cloudflare setup')
    .summary('Health check and diagnostics')
    .option(
      '--fix',
      'Attempt to auto-fix issues where possible'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli doctor              Run health checks
  opennextjs-cli doctor --fix        Run checks and auto-fix issues

What it checks:
  • Node.js version (must be 18+)
  • Package manager installation
  • Wrangler CLI availability
  • Project structure
  • Required dependencies
  • Configuration files
  • Cloudflare authentication
  • Common errors and misconfigurations

Use --fix to automatically resolve fixable issues.
`
    )
    .action(async (options: { fix?: boolean }) => {
      try {
        p.intro('🏥 Running Health Checks');

        // Detect project root (handles monorepos)
        const rootResult = detectProjectRoot();
        const projectRoot = rootResult.projectRoot;
        const checks: HealthCheck[] = [];

        // Run health checks sequentially using tasks()
        await p.tasks([
          {
            title: 'Checking Node.js version',
            task: async () => {
              const nodeCheck: HealthCheck = {
                name: 'Node.js Version',
                status: 'pass',
                message: '',
              };

              try {
                const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
                const majorVersion = parseInt((nodeVersion).replace('v', '').split('.')[0] || '0', 10);
                if (majorVersion >= 18) {
                  nodeCheck.message = `Node.js ${nodeVersion} (✓)`;
                } else {
                  nodeCheck.status = 'fail';
                  nodeCheck.message = `Node.js ${nodeVersion} (requires 18+)`;
                  nodeCheck.fix = (): void => {
                    logger.info('Please upgrade Node.js to version 18 or higher');
                  };
                }
              } catch {
                nodeCheck.status = 'fail';
                nodeCheck.message = 'Node.js not found';
              }

              checks.push(nodeCheck);
            },
          },
          {
            title: 'Checking package manager',
            task: async () => {
              const packageManager = detectPackageManager(projectRoot);
              checks.push({
                name: 'Package Manager',
                status: 'pass',
                message: `${packageManager} detected`,
              });
            },
          },
          {
            title: 'Checking Wrangler CLI',
            task: async () => {
              const wranglerCheck: HealthCheck = {
                name: 'Wrangler CLI',
                status: 'pass',
                message: '',
              };

              try {
                execSync('wrangler --version', { stdio: 'ignore' });
                wranglerCheck.message = 'Wrangler CLI installed';
              } catch {
                wranglerCheck.status = 'warning';
                wranglerCheck.message = 'Wrangler CLI not found in PATH';
                if (options.fix) {
                  wranglerCheck.fix = (): void => {
                    const pm = detectPackageManager(projectRoot);
                    addDependency('wrangler', true, projectRoot, pm);
                    logger.success('Installed wrangler');
                  };
                } else {
                  wranglerCheck.fix = (): void => {
                    logger.info('Install wrangler: pnpm add -D wrangler');
                  };
                }
              }

              checks.push(wranglerCheck);
            },
          },
          {
            title: 'Checking project structure',
            task: async () => {
              const detection = detectNextJsProject(projectRoot);
              checks.push({
                name: 'Next.js Project',
                status: detection.isNextJsProject ? 'pass' : 'fail',
                message: detection.isNextJsProject
                  ? `Next.js ${getNextJsVersion(projectRoot) || 'detected'}`
                  : 'Not a Next.js project',
              });

              // Check OpenNext.js
              const openNextCheck: HealthCheck = {
                name: 'OpenNext.js',
                status: detection.hasOpenNext ? 'pass' : 'fail',
                message: detection.hasOpenNext
                  ? 'OpenNext.js Cloudflare configured'
                  : 'OpenNext.js Cloudflare not configured',
              };
              if (!detection.hasOpenNext) {
                openNextCheck.fix = (): void => {
                  logger.info('Run "opennextjs-cli add" to set up OpenNext.js');
                };
              }
              checks.push(openNextCheck);
            },
          },
          {
            title: 'Checking dependencies',
            task: async () => {
              const packageJson = readPackageJson(projectRoot);
              if (packageJson) {
                const deps = {
                  ...((packageJson['dependencies'] as Record<string, string>) || {}),
                  ...((packageJson['devDependencies'] as Record<string, string>) || {}),
                };

                if (!deps['@opennextjs/cloudflare']) {
                  checks.push({
                    name: 'Dependencies',
                    status: 'fail',
                    message: '@opennextjs/cloudflare not installed',
                    fix: options.fix
                      ? (): void => {
                          const pm = detectPackageManager(projectRoot);
                          addDependency('@opennextjs/cloudflare', false, projectRoot, pm);
                          logger.success('Installed @opennextjs/cloudflare');
                        }
                      : (): void => {
                          logger.info('Install: pnpm add @opennextjs/cloudflare');
                        },
                  });
                }

                if (!deps['wrangler']) {
                  checks.push({
                    name: 'Dependencies',
                    status: 'warning',
                    message: 'wrangler not installed',
                    fix: options.fix
                      ? (): void => {
                          const pm = detectPackageManager(projectRoot);
                          addDependency('wrangler', true, projectRoot, pm);
                          logger.success('Installed wrangler');
                        }
                      : (): void => {
                          logger.info('Install: pnpm add -D wrangler');
                        },
                  });
                }
              }
            },
          },
          {
            title: 'Checking configuration files',
            task: async () => {
              const configFiles = ['wrangler.toml', 'open-next.config.ts'];
              for (const file of configFiles) {
                const exists = existsSync(join(projectRoot, file));
                checks.push({
                  name: `Config: ${file}`,
                  status: exists ? 'pass' : 'fail',
                  message: exists ? 'Found' : 'Missing',
                  ...(exists
                    ? {}
                    : {
                        fix: (): void => {
                          logger.info(`Run "opennextjs-cli add" to generate ${file}`);
                        },
                      }),
                });
              }
            },
          },
          {
            title: 'Checking Cloudflare authentication',
            task: async () => {
              const authCheck: HealthCheck = {
                name: 'Cloudflare Auth',
                status: 'pass',
                message: '',
              };

              try {
                execSync('wrangler whoami', { stdio: 'ignore' });
                authCheck.message = 'Authenticated';
              } catch {
                authCheck.status = 'warning';
                authCheck.message = 'Not authenticated';
                authCheck.fix = (): void => {
                  logger.info('Run "opennextjs-cli cloudflare login" to authenticate');
                };
              }

              checks.push(authCheck);
            },
          },
          {
            title: 'Validating configuration',
            task: async () => {
              const detection = detectNextJsProject(projectRoot);
              if (detection.hasOpenNext) {
                const validation = validateConfiguration(projectRoot);
                if (!validation.valid) {
                  checks.push({
                    name: 'Configuration',
                    status: 'fail',
                    message: `${validation.errors.length} error(s) found`,
                    fix: () => {
                      logger.info('Run "opennextjs-cli validate" for details');
                    },
                  });
                } else if (validation.warnings.length > 0) {
                  checks.push({
                    name: 'Configuration',
                    status: 'warning',
                    message: `${validation.warnings.length} warning(s) found`,
                    fix: () => {
                      logger.info('Run "opennextjs-cli validate" for details');
                    },
                  });
                }
              }
            },
          },
        ]);

        // Display results with beautiful structured output (matching status.ts style)
        await new Promise((resolve) => setTimeout(resolve, 150));

        const passing = checks.filter((c) => c.status === 'pass');
        const warnings = checks.filter((c) => c.status === 'warning');
        const failures = checks.filter((c) => c.status === 'fail');

        // Group 1: Passing checks
        if (passing.length > 0) {
          const passingInfo = passing.map((check) => {
            return `  ✓ ${check.name}: ${check.message}`;
          }).join('\n');

          await new Promise((resolve) => setTimeout(resolve, 100));
          p.note(passingInfo, 'Health Check Results');
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        // Group 2: Warnings
        if (warnings.length > 0) {
          const warningsInfo = warnings.map((check) => {
            let info = `  ▲ ${check.name}: ${check.message}`;
            if (check.fix) {
              if (options.fix) {
                info += '\n    Attempting to fix...';
              } else {
                info += '\n    Fix available: Run with --fix flag';
              }
            }
            return info;
          }).join('\n\n');

          await new Promise((resolve) => setTimeout(resolve, 100));
          p.note(warningsInfo, 'Warnings');
          await new Promise((resolve) => setTimeout(resolve, 150));

          // Apply fixes if requested
          if (options.fix) {
        for (const check of warnings) {
              if (check.fix) {
            await check.fix();
              }
            }
          }
        }

        // Group 3: Failures
        if (failures.length > 0) {
          const failuresInfo = failures.map((check) => {
            let info = `  ■ ${check.name}: ${check.message}`;
            if (check.fix) {
              if (options.fix) {
                info += '\n    Attempting to fix...';
              } else {
                info += '\n    Fix available: Run with --fix flag';
              }
            }
            return info;
          }).join('\n\n');

          await new Promise((resolve) => setTimeout(resolve, 100));
          p.note(failuresInfo, 'Issues');
          await new Promise((resolve) => setTimeout(resolve, 150));

          // Apply fixes if requested
          if (options.fix) {
        for (const check of failures) {
              if (check.fix) {
            await check.fix();
              }
            }
          }
        }

        // Summary
        await new Promise((resolve) => setTimeout(resolve, 100));
        if (failures.length === 0 && warnings.length === 0) {
          p.note('All checks passed! ✓', 'Summary');
        } else {
          const summaryText = `${failures.length} issue(s) found, ${warnings.length} warning(s)${!options.fix && (failures.length > 0 || warnings.length > 0) ? '\nRun with --fix to attempt automatic fixes' : ''}`;
          p.note(summaryText, 'Summary');
          }

        await new Promise((resolve) => setTimeout(resolve, 150));
        p.outro('Health check complete');
      } catch (err) {
        logger.error('Failed to run health checks', err);
        process.exit(1);
      }
    });

  return command;
}
