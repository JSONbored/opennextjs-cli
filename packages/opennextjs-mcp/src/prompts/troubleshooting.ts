/**
 * Troubleshooting Prompt
 *
 * MCP prompt template for troubleshooting deployment issues.
 *
 * @packageDocumentation
 */

/**
 * Get troubleshoot-deployment prompt
 */
export async function getTroubleshootPrompt(): Promise<{
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
          text: `# Troubleshooting OpenNext.js Cloudflare Deployment

## Common Issues and Solutions

### 1. Authentication Errors
**Error**: "Not authenticated with Cloudflare"
**Fix**: 
\`\`\`bash
opennextjs-cli cloudflare login
\`\`\`

### 2. Missing Account ID
**Error**: "account_id is required"
**Fix**: 
\`\`\`bash
opennextjs-cli env setup
\`\`\`
Or add to wrangler.toml:
\`\`\`toml
account_id = "your-account-id"
\`\`\`

### 3. Build Failures
**Error**: Build errors during deployment
**Fix**:
- Check Node.js version: \`node --version\` (must be 18+)
- Validate config: \`opennextjs-cli validate\`
- Check dependencies: \`opennextjs-cli doctor\`

### 4. Missing Dependencies
**Error**: "@opennextjs/cloudflare not found"
**Fix**:
\`\`\`bash
pnpm add @opennextjs/cloudflare
pnpm add -D wrangler
\`\`\`

### 5. R2 Bucket Not Found
**Error**: R2 bucket access errors
**Fix**:
- Ensure R2 bucket exists in Cloudflare dashboard
- Check bucket name matches wrangler.toml
- Verify R2 bindings are correct

### 6. Configuration Validation
Run comprehensive checks:
\`\`\`bash
opennextjs-cli validate
opennextjs-cli doctor --fix
\`\`\`

## Getting Help
- Check logs: \`wrangler tail\`
- Validate config: \`opennextjs-cli validate\`
- Health check: \`opennextjs-cli doctor\`
`,
        },
      },
    ],
  };
}
