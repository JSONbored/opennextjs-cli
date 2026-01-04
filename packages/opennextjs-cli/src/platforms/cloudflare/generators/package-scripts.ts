/**
 * Package Scripts Generator
 *
 * Generates and updates package.json scripts for OpenNext.js Cloudflare workflows.
 *
 * @packageDocumentation
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { CloudflareConfig } from '../../../schemas/config.js';
import { logger } from '../../../utils/logger.js';

/**
 * Generates or updates package.json scripts
 *
 * @description
 * Adds OpenNext.js Cloudflare scripts to package.json:
 * - preview: Build and preview locally
 * - deploy: Build and deploy to Cloudflare
 * - upload: Build and upload without deploying
 *
 * @param config - Cloudflare configuration
 * @param projectRoot - Root directory of the project
 * @returns Promise that resolves when scripts are added
 *
 * @example
 * ```typescript
 * await generatePackageScripts(config, process.cwd());
 * ```
 */
export async function generatePackageScripts(
  _config: CloudflareConfig,
  projectRoot: string
): Promise<void> {
  const filePath = join(projectRoot, 'package.json');

  if (!existsSync(filePath)) {
    logger.warning('package.json not found, skipping script generation');
    return;
  }

  const packageJson = JSON.parse(readFileSync(filePath, 'utf-8'));

  // Initialize scripts object if it doesn't exist
  if (!packageJson.scripts) {
    packageJson.scripts = {};
  }

  // Add OpenNext.js Cloudflare scripts
  packageJson.scripts.preview = 'opennextjs-cloudflare build && opennextjs-cloudflare preview';
  packageJson.scripts.deploy = 'opennextjs-cloudflare build && opennextjs-cloudflare deploy';
  packageJson.scripts.upload = 'opennextjs-cloudflare build && opennextjs-cloudflare upload';

  // Add patch scripts (run before build)
  packageJson.scripts['prebuild'] = 'node scripts/patch-nextjs-source.js || true';
  packageJson.scripts['postbuild'] = 'node scripts/patch-init.js || true';

  // Add type generation script for Cloudflare bindings
  packageJson.scripts['cf-typegen'] = 'wrangler types --env-interface CloudflareEnv cloudflare-env.d.ts';

  writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
  logger.success(`Updated package.json scripts`);
}
