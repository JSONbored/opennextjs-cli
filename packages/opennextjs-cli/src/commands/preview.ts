/**
 * Preview Command
 *
 * Starts a local preview server using Cloudflare Workers.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { spawn } from 'child_process';
import { detectNextJsProject } from '../utils/project-detector.js';
import { logger } from '../utils/logger.js';

/**
 * Creates the `preview` command for local preview
 *
 * @description
 * This command starts a local preview server using wrangler dev,
 * allowing you to test your OpenNext.js application locally.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli preview
 * ```
 */
export function previewCommand(): Command {
  const command = new Command('preview');

  command
    .description('Start local preview server with Cloudflare Workers')
    .summary('Preview locally')
    .option(
      '--port <number>',
      'Port to run preview server on (default: 8787)',
      '8787'
    )
    .option(
      '--env <name>',
      'Use specific environment configuration'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli preview                 Start preview on default port (8787)
  opennextjs-cli preview --port 3000    Start preview on port 3000
  opennextjs-cli preview --env dev      Use development environment config

What it does:
  1. Starts wrangler dev server
  2. Loads environment variables from .dev.vars
  3. Provides local preview URL (typically http://localhost:8787)
  4. Supports hot reload for development

Press Ctrl+C to stop the preview server.
`
    )
    .action((options: { port?: string; env?: string }) => {
      try {
        p.intro('🔍 Starting Preview Server');

        const projectRoot = process.cwd();
        const detection = detectNextJsProject(projectRoot);

        if (!detection.isNextJsProject) {
          logger.error('Not a Next.js project');
          logger.info('Run this command from a Next.js project directory');
          process.exit(1);
        }

        if (!detection.hasOpenNext) {
          logger.error('OpenNext.js Cloudflare is not configured');
          logger.info('Run "opennextjs-cli add" to set up OpenNext.js first');
          process.exit(1);
        }

        const port = options.port || '8787';
        const env = options.env;

        logger.section('Starting Server');
        p.log.info(`Port: ${port}`);
        if (env) {
          p.log.info(`Environment: ${env}`);
        }
        p.log.info('Starting wrangler dev...');

        // Build command
        const wranglerCommand = 'wrangler';
        const args: string[] = ['dev'];

        if (port) {
          args.push('--port', port);
        }

        if (env) {
          args.push('--env', env);
        }

        // Start wrangler dev
        const wranglerProcess = spawn(wranglerCommand, args, {
          cwd: projectRoot,
          stdio: 'inherit',
          shell: true,
        });

        // Handle process termination
        process.on('SIGINT', () => {
          p.log.info('\nStopping preview server...');
          wranglerProcess.kill('SIGINT');
          process.exit(0);
        });

        process.on('SIGTERM', () => {
          wranglerProcess.kill('SIGTERM');
          process.exit(0);
        });

        wranglerProcess.on('error', (error) => {
          logger.error('Failed to start preview server', error);
          process.exit(1);
        });

        wranglerProcess.on('exit', (code) => {
          if (code !== 0 && code !== null) {
            logger.error(`Preview server exited with code ${code}`);
            process.exit(code);
          }
        });

        // Note: The process will continue running until user stops it
        // We don't call outro here since the server is running
      } catch (error) {
        logger.error('Failed to start preview server', error);
        process.exit(1);
      }
    });

  return command;
}
