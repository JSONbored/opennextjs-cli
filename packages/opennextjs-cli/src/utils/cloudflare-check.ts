/**
 * Cloudflare Account Check
 *
 * Verifies Cloudflare account access and Wrangler authentication.
 *
 * @packageDocumentation
 */

import { execSync } from 'child_process';

/**
 * Checks if Wrangler is authenticated
 *
 * @description
 * Verifies that the user is logged in to Cloudflare via Wrangler.
 *
 * @returns True if authenticated, false otherwise
 *
 * @example
 * ```typescript
 * const isAuthenticated = await checkCloudflareAuth();
 * if (!isAuthenticated) {
 *   logger.warning('Please run: wrangler login');
 * }
 * ```
 */
export function checkCloudflareAuth(): boolean {
  try {
    execSync('wrangler whoami', { stdio: 'pipe' });
    return true;
  } catch (error) {
    return false;
  }
}

/**
 * Verifies Cloudflare setup and provides helpful messages
 *
 * @description
 * Checks if Wrangler is installed and authenticated, providing
 * helpful error messages if not.
 *
 * @returns Object with verification results
 *
 * @example
 * ```typescript
 * const verification = await verifyCloudflareSetup();
 * if (!verification.wranglerInstalled) {
 *   logger.error('Wrangler is not installed');
 * }
 * ```
 */
export function verifyCloudflareSetup(): {
  wranglerInstalled: boolean;
  authenticated: boolean;
  message?: string;
} {
  // Check if wrangler is installed
  try {
    execSync('wrangler --version', { stdio: 'pipe' });
  } catch (error) {
    return {
      wranglerInstalled: false,
      authenticated: false,
      message: 'Wrangler is not installed. Install it with: npm install -g wrangler',
    };
  }

  // Check authentication
  const authenticated = checkCloudflareAuth();

  if (!authenticated) {
    return {
      wranglerInstalled: true,
      authenticated: false,
      message: 'Not authenticated with Cloudflare. Run: wrangler login',
    };
  }

  return {
    wranglerInstalled: true,
    authenticated: true,
  };
}
