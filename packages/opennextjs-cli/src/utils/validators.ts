/**
 * Input Validators
 *
 * Provides Zod-based validation for user inputs and configuration.
 *
 * @packageDocumentation
 */

import { z } from 'zod';

/**
 * Validates a project name
 *
 * @description
 * Ensures project names are valid for npm/package.json naming conventions.
 *
 * @param name - Project name to validate
 * @returns Validation result with success status and error message if invalid
 *
 * @example
 * ```typescript
 * const result = validateProjectName('my-project');
 * if (!result.success) {
 *   console.error(result.error);
 * }
 * ```
 */
export function validateProjectName(name: string): { success: boolean; error?: string } {
  const schema = z
    .string()
    .min(1, 'Project name cannot be empty')
    .max(214, 'Project name is too long (max 214 characters)')
    .regex(
      /^[a-z0-9]([a-z0-9._-]*[a-z0-9])?$/,
      'Project name must be lowercase and can only contain letters, numbers, dots, hyphens, and underscores'
    );

  const result = schema.safeParse(name);

  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError?.message || 'Invalid project name',
    };
  }

  return { success: true };
}

/**
 * Validates a Next.js version string
 *
 * @description
 * Ensures the version string matches Next.js version format (e.g., "15.0.0", "16.1.0").
 *
 * @param version - Version string to validate
 * @returns Validation result with success status and parsed version if valid
 *
 * @example
 * ```typescript
 * const result = validateNextJsVersion('15.1.0');
 * if (result.success) {
 *   console.log('Major version:', result.major);
 * }
 * ```
 */
export function validateNextJsVersion(version: string): {
  success: boolean;
  error?: string;
  major?: number;
  minor?: number;
  patch?: number;
} {
  const schema = z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in format X.Y.Z');

  const result = schema.safeParse(version);

  if (!result.success) {
    const firstError = result.error.issues[0];
    return {
      success: false,
      error: firstError?.message || 'Invalid version format',
    };
  }

  const parts = version.split('.').map(Number);
  const [major, minor, patch] = parts;

  return {
    success: true,
    major: major ?? 0,
    minor: minor ?? 0,
    patch: patch ?? 0,
  };
}
