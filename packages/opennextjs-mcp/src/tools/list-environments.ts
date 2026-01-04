/**
 * List Environments Tool
 *
 * MCP tool for listing available environments.
 *
 * @packageDocumentation
 */

import { readWranglerToml, extractEnvironments } from '@jsonbored/opennextjs-cli/utils';

/**
 * Handle list_environments tool call
 */
export async function handleListEnvironments(_args: unknown) {
  const wranglerToml = readWranglerToml();
  const environments = wranglerToml ? extractEnvironments(wranglerToml) : ['production'];

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(
          {
            environments,
            default: 'production',
          },
          null,
          2
        ),
      },
    ],
  };
}
