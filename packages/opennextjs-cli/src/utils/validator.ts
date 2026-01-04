/**
 * Configuration Validator
 *
 * Validates OpenNext.js Cloudflare configuration files and project setup.
 *
 * @packageDocumentation
 */

import { existsSync } from 'fs';
import { join } from 'path';
import { execSync } from 'child_process';
import { readWranglerToml, readOpenNextConfig, readPackageJson } from './config-reader.js';
import { detectNextJsProject } from './project-detector.js';

/**
 * Validation result for a single check
 */
export interface ValidationCheck {
  name: string;
  status: 'pass' | 'fail' | 'warning';
  message: string;
  fix?: string;
}

/**
 * Complete validation result
 */
export interface ValidationResult {
  valid: boolean;
  checks: ValidationCheck[];
  errors: ValidationCheck[];
  warnings: ValidationCheck[];
}

/**
 * Validates wrangler.toml syntax
 */
function validateWranglerToml(projectRoot: string): ValidationCheck {
  const wranglerToml = readWranglerToml(projectRoot);
  
  if (!wranglerToml) {
    return {
      name: 'wrangler.toml exists',
      status: 'fail',
      message: 'wrangler.toml file not found',
      fix: 'Run "opennextjs-cli add" to generate wrangler.toml',
    };
  }

  // Basic TOML syntax check (check for common issues)
  const hasName = /^name\s*=/m.test(wranglerToml);
  const hasAccountId = /^account_id\s*=/m.test(wranglerToml) || /^\[env\./.test(wranglerToml);

  if (!hasName) {
    return {
      name: 'wrangler.toml name',
      status: 'fail',
      message: 'wrangler.toml missing required "name" field',
      fix: 'Add "name = \\"your-worker-name\\"" to wrangler.toml',
    };
  }

  if (!hasAccountId) {
    return {
      name: 'wrangler.toml account_id',
      status: 'warning',
      message: 'wrangler.toml missing account_id (may be in environment-specific config)',
      fix: 'Add "account_id = \\"your-account-id\\"" to wrangler.toml or environment config',
    };
  }

  return {
    name: 'wrangler.toml syntax',
    status: 'pass',
    message: 'wrangler.toml is valid',
  };
}

/**
 * Validates open-next.config.ts
 */
function validateOpenNextConfig(projectRoot: string): ValidationCheck {
  const config = readOpenNextConfig(projectRoot);
  
  if (!config) {
    return {
      name: 'open-next.config.ts exists',
      status: 'fail',
      message: 'open-next.config.ts file not found',
      fix: 'Run "opennextjs-cli add" to generate open-next.config.ts',
    };
  }

  // Basic validation - check for export default
  const hasExport = /export\s+default/m.test(config);
  
  if (!hasExport) {
    return {
      name: 'open-next.config.ts export',
      status: 'fail',
      message: 'open-next.config.ts missing default export',
      fix: 'Ensure the config file exports a default configuration object',
    };
  }

  return {
    name: 'open-next.config.ts syntax',
    status: 'pass',
    message: 'open-next.config.ts is valid',
  };
}

/**
 * Validates package.json scripts
 */
function validatePackageScripts(projectRoot: string): ValidationCheck {
  const packageJson = readPackageJson(projectRoot);
  
  if (!packageJson) {
    return {
      name: 'package.json exists',
      status: 'fail',
      message: 'package.json not found',
      fix: 'Ensure you are in a valid Node.js project directory',
    };
  }

  const scripts = (packageJson['scripts'] as Record<string, string>) || {};
  const requiredScripts = ['preview', 'deploy'];
  const missing: string[] = [];

  for (const script of requiredScripts) {
    if (!scripts[script]) {
      missing.push(script);
    }
  }

  if (missing.length > 0) {
    return {
      name: 'package.json scripts',
      status: 'warning',
      message: `Missing recommended scripts: ${missing.join(', ')}`,
      fix: `Add scripts to package.json: ${missing.map(s => `"${s}": "wrangler ..."`).join(', ')}`,
    };
  }

  return {
    name: 'package.json scripts',
    status: 'pass',
    message: 'Required scripts are present',
  };
}

/**
 * Validates required dependencies
 */
function validateDependencies(projectRoot: string): ValidationCheck {
  const packageJson = readPackageJson(projectRoot);
  
  if (!packageJson) {
    return {
      name: 'dependencies check',
      status: 'fail',
      message: 'Cannot check dependencies - package.json not found',
      fix: 'Ensure you are in a valid Node.js project directory',
    };
  }

  const deps = {
    ...((packageJson['dependencies'] as Record<string, string>) || {}),
    ...((packageJson['devDependencies'] as Record<string, string>) || {}),
  };

  const missing: string[] = [];
  
  if (!deps['@opennextjs/cloudflare']) {
    missing.push('@opennextjs/cloudflare');
  }
  
  if (!deps['wrangler']) {
    missing.push('wrangler (dev dependency)');
  }

  if (missing.length > 0) {
    return {
      name: 'required dependencies',
      status: 'fail',
      message: `Missing dependencies: ${missing.join(', ')}`,
      fix: `Install missing dependencies: pnpm add ${missing.includes('@opennextjs/cloudflare') ? '@opennextjs/cloudflare' : ''} ${missing.includes('wrangler (dev dependency)') ? '-D wrangler' : ''}`.trim(),
    };
  }

  return {
    name: 'required dependencies',
    status: 'pass',
    message: 'All required dependencies are installed',
  };
}

/**
 * Validates Cloudflare connection
 */
function validateCloudflareConnection(): ValidationCheck {
  try {
    // Check if wrangler is available
    execSync('wrangler --version', { stdio: 'ignore' });
  } catch {
    return {
      name: 'wrangler CLI',
      status: 'warning',
      message: 'wrangler CLI not found in PATH',
      fix: 'Install wrangler: pnpm add -D wrangler',
    };
  }

  try {
    // Check authentication
    execSync('wrangler whoami', { stdio: 'ignore' });
    return {
      name: 'Cloudflare authentication',
      status: 'pass',
      message: 'Authenticated with Cloudflare',
    };
  } catch {
    return {
      name: 'Cloudflare authentication',
      status: 'warning',
      message: 'Not authenticated with Cloudflare',
      fix: 'Run "wrangler login" to authenticate',
    };
  }
}

/**
 * Validates Next.js project structure
 */
function validateProjectStructure(projectRoot: string): ValidationCheck {
  const detection = detectNextJsProject(projectRoot);
  
  if (!detection.isNextJsProject) {
    return {
      name: 'Next.js project',
      status: 'fail',
      message: 'Not a Next.js project',
      fix: 'Run this command from a Next.js project directory',
    };
  }

  // Check for required Next.js files
  const hasNextConfig =
    existsSync(join(projectRoot, 'next.config.js')) ||
    existsSync(join(projectRoot, 'next.config.mjs')) ||
    existsSync(join(projectRoot, 'next.config.ts'));

  if (!hasNextConfig) {
    return {
      name: 'Next.js config',
      status: 'warning',
      message: 'No next.config.* file found',
      fix: 'Next.js will use default configuration',
    };
  }

  return {
    name: 'Next.js project structure',
    status: 'pass',
    message: 'Valid Next.js project structure',
  };
}

/**
 * Validates the entire OpenNext.js Cloudflare configuration
 *
 * @param projectRoot - Root directory of the project
 * @returns Validation result with all checks
 */
export function validateConfiguration(projectRoot: string = process.cwd()): ValidationResult {
  const checks: ValidationCheck[] = [];

  // Run all validation checks
  checks.push(validateProjectStructure(projectRoot));
  checks.push(validateWranglerToml(projectRoot));
  checks.push(validateOpenNextConfig(projectRoot));
  checks.push(validatePackageScripts(projectRoot));
  checks.push(validateDependencies(projectRoot));
  checks.push(validateCloudflareConnection());

  const errors = checks.filter((c) => c.status === 'fail');
  const warnings = checks.filter((c) => c.status === 'warning');

  return {
    valid: errors.length === 0,
    checks,
    errors,
    warnings,
  };
}
