/**
 * Init Command
 *
 * Initializes a new Next.js project with OpenNext.js Cloudflare configuration.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { promptProjectName } from '../prompts.js';
import { promptCloudflareConfig } from '../platforms/cloudflare/prompts.js';
import { generateCloudflareConfig } from '../platforms/cloudflare/index.js';
import { addDependency, installDependencies } from '../utils/package-manager.js';
import { logger } from '../utils/logger.js';
import { mkdirSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * Creates the `init` command for initializing new projects
 *
 * @description
 * This command guides users through creating a new Next.js project
 * with OpenNext.js Cloudflare configuration from scratch.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli init my-project
 * ```
 */
export function initCommand(): Command {
  const command = new Command('init');

  command
    .description('Initialize a new Next.js project with OpenNext.js Cloudflare configuration')
    .summary('Create a new Next.js project with OpenNext.js Cloudflare')
    .argument(
      '[project-name]',
      'Name of the project directory to create (will prompt if not provided)'
    )
    .option(
      '-y, --yes',
      'Skip all interactive prompts and use default configuration values'
    )
    .option(
      '--next-version <version>',
      'Specify Next.js version to use (default: latest 15.x)',
      '15.1.0'
    )
    .option(
      '--worker-name <name>',
      'Cloudflare Worker name (default: project name)'
    )
    .option(
      '--caching-strategy <strategy>',
      'Caching strategy: static-assets, r2, r2-do-queue, r2-do-queue-tag-cache',
      'r2'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli init                    Interactive setup with prompts
  opennextjs-cli init my-app              Create project named "my-app"
  opennextjs-cli init --yes               Use all defaults, no prompts
  opennextjs-cli init --worker-name my-worker  Custom worker name

What it does:
  1. Creates a new Next.js project with TypeScript and Tailwind CSS
  2. Configures OpenNext.js Cloudflare adapter
  3. Sets up wrangler.toml and open-next.config.ts
  4. Installs all required dependencies
  5. Configures package.json scripts for preview and deploy

Caching Strategies:
  static-assets           SSG-only, no R2 needed
  r2                      R2 Incremental Cache (recommended)
  r2-do-queue            ISR with time-based revalidation
  r2-do-queue-tag-cache  Full-featured with on-demand revalidation

Next Steps:
  After initialization, you can:
  cd <project-name>
  pnpm dev        # Start development server
  pnpm preview    # Preview with Cloudflare Workers
  pnpm deploy     # Deploy to Cloudflare
`
    )
    .action(async (projectName: string | undefined, _options: { 
      yes?: boolean;
      nextVersion?: string;
      workerName?: string;
      cachingStrategy?: string;
    }) => {
      try {
        p.intro('🚀 OpenNext.js CLI');
        logger.section('Project Initialization');

        // Get project name
        const finalProjectName = projectName || (await promptProjectName());

        // Create project directory
        const projectPath = join(process.cwd(), finalProjectName);
        if (projectPath !== process.cwd()) {
          mkdirSync(projectPath, { recursive: true });
        }

        // Initialize Next.js project
        const nextSpinner = p.spinner();
        nextSpinner.start('Creating Next.js project...');
        execSync(`npx create-next-app@latest ${finalProjectName} --typescript --tailwind --app --no-src-dir --import-alias "@/*"`, {
          stdio: 'inherit',
          cwd: projectPath !== process.cwd() ? process.cwd() : undefined,
        });
        nextSpinner.stop('Next.js project created');

        // Change to project directory
        process.chdir(projectPath);

        // Prompt for Cloudflare configuration
        logger.section('Cloudflare Configuration');
        const config = await promptCloudflareConfig({
          workerName: finalProjectName,
          nextJsVersion: '15.1.0',
        });

        // Generate configuration files
        logger.section('Setup');
        const configSpinner = p.spinner();
        configSpinner.start('Generating configuration files...');
        await generateCloudflareConfig(config, projectPath);
        configSpinner.stop('Configuration files generated');

        // Install OpenNext.js Cloudflare
        const opennextSpinner = p.spinner();
        opennextSpinner.start('Installing @opennextjs/cloudflare...');
        await addDependency('@opennextjs/cloudflare', false, projectPath);
        opennextSpinner.stop('@opennextjs/cloudflare installed');

        // Install wrangler as dev dependency
        const wranglerSpinner = p.spinner();
        wranglerSpinner.start('Installing wrangler...');
        await addDependency('wrangler', true, projectPath);
        wranglerSpinner.stop('wrangler installed');

        // Install all dependencies
        const depsSpinner = p.spinner();
        depsSpinner.start('Installing dependencies...');
        await installDependencies(projectPath);
        depsSpinner.stop('Dependencies installed');

        logger.success(`Project "${finalProjectName}" initialized successfully!`);
        p.note(
          `Next steps:\n\n  cd ${finalProjectName}\n  pnpm dev        # Start development server\n  pnpm preview    # Preview with Cloudflare Workers\n  pnpm deploy     # Deploy to Cloudflare`,
          '🎉 Ready to Go!'
        );
        p.outro('Project initialized successfully!');
      } catch (error) {
        logger.error('Failed to initialize project', error);
        process.exit(1);
      }
    });

  return command;
}
