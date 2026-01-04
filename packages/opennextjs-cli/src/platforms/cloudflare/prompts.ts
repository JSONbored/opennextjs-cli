/**
 * Cloudflare Platform Prompts
 *
 * Interactive prompts specific to Cloudflare platform configuration.
 * Uses @clack/prompts (same as next-forge).
 *
 * @packageDocumentation
 */

import * as p from '@clack/prompts';
import { cancel, isCancel } from '@clack/prompts';
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

  const imageOptimization = await p.confirm({
    message: 'Enable Cloudflare Images optimization?',
    initialValue: false,
  });

  if (isCancel(imageOptimization)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  const analyticsEngine = await p.confirm({
    message: 'Enable Cloudflare Analytics Engine?',
    initialValue: false,
  });

  if (isCancel(analyticsEngine)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  // Prompt for environments
  const environments = await promptEnvironments();

  // Get current date for compatibility_date
  const compatibilityDate = new Date().toISOString().split('T')[0]!;

  return {
    workerName,
    cachingStrategy,
    database,
    imageOptimization: imageOptimization,
    analyticsEngine: analyticsEngine,
    environments,
    nextJsVersion,
    compatibilityDate,
  };
}

/**
 * Prompts for environment configurations
 */
async function promptEnvironments(): Promise<CloudflareConfig['environments']> {
  const environments: CloudflareConfig['environments'] = [];

  // Always include development environment
  const devObservability = await p.confirm({
    message: 'Enable full observability for development? (recommended)',
    initialValue: true,
  });

  if (isCancel(devObservability)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

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
  const hasProduction = await p.confirm({
    message: 'Configure production environment?',
    initialValue: true,
  });

  if (isCancel(hasProduction)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  if (hasProduction) {
    const prodLogSampling = await p.text({
      message: 'Production log sampling rate (0-1):',
      placeholder: '0.1',
      defaultValue: '0.1',
      validate: (input: string) => {
        const value = parseFloat(input);
        if (isNaN(value) || value < 0 || value > 1) {
          return 'Sampling rate must be between 0 and 1';
        }
        return;
      },
    });

    if (isCancel(prodLogSampling)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }

    const prodTraceSampling = await p.text({
      message: 'Production trace sampling rate (0-1):',
      placeholder: '0.1',
      defaultValue: '0.1',
      validate: (input: string) => {
        const value = parseFloat(input);
        if (isNaN(value) || value < 0 || value > 1) {
          return 'Sampling rate must be between 0 and 1';
        }
        return;
      },
    });

    if (isCancel(prodTraceSampling)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }

    const prodLogpush = await p.confirm({
      message: 'Enable Logpush for production?',
      initialValue: false,
    });

    if (isCancel(prodLogpush)) {
      cancel('Operation cancelled.');
      process.exit(0);
    }

    environments.push({
      name: 'production',
      observability: {
        logs: true,
        logSamplingRate: parseFloat(prodLogSampling),
        traces: true,
        traceSamplingRate: parseFloat(prodTraceSampling),
        logpush: prodLogpush,
      },
    });
  }

  return environments;
}
