/**
 * Wrangler Config Resource
 *
 * MCP resource for reading wrangler.toml configuration.
 *
 * @packageDocumentation
 */

import { readWranglerToml } from '@jsonbored/opennextjs-cli/utils';

/**
 * Read wrangler.toml resource
 */
export async function readWranglerConfig(uri: string) {
  const content = readWranglerToml();
  if (!content) {
    throw new Error('wrangler.toml not found');
  }

  return {
    contents: [
      {
        uri,
        mimeType: 'text/toml',
        text: content,
      },
    ],
  };
}
