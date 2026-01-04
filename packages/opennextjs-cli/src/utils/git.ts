/**
 * Git Utilities
 *
 * Utilities for git repository initialization and management.
 *
 * @packageDocumentation
 */

import { existsSync, writeFileSync, readFileSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';

/**
 * Checks if git is initialized in the current directory
 *
 * @param projectRoot - Root directory of the project
 * @returns True if git is initialized
 */
export function isGitInitialized(projectRoot: string = process.cwd()): boolean {
  return existsSync(join(projectRoot, '.git'));
}

/**
 * Checks if git CLI is available
 *
 * @returns True if git is available
 */
export function isGitAvailable(): boolean {
  try {
    execSync('git --version', { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Initializes git repository
 *
 * @param projectRoot - Root directory of the project
 * @returns True if initialization was successful
 */
export function initializeGit(projectRoot: string = process.cwd()): boolean {
  try {
    execSync('git init', { cwd: projectRoot, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

/**
 * Creates .gitignore file with Next.js and Cloudflare patterns
 *
 * @param projectRoot - Root directory of the project
 */
export function createGitignore(projectRoot: string = process.cwd()): void {
  const gitignorePath = join(projectRoot, '.gitignore');
  
  // Default Next.js .gitignore content
  const defaultGitignore = `# See https://help.github.com/articles/ignoring-files/ for more about ignoring files.

# dependencies
/node_modules
/.pnp
.pnp.js
.yarn/install-state.gz

# testing
/coverage

# next.js
/.next/
/out/

# production
/build

# misc
.DS_Store
*.pem

# debug
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# local env files
.env*.local
.env

# vercel
.vercel

# typescript
*.tsbuildinfo
next-env.d.ts

# Cloudflare
.wrangler/
.dev.vars
.wrangler.toml.local
`;

  // If .gitignore exists, append Cloudflare-specific entries if not present
  if (existsSync(gitignorePath)) {
    const existing = readFileSync(gitignorePath, 'utf-8');
    if (!existing.includes('.wrangler/')) {
      writeFileSync(gitignorePath, existing + '\n# Cloudflare\n.wrangler/\n.dev.vars\n.wrangler.toml.local\n', 'utf-8');
    }
  } else {
    writeFileSync(gitignorePath, defaultGitignore, 'utf-8');
  }
}

/**
 * Creates initial git commit
 *
 * @param projectRoot - Root directory of the project
 * @param message - Commit message
 * @returns True if commit was successful
 */
export function createInitialCommit(projectRoot: string = process.cwd(), message: string = 'Initial commit'): boolean {
  try {
    execSync('git add .', { cwd: projectRoot, stdio: 'ignore' });
    execSync(`git commit -m "${message}"`, { cwd: projectRoot, stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}
