/**
 * Platform Detector
 *
 * Detects the source platform (Vercel, Netlify) from project files.
 *
 * @packageDocumentation
 */

import { existsSync, readFileSync } from 'fs';
import { join } from 'path';

/**
 * Detected platform information
 */
export interface PlatformInfo {
  platform: 'vercel' | 'netlify' | 'unknown';
  configFile?: string;
  configContent?: string;
}

/**
 * Detect source platform from project files
 */
export function detectPlatform(projectPath: string = process.cwd()): PlatformInfo {
  // Check for Vercel
  const vercelJson = join(projectPath, 'vercel.json');
  if (existsSync(vercelJson)) {
    return {
      platform: 'vercel',
      configFile: 'vercel.json',
      configContent: readFileSync(vercelJson, 'utf-8'),
    };
  }

  // Check for Netlify
  const netlifyToml = join(projectPath, 'netlify.toml');
  if (existsSync(netlifyToml)) {
    return {
      platform: 'netlify',
      configFile: 'netlify.toml',
      configContent: readFileSync(netlifyToml, 'utf-8'),
    };
  }

  // Check package.json scripts for hints
  const packageJsonPath = join(projectPath, 'package.json');
  if (existsSync(packageJsonPath)) {
    try {
      const packageJson = JSON.parse(readFileSync(packageJsonPath, 'utf-8')) as {
        scripts?: Record<string, string>;
      };
      const scripts = packageJson.scripts || {};
      
      // Check for Vercel scripts
      if (scripts['build']?.includes('vercel') || scripts['deploy']?.includes('vercel')) {
        return { platform: 'vercel' };
      }
      
      // Check for Netlify scripts
      if (scripts['build']?.includes('netlify') || scripts['deploy']?.includes('netlify')) {
        return { platform: 'netlify' };
      }
    } catch {
      // Ignore parse errors
    }
  }

  return { platform: 'unknown' };
}
