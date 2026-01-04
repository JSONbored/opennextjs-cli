/**
 * MCP Prompts Registration
 *
 * Registers all prompts (templates) for common workflows.
 *
 * @packageDocumentation
 */

import type { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { getSetupPrompt } from './setup-workflow.js';
import { getTroubleshootPrompt } from './troubleshooting.js';
import { getOptimizePrompt } from './optimize-config.js';

/**
 * Prompt definitions
 */
const PROMPTS = [
  {
    name: 'setup-opennextjs-project',
    description: 'Step-by-step guide for setting up OpenNext.js Cloudflare project',
    handler: getSetupPrompt,
  },
  {
    name: 'troubleshoot-deployment',
    description: 'Common deployment issues and solutions for OpenNext.js Cloudflare',
    handler: getTroubleshootPrompt,
  },
  {
    name: 'optimize-cloudflare-config',
    description: 'Best practices for optimizing Cloudflare Workers configuration',
    handler: getOptimizePrompt,
  },
];

/**
 * Register all prompts with the MCP server
 */
export function registerAllPrompts(server: Server): void {
  // Register prompts/list handler
  (server as unknown as { setRequestHandler: (method: string, handler: () => Promise<unknown>) => void }).setRequestHandler('prompts/list', () => {
    return Promise.resolve({
      prompts: PROMPTS.map((prompt) => ({
        name: prompt.name,
        description: prompt.description,
        arguments: [],
      })),
    });
  });

  // Register prompts/get handler
  (server as unknown as { setRequestHandler: (method: string, handler: (request: { params: { name: string } }) => Promise<unknown>) => void }).setRequestHandler('prompts/get', async (request) => {
    const params = request.params as { name: string };
    const promptName = params.name;
    const prompt = PROMPTS.find((p) => p.name === promptName);

    if (!prompt) {
      throw new Error(`Unknown prompt: ${promptName}`);
    }

    return await prompt.handler();
  });
}
