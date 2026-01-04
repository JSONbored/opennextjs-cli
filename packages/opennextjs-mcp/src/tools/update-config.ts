/**
 * Update Configuration Tool
 *
 * MCP tool for updating configuration (placeholder).
 *
 * @packageDocumentation
 */

/**
 * Handle update_configuration tool call
 */
export async function handleUpdateConfig(args: { workerName?: string; cachingStrategy?: string }): Promise<{
  content: Array<{
    type: 'text';
    text: string;
  }>;
}> {
  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify({
          message: 'Configuration update requires CLI. Use: opennextjs-cli config',
          instruction: 'Run "opennextjs-cli config" for interactive configuration update',
          requestedChanges: args,
        }, null, 2),
      },
    ],
  };
}
