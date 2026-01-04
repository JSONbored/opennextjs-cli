/**
 * Next.js Config Patch Generator
 *
 * Generates patches for next.config.mjs to enable Cloudflare compatibility.
 *
 * @packageDocumentation
 */

import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import type { CloudflareConfig } from '../../../schemas/config.js';
import { logger } from '../../../utils/logger.js';

/**
 * Generates or patches next.config.mjs file
 *
 * @description
 * Adds OpenNext.js Cloudflare initialization to next.config.mjs.
 * If the file exists, it patches it; otherwise creates a new one.
 *
 * @param config - Cloudflare configuration
 * @param projectRoot - Root directory of the project
 * @returns Promise that resolves when file is written
 *
 * @example
 * ```typescript
 * await generateNextConfigPatch(config, process.cwd());
 * ```
 */
export async function generateNextConfigPatch(
  config: CloudflareConfig,
  projectRoot: string
): Promise<void> {
  const filePath = join(projectRoot, 'next.config.mjs');
  const isNextJs16 = config.nextJsVersion.startsWith('16');

  let content = '';

  if (existsSync(filePath)) {
    // Read existing config
    content = readFileSync(filePath, 'utf-8');

    // Check if already patched
    if (content.includes('initOpenNextCloudflareForDev')) {
      logger.info('next.config.mjs already contains OpenNext.js initialization');
      return;
    }

    // Add import and initialization
    if (!content.includes("from '@opennextjs/cloudflare'")) {
      // Add import at the top
      const importStatement = "import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';\n";
      content = importStatement + content;
    }

    // Add initialization call
    if (!content.includes('initOpenNextCloudflareForDev()')) {
      // Add after imports, before export
      const initCall = isNextJs16
        ? `\n// OpenNext.js Cloudflare initialization (Next.js 16.x experimental)\ninitOpenNextCloudflareForDev();\n`
        : `\n// OpenNext.js Cloudflare initialization\ninitOpenNextCloudflareForDev();\n`;

      // Try to insert before the export statement
      const exportIndex = content.indexOf('export default');
      if (exportIndex !== -1) {
        content = content.slice(0, exportIndex) + initCall + content.slice(exportIndex);
      } else {
        // No export found, append at the end
        content += initCall;
      }
    }
  } else {
    // Create new config file
    content = generateNewNextConfig(isNextJs16);
  }

  writeFileSync(filePath, content, 'utf-8');
  logger.success(`Generated/updated next.config.mjs`);
}

/**
 * Generates a new next.config.mjs file
 *
 * @description
 * Creates a basic Next.js configuration file with OpenNext.js Cloudflare initialization.
 *
 * @param isNextJs16 - Whether this is for Next.js 16.x (experimental)
 * @returns Configuration file content as string
 */
function generateNewNextConfig(isNextJs16: boolean): string {
  const comment = isNextJs16
    ? '// OpenNext.js Cloudflare initialization (Next.js 16.x experimental)'
    : '// OpenNext.js Cloudflare initialization';

  return `import { initOpenNextCloudflareForDev } from '@opennextjs/cloudflare';

${comment}
initOpenNextCloudflareForDev();

/** @type {import('next').NextConfig} */
const nextConfig = {
  // Your Next.js configuration here
};

export default nextConfig;
`;
}
