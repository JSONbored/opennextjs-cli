# @jsonbored/opennextjs-mcp

<div align="center">

**🧠 Model Context Protocol server for OpenNext.js Cloudflare projects**

[![npm version](https://img.shields.io/npm/v/@jsonbored/opennextjs-mcp)](https://www.npmjs.com/package/@jsonbored/opennextjs-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@jsonbored/opennextjs-mcp)](https://www.npmjs.com/package/@jsonbored/opennextjs-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Installation](#installation) • [Quick Start](#quick-start) • [Tools](#available-tools) • [Resources](#available-resources) • [Prompts](#available-prompts)

</div>

---

## Overview

`@jsonbored/opennextjs-mcp` is a Model Context Protocol (MCP) server that enables AI tools (like Cursor AI, Claude Desktop) to interact with your OpenNext.js Cloudflare projects locally. It provides programmatic access to project configuration, validation, deployment, and diagnostics through a standardized MCP interface.

### What is MCP?

[Model Context Protocol](https://modelcontextprotocol.io/) is an open protocol that enables AI assistants to securely access external data sources and tools. This MCP server exposes your OpenNext.js project to AI tools, allowing them to:

- 📊 Query project status and configuration
- ✅ Validate project setup
- 🔍 Diagnose issues and suggest fixes
- 📖 Read configuration files
- 🚀 Assist with deployment
- 💡 Provide setup and troubleshooting guidance

### Key Features

- 🔧 **7 Tools** - Comprehensive project interaction capabilities
- 📚 **4 Resources** - Read project configuration files
- 💬 **3 Prompts** - Structured guidance templates
- 🔒 **Secure** - Runs locally via stdio (no network required)
- ⚡ **Fast** - Direct file system access
- 🎯 **Type-Safe** - Full TypeScript with Zod validation

## Installation

### Automatic Setup (Recommended)

The easiest way to set up the MCP server is using the CLI:

```bash
opennextjs-cli mcp setup
```

This automatically:
- Detects your MCP configuration file
- Adds the MCP server configuration
- Verifies the setup
- Provides restart instructions

### Manual Installation

#### 1. Install the Package

```bash
npm install -g @jsonbored/opennextjs-mcp
# or
pnpm add -g @jsonbored/opennextjs-mcp
```

#### 2. Configure MCP Client

**For Cursor:**

Add to `~/.cursor/mcp.json`:

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

**For Claude Desktop (macOS):**

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

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

**For Claude Desktop (Windows):**

Add to `%APPDATA%\Claude\claude_desktop_config.json`:

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

**For Claude Desktop (Linux):**

Add to `~/.config/Claude/claude_desktop_config.json`:

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

#### 3. Restart Your AI Tool

Restart Cursor, Claude Desktop, or your MCP-compatible AI tool to load the new server.

## Quick Start

### 1. Set Up MCP Server

```bash
# In your OpenNext.js project directory
opennextjs-cli mcp setup
```

### 2. Restart AI Tool

Restart Cursor or Claude Desktop.

### 3. Start Using

Now you can ask your AI assistant:

- "What's my current OpenNext.js configuration?"
- "Validate my project setup"
- "Check the health of my project"
- "List my Cloudflare environments"
- "Help me troubleshoot deployment issues"
- "Read my wrangler.toml file"
- "Update my caching strategy to r2"

## Available Tools

Tools are functions that AI can call to interact with your project. All tools return JSON responses.

### 1. `get_project_status`

Get comprehensive project status including Next.js version, OpenNext.js configuration, dependencies, worker name, caching strategy, and environments.

**Returns:**
```json
{
  "nextJs": {
    "detected": true,
    "version": "15.1.0"
  },
  "openNext": {
    "configured": true,
    "workerName": "my-worker",
    "accountId": "account-id",
    "cachingStrategy": "r2",
    "environments": ["production", "staging"]
  },
  "dependencies": {
    "opennextjsCloudflare": "1.14.7",
    "wrangler": "3.0.0"
  },
  "packageManager": "pnpm"
}
```

**Example AI Usage:**
```
User: "What's my current OpenNext.js configuration?"
AI: [Calls get_project_status]
    → Returns: Next.js 15.1.0, OpenNext.js configured, 
       Worker: my-app, Caching: r2, Environments: production, staging
```

### 2. `validate_configuration`

Validate OpenNext.js Cloudflare configuration and check for issues. Returns validation results with errors, warnings, and fix suggestions.

**Returns:**
```json
{
  "valid": true,
  "checks": [
    {
      "name": "wrangler.toml exists",
      "status": "pass",
      "message": "wrangler.toml is valid"
    }
  ],
  "errors": [],
  "warnings": [
    {
      "name": "wrangler.toml account_id",
      "status": "warning",
      "message": "wrangler.toml missing account_id",
      "fix": "Add \"account_id = \\\"your-account-id\\\"\" to wrangler.toml",
      "docsUrl": "https://developers.cloudflare.com/workers/configuration/configuration-files/#account_id"
    }
  ]
}
```

**Example AI Usage:**
```
User: "Is my configuration valid?"
AI: [Calls validate_configuration]
    → Returns: ✅ Configuration valid, 2 warnings found
    → Suggests: Add account_id to wrangler.toml
    → Provides documentation link
```

### 3. `check_health`

Run health checks on the project. Returns health status, issues, and auto-fix suggestions.

**Returns:**
```json
{
  "healthy": true,
  "checks": [
    {
      "name": "Node.js version",
      "status": "pass",
      "message": "Node.js 22.0.0 detected"
    }
  ],
  "warnings": [],
  "errors": []
}
```

**Example AI Usage:**
```
User: "Check the health of my project"
AI: [Calls check_health]
    → Returns: ✅ All checks passed
    → Or: ⚠️ 3 warnings, 1 error found
    → Suggests: Run with --fix to auto-fix
```

### 4. `list_environments`

List available Cloudflare Workers environments from `wrangler.toml`.

**Returns:**
```json
{
  "environments": ["production", "staging", "development"]
}
```

**Example AI Usage:**
```
User: "What environments do I have configured?"
AI: [Calls list_environments]
    → Returns: production, staging, development
```

### 5. `deploy_to_cloudflare`

Deploy OpenNext.js project to Cloudflare Workers. Returns deployment status and URL.

**Parameters:**
- `environment` (optional, string) - Environment to deploy to (default: production)
- `dryRun` (optional, boolean) - Preview deployment without deploying

**Returns:**
```json
{
  "message": "Deployment requires wrangler CLI. Use: wrangler deploy",
  "instruction": "Run \"opennextjs-cli deploy\" or \"wrangler deploy\" from the project directory",
  "environment": "production",
  "dryRun": false
}
```

**Example AI Usage:**
```
User: "Deploy my app to production"
AI: [Calls deploy_to_cloudflare with environment="production"]
    → Returns: Deployment instructions
```

**Note:** This tool provides deployment instructions. Actual deployment should be done via CLI or wrangler directly.

### 6. `start_preview_server`

Start local preview server using `wrangler dev`. Returns preview URL.

**Parameters:**
- `port` (optional, number) - Port number (default: 8787)

**Returns:**
```json
{
  "message": "Preview server requires wrangler CLI. Use: wrangler dev",
  "instruction": "Run \"opennextjs-cli preview\" or \"wrangler dev\" from the project directory",
  "port": 8787
}
```

**Example AI Usage:**
```
User: "Start a preview server"
AI: [Calls start_preview_server]
    → Returns: Preview server instructions
```

**Note:** This tool provides preview instructions. Actual preview server should be started via CLI or wrangler directly.

### 7. `update_configuration`

Update OpenNext.js Cloudflare configuration. All parameters are optional.

**Parameters:**
- `workerName` (optional, string) - Update worker name
- `cachingStrategy` (optional, string) - Update caching strategy (static-assets, r2, r2-do-queue, r2-do-queue-tag-cache)
- `database` (optional, string) - Update database option
- `imageOptimization` (optional, boolean) - Enable/disable image optimization
- `analyticsEngine` (optional, boolean) - Enable/disable Analytics Engine
- `nextJsVersion` (optional, string) - Update Next.js version
- `compatibilityDate` (optional, string) - Update compatibility date

**Returns:**
```json
{
  "updated": true,
  "changes": {
    "cachingStrategy": "r2"
  }
}
```

**Example AI Usage:**
```
User: "Update my caching strategy to r2"
AI: [Calls update_configuration with cachingStrategy="r2"]
    → Updates wrangler.toml and open-next.config.ts
    → Confirms: Caching strategy updated to "r2"
```

## Available Resources

Resources are data that AI can read from your project. All resources return file content or structured data.

### 1. `opennextjs://config/wrangler.toml`

Cloudflare Workers configuration file.

**MIME Type:** `text/toml`

**Returns:**
```toml
name = "my-worker"
account_id = "account-id"
compatibility_date = "2024-01-01"

[env.production]
account_id = "prod-account-id"
```

**Example AI Usage:**
```
User: "Show me my wrangler.toml"
AI: [Reads opennextjs://config/wrangler.toml]
    → Returns: Full wrangler.toml content
    → AI can analyze and provide insights
```

**Error Handling:**
- If file doesn't exist, returns error: "wrangler.toml not found"

### 2. `opennextjs://config/open-next.config.ts`

OpenNext.js Cloudflare configuration file.

**MIME Type:** `text/typescript`

**Returns:**
```typescript
export default {
  adapter: 'cloudflare',
  cachingStrategy: 'r2',
  // ... other options
};
```

**Example AI Usage:**
```
User: "What's in my open-next.config.ts?"
AI: [Reads opennextjs://config/open-next.config.ts]
    → Returns: Full config file content
    → AI can suggest optimizations
```

**Error Handling:**
- If file doesn't exist, returns error: "open-next.config.ts not found"

### 3. `opennextjs://config/package.json`

Project package.json file with dependencies and scripts.

**MIME Type:** `application/json`

**Returns:**
```json
{
  "name": "my-project",
  "version": "1.0.0",
  "dependencies": {
    "next": "15.1.0",
    "@opennextjs/cloudflare": "1.14.7"
  },
  "devDependencies": {
    "wrangler": "3.0.0"
  },
  "scripts": {
    "preview": "wrangler dev",
    "deploy": "wrangler deploy"
  }
}
```

**Example AI Usage:**
```
User: "What dependencies do I have?"
AI: [Reads opennextjs://config/package.json]
    → Returns: Full package.json
    → AI can check for outdated packages
```

**Error Handling:**
- If file doesn't exist, returns error (package.json should always exist)

### 4. `opennextjs://project/structure`

Project file tree and key directories.

**MIME Type:** `application/json`

**Returns:**
```json
{
  "structure": {
    "src": ["app", "components", "lib"],
    "public": ["images", "fonts"],
    "config": ["wrangler.toml", "open-next.config.ts"]
  },
  "keyDirectories": ["src", "public", "app"],
  "configFiles": ["wrangler.toml", "open-next.config.ts", "package.json"]
}
```

**Example AI Usage:**
```
User: "Show me my project structure"
AI: [Reads opennextjs://project/structure]
    → Returns: Project file tree
    → AI can help navigate project
```

## Available Prompts

Prompts are templates that provide structured guidance for common workflows. They return formatted messages that AI can use to guide users.

### 1. `setup-opennextjs-project`

Step-by-step guide for setting up OpenNext.js Cloudflare project.

**Returns:**
Structured prompt with:
- Prerequisites checklist
- Installation steps
- Configuration steps
- Verification steps
- Next steps

**Example AI Usage:**
```
User: "Help me set up OpenNext.js"
AI: [Uses setup-opennextjs-project prompt]
    → Provides step-by-step guide:
    1. Install dependencies
    2. Run "opennextjs-cli add"
    3. Configure wrangler.toml
    4. Deploy
```

### 2. `troubleshoot-deployment`

Common deployment issues and solutions for OpenNext.js Cloudflare.

**Returns:**
Structured prompt with:
- Common deployment errors
- Solutions for each error
- Diagnostic steps
- Prevention tips

**Example AI Usage:**
```
User: "My deployment is failing"
AI: [Uses troubleshoot-deployment prompt]
    → Provides troubleshooting steps:
    1. Check wrangler.toml configuration
    2. Verify Cloudflare authentication
    3. Check build logs
    4. Common fixes
```

### 3. `optimize-cloudflare-config`

Best practices for optimizing Cloudflare Workers configuration.

**Returns:**
Structured prompt with:
- Performance optimization tips
- Caching strategy recommendations
- Configuration best practices
- Resource optimization

**Example AI Usage:**
```
User: "How can I optimize my Cloudflare config?"
AI: [Uses optimize-cloudflare-config prompt]
    → Provides optimization tips:
    1. Use appropriate caching strategy
    2. Optimize worker size
    3. Configure proper headers
    4. Enable compression
```

## How It Works

### Architecture

```
AI Tool (Cursor/Claude Desktop)
    ↓
MCP Client
    ↓
MCP Server (@jsonbored/opennextjs-mcp)
    ↓
@jsonbored/opennextjs-cli/utils (shared utilities)
    ↓
OpenNext.js Project (local filesystem)
```

### Communication Flow

1. **AI Tool** requests information or action
2. **MCP Client** routes request to MCP server
3. **MCP Server** reads project files or executes tools
4. **MCP Server** returns data to MCP client
5. **AI Tool** receives information and provides assistance

### Stdio Transport

The MCP server uses stdio (standard input/output) transport, meaning:
- ✅ Runs locally (no network required)
- ✅ Secure (no external connections)
- ✅ Fast (direct file system access)
- ✅ Works offline

### Project Detection

The MCP server automatically detects the project directory from the current working directory when invoked by the MCP client. It looks for:

- `package.json` with Next.js dependency
- `wrangler.toml` or `open-next.config.ts` (optional, for OpenNext.js projects)

**Monorepo Support:**
- Automatically detects monorepo structure
- Finds Next.js projects within workspaces
- Works from any directory within monorepo

## Use Cases

### 1. Configuration Queries

```
User: "What's my current worker name?"
AI: [Calls get_project_status]
    → Extracts worker name
    → Answers: "Your worker name is 'my-app'"
```

### 2. Validation Assistance

```
User: "Is my configuration correct?"
AI: [Calls validate_configuration]
    → Reviews errors and warnings
    → Suggests fixes with documentation links
    → Provides step-by-step fix instructions
```

### 3. Troubleshooting

```
User: "Why is my deployment failing?"
AI: [Calls check_health]
    → [Reads wrangler.toml]
    → [Reads open-next.config.ts]
    → Analyzes configuration
    → Provides solutions
```

### 4. Setup Guidance

```
User: "Help me set up OpenNext.js"
AI: [Uses setup-opennextjs-project prompt]
    → Guides through setup process
    → Validates each step
    → Provides next steps
```

### 5. Configuration Updates

```
User: "Change my caching strategy to r2"
AI: [Calls update_configuration with cachingStrategy="r2"]
    → Updates wrangler.toml
    → Updates open-next.config.ts
    → Confirms: "Caching strategy updated to r2"
```

### 6. File Reading

```
User: "Show me my wrangler.toml"
AI: [Reads opennextjs://config/wrangler.toml]
    → Displays file content
    → Can analyze and suggest improvements
```

## Requirements

- **Node.js** 18.0.0 or higher
- **OpenNext.js Project** - Must be in an OpenNext.js Cloudflare project directory
- **MCP-Compatible AI Tool** - Cursor, Claude Desktop, or other MCP clients
- **@jsonbored/opennextjs-cli** - Automatically installed as dependency

## Configuration

### MCP Client Configuration

The MCP server is configured in your MCP client's configuration file:

**Cursor:** `~/.cursor/mcp.json`  
**Claude Desktop (macOS):** `~/Library/Application Support/Claude/claude_desktop_config.json`  
**Claude Desktop (Windows):** `%APPDATA%\Claude\claude_desktop_config.json`  
**Claude Desktop (Linux):** `~/.config/Claude/claude_desktop_config.json`

**Configuration Format:**
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

### Project Detection

The MCP server automatically detects the project directory from the current working directory when invoked by the MCP client. It looks for:

- `package.json` with Next.js dependency
- `wrangler.toml` or `open-next.config.ts` (optional, for OpenNext.js projects)

**Monorepo Support:**
- Automatically detects monorepo structure
- Finds Next.js projects within workspaces
- Works from any directory within monorepo

## Development

### Build

```bash
pnpm build
```

### Development Mode

```bash
pnpm dev
```

### Type Check

```bash
pnpm type-check
```

### Lint

```bash
pnpm lint
```

### Test

```bash
pnpm test
pnpm test:watch
pnpm test:coverage
```

## Dependencies

- **@jsonbored/opennextjs-cli** - Reuses CLI utilities (project detection, validation, config reading)
- **@modelcontextprotocol/sdk** - MCP SDK for server implementation
- **zod** - Schema validation

## Testing

The MCP package includes comprehensive tests:

- **28 tests** covering:
  - Server initialization
  - All 7 tools
  - All 4 resources
  - Registration functions

**Test Structure:**
- `src/__tests__/mcp-server.test.ts` - Server tests
- `src/__tests__/tools/` - Tool tests
- `src/__tests__/resources/` - Resource tests

**All tests use real file system operations** (no mocks).

See [MCP_TESTING.md](../../MCP_TESTING.md) for detailed testing documentation.

## Troubleshooting

### MCP Server Not Starting

1. Verify Node.js version: `node --version` (must be 18+)
2. Check package installation: `npm list -g @jsonbored/opennextjs-mcp`
3. Test manually: `npx @jsonbored/opennextjs-mcp@latest`
4. Check MCP configuration file syntax (must be valid JSON)

### AI Tool Not Recognizing Server

1. Verify MCP configuration file location
2. Check JSON syntax in configuration
3. Restart AI tool completely
4. Check AI tool logs for errors
5. Verify `npx` is available in PATH

### Project Not Detected

1. Ensure you're in a Next.js project directory
2. Verify `package.json` exists
3. Check that `next` is in dependencies
4. In monorepos, ensure you're in the correct workspace

### Tools Not Working

1. Verify project has OpenNext.js configured
2. Check that `wrangler.toml` exists (for some tools)
3. Ensure required dependencies are installed
4. Check that `@jsonbored/opennextjs-cli` is installed (dependency)

### Resources Return Errors

1. **"wrangler.toml not found"** - Run `opennextjs-cli add` to create it
2. **"open-next.config.ts not found"** - Run `opennextjs-cli add` to create it
3. **"package.json not found"** - Ensure you're in a Node.js project directory

## Examples

### Example 1: Project Status Query

```
User: "What's my project status?"
AI: [Calls get_project_status]
    → Returns: Next.js 15.1.0, OpenNext.js configured, 
       Worker: my-app, Caching: r2, Environments: production, staging
    → AI summarizes: "Your project is configured with Next.js 15.1.0, 
       worker name 'my-app', using R2 caching, with production and staging environments."
```

### Example 2: Configuration Validation

```
User: "Validate my setup"
AI: [Calls validate_configuration]
    → Returns: ✅ Configuration valid, 2 warnings found
    → Warnings include documentation links
    → AI suggests: "Your configuration is valid, but you should add 
       account_id to wrangler.toml. See: [docs link]"
```

### Example 3: Health Check

```
User: "Check my project health"
AI: [Calls check_health]
    → Returns: ✅ All checks passed
    → Or: ⚠️ 3 warnings, 1 error found
    → AI suggests: "Your project is healthy!" or 
       "Found 3 warnings and 1 error. Run 'opennextjs-cli doctor --fix' to auto-fix."
```

### Example 4: Configuration Update

```
User: "Change my worker name to my-new-app"
AI: [Calls update_configuration with workerName="my-new-app"]
    → Updates wrangler.toml
    → Confirms: Worker name updated to "my-new-app"
    → AI confirms: "✅ Worker name updated successfully!"
```

### Example 5: File Reading

```
User: "Show me my wrangler.toml"
AI: [Reads opennextjs://config/wrangler.toml]
    → Returns: Full file content
    → AI displays: "Here's your wrangler.toml: [content]"
    → AI can analyze: "I notice you're missing account_id. 
       Should I help you add it?"
```

### Example 6: Environment Listing

```
User: "What environments do I have?"
AI: [Calls list_environments]
    → Returns: ["production", "staging"]
    → AI answers: "You have 2 environments configured: production and staging."
```

## API Reference

### Tools

All tools follow the MCP tool specification:

```typescript
{
  name: string;
  description: string;
  inputSchema: {
    type: 'object';
    properties: Record<string, unknown>;
    required: string[];
  };
}
```

### Resources

All resources follow the MCP resource specification:

```typescript
{
  uri: string;
  name: string;
  description: string;
  mimeType: string;
}
```

### Prompts

All prompts follow the MCP prompt specification:

```typescript
{
  name: string;
  description: string;
  arguments: Array<{
    name: string;
    description: string;
    required: boolean;
  }>;
}
```

## Related

- **[CLI Package](../opennextjs-cli/README.md)** - Main CLI tool
- **[Main Repository](https://github.com/JSONbored/opennextjs-cli)** - Full project documentation
- **[Model Context Protocol](https://modelcontextprotocol.io/)** - MCP specification
- **[OpenNext.js](https://opennext.js.org/)** - Core adapter documentation
- **[MCP Testing Guide](../../MCP_TESTING.md)** - Testing documentation

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [JSONbored](https://github.com/JSONbored)

[⭐ Star on GitHub](https://github.com/JSONbored/opennextjs-cli) • [📦 npm](https://www.npmjs.com/package/@jsonbored/opennextjs-mcp)

</div>
