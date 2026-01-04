/**
 * Migrate Command
 *
 * Migrates projects from Vercel or Netlify to OpenNext.js Cloudflare.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { writeFile } from 'fs/promises';
import { existsSync } from 'fs';
import { join } from 'path';
import { logger } from '../utils/logger.js';
import { detectPlatform } from '../utils/migrators/platform-detector.js';
import { migrateFromVercel } from '../utils/migrators/vercel-migrator.js';
import { migrateFromNetlify } from '../utils/migrators/netlify-migrator.js';
import { readPackageJson, writePackageJson } from '../utils/config-reader.js';
import { promptConfirmation } from '../prompts.js';
import { backupFiles } from '../utils/backup.js';

/**
 * Creates the `migrate` command for migrating from other platforms
 *
 * @description
 * This command helps migrate projects from Vercel or Netlify
 * to OpenNext.js Cloudflare configuration.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli migrate
 * opennextjs-cli migrate --from vercel
 * opennextjs-cli migrate --dry-run
 * ```
 */
export function migrateCommand(): Command {
  const command = new Command('migrate');

  command
    .description('Migrate from Vercel or Netlify to OpenNext.js Cloudflare')
    .summary('Migrate from other platforms to OpenNext.js Cloudflare')
    .option(
      '--from <platform>',
      'Source platform: vercel or netlify (auto-detected if not specified)'
    )
    .option(
      '--dry-run',
      'Preview migration without making changes'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli migrate                    Auto-detect platform and migrate
  opennextjs-cli migrate --from vercel     Migrate from Vercel
  opennextjs-cli migrate --from netlify    Migrate from Netlify
  opennextjs-cli migrate --dry-run         Preview migration without changes

What it does:
  1. Detects source platform (Vercel/Netlify) or uses --from flag
  2. Reads existing configuration files
  3. Converts configuration to OpenNext.js Cloudflare format
  4. Migrates environment variables
  5. Updates package.json scripts
  6. Generates migration report

Migration Process:
  • Converts vercel.json → wrangler.toml + open-next.config.ts
  • Converts netlify.toml → wrangler.toml + open-next.config.ts
  • Migrates environment variables
  • Updates deployment scripts
  • Creates backup of original files

Note:
  Some features may require manual configuration:
  • Redirect rules
  • Header rules
  • Custom rewrites
  • Platform-specific features
`
    )
    .action(async (options: { from?: string; dryRun?: boolean }) => {
      try {
        p.intro('🔄 OpenNext.js Migration');
        logger.section('Platform Migration');

        const projectPath = process.cwd();

        // Detect or use specified platform
        let platform: 'vercel' | 'netlify' | 'unknown';
        if (options.from) {
          if (options.from.toLowerCase() === 'vercel') {
            platform = 'vercel';
          } else if (options.from.toLowerCase() === 'netlify') {
            platform = 'netlify';
          } else {
            logger.error(`Unknown platform: ${options.from}. Supported: vercel, netlify`);
            process.exit(1);
          }
        } else {
          const detected = detectPlatform(projectPath);
          platform = detected.platform;
          
          if (platform === 'unknown') {
            logger.error('Could not detect source platform. Please specify --from vercel or --from netlify');
            process.exit(1);
          }
          
          p.note(
            `Detected platform: ${platform}\nConfig file: ${detected.configFile || 'N/A'}`,
            'Platform Detection'
          );
        }

        const dryRun = options.dryRun || false;

        if (dryRun) {
          p.note('Running in dry-run mode. No files will be modified.', 'Dry Run Mode');
        }

        // Perform migration
        logger.section('Migration Process');
        const migrationSpinner = p.spinner();
        migrationSpinner.start(`Migrating from ${platform}...`);
        
        let migrationResult: {
          workerName: string;
          wranglerConfig: string;
          openNextConfig: string;
          packageJsonUpdates: { scripts?: Record<string, string> };
          envVars: Record<string, string>;
          notes: string[];
        };
        
        if (platform === 'vercel') {
          migrationResult = migrateFromVercel(projectPath, dryRun);
        } else if (platform === 'netlify') {
          migrationResult = migrateFromNetlify(projectPath, dryRun);
        } else {
          migrationSpinner.stop('Migration failed');
          throw new Error('Unknown platform');
        }
        
        migrationSpinner.stop('Migration analysis complete');

        // Display migration report
        logger.section('Migration Report');
        p.note(
          `Worker Name: ${migrationResult.workerName}\n` +
          `Environment Variables: ${Object.keys(migrationResult.envVars).length} found\n` +
          `Package Scripts: Updated`,
          'Migration Summary'
        );

        // Show notes
        if (migrationResult.notes.length > 0) {
          p.note(
            migrationResult.notes.join('\n'),
            'Migration Notes'
          );
        }

        // Show preview of files that would be created
        if (dryRun) {
          logger.section('Preview (Dry Run)');
          p.note(
            `Files that would be created:\n` +
            `  • wrangler.toml\n` +
            `  • open-next.config.ts\n` +
            `  • package.json (updated)\n\n` +
            `Environment variables to migrate:\n` +
            (Object.keys(migrationResult.envVars).length > 0
              ? Object.keys(migrationResult.envVars).map(key => `  • ${key}`).join('\n')
              : '  (none found)'),
            'Files Preview'
          );
          
          p.outro('Dry run complete. Run without --dry-run to apply changes.');
          return;
        }

        // Confirm before applying
        const confirmed = await promptConfirmation(
          'Apply migration? This will create/update configuration files.',
          true
        );

        if (!confirmed) {
          p.cancel('Migration cancelled.');
          process.exit(0);
        }

        // Backup existing files
        logger.section('Creating Backups');
        const filesToBackup = [
          join(projectPath, 'wrangler.toml'),
          join(projectPath, 'open-next.config.ts'),
          join(projectPath, 'package.json'),
        ].filter(file => existsSync(file));
        
        if (filesToBackup.length > 0) {
          backupFiles(filesToBackup);
        }

        // Apply migration
        logger.section('Applying Migration');
        await p.tasks([
          {
            title: 'Writing wrangler.toml',
            task: async () => {
              await writeFile(
                join(projectPath, 'wrangler.toml'),
                migrationResult.wranglerConfig,
                'utf-8'
              );
            },
          },
          {
            title: 'Writing open-next.config.ts',
            task: async () => {
              await writeFile(
                join(projectPath, 'open-next.config.ts'),
                migrationResult.openNextConfig,
                'utf-8'
              );
            },
          },
          {
            title: 'Updating package.json',
            task: async () => {
              const packageJson = readPackageJson(projectPath);
              const updated = {
                ...packageJson,
                scripts: {
                  ...packageJson?.scripts,
                  ...migrationResult.packageJsonUpdates.scripts,
                },
              };
              writePackageJson(projectPath, updated);
            },
          },
        ]);

        // Environment variables note
        if (Object.keys(migrationResult.envVars).length > 0) {
          p.note(
            `Environment variables found:\n` +
            Object.keys(migrationResult.envVars).map(key => `  • ${key}`).join('\n') +
            `\n\nPlease set these in Cloudflare:\n` +
            `  wrangler secret put <VAR_NAME>\n` +
            `Or add them to wrangler.toml [vars] section`,
            'Environment Variables'
          );
        }

        logger.success('Migration completed successfully!');
        p.note(
          `Next steps:\n\n` +
          `  1. Review wrangler.toml and open-next.config.ts\n` +
          `  2. Set environment variables in Cloudflare\n` +
          `  3. Install dependencies: pnpm install\n` +
          `  4. Test locally: pnpm preview\n` +
          `  5. Deploy: pnpm deploy`,
          '🎉 Migration Complete!'
        );
        p.outro('Migration completed successfully!');
      } catch (error) {
        logger.error('Migration failed', error);
        process.exit(1);
      }
    });

  return command;
}
