/**
 * Health Check Tool
 *
 * MCP tool for running health checks.
 *
 * @packageDocumentation
 */

import { validateConfiguration } from '@jsonbored/opennextjs-cli/utils';
import { detectNextJsProject } from '@jsonbored/opennextjs-cli/utils';

/**
 * Handle check_health tool call
 */
export async function handleHealthCheck(_args: unknown) {
  const projectRoot = process.cwd();
  const detection = detectNextJsProject(projectRoot);
  const validation = detection.hasOpenNext ? validateConfiguration(projectRoot) : null;

  const health = {
    project: {
      isNextJs: detection.isNextJsProject,
      hasOpenNext: detection.hasOpenNext,
      packageManager: detection.packageManager,
    },
    validation: validation
      ? {
          valid: validation.valid,
          errors: validation.errors.length,
          warnings: validation.warnings.length,
        }
      : null,
  };

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(health, null, 2),
      },
    ],
  };
}
