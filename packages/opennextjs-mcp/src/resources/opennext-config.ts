/**
 * OpenNext Config Resource
 *
 * MCP resource for reading open-next.config.ts.
 *
 * @packageDocumentation
 */

import { readOpenNextConfig } from '@jsonbored/opennextjs-cli/utils';

/**
 * Read open-next.config.ts resource
 */
export async function readOpenNextConfigResource(uri: string): Promise<{
  contents: Array<{
    uri: string;
    mimeType: string;
    text: string;
  }>;
}> {
  const content = readOpenNextConfig();
  if (!content) {
    throw new Error('open-next.config.ts not found');
  }

  return {
    contents: [
      {
        uri,
        mimeType: 'text/typescript',
        text: content,
      },
    ],
  };
}
