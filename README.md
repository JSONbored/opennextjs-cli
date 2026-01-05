# OpenNext.js CLI

<div align="center">

**🚀 Interactive CLI/TUI tool for setting up and configuring OpenNext.js projects for Cloudflare Workers**

[![npm version](https://img.shields.io/npm/v/@jsonbored/opennextjs-cli)](https://www.npmjs.com/package/@jsonbored/opennextjs-cli)
[![npm downloads](https://img.shields.io/npm/dm/@jsonbored/opennextjs-cli)](https://www.npmjs.com/package/@jsonbored/opennextjs-cli)
[![Node.js version](https://img.shields.io/node/v/@jsonbored/opennextjs-cli)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Note:** This is an unofficial community tool. It is not affiliated with or endorsed by the OpenNext.js team.

[Quick Start](#quick-start) • [Packages](#packages) • [Documentation](#documentation) • [Development](#development)

</div>

---

## Overview

**OpenNext.js CLI** is a comprehensive, interactive command-line tool that simplifies setting up and managing OpenNext.js projects for Cloudflare Workers. Built with modern UX principles using `@clack/prompts` (same as `next-forge`), it provides a beautiful, intuitive interface for project setup, configuration, deployment, and maintenance.

### What is OpenNext.js?

[OpenNext.js](https://opennext.js.org/) is an open-source adapter that enables deploying Next.js applications to various platforms, including Cloudflare Workers. This CLI tool automates the entire setup and configuration process, making it as easy as `create-next-app`.

## Packages

This monorepo contains **2 npm packages** that share the same GitHub repository but are published separately:

### 1. `@jsonbored/opennextjs-cli` - CLI Tool

The main command-line interface for setting up and managing OpenNext.js projects.

**Installation:**
```bash
npm install -g @jsonbored/opennextjs-cli
# or
pnpm add -g @jsonbored/opennextjs-cli
```

**Alias:** `onjs` (shorter command)

**Documentation:** See [packages/opennextjs-cli/README.md](packages/opennextjs-cli/README.md) for complete CLI documentation.

### 2. `@jsonbored/opennextjs-mcp` - MCP Server

Model Context Protocol server that enables AI tools to interact with OpenNext.js projects.

**Installation:**
```bash
npm install -g @jsonbored/opennextjs-mcp
```

**Documentation:** See [packages/opennextjs-mcp/README.md](packages/opennextjs-mcp/README.md) for complete MCP documentation.

**Note:** The MCP server is automatically configured when you run `opennextjs-cli mcp setup`.

## Quick Start

### Install CLI

```bash
npm install -g @jsonbored/opennextjs-cli
# or use the alias
onjs --version
```

### Create a New Project

```bash
opennextjs-cli init my-project
# or
onjs init my-project
```

### Add to Existing Project

```bash
cd your-existing-nextjs-project
opennextjs-cli add
# or
onjs add
```

### Deploy

```bash
pnpm deploy
# or
npm run deploy
```

## Development

### Prerequisites

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher (recommended)
- **Git** (for version control)

### Setup

```bash
# Clone repository
git clone https://github.com/JSONbored/opennextjs-cli.git
cd opennextjs-cli

# Install dependencies
pnpm install

# Build all packages
pnpm build

# Run tests
pnpm test
```

### Development Workflow

```bash
# Watch mode for CLI package
cd packages/opennextjs-cli
pnpm dev

# Watch mode for MCP package
cd packages/opennextjs-mcp
pnpm dev

# Run CLI locally
cd packages/opennextjs-cli
pnpm dev
# Then use: node dist/index.js <command>
```

### Testing

```bash
# Run all tests
pnpm test

# Run CLI tests
cd packages/opennextjs-cli
pnpm test

# Run MCP tests
cd packages/opennextjs-mcp
pnpm test

# Run with coverage
pnpm test:coverage
```

### Linting

```bash
# Lint all packages
pnpm lint

# Lint specific package
cd packages/opennextjs-cli
pnpm lint
```

## Features

### Core Functionality

- **Interactive Setup Wizard** - Beautiful step-by-step prompts for configuration
- **Automatic Configuration** - Generates `open-next.config.ts`, `wrangler.toml`, and more
- **Smart Defaults** - Best practices built-in with sensible defaults
- **Dependency Management** - Automatically installs required packages
- **Type-Safe** - Full TypeScript support with Zod validation
- **Modern TUI** - Beautiful terminal UI using `@clack/prompts`

### Safety & Reliability

- **Safety Checks** - Comprehensive pre-operation validation
- **Automatic Rollback** - Reverts changes on failure
- **Auto-Backup** - Backs up files before modifications
- **Monorepo Support** - Detects and handles monorepo structures
- **Path Validation** - Prevents unsafe file operations

### AI Integration

- **MCP Server** - Model Context Protocol server for AI tool integration
- **Cursor/Claude Desktop** - Seamless integration with AI coding assistants
- **Project Insights** - AI can query project status, validate configs, and more

## CLI Commands

The CLI provides 15 commands for complete project management:

### Project Setup
- `init` - Create new Next.js project with OpenNext.js
- `add` - Add OpenNext.js to existing project
- `config` - Update configuration

### Project Management
- `status` - Show project status
- `validate` - Validate configuration
- `doctor` - Health checks with auto-fix
- `setup` - Configure CLI settings

### Deployment & Development
- `deploy` - Deploy to Cloudflare
- `preview` - Start local preview server
- `update` - Update dependencies

### Environment & Cloudflare
- `env` - Manage environment variables
- `cloudflare` - Manage Cloudflare authentication

### Advanced
- `migrate` - Migrate from Vercel/Netlify
- `mcp` - Setup MCP server
- `completion` - Shell completion scripts

**Full Documentation:** See [packages/opennextjs-cli/README.md](packages/opennextjs-cli/README.md)

## MCP Server

The MCP server provides AI tools with programmatic access to your OpenNext.js projects:

### Tools (7)
- `get_project_status` - Get project information
- `validate_configuration` - Validate setup
- `check_health` - Health checks
- `list_environments` - List Cloudflare environments
- `deploy_to_cloudflare` - Deploy project
- `start_preview_server` - Start preview
- `update_configuration` - Update config

### Resources (4)
- `opennextjs://config/wrangler.toml` - Wrangler config
- `opennextjs://config/open-next.config.ts` - OpenNext config
- `opennextjs://config/package.json` - Package config
- `opennextjs://project/structure` - Project structure

### Prompts (3)
- `setup-opennextjs-project` - Setup guide
- `troubleshoot-deployment` - Troubleshooting
- `optimize-cloudflare-config` - Optimization tips

**Full Documentation:** See [packages/opennextjs-mcp/README.md](packages/opennextjs-mcp/README.md)

## Requirements

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0+ (recommended) or npm/yarn/bun
- **Cloudflare Account** (for deployment)
- **Wrangler CLI** (installed automatically)

## Caching Strategies

The CLI supports multiple caching strategies:

| Strategy | Description | Use Case |
|----------|-------------|----------|
| `static-assets` | SSG-only, no R2 needed | Simple static sites |
| `r2` | R2 Incremental Cache | Most Next.js apps (recommended) |
| `r2-do-queue` | ISR with time-based revalidation | Dynamic content with ISR |
| `r2-do-queue-tag-cache` | Full-featured with on-demand revalidation | Complex apps with on-demand ISR |

## Testing

- **CLI Package**: 162 tests (9 test suites)
  - Unit tests for all utilities
  - E2E tests for all commands
- **MCP Package**: 28 tests (5 test suites)
  - Server initialization tests
  - Tool and resource tests

**All tests use real file system operations** (no mocks).

## Roadmap

**Completed:**
- ✅ Phase 1: Core CLI commands (init, add, config, status, validate)
- ✅ Phase 2: Advanced commands (deploy, preview, update, env, cloudflare, doctor)
- ✅ Phase 5: MCP server (tools, resources, prompts)

**Coming Soon:**
- Phase 3: Templates, migration helpers, dry-run mode, config export/import
- Phase 4: CI/CD integration, testing setup, monitoring setup

## Contributing

Contributions are welcome! Please see our contributing guidelines (coming soon).

### Development Setup

```bash
# Clone repository
git clone https://github.com/JSONbored/opennextjs-cli.git
cd opennextjs-cli

# Install dependencies
pnpm install

# Build packages
pnpm build

# Run tests
pnpm test

# Run CLI locally
cd packages/opennextjs-cli
pnpm dev
```

## Related Projects

- **[OpenNext.js](https://opennext.js.org/)** - The core adapter that makes this possible
- **[OpenNext.js Cloudflare](https://github.com/opennextjs/opennextjs-cloudflare)** - Cloudflare-specific implementation
- **[Cloudflare Workers](https://workers.cloudflare.com/)** - Deployment platform
- **[Model Context Protocol](https://modelcontextprotocol.io/)** - MCP specification

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Support

- [Documentation](https://github.com/JSONbored/opennextjs-cli#readme)
- [Report Issues](https://github.com/JSONbored/opennextjs-cli/issues)
- [Discussions](https://github.com/JSONbored/opennextjs-cli/discussions)

## Credits

This tool is built for and powered by [OpenNext.js](https://opennext.js.org/), an amazing project that makes deploying Next.js to various platforms possible.

- **OpenNext.js Cloudflare**: https://github.com/opennextjs/opennextjs-cloudflare
- **Official Documentation**: https://opennext.js.org/cloudflare
- **Package**: `@opennextjs/cloudflare` on npm

---

<div align="center">

Made with ❤️ by [JSONbored](https://github.com/JSONbored)

[⭐ Star on GitHub](https://github.com/JSONbored/opennextjs-cli) • [📦 npm CLI](https://www.npmjs.com/package/@jsonbored/opennextjs-cli) • [📦 npm MCP](https://www.npmjs.com/package/@jsonbored/opennextjs-mcp) • [🐛 Report Issue](https://github.com/JSONbored/opennextjs-cli/issues)

</div>
