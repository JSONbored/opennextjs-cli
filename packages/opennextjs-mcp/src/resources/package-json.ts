/**
 * Package JSON Resource
 *
 * MCP resource for reading package.json.
 *
 * @packageDocumentation
 */

import { readPackageJson } from '@jsonbored/opennextjs-cli/utils';

/**
 * Read package.json resource
 */
export async function readPackageJsonResource(uri: string) {
  const packageJson = readPackageJson();
  if (!packageJson) {
    throw new Error('package.json not found');
  }

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(packageJson, null, 2),
      },
    ],
  };
}
