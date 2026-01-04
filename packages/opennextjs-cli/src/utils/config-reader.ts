/**
 * Configuration File Reader
 *
 * Reads and parses configuration files (wrangler.toml, open-next.config.ts, package.json).
 *
 * @packageDocumentation
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';

/**
 * Package.json structure
 */
export interface PackageJson {
  name?: string;
  version?: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  scripts?: Record<string, string>;
  workspaces?: string[] | { packages?: string[] };
  [key: string]: unknown;
}

/**
 * Reads and parses wrangler.toml file
 *
 * @param projectRoot - Root directory of the project
 * @returns TOML content as string or undefined if not found
 */
export function readWranglerToml(projectRoot: string = process.cwd()): string | undefined {
  const filePath = join(projectRoot, 'wrangler.toml');
  if (!existsSync(filePath)) {
    return undefined;
  }
  return readFileSync(filePath, 'utf-8');
}

/**
 * Reads and parses open-next.config.ts file
 *
 * @param projectRoot - Root directory of the project
 * @returns TypeScript config content as string or undefined if not found
 */
export function readOpenNextConfig(projectRoot: string = process.cwd()): string | undefined {
  const filePath = join(projectRoot, 'open-next.config.ts');
  if (!existsSync(filePath)) {
    return undefined;
  }
  return readFileSync(filePath, 'utf-8');
}

/**
 * Reads and parses package.json file
 *
 * @param projectRoot - Root directory of the project
 * @returns Parsed package.json object or undefined if not found
 */
export function readPackageJson(projectRoot: string = process.cwd()): PackageJson | undefined {
  const filePath = join(projectRoot, 'package.json');
  if (!existsSync(filePath)) {
    return undefined;
  }
  try {
    return JSON.parse(readFileSync(filePath, 'utf-8')) as PackageJson;
  } catch {
    return undefined;
  }
}

/**
 * Extracts worker name from wrangler.toml
 *
 * @param tomlContent - TOML content as string
 * @returns Worker name or undefined
 */
export function extractWorkerName(tomlContent: string): string | undefined {
  const nameMatch = tomlContent.match(/^name\s*=\s*["']([^"']+)["']/m);
  return nameMatch?.[1];
}

/**
 * Extracts account ID from wrangler.toml
 *
 * @param tomlContent - TOML content as string
 * @returns Account ID or undefined
 */
export function extractAccountId(tomlContent: string): string | undefined {
  const accountIdMatch = tomlContent.match(/^account_id\s*=\s*["']([^"']+)["']/m);
  return accountIdMatch?.[1];
}

/**
 * Extracts caching strategy from open-next.config.ts
 *
 * @param configContent - Config content as string
 * @returns Caching strategy or undefined
 */
export function extractCachingStrategy(configContent: string): string | undefined {
  // Look for cachingStrategy in the config
  const strategyMatch = configContent.match(/cachingStrategy:\s*['"]([^'"]+)['"]/);
  if (strategyMatch) {
    return strategyMatch[1];
  }
  // Look for cache property
  const cacheMatch = configContent.match(/cache:\s*['"]([^'"]+)['"]/);
  return cacheMatch?.[1];
}

/**
 * Extracts environments from wrangler.toml
 *
 * @param tomlContent - TOML content as string
 * @returns Array of environment names
 */
export function extractEnvironments(tomlContent: string): string[] {
  const environments: string[] = [];
  // Default environment is always present
  environments.push('production');
  
  // Look for [env.*] sections
  const envMatches = tomlContent.matchAll(/\[env\.([^\]]+)\]/g);
  for (const match of envMatches) {
    const envName = match[1];
    if (envName) {
      environments.push(envName);
    }
  }
  
  return environments;
}

/**
 * Writes package.json file
 *
 * @param projectRoot - Root directory of the project
 * @param packageJson - Package.json object to write
 */
export function writePackageJson(
  projectRoot: string = process.cwd(),
  packageJson: PackageJson
): void {
  const filePath = join(projectRoot, 'package.json');
  writeFileSync(filePath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
}
