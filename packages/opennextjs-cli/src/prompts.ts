/**
 * Interactive Prompts
 *
 * @clack/prompts-based prompts for gathering user preferences and configuration.
 * Uses the same library as next-forge.
 *
 * @packageDocumentation
 */

import * as p from '@clack/prompts';
import { cancel, isCancel } from '@clack/prompts';
import type { CachingStrategy, DatabaseOption } from './types/index.js';
import { validateProjectName } from './utils/validators.js';

/**
 * Prompts for project name
 */
export async function promptProjectName(defaultName?: string): Promise<string> {
  const projectName = await p.text({
    message: 'What is your project name?',
    placeholder: defaultName || 'my-project',
    ...(defaultName ? { defaultValue: defaultName } : {}),
    validate: (input: string) => {
      if (!input || input.trim().length === 0) {
        return 'Project name is required';
      }
      const result = validateProjectName(input);
      if (!result.success) {
        return result.error || 'Invalid project name';
      }
      return;
    },
  });

  if (isCancel(projectName)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return projectName as string;
}

/**
 * Prompts for caching strategy selection
 */
export async function promptCachingStrategy(): Promise<CachingStrategy> {
  const strategy = await p.select({
    message: 'Select a caching strategy:',
    options: [
      {
        value: 'static-assets' as CachingStrategy,
        label: 'Static Assets (SSG-only, no R2 needed)',
      },
      {
        value: 'r2' as CachingStrategy,
        label: 'R2 Incremental Cache (recommended for most cases)',
      },
      {
        value: 'r2-do-queue' as CachingStrategy,
        label: 'R2 + Durable Object Queue (ISR with time-based revalidation)',
      },
      {
        value: 'r2-do-queue-tag-cache' as CachingStrategy,
        label: 'R2 + DO Queue + DO Tag Cache (full-featured with on-demand revalidation)',
      },
    ],
    initialValue: 'r2' as CachingStrategy,
  });

  if (isCancel(strategy)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return strategy as CachingStrategy;
}

/**
 * Prompts for database option selection
 */
export async function promptDatabaseOption(): Promise<DatabaseOption> {
  const database = await p.select({
    message: 'Do you want to configure a database?',
    options: [
      { value: 'none' as DatabaseOption, label: 'None' },
      { value: 'hyperdrive' as DatabaseOption, label: 'Hyperdrive (PostgreSQL acceleration)' },
      { value: 'd1' as DatabaseOption, label: 'D1 (SQLite)' },
    ],
    initialValue: 'none' as DatabaseOption,
  });

  if (isCancel(database)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return database as DatabaseOption;
}

/**
 * Prompts for worker name
 */
export async function promptWorkerName(defaultName?: string): Promise<string> {
  const workerName = await p.text({
    message: 'What is your Cloudflare Worker name?',
    placeholder: defaultName || 'my-worker',
    ...(defaultName ? { defaultValue: defaultName } : {}),
    validate: (input: string) => {
      if (!input || input.trim().length === 0) {
        return 'Worker name is required';
      }
      return;
    },
  });

  if (isCancel(workerName)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return (workerName as string).trim();
}

/**
 * Prompts for Next.js version selection
 */
export async function promptNextJsVersion(detectedVersion?: string): Promise<string> {
  const version = await p.select({
    message: 'Which Next.js version do you want to use?',
    options: [
      {
        value: '15.1.0',
        label: 'Next.js 15.x (Official support, recommended)',
      },
      {
        value: '16.1.0',
        label: 'Next.js 16.x (Experimental, use with caution)',
      },
    ],
    initialValue: detectedVersion?.startsWith('15') ? '15.1.0' : '15.1.0',
  });

  if (isCancel(version)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return version as string;
}

/**
 * Prompts for confirmation
 */
export async function promptConfirmation(
  message: string,
  defaultValue: boolean = false
): Promise<boolean> {
  const confirmed = await p.confirm({
    message,
    initialValue: defaultValue,
  });

  if (isCancel(confirmed)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return confirmed as boolean;
}
