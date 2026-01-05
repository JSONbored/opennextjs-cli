/**
 * Project Root Detection Utility
 *
 * Intelligently detects the correct project root, handling monorepos and workspace scenarios.
 *
 * @packageDocumentation
 */

import { existsSync, readdirSync } from 'fs';
import { join } from 'path';
import { detectNextJsProject } from './project-detector.js';
import { detectMonorepo, type MonorepoInfo } from './monorepo-detector.js';

/**
 * Project root detection result
 */
export interface ProjectRootResult {
  /** The detected project root path */
  projectRoot: string;
  /** Whether the project is in a monorepo */
  isMonorepo: boolean;
  /** Monorepo information if applicable */
  monorepoInfo?: MonorepoInfo;
  /** Whether a Next.js project was found */
  foundNextJs: boolean;
  /** Detection metadata */
  metadata: {
    /** Workspace directories searched */
    workspacesSearched?: string[];
    /** Original working directory */
    originalCwd: string;
  };
}

/**
 * Detects the correct project root for a Next.js project, handling monorepos
 *
 * @description
 * This function intelligently finds the Next.js project root by:
 * 1. Checking if the current directory is a Next.js project
 * 2. If not, detecting if we're in a monorepo
 * 3. Searching workspace directories for Next.js projects
 * 4. Returning the first valid Next.js project found
 *
 * @param cwd - Current working directory to start search from (defaults to process.cwd())
 * @returns Project root detection result
 *
 * @example
 * ```typescript
 * const result = detectProjectRoot();
 * if (result.foundNextJs) {
 *   console.log('Project root:', result.projectRoot);
 * }
 * ```
 */
export function detectProjectRoot(cwd: string = process.cwd()): ProjectRootResult {
  const result: ProjectRootResult = {
    projectRoot: cwd,
    isMonorepo: false,
    foundNextJs: false,
    metadata: {
      originalCwd: cwd,
    },
  };

  // Step 1: Check if current directory is a Next.js project
  const currentDetection = detectNextJsProject(cwd);
  if (currentDetection.isNextJsProject) {
    result.projectRoot = cwd;
    result.foundNextJs = true;
    return result;
  }

  // Step 2: Detect if we're in a monorepo
  const monorepo = detectMonorepo(cwd);
  if (!monorepo.isMonorepo || !monorepo.workspaceRoot) {
    // Not in a monorepo and not a Next.js project
    return result;
  }

  result.isMonorepo = true;
  result.monorepoInfo = monorepo;
  const workspaceRoot = monorepo.workspaceRoot;
  const workspaces = monorepo.workspaces || [];

  // Step 3: Expand workspace patterns and search for Next.js projects
  const workspaceDirs: string[] = [];
  for (const pattern of workspaces) {
    if (pattern.includes('*')) {
      const baseDir = pattern.replace('/*', '').replace('\\*', '');
      const fullPath = join(workspaceRoot, baseDir);
      if (existsSync(fullPath)) {
        try {
          const dirs = readdirSync(fullPath, { withFileTypes: true })
            .filter((dirent) => dirent.isDirectory())
            .map((dirent) => join(fullPath, dirent.name));
          workspaceDirs.push(...dirs);
        } catch {
          // Ignore read errors
        }
      }
    } else {
      workspaceDirs.push(join(workspaceRoot, pattern));
    }
  }

  result.metadata.workspacesSearched = workspaceDirs;

  // Step 4: Search workspaces for Next.js projects
  for (const workspaceDir of workspaceDirs) {
    if (existsSync(workspaceDir)) {
      const workspaceDetection = detectNextJsProject(workspaceDir);
      if (workspaceDetection.isNextJsProject) {
        result.projectRoot = workspaceDir;
        result.foundNextJs = true;
        return result;
      }
    }
  }

  // No Next.js project found, but we're in a monorepo
  // Return the workspace root as fallback
  result.projectRoot = workspaceRoot;
  return result;
}
