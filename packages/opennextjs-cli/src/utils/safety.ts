/**
 * Safety Utilities
 *
 * Provides safety checks and safeguards for CLI operations.
 *
 * @packageDocumentation
 */

import { existsSync, statSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { detectNextJsProject } from './project-detector.js';
import { detectMonorepo, isInMonorepo } from './monorepo-detector.js';

/**
 * Safety check result
 */
export interface SafetyCheck {
  passed: boolean;
  warnings: string[];
  errors: string[];
  recommendations: string[];
}

/**
 * Performs comprehensive safety checks before making changes
 *
 * @param projectRoot - Root directory of the project
 * @param operation - Operation being performed (e.g., 'add', 'config', 'deploy')
 * @returns Safety check results
 */
export function performSafetyChecks(
  projectRoot: string = process.cwd(),
  operation: string = 'modify'
): SafetyCheck {
  const result: SafetyCheck = {
    passed: true,
    warnings: [],
    errors: [],
    recommendations: [],
  };

  // Check if directory exists and is accessible
  try {
    const stat = statSync(projectRoot);
    if (!stat.isDirectory()) {
      result.passed = false;
      result.errors.push(`Path is not a directory: ${projectRoot}`);
      return result;
    }
  } catch {
    result.passed = false;
    result.errors.push(`Cannot access directory: ${projectRoot}`);
    return result;
  }

  // Check if package.json exists
  const packageJsonPath = join(projectRoot, 'package.json');
  if (!existsSync(packageJsonPath)) {
    result.passed = false;
    result.errors.push('package.json not found. Are you in a Node.js project?');
    return result;
  }

  // Check if it's a Next.js project (for add/config operations)
  if (operation === 'add' || operation === 'config') {
    const detection = detectNextJsProject(projectRoot);
    if (!detection.isNextJsProject) {
      result.passed = false;
      result.errors.push('Not a Next.js project. This tool is for Next.js projects only.');
      return result;
    }
  }

  // Check for git repository (recommended)
  const gitPath = join(projectRoot, '.git');
  if (!existsSync(gitPath)) {
    result.warnings.push('No git repository detected. Consider initializing git for version control.');
    result.recommendations.push('Run: git init');
  }

  // Check for uncommitted changes (warning)
  try {
    execSync('git diff --quiet', { cwd: projectRoot, stdio: 'ignore' });
  } catch {
    result.warnings.push('You have uncommitted changes. Consider committing before making changes.');
    result.recommendations.push('Run: git status to see changes');
  }

  // Check for monorepo (informational)
  if (isInMonorepo(projectRoot)) {
    const monorepo = detectMonorepo(projectRoot);
    result.warnings.push(
      `Monorepo detected (${monorepo.type}). Ensure you're in the correct workspace package.`
    );
    result.recommendations.push('Verify you want to modify this specific package in the monorepo');
  }

  // Check Node.js version
  try {
    const nodeVersion = execSync('node --version', { encoding: 'utf-8' }).trim();
    const majorVersion = parseInt(nodeVersion.replace('v', '').split('.')[0] || '0', 10);
    if (majorVersion < 18) {
      result.passed = false;
      result.errors.push(`Node.js ${nodeVersion} detected. Node.js 18+ is required.`);
    }
  } catch {
    result.warnings.push('Could not verify Node.js version');
  }

  // Check disk space (basic check)
  // Note: This is a placeholder for future disk space checking
  // In production, you might want more sophisticated disk space checking

  return result;
}

/**
 * Validates that a file path is safe to write to
 *
 * @param filePath - Path to validate
 * @param projectRoot - Root directory of the project
 * @returns True if safe to write
 */
export function isSafeToWrite(filePath: string, projectRoot: string = process.cwd()): boolean {
  // Ensure path is within project root
  const resolvedPath = join(projectRoot, filePath);
  const normalizedProjectRoot = projectRoot.replace(/\/$/, '');
  const normalizedResolved = resolvedPath.replace(/\/$/, '');

  if (!normalizedResolved.startsWith(normalizedProjectRoot)) {
    return false;
  }

  // Check for dangerous paths
  const dangerousPatterns = [
    /\.\./g, // Path traversal
    /node_modules/,
    /\.git/,
    /\.next/,
    /dist/,
    /build/,
  ];

  for (const pattern of dangerousPatterns) {
    if (pattern.test(filePath)) {
      return false;
    }
  }

  return true;
}

/**
 * Confirms destructive operation with user
 *
 * @param message - Confirmation message
 * @param defaultValue - Default value (false for safety)
 * @returns True if user confirms
 */
export async function confirmDestructiveOperation(
  message: string,
  defaultValue: boolean = false
): Promise<boolean> {
  const { promptConfirmation } = await import('../prompts.js');
  return promptConfirmation(message, defaultValue);
}
