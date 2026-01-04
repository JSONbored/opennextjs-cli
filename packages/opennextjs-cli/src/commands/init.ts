/**
 * Init Command
 *
 * Initializes a new Next.js project with OpenNext.js Cloudflare configuration.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
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
    .description('Initialize a new Next.js project with OpenNext.js Cloudflare')
    .argument('[project-name]', 'Name of the project to create')
    .option('-y, --yes', 'Skip interactive prompts and use defaults')
    .action(async (projectName: string | undefined, _options: { yes?: boolean }) => {
      try {
        logger.info('Initializing new OpenNext.js Cloudflare project...');

        // Get project name
        const finalProjectName = projectName || (await promptProjectName());

        // Create project directory
        const projectPath = join(process.cwd(), finalProjectName);
        if (projectPath !== process.cwd()) {
          mkdirSync(projectPath, { recursive: true });
        }

        // Initialize Next.js project
        logger.info('Creating Next.js project...');
        execSync(`npx create-next-app@latest ${finalProjectName} --typescript --tailwind --app --no-src-dir --import-alias "@/*"`, {
          stdio: 'inherit',
          cwd: projectPath !== process.cwd() ? process.cwd() : undefined,
        });

        // Change to project directory
        process.chdir(projectPath);

        // Prompt for Cloudflare configuration
        const config = await promptCloudflareConfig({
          workerName: finalProjectName,
          nextJsVersion: '15.1.0',
        });

        // Generate configuration files
        logger.info('Generating configuration files...');
        await generateCloudflareConfig(config, projectPath);

        // Install OpenNext.js Cloudflare
        logger.info('Installing @opennextjs/cloudflare...');
        await addDependency('@opennextjs/cloudflare', false, projectPath);

        // Install wrangler as dev dependency
        logger.info('Installing wrangler...');
        await addDependency('wrangler', true, projectPath);

        // Install all dependencies
        logger.info('Installing dependencies...');
        await installDependencies(projectPath);

        logger.success(`Project "${finalProjectName}" initialized successfully!`);
        logger.info(`Next steps:`);
        logger.info(`  cd ${finalProjectName}`);
        logger.info(`  pnpm dev        # Start development server`);
        logger.info(`  pnpm preview    # Preview with Cloudflare Workers`);
        logger.info(`  pnpm deploy     # Deploy to Cloudflare`);
      } catch (error) {
        logger.error('Failed to initialize project', error);
        process.exit(1);
      }
    });

  return command;
}
