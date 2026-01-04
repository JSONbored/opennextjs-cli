/**
 * Environment Variables Command
 *
 * Manages environment variables for OpenNext.js Cloudflare projects.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { detectNextJsProject } from '../utils/project-detector.js';
import { logger } from '../utils/logger.js';
import { readWranglerToml, extractAccountId } from '../utils/config-reader.js';

/**
 * Creates the `env` command for managing environment variables
 *
 * @description
 * This command helps set up and manage environment variables for Cloudflare Workers.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli env setup
 * ```
 */
export function envCommand(): Command {
  const command = new Command('env');

  command
    .description('Manage environment variables for Cloudflare Workers')
    .summary('Manage environment variables')
    .addCommand(
      new Command('setup')
        .description('Interactive setup for environment variables')
        .action(async () => {
          try {
            p.intro('🔐 Environment Variables Setup');

            const projectRoot = process.cwd();
            const detection = detectNextJsProject(projectRoot);

            if (!detection.hasOpenNext) {
              logger.error('OpenNext.js Cloudflare is not configured');
              logger.info('Run "opennextjs-cli add" to set up OpenNext.js first');
              process.exit(1);
            }

            logger.section('Cloudflare Account');
            const accountId = await p.text({
              message: 'Cloudflare Account ID',
              placeholder: 'Enter your Cloudflare account ID',
              validate: (input) => {
                if (!input || input.trim().length === 0) {
                  return 'Account ID is required';
                }
                return;
              },
            });

            if (p.isCancel(accountId)) {
              p.cancel('Operation cancelled.');
              process.exit(0);
            }

            // Update wrangler.toml with account_id if not present
            const wranglerToml = readWranglerToml(projectRoot);
            if (wranglerToml && !extractAccountId(wranglerToml)) {
              logger.section('Updating Configuration');
              const tomlPath = join(projectRoot, 'wrangler.toml');
              const updated = wranglerToml.replace(
                /^name\s*=/m,
                `account_id = "${accountId}"\nname =`
              );
              writeFileSync(tomlPath, updated, 'utf-8');
              logger.success('Updated wrangler.toml with account ID');
            }

            // Generate .env.example
            logger.section('Environment Files');
            const envExamplePath = join(projectRoot, '.env.example');
            const envExample = `# Cloudflare Account ID
CLOUDFLARE_ACCOUNT_ID=${accountId}

# Add your environment variables here
# These will be used for local development (.dev.vars)
# For production, use: wrangler secret put <KEY>
`;

            writeFileSync(envExamplePath, envExample, 'utf-8');
            logger.success('Created .env.example');

            p.note(
              'For production secrets, use: wrangler secret put <KEY>\nFor local development, add variables to .dev.vars',
              '📝 Next Steps'
            );

            p.outro('Environment setup complete');
          } catch (error) {
            logger.error('Failed to set up environment variables', error);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('validate')
        .description('Validate environment variables')
        .action(() => {
          try {
            p.intro('✅ Validating Environment Variables');

            const projectRoot = process.cwd();
            const wranglerToml = readWranglerToml(projectRoot);

            if (!wranglerToml) {
              logger.error('wrangler.toml not found');
              process.exit(1);
            }

            const accountId = extractAccountId(wranglerToml);
            if (!accountId) {
              logger.warning('Account ID not found in wrangler.toml');
              logger.info('Run "opennextjs-cli env setup" to configure');
            } else {
              logger.success(`Account ID: ${accountId}`);
            }

            // Check for .dev.vars
            const devVarsPath = join(projectRoot, '.dev.vars');
            if (existsSync(devVarsPath)) {
              logger.success('.dev.vars file exists');
            } else {
              logger.warning('.dev.vars file not found');
              logger.info('Create .dev.vars for local development variables');
            }

            p.outro('Validation complete');
          } catch (error) {
            logger.error('Failed to validate environment variables', error);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('list')
        .description('List environment variables')
        .action(() => {
          try {
            const projectRoot = process.cwd();
            const devVarsPath = join(projectRoot, '.dev.vars');

            if (existsSync(devVarsPath)) {
              const content = readFileSync(devVarsPath, 'utf-8');
              console.log(content);
            } else {
              logger.warning('.dev.vars file not found');
            }
          } catch (error) {
            logger.error('Failed to list environment variables', error);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('set')
        .description('Set an environment variable')
        .argument('<key>', 'Environment variable key')
        .argument('<value>', 'Environment variable value')
        .option('--secret', 'Set as Cloudflare secret (production)')
        .action((key: string, value: string, options: { secret?: boolean }) => {
          try {
            const projectRoot = process.cwd();

            if (options.secret) {
              // Set as Cloudflare secret
              logger.section('Setting Cloudflare Secret');
              execSync(`wrangler secret put ${key}`, {
                cwd: projectRoot,
                input: value,
                stdio: 'inherit',
              });
              logger.success(`Secret ${key} set`);
            } else {
              // Add to .dev.vars
              const devVarsPath = join(projectRoot, '.dev.vars');
              let content = '';

              if (existsSync(devVarsPath)) {
                content = readFileSync(devVarsPath, 'utf-8');
              }

              // Check if key already exists
              const keyRegex = new RegExp(`^${key}=.*$`, 'm');
              if (keyRegex.test(content)) {
                content = content.replace(keyRegex, `${key}=${value}`);
              } else {
                content += `\n${key}=${value}\n`;
              }

              writeFileSync(devVarsPath, content, 'utf-8');
              logger.success(`Added ${key} to .dev.vars`);
            }
          } catch (error) {
            logger.error('Failed to set environment variable', error);
            process.exit(1);
          }
        })
    );

  command.addHelpText(
    'after',
    `
Subcommands:
  setup      Interactive setup wizard for environment variables
  validate   Validate environment variable configuration
  list       List local environment variables (.dev.vars)
  set        Set an environment variable (local or secret)

Examples:
  opennextjs-cli env setup                    Set up environment variables
  opennextjs-cli env validate                 Check configuration
  opennextjs-cli env set API_KEY value        Set local variable
  opennextjs-cli env set API_KEY value --secret  Set production secret
`
  );

  return command;
}
