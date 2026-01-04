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
  // Group core configuration prompts
  const coreConfig = await p.group(
    {
      workerName: () => promptWorkerName(defaults?.workerName),
      cachingStrategy: () => promptCachingStrategy(),
      database: () => promptDatabaseOption(),
      nextJsVersion: () => promptNextJsVersion(defaults?.nextJsVersion),
    },
    {
      onCancel: () => {
        cancel('Operation cancelled.');
        process.exit(0);
      },
    }
  );

  const workerName = coreConfig.workerName;
  const cachingStrategy = coreConfig.cachingStrategy;
  const database = coreConfig.database;
  const nextJsVersion = coreConfig.nextJsVersion;

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

  // Group optional features
  const optionalFeatures = await p.group(
    {
      imageOptimization: () => p.confirm({
        message: 'Enable Cloudflare Images optimization?',
        initialValue: false,
      }),
      analyticsEngine: () => p.confirm({
        message: 'Enable Cloudflare Analytics Engine?',
        initialValue: false,
      }),
    },
    {
      onCancel: () => {
        cancel('Operation cancelled.');
        process.exit(0);
      },
    }
  );

  const imageOptimization = optionalFeatures.imageOptimization;
  const analyticsEngine = optionalFeatures.analyticsEngine;

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

  // Use multiselect for environment selection
  const selectedEnvironments = await p.multiselect({
    message: 'Select environments to configure:',
    options: [
      { value: 'development', label: 'Development (always included)', hint: 'Full observability recommended' },
      { value: 'staging', label: 'Staging', hint: 'Optional' },
      { value: 'production', label: 'Production', hint: 'Recommended' },
    ],
    initialValues: ['development', 'production'],
  });

  if (isCancel(selectedEnvironments)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  // Always include development environment
  const hasDevelopment = selectedEnvironments.includes('development');
  const devObservability = hasDevelopment ? await p.confirm({
    message: 'Enable full observability for development? (recommended)',
    initialValue: true,
  }) : false;

  if (isCancel(devObservability)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  if (hasDevelopment) {
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
  }

  // Configure staging if selected
  if (selectedEnvironments.includes('staging')) {
    const stagingConfig = await p.group(
      {
        logSampling: () => p.text({
          message: 'Staging log sampling rate (0-1):',
          placeholder: '0.5',
          defaultValue: '0.5',
          validate: (input: string) => {
            const value = parseFloat(input);
            if (isNaN(value) || value < 0 || value > 1) {
              return 'Sampling rate must be between 0 and 1';
            }
            return;
          },
        }),
        traceSampling: () => p.text({
          message: 'Staging trace sampling rate (0-1):',
          placeholder: '0.5',
          defaultValue: '0.5',
          validate: (input: string) => {
            const value = parseFloat(input);
            if (isNaN(value) || value < 0 || value > 1) {
              return 'Sampling rate must be between 0 and 1';
            }
            return;
          },
        }),
        logpush: () => p.confirm({
          message: 'Enable Logpush for staging?',
          initialValue: false,
        }),
      },
      {
        onCancel: () => {
          cancel('Operation cancelled.');
          process.exit(0);
        },
      }
    );

    if (!isCancel(stagingConfig.logSampling) && !isCancel(stagingConfig.traceSampling) && !isCancel(stagingConfig.logpush)) {
      environments.push({
        name: 'staging',
        observability: {
          logs: true,
          logSamplingRate: parseFloat(stagingConfig.logSampling),
          traces: true,
          traceSamplingRate: parseFloat(stagingConfig.traceSampling),
          logpush: stagingConfig.logpush,
        },
      });
    }
  }

  // Configure production if selected
  if (selectedEnvironments.includes('production')) {
    const prodConfig = await p.group(
      {
        logSampling: () => p.text({
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
        }),
        traceSampling: () => p.text({
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
        }),
        logpush: () => p.confirm({
          message: 'Enable Logpush for production?',
          initialValue: false,
        }),
      },
      {
        onCancel: () => {
          cancel('Operation cancelled.');
          process.exit(0);
        },
      }
    );

    if (!isCancel(prodConfig.logSampling) && !isCancel(prodConfig.traceSampling) && !isCancel(prodConfig.logpush)) {
      environments.push({
        name: 'production',
        observability: {
          logs: true,
          logSamplingRate: parseFloat(prodConfig.logSampling),
          traces: true,
          traceSamplingRate: parseFloat(prodConfig.traceSampling),
          logpush: prodConfig.logpush,
        },
      });
    }
  }

  return environments;
}
