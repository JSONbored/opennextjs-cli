/**
 * MCP Tools Registration
 *
 * Registers all tools (functions) that AI can call.
 *
 * @packageDocumentation
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { handleGetProjectStatus } from './project-status.js';
import { handleValidateConfig } from './validate-config.js';
import { handleDeploy } from './deploy.js';
import { handlePreview } from './preview.js';
import { handleUpdateConfig } from './update-config.js';
import { handleHealthCheck } from './health-check.js';
import { handleListEnvironments } from './list-environments.js';

/**
 * Tool definitions
 */
const TOOLS = [
  {
    name: 'get_project_status',
    description: 'Get current OpenNext.js project status including Next.js version, configuration, dependencies, and deployment info',
    handler: handleGetProjectStatus,
  },
  {
    name: 'validate_configuration',
    description: 'Validate OpenNext.js Cloudflare configuration and check for issues. Returns validation results with errors, warnings, and fix suggestions.',
    handler: handleValidateConfig,
  },
  {
    name: 'deploy_to_cloudflare',
    description: 'Deploy OpenNext.js project to Cloudflare Workers. Returns deployment status and URL.',
    handler: handleDeploy,
  },
  {
    name: 'start_preview_server',
    description: 'Start local preview server using wrangler dev. Returns preview URL.',
    handler: handlePreview,
  },
  {
    name: 'update_configuration',
    description: 'Update OpenNext.js Cloudflare configuration. All parameters are optional.',
    handler: handleUpdateConfig,
  },
  {
    name: 'check_health',
    description: 'Run health checks on OpenNext.js project. Returns health status, issues, and auto-fix suggestions.',
    handler: handleHealthCheck,
  },
  {
    name: 'list_environments',
    description: 'List available Cloudflare Workers environments from wrangler.toml',
    handler: handleListEnvironments,
  },
];

/**
 * Register all tools with the MCP server
 */
export function registerAllTools(server: Server): void {
  // Register tools/list handler
  (server as unknown as { setRequestHandler: (method: string, handler: () => Promise<unknown>) => void }).setRequestHandler('tools/list', async () => {
    return {
      tools: TOOLS.map((tool) => ({
        name: tool.name,
        description: tool.description,
        inputSchema: {
          type: 'object',
          properties: {},
          required: [],
        },
      })),
    };
  });

  // Register tools/call handler
  (server as unknown as { setRequestHandler: (method: string, handler: (request: { params: { name: string; arguments?: unknown } }) => Promise<unknown>) => void }).setRequestHandler('tools/call', async (request) => {
    const params = request.params as { name: string; arguments?: unknown };
    const toolName = params.name;
    const tool = TOOLS.find((t) => t.name === toolName);

    if (!tool) {
      throw new Error(`Unknown tool: ${toolName}`);
    }

    return await tool.handler(params.arguments || {});
  });
}
