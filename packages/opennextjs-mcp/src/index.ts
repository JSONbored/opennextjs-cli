#!/usr/bin/env node
/**
 * OpenNext.js MCP Server
 *
 * Model Context Protocol server for OpenNext.js Cloudflare projects.
 * Enables AI tools to interact with OpenNext.js projects locally.
 *
 * @packageDocumentation
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerAllTools } from './tools/index.js';
import { registerAllResources } from './resources/index.js';
import { registerAllPrompts } from './prompts/index.js';

/**
 * Main entry point for MCP server
 */
async function main(): Promise<void> {
  const server = new Server(
    {
      name: 'opennextjs-mcp',
      version: '0.1.0',
    },
    {
      capabilities: {
        tools: {},
        resources: {},
        prompts: {},
      },
    }
  );

  // Register all capabilities
  registerAllTools(server);
  registerAllResources(server);
  registerAllPrompts(server);

  // Connect via stdio
  const transport = new StdioServerTransport();
  await server.connect(transport);

  // Server is now running and will handle requests
}

main().catch((error) => {
  console.error('Failed to start MCP server:', error);
  process.exit(1);
});
