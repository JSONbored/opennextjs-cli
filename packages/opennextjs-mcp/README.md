# @jsonbored/opennextjs-mcp

<div align="center">

**🧠 Model Context Protocol server for OpenNext.js Cloudflare projects**

[![npm version](https://img.shields.io/npm/v/@jsonbored/opennextjs-mcp)](https://www.npmjs.com/package/@jsonbored/opennextjs-mcp)
[![npm downloads](https://img.shields.io/npm/dm/@jsonbored/opennextjs-mcp)](https://www.npmjs.com/package/@jsonbored/opennextjs-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Installation](#installation) • [Quick Start](#quick-start) • [Tools](#available-tools) • [Resources](#available-resources)

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

### Manual Installation

#### 1. Install the Package

```bash
npm install -g @jsonbored/opennextjs-mcp
# or
pnpm add -g @jsonbored/opennextjs-mcp
```

#### 2. Configure MCP Client

Add to your MCP configuration file (`.mcp.json` or `~/.cursor/mcp.json`):

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

## Available Tools

Tools are functions that AI can call to interact with your project.

### `get_project_status`

Get comprehensive project status including Next.js version, OpenNext.js configuration, dependencies, worker name, caching strategy, and environments.

**Example AI Usage:**
```
User: "What's my current OpenNext.js configuration?"
AI: Calls get_project_status → Returns project info
```

### `validate_configuration`

Validate OpenNext.js Cloudflare configuration and check for issues. Returns validation results with errors, warnings, and fix suggestions.

**Example AI Usage:**
```
User: "Is my configuration valid?"
AI: Calls validate_configuration → Returns validation results
```

### `check_health`

Run health checks on the project. Returns health status, issues, and auto-fix suggestions.

**Example AI Usage:**
```
User: "Check the health of my project"
AI: Calls check_health → Returns health check results
```

### `list_environments`

List available Cloudflare Workers environments from `wrangler.toml`.

**Example AI Usage:**
```
User: "What environments do I have configured?"
AI: Calls list_environments → Returns environment list
```

### `deploy_to_cloudflare`

Deploy OpenNext.js project to Cloudflare Workers. Returns deployment status and URL.

**Parameters:**
- `environment` (optional) - Environment to deploy to
- `dryRun` (optional) - Preview deployment without deploying

**Example AI Usage:**
```
User: "Deploy my app to production"
AI: Calls deploy_to_cloudflare with environment="production"
```

### `start_preview_server`

Start local preview server using `wrangler dev`. Returns preview URL.

**Parameters:**
- `port` (optional) - Port number (default: 8787)

**Example AI Usage:**
```
User: "Start a preview server"
AI: Calls start_preview_server → Returns preview URL
```

### `update_configuration`

Update OpenNext.js Cloudflare configuration. All parameters are optional.

**Parameters:**
- `workerName` (optional) - Update worker name
- `cachingStrategy` (optional) - Update caching strategy
- `database` (optional) - Update database option
- `imageOptimization` (optional) - Enable/disable image optimization
- `analyticsEngine` (optional) - Enable/disable Analytics Engine
- `nextJsVersion` (optional) - Update Next.js version
- `compatibilityDate` (optional) - Update compatibility date

**Example AI Usage:**
```
User: "Update my caching strategy to r2"
AI: Calls update_configuration with cachingStrategy="r2"
```

## Available Resources

Resources are data that AI can read from your project.

### `opennextjs://config/wrangler.toml`

Cloudflare Workers configuration file.

**MIME Type:** `text/toml`

**Example AI Usage:**
```
User: "Show me my wrangler.toml"
AI: Reads opennextjs://config/wrangler.toml → Returns file content
```

### `opennextjs://config/open-next.config.ts`

OpenNext.js Cloudflare configuration file.

**MIME Type:** `text/typescript`

**Example AI Usage:**
```
User: "What's in my open-next.config.ts?"
AI: Reads opennextjs://config/open-next.config.ts → Returns file content
```

### `opennextjs://config/package.json`

Project package.json file with dependencies and scripts.

**MIME Type:** `application/json`

**Example AI Usage:**
```
User: "What dependencies do I have?"
AI: Reads opennextjs://config/package.json → Returns package.json
```

### `opennextjs://project/structure`

Project file tree and key directories.

**MIME Type:** `application/json`

**Example AI Usage:**
```
User: "Show me my project structure"
AI: Reads opennextjs://project/structure → Returns file tree
```

## Available Prompts

Prompts are templates that provide structured guidance for common workflows.

### `setup-opennextjs-project`

Step-by-step guide for setting up OpenNext.js Cloudflare project.

**Example AI Usage:**
```
User: "Help me set up OpenNext.js"
AI: Uses setup-opennextjs-project prompt → Provides step-by-step guide
```

### `troubleshoot-deployment`

Common deployment issues and solutions for OpenNext.js Cloudflare.

**Example AI Usage:**
```
User: "My deployment is failing"
AI: Uses troubleshoot-deployment prompt → Provides troubleshooting steps
```

### `optimize-cloudflare-config`

Best practices for optimizing Cloudflare Workers configuration.

**Example AI Usage:**
```
User: "How can I optimize my Cloudflare config?"
AI: Uses optimize-cloudflare-config prompt → Provides optimization tips
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

## Use Cases

### 1. Configuration Queries

```
User: "What's my current worker name?"
AI: Calls get_project_status → Extracts worker name → Answers
```

### 2. Validation Assistance

```
User: "Is my configuration correct?"
AI: Calls validate_configuration → Reviews errors → Suggests fixes
```

### 3. Troubleshooting

```
User: "Why is my deployment failing?"
AI: Calls check_health → Reads deployment logs → Provides solutions
```

### 4. Setup Guidance

```
User: "Help me set up OpenNext.js"
AI: Uses setup-opennextjs-project prompt → Guides through setup
```

### 5. Configuration Updates

```
User: "Change my caching strategy to r2"
AI: Calls update_configuration → Updates config → Confirms change
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
**Claude Desktop:** `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

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

## Dependencies

- **@jsonbored/opennextjs-cli** - Reuses CLI utilities (project detection, validation, config reading)
- **@modelcontextprotocol/sdk** - MCP SDK for server implementation
- **zod** - Schema validation

## Troubleshooting

### MCP Server Not Starting

1. Verify Node.js version: `node --version` (must be 18+)
2. Check package installation: `npm list -g @jsonbored/opennextjs-mcp`
3. Test manually: `npx @jsonbored/opennextjs-mcp@latest`

### AI Tool Not Recognizing Server

1. Verify MCP configuration file location
2. Check JSON syntax in configuration
3. Restart AI tool completely
4. Check AI tool logs for errors

### Project Not Detected

1. Ensure you're in a Next.js project directory
2. Verify `package.json` exists
3. Check that `next` is in dependencies

### Tools Not Working

1. Verify project has OpenNext.js configured
2. Check that `wrangler.toml` exists (for some tools)
3. Ensure required dependencies are installed

## Examples

### Example 1: Project Status Query

```
User: "What's my project status?"
AI: [Calls get_project_status]
    → Returns: Next.js 15.5.9, OpenNext.js configured, 
       Worker: my-app, Caching: r2, Environments: production
```

### Example 2: Configuration Validation

```
User: "Validate my setup"
AI: [Calls validate_configuration]
    → Returns: ✅ Configuration valid, 2 warnings found
    → Suggests: Update Next.js to latest patch version
```

### Example 3: Health Check

```
User: "Check my project health"
AI: [Calls check_health]
    → Returns: ✅ All checks passed
    → Or: ⚠️ 3 warnings, 1 error found
    → Suggests: Run with --fix to auto-fix
```

### Example 4: Configuration Update

```
User: "Change my worker name to my-new-app"
AI: [Calls update_configuration with workerName="my-new-app"]
    → Updates wrangler.toml
    → Confirms: Worker name updated to "my-new-app"
```

## Related

- **[CLI Package](../opennextjs-cli/README.md)** - Main CLI tool
- **[Main Repository](https://github.com/JSONbored/opennextjs-cli)** - Full project documentation
- **[Model Context Protocol](https://modelcontextprotocol.io/)** - MCP specification
- **[OpenNext.js](https://opennext.js.org/)** - Core adapter documentation

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [JSONbored](https://github.com/JSONbored)

[⭐ Star on GitHub](https://github.com/JSONbored/opennextjs-cli) • [📦 npm](https://www.npmjs.com/package/@jsonbored/opennextjs-mcp)

</div>
