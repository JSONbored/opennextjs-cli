# @jsonbored/opennextjs-mcp

**Model Context Protocol server for OpenNext.js Cloudflare projects**

Enables AI tools (like Cursor AI, Claude Desktop) to interact with your OpenNext.js projects locally through a standardized MCP interface.

## Overview

This MCP server provides AI tools with programmatic access to:
- **Tools**: Functions to get project status, validate configuration, check health, list environments
- **Resources**: Read wrangler.toml, open-next.config.ts, package.json, project structure
- **Prompts**: Templates for setup workflows, troubleshooting, and optimization guides

## Installation

The MCP server is automatically installed when you run:

```bash
opennextjs-cli mcp setup
```

Or manually add to your MCP configuration (`.mcp.json` or `~/.cursor/mcp.json`):

```json
{
  "mcpServers": {
    "opennextjs": {
      "command": "npx",
      "args": ["-y", "@jsonbored/opennextjs-mcp@latest"]
    }
  }
}
```

## Usage

After setup, restart Cursor/Claude Desktop. The AI will be able to:

- **Query project status**: "What's my current OpenNext.js configuration?"
- **Validate setup**: "Check if my configuration is valid"
- **Get help**: "Help me troubleshoot my deployment"
- **Read configs**: Access wrangler.toml, open-next.config.ts, package.json
- **Check health**: "Run a health check on my project"

## Available Tools

### `get_project_status`
Get comprehensive project status including Next.js version, OpenNext.js configuration, dependencies, worker name, caching strategy, and environments.

### `validate_configuration`
Validate OpenNext.js Cloudflare configuration and check for issues. Returns validation results with errors, warnings, and fix suggestions.

### `check_health`
Run health checks on the project. Returns health status, issues, and auto-fix suggestions.

### `list_environments`
List available Cloudflare Workers environments from wrangler.toml.

## Available Resources

- `opennextjs://config/wrangler.toml` - Cloudflare Workers configuration
- `opennextjs://config/open-next.config.ts` - OpenNext.js configuration
- `opennextjs://config/package.json` - Project dependencies and scripts
- `opennextjs://project/structure` - Project file tree

## Available Prompts

- `setup-opennextjs-project` - Step-by-step setup guide
- `troubleshoot-deployment` - Common issues and solutions
- `optimize-cloudflare-config` - Best practices for optimization

## How It Works

The MCP server runs locally via stdio transport. When an AI tool needs to interact with your project:

1. AI calls a tool (e.g., `get_project_status`)
2. MCP server executes the tool handler
3. Tool reads project files and returns data
4. AI receives the information and can provide assistance

## Requirements

- Node.js 18+
- OpenNext.js Cloudflare project (or any Next.js project)
- MCP-compatible AI tool (Cursor, Claude Desktop, etc.)

## Development

```bash
# Build
pnpm build

# Development mode
pnpm dev

# Type check
pnpm type-check
```

## License

MIT
