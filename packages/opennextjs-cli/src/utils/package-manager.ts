/**
 * Package Manager Utility
 *
 * Detects and manages package manager operations.
 *
 * @packageDocumentation
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * Supported package managers
 */
export type PackageManager = 'npm' | 'pnpm' | 'yarn';

/**
 * Detects the package manager used in the current project
 *
 * @description
 * Checks for lock files to determine which package manager is being used.
 *
 * @param cwd - Current working directory
 * @returns Detected package manager or 'npm' as default
 *
 * @example
 * ```typescript
 * const pm = detectPackageManager();
 * console.log('Using:', pm); // 'pnpm', 'yarn', or 'npm'
 * ```
 */
export function detectPackageManager(cwd: string = process.cwd()): PackageManager {
  if (existsSync(join(cwd, 'pnpm-lock.yaml'))) {
    return 'pnpm';
  }
  if (existsSync(join(cwd, 'yarn.lock'))) {
    return 'yarn';
  }
  return 'npm';
}

/**
 * Installs dependencies using the detected package manager
 *
 * @description
 * Runs the appropriate install command based on the detected package manager.
 *
 * @param cwd - Current working directory
 * @param packageManager - Package manager to use (auto-detected if not provided)
 * @returns Promise that resolves when installation completes
 *
 * @example
 * ```typescript
 * await installDependencies();
 * ```
 */
export function installDependencies(
  cwd: string = process.cwd(),
  packageManager?: PackageManager
): void {
  const pm = packageManager || detectPackageManager(cwd);

  const commands: Record<PackageManager, string> = {
    npm: 'npm install',
    pnpm: 'pnpm install',
    yarn: 'yarn install',
  };

  execSync(commands[pm], {
    cwd,
    stdio: 'inherit',
  });
}

/**
 * Adds a dependency using the detected package manager
 *
 * @description
 * Adds a package as a dependency using the appropriate command.
 *
 * @param packageName - Name of the package to install
 * @param isDev - Whether this is a dev dependency
 * @param cwd - Current working directory
 * @param packageManager - Package manager to use (auto-detected if not provided)
 * @returns Promise that resolves when installation completes
 *
 * @example
 * ```typescript
 * await addDependency('@opennextjs/cloudflare', false);
 * ```
 */
export function addDependency(
  packageName: string,
  isDev: boolean = false,
  cwd: string = process.cwd(),
  packageManager?: PackageManager
): void {
  const pm = packageManager || detectPackageManager(cwd);

  const commands: Record<PackageManager, string> = {
    npm: isDev ? `npm install --save-dev ${packageName}` : `npm install ${packageName}`,
    pnpm: isDev ? `pnpm add -D ${packageName}` : `pnpm add ${packageName}`,
    yarn: isDev ? `yarn add -D ${packageName}` : `yarn add ${packageName}`,
  };

  execSync(commands[pm], {
    cwd,
    stdio: 'inherit',
  });
}
