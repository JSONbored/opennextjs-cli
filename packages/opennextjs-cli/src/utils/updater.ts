/**
 * Package Updater
 *
 * Utilities for checking and updating package versions.
 *
 * @packageDocumentation
 */

import { readPackageJson } from './config-reader.js';
import { execSync } from 'child_process';
import { detectPackageManager } from './package-manager.js';

/**
 * Package update information
 */
export interface PackageUpdateInfo {
  name: string;
  current?: string;
  latest: string;
  needsUpdate: boolean;
}

/**
 * Fetches latest version of a package from npm registry
 *
 * @param packageName - Name of the package
 * @returns Latest version or undefined if not found
 */
export async function getLatestVersion(packageName: string): Promise<string | undefined> {
  try {
    const result = execSync(`npm view ${packageName} version`, { encoding: 'utf-8' });
    return result.trim();
  } catch {
    return undefined;
  }
}

/**
 * Checks for updates to OpenNext.js related packages
 *
 * @param projectRoot - Root directory of the project
 * @returns Array of package update information
 */
export async function checkForUpdates(
  projectRoot: string = process.cwd()
): Promise<PackageUpdateInfo[]> {
  const packageJson = readPackageJson(projectRoot);
  if (!packageJson) {
    return [];
  }

  const deps = {
    ...((packageJson['dependencies'] as Record<string, string>) || {}),
    ...((packageJson['devDependencies'] as Record<string, string>) || {}),
  };

  const packagesToCheck = ['@opennextjs/cloudflare', 'wrangler', 'next'];
  const updates: PackageUpdateInfo[] = [];

  for (const pkg of packagesToCheck) {
    const current = deps[pkg];
    if (!current) {
      continue;
    }

    const latest = await getLatestVersion(pkg);
    if (!latest) {
      continue;
    }

    // Remove version prefix (^, ~, etc.) for comparison
    const currentVersion = current.replace(/[\^~]/, '');
    const needsUpdate = currentVersion !== latest;

    updates.push({
      name: pkg,
      current: currentVersion,
      latest,
      needsUpdate,
    });
  }

  return updates;
}

/**
 * Updates a package to latest version
 *
 * @param packageName - Name of the package to update
 * @param isDev - Whether it's a dev dependency
 * @param projectRoot - Root directory of the project
 * @param packageManager - Package manager to use
 * @returns True if update was successful
 */
export async function updatePackage(
  packageName: string,
  isDev: boolean,
  projectRoot: string = process.cwd(),
  packageManager?: ReturnType<typeof detectPackageManager>
): Promise<boolean> {
  try {
    const pm = packageManager || detectPackageManager(projectRoot);
    let command: string;

    if (pm === 'pnpm') {
      command = isDev ? `pnpm update -D ${packageName}` : `pnpm update ${packageName}`;
    } else if (pm === 'yarn') {
      command = isDev ? `yarn upgrade ${packageName} --dev` : `yarn upgrade ${packageName}`;
    } else {
      command = isDev ? `npm update --save-dev ${packageName}` : `npm update ${packageName}`;
    }

    execSync(command, { cwd: projectRoot, stdio: 'inherit' });
    return true;
  } catch {
    return false;
  }
}
