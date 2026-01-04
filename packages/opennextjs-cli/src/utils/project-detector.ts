/**
 * Project Detection Utility
 *
 * Detects existing Next.js projects and their configuration state.
 *
 * @packageDocumentation
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';
import type { PackageJson } from './config-reader.js';
import type { ProjectDetectionResult } from '../types/index.js';

/**
 * Detects if the current directory is a Next.js project
 *
 * @description
 * Checks for the presence of Next.js indicators:
 * - package.json with next dependency
 * - next.config.js/mjs/ts
 * - app/ or pages/ directory
 *
 * @param cwd - Current working directory to check (defaults to process.cwd())
 * @returns Detection result with project information
 *
 * @example
 * ```typescript
 * const result = detectNextJsProject();
 * if (result.isNextJsProject) {
 *   console.log('Next.js version:', result.nextJsVersion);
 * }
 * ```
 */
export function detectNextJsProject(cwd: string = process.cwd()): ProjectDetectionResult {
  const packageJsonPath = join(cwd, 'package.json');
  const result: ProjectDetectionResult = {
    isNextJsProject: false,
    hasOpenNext: false,
  };

  // Check if package.json exists
  if (!existsSync(packageJsonPath)) {
    return result;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageJson;
    const dependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    // Check for Next.js
    const nextVersion = dependencies['next'];
    if (nextVersion) {
      result.isNextJsProject = true;
      result.nextJsVersion = (nextVersion).replace(/[\^~]/, '');
    }

    // Check for OpenNext.js Cloudflare
    if (dependencies['@opennextjs/cloudflare']) {
      result.hasOpenNext = true;
    }

    // Detect package manager
    if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
      result.packageManager = 'pnpm';
    } else if (existsSync(join(cwd, 'yarn.lock'))) {
      result.packageManager = 'yarn';
    } else if (existsSync(join(cwd, 'package-lock.json'))) {
      result.packageManager = 'npm';
    }

    // Check for Next.js config files
    const hasNextConfig =
      existsSync(join(cwd, 'next.config.js')) ||
      existsSync(join(cwd, 'next.config.mjs')) ||
      existsSync(join(cwd, 'next.config.ts'));

    // Check for Next.js app structure
    const hasAppDir = existsSync(join(cwd, 'app')) || existsSync(join(cwd, 'src/app'));
    const hasPagesDir = existsSync(join(cwd, 'pages')) || existsSync(join(cwd, 'src/pages'));

    // If we have next in dependencies but no config/structure, still consider it a Next.js project
    if (result.isNextJsProject && (hasNextConfig || hasAppDir || hasPagesDir)) {
      // Project is confirmed
    }
  } catch {
    // If we can't parse package.json, return default result
    return result;
  }

  return result;
}

/**
 * Detects Next.js version from package.json
 *
 * @description
 * Extracts and validates the Next.js version from package.json.
 *
 * @param cwd - Current working directory
 * @returns Next.js version string or undefined if not found
 *
 * @example
 * ```typescript
 * const version = getNextJsVersion();
 * if (version) {
 *   console.log('Next.js version:', version);
 * }
 * ```
 */
export function getNextJsVersion(cwd: string = process.cwd()): string | undefined {
  const packageJsonPath = join(cwd, 'package.json');

  if (!existsSync(packageJsonPath)) {
    return undefined;
  }

  try {
    const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as PackageJson;
    const dependencies = {
      ...(packageJson.dependencies || {}),
      ...(packageJson.devDependencies || {}),
    };

    const nextVersion = dependencies['next'];
    if (nextVersion) {
      // Remove version prefix (^, ~, etc.)
      return String(nextVersion).replace(/[\^~]/, '');
    }
  } catch {
    // Return undefined if we can't parse
  }

  return undefined;
}
