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
import { promptTemplateSelection } from '../utils/template-selector.js';
import { applyTemplates } from '../utils/templates.js';
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
    .option(
      '--template <templates>',
      'Comma-separated list of templates to apply (e.g., "with-auth,with-database")'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli init                    Interactive setup with prompts
  opennextjs-cli init my-app              Create project named "my-app"
  opennextjs-cli init --yes               Use all defaults, no prompts
  opennextjs-cli init --worker-name my-worker  Custom worker name
  opennextjs-cli init --template with-auth,with-database  Apply templates

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
    .action(async (projectName: string | undefined, options: { 
      yes?: boolean;
      nextVersion?: string;
      workerName?: string;
      cachingStrategy?: string;
      template?: string;
    }) => {
      try {
        p.intro('🚀 OpenNext.js CLI');
        logger.section('Project Initialization');

        // Parse template option
        let selectedTemplates: string[] = ['basic'];
        if (options.template) {
          selectedTemplates = options.template.split(',').map(t => t.trim());
        }

        // Group initial prompts
        logger.section('Project Setup');
        const initialConfig = await p.group(
          {
            projectName: () => promptProjectName(projectName),
            packageManager: () => promptPackageManager(),
            templates: () => {
              // Only prompt if template not provided via flag
              if (!options.template && !options.yes) {
                return promptTemplateSelection('Select project templates:', ['basic']);
              }
              return Promise.resolve(selectedTemplates);
            },
          },
          {
            onCancel: () => {
              p.cancel('Operation cancelled.');
              process.exit(0);
            },
          }
        );

        const finalProjectName = initialConfig.projectName;
        const selectedPackageManager = initialConfig.packageManager;
        selectedTemplates = initialConfig.templates;

        // Create project directory
        const projectPath = join(process.cwd(), finalProjectName);
        if (projectPath !== process.cwd()) {
          mkdirSync(projectPath, { recursive: true });
        }

        // Change to project directory
        process.chdir(projectPath);

        // Prompt for Cloudflare configuration (grouped)
        logger.section('Cloudflare Configuration');
        const config = await promptCloudflareConfig({
          workerName: finalProjectName,
          nextJsVersion: '15.1.0',
        });

        // Build tasks array
        const tasks = [
          {
            title: 'Creating Next.js project',
            task: async () => {
              execSync(`npx create-next-app@latest ${finalProjectName} --typescript --tailwind --app --no-src-dir --import-alias "@/*"`, {
                stdio: 'inherit',
                cwd: projectPath !== process.cwd() ? process.cwd() : undefined,
              });
            },
          },
          {
            title: 'Generating configuration files',
            task: async () => {
              await generateCloudflareConfig(config, projectPath);
            },
          },
          {
            title: 'Installing @opennextjs/cloudflare',
            task: async () => {
              addDependency('@opennextjs/cloudflare', false, projectPath, selectedPackageManager);
            },
          },
          {
            title: 'Installing wrangler',
            task: async () => {
              addDependency('wrangler', true, projectPath, selectedPackageManager);
            },
          },
          {
            title: 'Installing dependencies',
            task: async () => {
              installDependencies(projectPath, selectedPackageManager);
            },
          },
        ];

        // Add template task if templates are selected (and not just basic)
        const hasNonBasicTemplates = selectedTemplates.length > 0 && 
          (selectedTemplates.length > 1 || !selectedTemplates.includes('basic'));
        
        if (hasNonBasicTemplates) {
          tasks.push({
            title: 'Applying templates',
            task: async () => {
              await applyTemplates(selectedTemplates, projectPath, selectedPackageManager);
            },
          });
        }

        // Use tasks() for sequential operations
        await p.tasks(tasks);

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
