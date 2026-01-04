/**
 * Validate Configuration Tool
 *
 * MCP tool for validating OpenNext.js configuration.
 *
 * @packageDocumentation
 */

import { validateConfiguration } from '@jsonbored/opennextjs-cli/utils';

/**
 * Handle validate_configuration tool call
 */
export async function handleValidateConfig(_args: unknown): Promise<{
  content: Array<{
    type: 'text';
    text: string;
  }>;
}> {
  const projectRoot = process.cwd();
  const result = validateConfiguration(projectRoot);

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(result, null, 2),
      },
    ],
  };
}
