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
        .action(async () => {
          try {
            p.intro('🔐 Cloudflare Authentication');

            await new Promise((resolve) => setTimeout(resolve, 150));
            p.note('Opening Cloudflare login in your browser...', 'Login');

            execSync('wrangler login', { stdio: 'inherit' });

            await new Promise((resolve) => setTimeout(resolve, 150));
            p.note('Successfully authenticated with Cloudflare', 'Authentication');
            await new Promise((resolve) => setTimeout(resolve, 150));
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
        .action(async () => {
          try {
            p.intro('✅ Verifying Authentication');

            await new Promise((resolve) => setTimeout(resolve, 150));
            try {
              const output = execSync('wrangler whoami', { encoding: 'utf-8' });
              const verifyInfo = [
                '  ✓ Authenticated with Cloudflare',
                `  ${output.trim()}`,
              ];
              p.note(verifyInfo.join('\n'), 'Authentication Status');

            // Check account ID in config
            const wranglerToml = readWranglerToml();
            if (wranglerToml) {
              const accountId = extractAccountId(wranglerToml);
              if (accountId) {
                  await new Promise((resolve) => setTimeout(resolve, 150));
                  p.note(`  Account ID: ${accountId}`, 'Configuration');
              } else {
                  await new Promise((resolve) => setTimeout(resolve, 150));
                  p.note('  ▲ Account ID not found in wrangler.toml', 'Configuration');
              }
            }
            } catch {
              p.note(
                '  ■ Not authenticated with Cloudflare\n  Run "opennextjs-cli cloudflare login" to authenticate',
                'Authentication Status'
              );
              process.exit(1);
            }

            await new Promise((resolve) => setTimeout(resolve, 150));
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
        .action(async () => {
          try {
            p.intro('👤 Account Information');

            await new Promise((resolve) => setTimeout(resolve, 150));
            try {
              const output = execSync('wrangler whoami', { encoding: 'utf-8' });
              p.note(output.trim(), 'Account Details');
            } catch {
              p.note(
                '  ■ Not authenticated\n  Run "opennextjs-cli cloudflare login" first',
                'Account Details'
              );
              process.exit(1);
            }

            await new Promise((resolve) => setTimeout(resolve, 150));
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
        .action(async () => {
          try {
            p.intro('🚪 Logging Out');

            // Wrangler doesn't have a logout command, but we can clear the token
            await new Promise((resolve) => setTimeout(resolve, 150));
            const logoutInfo = [
              'To logout, delete the Cloudflare API token from:',
              '  ~/.wrangler/config/default.toml',
              'Or revoke it from: https://dash.cloudflare.com/profile/api-tokens',
            ];
            p.note(logoutInfo.join('\n'), 'Clearing Authentication');
            await new Promise((resolve) => setTimeout(resolve, 150));
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
