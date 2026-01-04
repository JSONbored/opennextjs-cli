/**
 * Init Command
 *
 * Initializes a new Next.js project with OpenNext.js Cloudflare configuration.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { promptProjectName, promptPackageManager } from '../prompts.js';
import { promptCloudflareConfig } from '../platforms/cloudflare/prompts.js';
import { generateCloudflareConfig } from '../platforms/cloudflare/index.js';
import { addDependency, installDependencies } from '../utils/package-manager.js';
import { logger } from '../utils/logger.js';
import { isGitInitialized, isGitAvailable, initializeGit, createGitignore, createInitialCommit } from '../utils/git.js';
import { promptConfirmation } from '../prompts.js';
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

        // Get package manager
        logger.section('Package Manager');
        const selectedPackageManager = await promptPackageManager();

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
        await addDependency('@opennextjs/cloudflare', false, projectPath, selectedPackageManager);
        opennextSpinner.stop('@opennextjs/cloudflare installed');

        // Install wrangler as dev dependency
        const wranglerSpinner = p.spinner();
        wranglerSpinner.start('Installing wrangler...');
        await addDependency('wrangler', true, projectPath, selectedPackageManager);
        wranglerSpinner.stop('wrangler installed');

        // Install all dependencies
        const depsSpinner = p.spinner();
        depsSpinner.start('Installing dependencies...');
        await installDependencies(projectPath, selectedPackageManager);
        depsSpinner.stop('Dependencies installed');

        // Git initialization
        if (isGitAvailable() && !isGitInitialized(projectPath)) {
          logger.section('Git Setup');
          const initGit = await promptConfirmation(
            'Initialize git repository?',
            true
          );

          if (initGit) {
            const gitSpinner = p.spinner();
            gitSpinner.start('Initializing git repository...');
            
            if (initializeGit(projectPath)) {
              createGitignore(projectPath);
              gitSpinner.stop('Git repository initialized');

              const makeCommit = await promptConfirmation(
                'Create initial commit?',
                true
              );

              if (makeCommit) {
                const commitSpinner = p.spinner();
                commitSpinner.start('Creating initial commit...');
                if (createInitialCommit(projectPath, 'Initial commit from opennextjs-cli')) {
                  commitSpinner.stop('Initial commit created');
                } else {
                  commitSpinner.stop('Failed to create initial commit');
                }
              }
            } else {
              gitSpinner.stop('Failed to initialize git repository');
            }
          }
        }

        logger.success(`Project "${finalProjectName}" initialized successfully!`);
        const pmCommand = selectedPackageManager === 'pnpm' ? 'pnpm' : selectedPackageManager === 'yarn' ? 'yarn' : 'npm';
        p.note(
          `Next steps:\n\n  cd ${finalProjectName}\n  ${pmCommand} dev        # Start development server\n  ${pmCommand} preview    # Preview with Cloudflare Workers\n  ${pmCommand} deploy     # Deploy to Cloudflare`,
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
