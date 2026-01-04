/**
 * Cloudflare Command
 *
 * Manages Cloudflare account authentication and connection.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { execSync } from 'child_process';
import { logger } from '../utils/logger.js';
import { readWranglerToml, extractAccountId } from '../utils/config-reader.js';

/**
 * Creates the `cloudflare` command for managing Cloudflare account
 *
 * @description
 * This command helps authenticate and verify Cloudflare account connection.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli cloudflare login
 * ```
 */
export function cloudflareCommand(): Command {
  const command = new Command('cloudflare');

  command
    .description('Manage Cloudflare account authentication and connection')
    .summary('Manage Cloudflare account')
    .addCommand(
      new Command('login')
        .description('Authenticate with Cloudflare')
        .action(() => {
          try {
            p.intro('🔐 Cloudflare Authentication');

            logger.section('Login');
            p.log.info('Opening Cloudflare login in your browser...');

            execSync('wrangler login', { stdio: 'inherit' });

            logger.success('Successfully authenticated with Cloudflare');
            p.outro('Authentication complete');
          } catch (error) {
            logger.error('Failed to authenticate', error);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('verify')
        .description('Verify current authentication status')
        .action(() => {
          try {
            p.intro('✅ Verifying Authentication');

            logger.section('Authentication Status');
            try {
              const output = execSync('wrangler whoami', { encoding: 'utf-8' });
              logger.success('Authenticated with Cloudflare');
              p.log.info(output.trim());
            } catch {
              logger.error('Not authenticated with Cloudflare');
              logger.info('Run "opennextjs-cli cloudflare login" to authenticate');
              process.exit(1);
            }

            // Check account ID in config
            const wranglerToml = readWranglerToml();
            if (wranglerToml) {
              const accountId = extractAccountId(wranglerToml);
              if (accountId) {
                p.log.info(`Account ID in config: ${accountId}`);
              } else {
                logger.warning('Account ID not found in wrangler.toml');
              }
            }

            p.outro('Verification complete');
          } catch (error) {
            logger.error('Failed to verify authentication', error);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('account')
        .description('Show account information')
        .action(() => {
          try {
            p.intro('👤 Account Information');

            logger.section('Account Details');
            try {
              const output = execSync('wrangler whoami', { encoding: 'utf-8' });
              console.log(output);
            } catch {
              logger.error('Not authenticated');
              logger.info('Run "opennextjs-cli cloudflare login" first');
              process.exit(1);
            }

            p.outro('Account information displayed');
          } catch (error) {
            logger.error('Failed to get account information', error);
            process.exit(1);
          }
        })
    )
    .addCommand(
      new Command('logout')
        .description('Clear Cloudflare authentication')
        .action(() => {
          try {
            p.intro('🚪 Logging Out');

            // Wrangler doesn't have a logout command, but we can clear the token
            logger.section('Clearing Authentication');
            p.log.info('To logout, delete the Cloudflare API token from:');
            p.log.info('  ~/.wrangler/config/default.toml');
            p.log.info('Or revoke it from: https://dash.cloudflare.com/profile/api-tokens');

            p.outro('Logout instructions displayed');
          } catch (error) {
            logger.error('Failed to logout', error);
            process.exit(1);
          }
        })
    );

  command.addHelpText(
    'after',
    `
Subcommands:
  login      Authenticate with Cloudflare
  verify     Verify current authentication status
  account    Show account information
  logout     Clear authentication (instructions)

Examples:
  opennextjs-cli cloudflare login      Authenticate with Cloudflare
  opennextjs-cli cloudflare verify     Check authentication status
  opennextjs-cli cloudflare account    Show account details
`
  );

  return command;
}
