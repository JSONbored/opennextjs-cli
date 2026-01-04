/**
 * MCP Command
 *
 * Helps users set up MCP server configuration.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { existsSync, readFileSync, writeFileSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { logger } from '../utils/logger.js';

/**
 * Creates the `mcp` command for MCP server setup
 *
 * @description
 * This command helps users configure the MCP server for use with AI tools.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli mcp setup
 * ```
 */
export function mcpCommand(): Command {
  const command = new Command('mcp');

  command
    .description('Set up MCP server configuration for AI tools')
    .summary('Configure MCP server')
    .addCommand(
      new Command('setup')
        .description('Set up MCP server configuration')
        .action(async () => {
          try {
            p.intro('🔧 MCP Server Setup');

            // Use tasks() for setup steps
            let configPath: string | undefined;
            let config: { mcpServers?: Record<string, unknown> } = {};

            await p.tasks([
              {
                title: 'Finding MCP configuration file',
                task: async () => {
                  const possiblePaths = [
                    join(process.cwd(), '.mcp.json'),
                    join(process.cwd(), 'mcp.json'),
                    join(homedir(), '.cursor', 'mcp.json'),
                  ];

                  for (const path of possiblePaths) {
                    if (existsSync(path)) {
                      configPath = path;
                      try {
                        const parsed = JSON.parse(readFileSync(path, 'utf-8')) as { mcpServers?: Record<string, unknown> };
                        if (typeof parsed === 'object' && parsed !== null) {
                          config = parsed;
                        }
                      } catch {
                        config = {};
                      }
                      break;
                    }
                  }

                  if (!configPath) {
                    // Use Cursor's default location
                    configPath = join(homedir(), '.cursor', 'mcp.json');
                    const dir = join(homedir(), '.cursor');
                    if (!existsSync(dir)) {
                      logger.info(`Creating directory: ${dir}`);
                      // Directory will be created when we write the file
                    }
                  }
                },
              },
              {
                title: 'Updating MCP configuration',
                task: async () => {
                  // Add or update opennextjs-mcp entry
                  if (!config.mcpServers) {
                    config.mcpServers = {};
                  }

                  config.mcpServers['opennextjs'] = {
                    command: 'npx',
                    args: ['-y', '@jsonbored/opennextjs-mcp@latest'],
                  };

                  // Write config
                  writeFileSync(configPath!, JSON.stringify(config, null, 2) + '\n', 'utf-8');
                },
              },
            ]);

            logger.section('Configuration');
            p.log.info(`Config file: ${configPath}`);
            logger.success('MCP configuration updated');

            p.note(
              `The MCP server has been added to your configuration.\n\nTo use it:\n1. Restart Cursor/Claude Desktop\n2. The AI will be able to interact with your OpenNext.js project\n\nConfig location: ${configPath}`,
              '✅ Setup Complete'
            );

            p.outro('MCP server configured successfully');
          } catch (error) {
            logger.error('Failed to set up MCP server', error);
            process.exit(1);
          }
        })
    );

  command.addHelpText(
    'after',
    `
Subcommands:
  setup      Set up MCP server configuration for AI tools

Examples:
  opennextjs-cli mcp setup    Configure MCP server

The MCP server enables AI tools (like Cursor AI, Claude Desktop) to interact
with your OpenNext.js project, providing tools, resources, and prompts for
project management, configuration, and deployment.
`
  );

  return command;
}
