/**
 * Netlify Migrator
 *
 * Migrates Netlify configuration to OpenNext.js Cloudflare.
 *
 * @packageDocumentation
 */

import { readFileSync, existsSync } from 'fs';
import { join } from 'path';
import type { PackageJson } from '../config-reader.js';
import { readPackageJson } from '../config-reader.js';

/**
 * Netlify configuration structure (simplified)
 */
export interface NetlifyConfig {
  build?: {
    command?: string;
    publish?: string;
    functions?: string;
  };
  redirects?: Array<{ from: string; to: string; status?: number }>;
  headers?: Array<{ for: string; values: Record<string, string> }>;
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
 * Parse TOML-like structure (simplified parser)
 */
function parseNetlifyToml(content: string): NetlifyConfig {
  const config: NetlifyConfig = {};
  
  // Simple TOML parsing for common patterns
  const buildMatch = content.match(/\[build\]\s*\n([^[]+)/s);
  if (buildMatch) {
    config.build = {};
    const buildContent = buildMatch[1];
    if (buildContent) {
      const commandMatch = buildContent.match(/command\s*=\s*["']([^"']+)["']/);
      const publishMatch = buildContent.match(/publish\s*=\s*["']([^"']+)["']/);
      if (commandMatch && commandMatch[1]) {
        config.build.command = commandMatch[1];
      }
      if (publishMatch && publishMatch[1]) {
        config.build.publish = publishMatch[1];
      }
    }
  }

  // Extract redirects
  const redirectsMatch = content.match(/\[\[redirects\]\]\s*\n([^[]+)/s);
  if (redirectsMatch) {
    // Simple redirect parsing
    config.redirects = [];
  }

  return config;
}

/**
 * Migrate from Netlify to OpenNext.js Cloudflare
 */
export function migrateFromNetlify(
  projectPath: string = process.cwd(),
  _dryRun: boolean = false
): MigrationResult {
  const netlifyTomlPath = join(projectPath, 'netlify.toml');
  const packageJson = readPackageJson(projectPath);
  
  let netlifyConfig: NetlifyConfig = {};
  if (existsSync(netlifyTomlPath)) {
    try {
      const content = readFileSync(netlifyTomlPath, 'utf-8');
      netlifyConfig = parseNetlifyToml(content);
    } catch {
      // Invalid TOML, use empty config
    }
  }

  // Extract project name from package.json
  const projectName = packageJson?.name || 'my-app';
  const workerName = projectName.replace(/[^a-z0-9-]/gi, '-').toLowerCase();

  // Generate wrangler.toml
  const wranglerConfig = `name = "${workerName}"
compatibility_date = "${new Date().toISOString().split('T')[0]}"
compatibility_flags = ["nodejs_compat"]

# Migrated from Netlify
# Original config: netlify.toml

[env.production]
name = "${workerName}"

[env.preview]
name = "${workerName}-preview"
`;

  // Generate open-next.config.ts
  const openNextConfig = `import type { OpenNextConfig } from '@opennextjs/cloudflare';

const config: OpenNextConfig = {
  // Migrated from Netlify configuration
  // Original config: netlify.toml
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

  // Extract environment variables from netlify.toml
  const envVars: Record<string, string> = netlifyConfig.env || {};

  // Collect migration notes
  const notes: string[] = [
    '✓ Migrated from Netlify configuration',
    `✓ Worker name: ${workerName}`,
    '✓ Created wrangler.toml with production and preview environments',
    '✓ Created open-next.config.ts',
    '✓ Updated package.json scripts',
  ];

  if (netlifyConfig.redirects && netlifyConfig.redirects.length > 0) {
    notes.push(`⚠ ${netlifyConfig.redirects.length} redirect rule(s) need manual configuration in Cloudflare`);
  }

  if (netlifyConfig.headers && netlifyConfig.headers.length > 0) {
    notes.push(`⚠ ${netlifyConfig.headers.length} header rule(s) need manual configuration in wrangler.toml`);
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
