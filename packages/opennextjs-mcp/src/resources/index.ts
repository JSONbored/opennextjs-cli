/**
 * MCP Resources Registration
 *
 * Registers all resources (data) that AI can read.
 *
 * @packageDocumentation
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { readWranglerConfig } from './wrangler-config.js';
import { readOpenNextConfigResource } from './opennext-config.js';
import { readPackageJsonResource } from './package-json.js';
import { readProjectStructure } from './project-structure.js';

/**
 * Resource definitions
 */
const RESOURCES = [
  {
    uri: 'opennextjs://config/wrangler.toml',
    name: 'Wrangler Configuration',
    description: 'Cloudflare Workers configuration file (wrangler.toml)',
    mimeType: 'text/toml',
    handler: readWranglerConfig,
  },
  {
    uri: 'opennextjs://config/open-next.config.ts',
    name: 'OpenNext Configuration',
    description: 'OpenNext.js Cloudflare configuration file',
    mimeType: 'text/typescript',
    handler: readOpenNextConfigResource,
  },
  {
    uri: 'opennextjs://config/package.json',
    name: 'Package Configuration',
    description: 'Project package.json file with dependencies and scripts',
    mimeType: 'application/json',
    handler: readPackageJsonResource,
  },
  {
    uri: 'opennextjs://project/structure',
    name: 'Project Structure',
    description: 'Project file tree and key directories',
    mimeType: 'application/json',
    handler: readProjectStructure,
  },
];

/**
 * Register all resources with the MCP server
 */
export function registerAllResources(server: Server): void {
  // Register resources/list handler
  (server as unknown as { setRequestHandler: (method: string, handler: () => Promise<unknown>) => void }).setRequestHandler('resources/list', async () => {
    return {
      resources: RESOURCES.map((resource) => ({
        uri: resource.uri,
        name: resource.name,
        description: resource.description,
        mimeType: resource.mimeType,
      })),
    };
  });

  // Register resources/read handler
  (server as unknown as { setRequestHandler: (method: string, handler: (request: { params: { uri: string } }) => Promise<unknown>) => void }).setRequestHandler('resources/read', async (request) => {
    const params = request.params as { uri: string };
    const uri = params.uri;
    const resource = RESOURCES.find((r) => r.uri === uri);

    if (!resource) {
      throw new Error(`Unknown resource: ${uri}`);
    }

    return await resource.handler(uri);
  });
}
