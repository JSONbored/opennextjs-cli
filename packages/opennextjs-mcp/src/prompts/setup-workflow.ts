/**
 * Setup Workflow Prompt
 *
 * MCP prompt template for setting up OpenNext.js projects.
 *
 * @packageDocumentation
 */

/**
 * Get setup-opennextjs-project prompt
 */
export async function getSetupPrompt(): Promise<{
  messages: Array<{
    role: 'user';
    content: {
      type: 'text';
      text: string;
    };
  }>;
}> {
  return {
    messages: [
      {
        role: 'user',
        content: {
          type: 'text',
          text: `# OpenNext.js Cloudflare Setup Guide

## Prerequisites
- Node.js 18 or higher
- Cloudflare account
- Wrangler CLI (will be installed automatically)

## Setup Steps

### 1. Create New Project
\`\`\`bash
opennextjs-cli init my-project
\`\`\`

### 2. Add to Existing Project
\`\`\`bash
cd my-existing-project
opennextjs-cli add
\`\`\`

### 3. Configure
- Worker name
- Caching strategy (R2 recommended)
- Database options (optional)
- Environment settings

### 4. Authenticate with Cloudflare
\`\`\`bash
opennextjs-cli cloudflare login
\`\`\`

### 5. Deploy
\`\`\`bash
pnpm deploy
# or
opennextjs-cli deploy
\`\`\`

## Next Steps
- Preview locally: \`pnpm preview\`
- Check status: \`opennextjs-cli status\`
- Validate config: \`opennextjs-cli validate\`

## Caching Strategies
- **static-assets**: SSG-only, no R2 needed
- **r2**: R2 Incremental Cache (recommended)
- **r2-do-queue**: ISR with time-based revalidation
- **r2-do-queue-tag-cache**: Full-featured with on-demand revalidation
`,
        },
      },
    ],
  };
}
