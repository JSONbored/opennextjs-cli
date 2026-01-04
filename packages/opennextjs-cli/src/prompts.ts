/**
 * Interactive Prompts
 *
 * Inquirer-based prompts for gathering user preferences and configuration.
 *
 * @packageDocumentation
 */

import inquirer from 'inquirer';
import type { CachingStrategy, DatabaseOption } from './types/index.js';
import { validateProjectName } from './utils/validators.js';

/**
 * Prompts for project name
 *
 * @description
 * Asks the user for a project name and validates it.
 *
 * @param defaultName - Default project name suggestion
 * @returns Project name entered by user
 *
 * @example
 * ```typescript
 * const name = await promptProjectName('my-project');
 * ```
 */
export async function promptProjectName(defaultName?: string): Promise<string> {
  const { projectName } = await inquirer.prompt<{ projectName: string }>([
    {
      type: 'input',
      name: 'projectName',
      message: 'What is your project name?',
      default: defaultName,
      validate: (input: string) => {
        const result = validateProjectName(input);
        return result.success || result.error || 'Invalid project name';
      },
    },
  ]);

  return projectName;
}

/**
 * Prompts for caching strategy selection
 *
 * @description
 * Presents caching strategy options with descriptions.
 *
 * @returns Selected caching strategy
 *
 * @example
 * ```typescript
 * const strategy = await promptCachingStrategy();
 * ```
 */
export async function promptCachingStrategy(): Promise<CachingStrategy> {
  const { strategy } = await inquirer.prompt<{ strategy: CachingStrategy }>([
    {
      type: 'list',
      name: 'strategy',
      message: 'Select a caching strategy:',
      choices: [
        {
          name: 'Static Assets (SSG-only, no R2 needed)',
          value: 'static-assets',
        },
        {
          name: 'R2 Incremental Cache (recommended for most cases)',
          value: 'r2',
        },
        {
          name: 'R2 + Durable Object Queue (ISR with time-based revalidation)',
          value: 'r2-do-queue',
        },
        {
          name: 'R2 + DO Queue + DO Tag Cache (full-featured with on-demand revalidation)',
          value: 'r2-do-queue-tag-cache',
        },
      ],
      default: 'r2',
    },
  ]);

  return strategy;
}

/**
 * Prompts for database option selection
 *
 * @description
 * Asks user if they want to configure a database binding.
 *
 * @returns Selected database option
 *
 * @example
 * ```typescript
 * const database = await promptDatabaseOption();
 * ```
 */
export async function promptDatabaseOption(): Promise<DatabaseOption> {
  const { database } = await inquirer.prompt<{ database: DatabaseOption }>([
    {
      type: 'list',
      name: 'database',
      message: 'Do you want to configure a database?',
      choices: [
        { name: 'None', value: 'none' },
        { name: 'Hyperdrive (PostgreSQL acceleration)', value: 'hyperdrive' },
        { name: 'D1 (SQLite)', value: 'd1' },
      ],
      default: 'none',
    },
  ]);

  return database;
}

/**
 * Prompts for worker name
 *
 * @description
 * Asks for the Cloudflare Worker name.
 *
 * @param defaultName - Default worker name suggestion
 * @returns Worker name entered by user
 *
 * @example
 * ```typescript
 * const workerName = await promptWorkerName('my-worker');
 * ```
 */
export async function promptWorkerName(defaultName?: string): Promise<string> {
  const { workerName } = await inquirer.prompt<{ workerName: string }>([
    {
      type: 'input',
      name: 'workerName',
      message: 'What is your Cloudflare Worker name?',
      default: defaultName,
      validate: (input: string) => {
        if (!input || input.trim().length === 0) {
          return 'Worker name is required';
        }
        return true;
      },
    },
  ]);

  return workerName.trim();
}

/**
 * Prompts for Next.js version selection
 *
 * @description
 * Allows user to choose between Next.js 15.x (official) and 16.x (experimental).
 *
 * @param detectedVersion - Currently installed Next.js version (if any)
 * @returns Selected Next.js version
 *
 * @example
 * ```typescript
 * const version = await promptNextJsVersion('15.1.0');
 * ```
 */
export async function promptNextJsVersion(detectedVersion?: string): Promise<string> {
  const { version } = await inquirer.prompt<{ version: string }>([
    {
      type: 'list',
      name: 'version',
      message: 'Which Next.js version do you want to use?',
      choices: [
        {
          name: 'Next.js 15.x (Official support, recommended)',
          value: '15.1.0',
        },
        {
          name: 'Next.js 16.x (Experimental, use with caution)',
          value: '16.1.0',
        },
      ],
      default: detectedVersion?.startsWith('15') ? '15.1.0' : '15.1.0',
    },
  ]);

  return version;
}

/**
 * Prompts for confirmation with a warning message
 *
 * @description
 * Asks user to confirm an action, useful for experimental features or destructive operations.
 *
 * @param message - Confirmation message
 * @param defaultValue - Default value
 * @returns Whether user confirmed
 *
 * @example
 * ```typescript
 * const confirmed = await promptConfirmation('This is experimental. Continue?', false);
 * ```
 */
export async function promptConfirmation(
  message: string,
  defaultValue: boolean = false
): Promise<boolean> {
  const { confirmed } = await inquirer.prompt<{ confirmed: boolean }>([
    {
      type: 'confirm',
      name: 'confirmed',
      message,
      default: defaultValue,
    },
  ]);

  return confirmed;
}
