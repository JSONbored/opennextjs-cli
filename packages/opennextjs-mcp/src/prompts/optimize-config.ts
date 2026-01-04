/**
 * Optimize Config Prompt
 *
 * MCP prompt template for optimizing Cloudflare configuration.
 *
 * @packageDocumentation
 */

/**
 * Get optimize-cloudflare-config prompt
 */
export async function getOptimizePrompt(): Promise<{
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
          text: `# Optimizing Cloudflare Workers Configuration

## Caching Strategies

### R2 Incremental Cache (Recommended)
- Best for: Most applications
- Setup: Automatic with "r2" strategy
- Benefits: Fast ISR, cost-effective

### R2 + Durable Objects Queue
- Best for: Time-based revalidation
- Setup: "r2-do-queue" strategy
- Benefits: Scheduled ISR updates

### Full-Featured (R2 + DO Queue + DO Tag Cache)
- Best for: On-demand revalidation
- Setup: "r2-do-queue-tag-cache" strategy
- Benefits: Maximum flexibility

## Performance Tips

1. **Enable Image Optimization**
   - Use Cloudflare Images for automatic optimization
   - Configure in open-next.config.ts

2. **Use R2 for Static Assets**
   - Store large files in R2
   - Configure bindings in wrangler.toml

3. **Optimize Bundle Size**
   - Use dynamic imports for large dependencies
   - Enable tree-shaking

4. **Configure Observability**
   - Enable logs and traces
   - Set appropriate sampling rates

## Best Practices

- Use environment-specific configs for dev/staging/prod
- Set up proper R2 bucket permissions
- Configure Durable Objects for high-traffic routes
- Monitor performance with Cloudflare Analytics
- Use wrangler secrets for sensitive data

## Configuration Updates
\`\`\`bash
opennextjs-cli config  # Update configuration interactively
\`\`\`
`,
        },
      },
    ],
  };
}
