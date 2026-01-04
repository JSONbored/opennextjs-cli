/**
 * Cloudflare Platform Prompts
 *
 * Interactive prompts specific to Cloudflare platform configuration.
 *
 * @packageDocumentation
 */

import inquirer from 'inquirer';
import type { CloudflareConfig } from '../../schemas/config.js';
import {
  promptCachingStrategy,
  promptDatabaseOption,
  promptWorkerName,
  promptNextJsVersion,
  promptConfirmation,
} from '../../prompts.js';

/**
 * Prompts for complete Cloudflare configuration
 *
 * @description
 * Guides user through all Cloudflare-specific configuration options.
 *
 * @param defaults - Optional default values
 * @returns Complete Cloudflare configuration
 *
 * @example
 * ```typescript
 * const config = await promptCloudflareConfig({
 *   workerName: 'my-worker',
 *   nextJsVersion: '15.1.0'
 * });
 * ```
 */
export async function promptCloudflareConfig(defaults?: {
  workerName?: string;
  nextJsVersion?: string;
}): Promise<CloudflareConfig> {
  const workerName = await promptWorkerName(defaults?.workerName);
  const cachingStrategy = await promptCachingStrategy();
  const database = await promptDatabaseOption();
  const nextJsVersion = await promptNextJsVersion(defaults?.nextJsVersion);

  // Warn about Next.js 16.x experimental support
  if (nextJsVersion.startsWith('16')) {
    const confirmed = await promptConfirmation(
      '⚠️  Next.js 16.x is experimental and not officially supported by OpenNext.js. Continue?',
      false
    );

    if (!confirmed) {
      // User declined, use 15.x instead
      return promptCloudflareConfig({ ...defaults, nextJsVersion: '15.1.0' });
    }
  }

  const { imageOptimization } = await inquirer.prompt<{ imageOptimization: boolean }>([
    {
      type: 'confirm',
      name: 'imageOptimization',
      message: 'Enable Cloudflare Images optimization?',
      default: false,
    },
  ]);

  const { analyticsEngine } = await inquirer.prompt<{ analyticsEngine: boolean }>([
    {
      type: 'confirm',
      name: 'analyticsEngine',
      message: 'Enable Cloudflare Analytics Engine?',
      default: false,
    },
  ]);

  // Prompt for environments
  const environments = await promptEnvironments();

  // Get current date for compatibility_date
  const compatibilityDate = new Date().toISOString().split('T')[0]!;

  return {
    workerName,
    cachingStrategy,
    database,
    imageOptimization,
    analyticsEngine,
    environments,
    nextJsVersion,
    compatibilityDate,
  };
}

/**
 * Prompts for environment configurations
 *
 * @description
 * Asks user to configure development and production environments.
 *
 * @returns Array of environment configurations
 *
 * @example
 * ```typescript
 * const envs = await promptEnvironments();
 * ```
 */
async function promptEnvironments(): Promise<CloudflareConfig['environments']> {
  const environments: CloudflareConfig['environments'] = [];

  // Always include development environment
  const { devObservability } = await inquirer.prompt<{
    devObservability: boolean;
  }>([
    {
      type: 'confirm',
      name: 'devObservability',
      message: 'Enable full observability for development? (recommended)',
      default: true,
    },
  ]);

  environments.push({
    name: 'development',
    observability: {
      logs: true,
      logSamplingRate: devObservability ? 1.0 : 0.1,
      traces: true,
      traceSamplingRate: devObservability ? 1.0 : 0.1,
      logpush: false,
    },
  });

  // Ask about production environment
  const { hasProduction } = await inquirer.prompt<{ hasProduction: boolean }>([
    {
      type: 'confirm',
      name: 'hasProduction',
      message: 'Configure production environment?',
      default: true,
    },
  ]);

  if (hasProduction) {
    const { prodLogSampling } = await inquirer.prompt<{ prodLogSampling: number }>([
      {
        type: 'number',
        name: 'prodLogSampling',
        message: 'Production log sampling rate (0-1):',
        default: 0.1,
        validate: (input: number) => {
          if (input < 0 || input > 1) {
            return 'Sampling rate must be between 0 and 1';
          }
          return true;
        },
      },
    ]);

    const { prodTraceSampling } = await inquirer.prompt<{ prodTraceSampling: number }>([
      {
        type: 'number',
        name: 'prodTraceSampling',
        message: 'Production trace sampling rate (0-1):',
        default: 0.1,
        validate: (input: number) => {
          if (input < 0 || input > 1) {
            return 'Sampling rate must be between 0 and 1';
          }
          return true;
        },
      },
    ]);

    const { prodLogpush } = await inquirer.prompt<{ prodLogpush: boolean }>([
      {
        type: 'confirm',
        name: 'prodLogpush',
        message: 'Enable Logpush for production?',
        default: false,
      },
    ]);

    environments.push({
      name: 'production',
      observability: {
        logs: true,
        logSamplingRate: prodLogSampling,
        traces: true,
        traceSamplingRate: prodTraceSampling,
        logpush: prodLogpush,
      },
    });
  }

  return environments;
}
