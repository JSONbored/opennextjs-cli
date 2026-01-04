/**
 * Vercel Migrator
 *
 * Migrates Vercel configuration to OpenNext.js Cloudflare.
 *
 * @packageDocumentation
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { PackageJson } from '../config-reader.js';
import { readPackageJson } from '../config-reader.js';

/**
 * Vercel configuration structure
 */
export interface VercelConfig {
  buildCommand?: string;
  outputDirectory?: string;
  devCommand?: string;
  installCommand?: string;
  framework?: string;
  rewrites?: Array<{ source: string; destination: string }>;
  redirects?: Array<{ source: string; destination: string; permanent?: boolean }>;
  headers?: Array<{ source: string; headers: Array<{ key: string; value: string }> }>;
  env?: Record<string, string>;
  [key: string]: unknown;
}

/**
 * Migration result
 */
export interface MigrationResult {
  workerName: string;
  wranglerConfig: string;
  openNextConfig: string;
  packageJsonUpdates: Partial<PackageJson>;
  envVars: Record<string, string>;
  notes: string[];
}

/**
 * Migrate from Vercel to OpenNext.js Cloudflare
 */
export function migrateFromVercel(
  projectPath: string = process.cwd(),
  _dryRun: boolean = false
): MigrationResult {
  const vercelJsonPath = join(projectPath, 'vercel.json');
  const packageJson = readPackageJson(projectPath);
  
  let vercelConfig: VercelConfig = {};
  if (existsSync(vercelJsonPath)) {
    try {
      vercelConfig = JSON.parse(readFileSync(vercelJsonPath, 'utf-8')) as VercelConfig;
    } catch {
      // Invalid JSON, use empty config
    }
  }

  // Extract project name from package.json
  const projectName = packageJson?.name || 'my-app';
  const workerName = projectName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

  // Generate wrangler.toml
  const wranglerConfig = `name = "${workerName}"
compatibility_date = "${new Date().toISOString().split('T')[0]}"
compatibility_flags = ["nodejs_compat"]

# Migrated from Vercel
# Original config: vercel.json

[env.production]
name = "${workerName}"

[env.preview]
name = "${workerName}-preview"
`;

  // Generate open-next.config.ts
  const openNextConfig = `import type { OpenNextConfig } from '@opennextjs/cloudflare';

const config: OpenNextConfig = {
  // Migrated from Vercel configuration
  // Original config: vercel.json
};

export default config;
`;

  // Update package.json scripts
  const packageJsonUpdates: Partial<PackageJson> = {
    scripts: {
      ...packageJson?.scripts,
      'preview': 'wrangler dev',
      'deploy': 'wrangler deploy',
      'deploy:preview': 'wrangler deploy --env preview',
    },
  };

  // Extract environment variables from vercel.json
  const envVars: Record<string, string> = vercelConfig.env || {};

  // Collect migration notes
  const notes: string[] = [
    '✓ Migrated from Vercel configuration',
    `✓ Worker name: ${workerName}`,
    '✓ Created wrangler.toml with production and preview environments',
    '✓ Created open-next.config.ts',
    '✓ Updated package.json scripts',
  ];

  if (vercelConfig.rewrites && vercelConfig.rewrites.length > 0) {
    notes.push(`⚠ ${vercelConfig.rewrites.length} rewrite rule(s) need manual configuration in Cloudflare`);
  }

  if (vercelConfig.redirects && vercelConfig.redirects.length > 0) {
    notes.push(`⚠ ${vercelConfig.redirects.length} redirect rule(s) need manual configuration in Cloudflare`);
  }

  if (vercelConfig.headers && vercelConfig.headers.length > 0) {
    notes.push(`⚠ ${vercelConfig.headers.length} header rule(s) need manual configuration in wrangler.toml`);
  }

  return {
    workerName,
    wranglerConfig,
    openNextConfig,
    packageJsonUpdates,
    envVars,
    notes,
  };
}
