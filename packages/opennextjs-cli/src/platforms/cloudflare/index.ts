/**
 * Cloudflare Platform Adapter
 *
 * Main entry point for Cloudflare platform-specific functionality.
 *
 * @packageDocumentation
 */

import type { CloudflareConfig } from '../../schemas/config.js';
import { generateOpenNextConfig } from './generators/open-next-config.js';
import { generateWranglerToml } from './generators/wrangler-toml.js';
import { generateNextConfigPatch } from './generators/next-config-patch.js';
import { generatePackageScripts } from './generators/package-scripts.js';
import { generatePatchScripts } from './generators/patch-scripts.js';

/**
 * Generates all configuration files for Cloudflare platform
 *
 * @description
 * Creates all necessary configuration files based on the provided Cloudflare config:
 * - open-next.config.ts
 * - wrangler.toml
 * - next.config.mjs patches
 * - package.json scripts
 *
 * @param config - Cloudflare configuration
 * @param projectRoot - Root directory of the project
 * @returns Promise that resolves when all files are generated
 *
 * @example
 * ```typescript
 * await generateCloudflareConfig(config, process.cwd());
 * ```
 */
export async function generateCloudflareConfig(
  config: CloudflareConfig,
  projectRoot: string
): Promise<void> {
  // Generate open-next.config.ts
  await generateOpenNextConfig(config, projectRoot);

  // Generate wrangler.toml
  await generateWranglerToml(config, projectRoot);

  // Generate next.config.mjs patches
  await generateNextConfigPatch(config, projectRoot);

  // Generate package.json scripts
  await generatePackageScripts(config, projectRoot);

  // Generate patch scripts
  await generatePatchScripts(config, projectRoot);
}

/**
 * Cloudflare platform prompts
 *
 * @description
 * Collection of prompts specific to Cloudflare platform configuration.
 */
export * from './prompts.js';
