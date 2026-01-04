/**
 * Monorepo Detection Utility
 *
 * Detects monorepo structure and workspace configurations.
 *
 * @packageDocumentation
 */

import { existsSync, readFileSync } from 'fs';
import { join, dirname } from 'path';

/**
 * Monorepo detection result
 */
export interface MonorepoInfo {
  isMonorepo: boolean;
  type?: 'pnpm' | 'yarn' | 'npm' | 'lerna' | 'nx' | 'turborepo';
  rootPath?: string;
  workspaceRoot?: string;
  workspaces?: string[];
}

/**
 * Detects if the current directory is part of a monorepo
 *
 * @description
 * Checks for monorepo indicators:
 * - pnpm-workspace.yaml (pnpm workspaces)
 * - package.json with workspaces field (npm/yarn)
 * - lerna.json (Lerna)
 * - nx.json (Nx)
 * - turbo.json (Turborepo)
 *
 * @param cwd - Current working directory to check
 * @returns Monorepo information
 *
 * @example
 * ```typescript
 * const monorepo = detectMonorepo();
 * if (monorepo.isMonorepo) {
 *   console.log('Monorepo type:', monorepo.type);
 * }
 * ```
 */
export function detectMonorepo(cwd: string = process.cwd()): MonorepoInfo {
  const result: MonorepoInfo = {
    isMonorepo: false,
  };

  // Check for pnpm workspace
  let currentPath = cwd;
  while (currentPath !== dirname(currentPath)) {
    const pnpmWorkspacePath = join(currentPath, 'pnpm-workspace.yaml');
    if (existsSync(pnpmWorkspacePath)) {
      result.isMonorepo = true;
      result.type = 'pnpm';
      result.rootPath = currentPath;
      result.workspaceRoot = currentPath;
      try {
        const content = readFileSync(pnpmWorkspacePath, 'utf-8');
        // Parse workspace patterns (simple extraction)
        const workspaceMatch = content.match(/packages:\s*\[(.*?)\]/s);
        if (workspaceMatch && workspaceMatch[1]) {
          const packages = workspaceMatch[1]
            .split(',')
            .map((p) => p.trim().replace(/['"]/g, ''))
            .filter(Boolean);
          result.workspaces = packages;
        }
      } catch {
        // Ignore parse errors
      }
      return result;
    }

    // Check for package.json with workspaces
    const packageJsonPath = join(currentPath, 'package.json');
    if (existsSync(packageJsonPath)) {
      try {
        const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8'));
        
        // Check for npm/yarn workspaces
        if (packageJson.workspaces || packageJson.workspaces?.packages) {
          result.isMonorepo = true;
          result.type = existsSync(join(currentPath, 'yarn.lock')) ? 'yarn' : 'npm';
          result.rootPath = currentPath;
          result.workspaceRoot = currentPath;
          result.workspaces = Array.isArray(packageJson.workspaces)
            ? packageJson.workspaces
            : packageJson.workspaces?.packages || [];
          return result;
        }

        // Check for Lerna
        if (existsSync(join(currentPath, 'lerna.json'))) {
          result.isMonorepo = true;
          result.type = 'lerna';
          result.rootPath = currentPath;
          result.workspaceRoot = currentPath;
          return result;
        }

        // Check for Nx
        if (existsSync(join(currentPath, 'nx.json'))) {
          result.isMonorepo = true;
          result.type = 'nx';
          result.rootPath = currentPath;
          result.workspaceRoot = currentPath;
          return result;
        }

        // Check for Turborepo
        if (existsSync(join(currentPath, 'turbo.json'))) {
          result.isMonorepo = true;
          result.type = 'turborepo';
          result.rootPath = currentPath;
          result.workspaceRoot = currentPath;
          return result;
        }
      } catch {
        // Ignore parse errors
      }
    }

    // Move up one directory
    const parentPath = dirname(currentPath);
    if (parentPath === currentPath) {
      break; // Reached filesystem root
    }
    currentPath = parentPath;
  }

  return result;
}

/**
 * Finds the workspace root for the current project
 *
 * @param cwd - Current working directory
 * @returns Workspace root path or undefined
 */
export function findWorkspaceRoot(cwd: string = process.cwd()): string | undefined {
  const monorepo = detectMonorepo(cwd);
  return monorepo.workspaceRoot;
}

/**
 * Checks if the current directory is in a monorepo workspace
 *
 * @param cwd - Current working directory
 * @returns True if in a monorepo workspace
 */
export function isInMonorepo(cwd: string = process.cwd()): boolean {
  return detectMonorepo(cwd).isMonorepo;
}
