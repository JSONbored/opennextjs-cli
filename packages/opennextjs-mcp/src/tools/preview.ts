/**
 * Preview Tool
 *
 * MCP tool for starting preview server (placeholder).
 *
 * @packageDocumentation
 */

/**
 * Handle start_preview_server tool call
 */
export async function handlePreview(args: { port?: number }): Promise<{
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
          message: 'Preview server requires wrangler CLI. Use: wrangler dev',
          instruction: 'Run "opennextjs-cli preview" or "wrangler dev" from the project directory',
          defaultUrl: `http://localhost:${args.port || 8787}`,
        }, null, 2),
      },
    ],
  };
}
