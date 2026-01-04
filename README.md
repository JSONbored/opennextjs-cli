# OpenNext.js CLI

<div align="center">

**Interactive CLI/TUI tool for setting up and configuring OpenNext.js projects for Cloudflare Workers**

[![npm version](https://img.shields.io/npm/v/@jsonbored/opennextjs-cli)](https://www.npmjs.com/package/@jsonbored/opennextjs-cli)
[![npm downloads](https://img.shields.io/npm/dm/@jsonbored/opennextjs-cli)](https://www.npmjs.com/package/@jsonbored/opennextjs-cli)
[![Node.js version](https://img.shields.io/node/v/@jsonbored/opennextjs-cli)](https://nodejs.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **Note:** This is an unofficial community tool. It is not affiliated with or endorsed by the OpenNext.js team.

[Quick Start](#quick-start) • [Documentation](#documentation) • [Features](#features) • [Packages](#packages)

</div>

---

## Overview

**OpenNext.js CLI** is a comprehensive, interactive command-line tool that simplifies setting up and managing OpenNext.js projects for Cloudflare Workers. Built with modern UX principles using `@clack/prompts` (same as `next-forge`), it provides a beautiful, intuitive interface for project setup, configuration, deployment, and maintenance.

### What is OpenNext.js?

[OpenNext.js](https://opennext.js.org/) is an open-source adapter that enables deploying Next.js applications to various platforms, including Cloudflare Workers. This CLI tool automates the entire setup and configuration process, making it as easy as `create-next-app`.

## Features

### Core Functionality

- **Interactive Setup Wizard** - Beautiful step-by-step prompts for configuration
- **Automatic Configuration** - Generates `open-next.config.ts`, `wrangler.toml`, and more
- **Smart Defaults** - Best practices built-in with sensible defaults
- **Dependency Management** - Automatically installs required packages
- **Type-Safe** - Full TypeScript support with Zod validation
- **Modern TUI** - Beautiful terminal UI using `@clack/prompts` (same as `next-forge`)

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

## Packages

This repository contains two npm packages:

### 1. `@jsonbored/opennextjs-cli` - CLI Tool

The main command-line interface for setting up and managing OpenNext.js projects.

```bash
npm install -g @jsonbored/opennextjs-cli
# or
pnpm add -g @jsonbored/opennextjs-cli
```

**Alias:** `onjs` (shorter command)

### 2. `@jsonbored/opennextjs-mcp` - MCP Server

Model Context Protocol server that enables AI tools to interact with OpenNext.js projects.

```bash
npm install -g @jsonbored/opennextjs-mcp
```

**Note:** The MCP server is automatically configured when you run `opennextjs-cli mcp setup`.

## Quick Start

### Install

```bash
npm install -g @jsonbored/opennextjs-cli
# or use the alias
npm install -g @jsonbored/opennextjs-cli
# then use: onjs
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

## Documentation

### Available Commands

#### Project Setup

- **`init [project-name]`** - Create a new Next.js project with OpenNext.js Cloudflare
- **`add`** - Add OpenNext.js to an existing Next.js project
- **`config`** - Update or reconfigure OpenNext.js Cloudflare settings

#### Project Management

- **`status`** - Display current project status and configuration
- **`validate`** - Validate OpenNext.js Cloudflare configuration
- **`doctor`** - Run health checks and diagnose issues (with `--fix` for auto-fix)
- **`setup`** - Configure CLI settings (global or project-specific)

#### Deployment & Development

- **`deploy`** - Build and deploy to Cloudflare Workers
- **`preview`** - Start local preview server with Cloudflare Workers
- **`update`** - Update OpenNext.js configuration and dependencies

#### Environment & Cloudflare

- **`env`** - Manage environment variables for Cloudflare Workers
  - `env setup` - Interactive environment setup
  - `env validate` - Validate environment variables
  - `env list` - List all environment variables
  - `env set <key> <value>` - Set an environment variable
- **`cloudflare`** - Manage Cloudflare account authentication
  - `cloudflare login` - Authenticate with Cloudflare
  - `cloudflare verify` - Verify authentication status
  - `cloudflare account` - Show account information
  - `cloudflare logout` - Clear authentication

#### AI Integration

- **`mcp setup`** - Set up MCP server configuration for AI tools

### Global Options

- **`--verbose, -V`** - Enable verbose logging
- **`--debug, -D`** - Enable debug logging (includes verbose)
- **`--version, -v`** - Display version number
- **`--help, -h`** - Display help for command

### Examples

```bash
# Create new project
opennextjs-cli init my-app

# Add to existing project
opennextjs-cli add

# Check project status
opennextjs-cli status

# Validate configuration
opennextjs-cli validate

# Run health checks
opennextjs-cli doctor
opennextjs-cli doctor --fix  # Auto-fix issues

# Deploy to Cloudflare
opennextjs-cli deploy

# Preview locally
opennextjs-cli preview

# Update dependencies
opennextjs-cli update

# Configure CLI settings
opennextjs-cli setup
opennextjs-cli setup --global

# Set up MCP for AI tools
opennextjs-cli mcp setup
```

## Use Cases

### 1. New Project Setup

```bash
opennextjs-cli init my-nextjs-app
cd my-nextjs-app
pnpm dev          # Start development
pnpm preview      # Preview with Cloudflare Workers
pnpm deploy       # Deploy to production
```

### 2. Existing Project Migration

```bash
cd your-existing-nextjs-project
opennextjs-cli add
# Follow prompts to configure
pnpm deploy
```

### 3. Configuration Updates

```bash
opennextjs-cli config
# Or update specific settings
opennextjs-cli config --worker-name new-name
opennextjs-cli config --caching-strategy r2
```

### 4. Health Diagnostics

```bash
opennextjs-cli doctor
# Auto-fix issues
opennextjs-cli doctor --fix
```

### 5. AI-Assisted Development

```bash
# Set up MCP server
opennextjs-cli mcp setup

# Then in Cursor/Claude Desktop, ask:
# "What's my current OpenNext.js configuration?"
# "Validate my project setup"
# "Help me troubleshoot deployment issues"
```

## Architecture

### Monorepo Structure

```
opennextjs-cli/
├── packages/
│   ├── opennextjs-cli/     # Main CLI package
│   └── opennextjs-mcp/      # MCP server package
├── scripts/                  # Build and release scripts
├── .github/workflows/        # CI/CD workflows
└── cliff.toml               # Changelog configuration
```

### Package Dependencies

- **CLI Package**: Standalone, can be used independently
- **MCP Package**: Depends on CLI package for shared utilities

Both packages are published to npm with synchronized versions.

## Configuration

### Global Configuration

Stored in `~/.opennextjs-cli/config.json`:

```json
{
  "defaultPackageManager": "pnpm",
  "defaultCachingStrategy": "r2",
  "autoBackup": true,
  "confirmDestructive": true,
  "verbose": false
}
```

### Project Configuration

Stored in `.opennextjs-cli.json` (project root):

```json
{
  "defaultPackageManager": "pnpm",
  "defaultCachingStrategy": "r2",
  "autoBackup": true
}
```

Project settings override global settings.

## Safety Features

- **Pre-operation Validation** - Checks project structure, dependencies, and configuration
- **Automatic Backups** - Creates timestamped backups before modifications
- **Rollback Support** - Automatically reverts changes on failure
- **Path Safety** - Validates file paths to prevent unsafe operations
- **Monorepo Detection** - Warns and confirms before operating in monorepos
- **Git Integration** - Detects uncommitted changes and warns

## MCP Server Integration

The MCP server (`@jsonbored/opennextjs-mcp`) enables AI tools to interact with your OpenNext.js projects:

### Setup

```bash
opennextjs-cli mcp setup
```

This automatically configures your MCP client (Cursor/Claude Desktop) to use the OpenNext.js MCP server.

### Available Tools

- `get_project_status` - Get comprehensive project information
- `validate_configuration` - Validate project configuration
- `check_health` - Run health checks
- `list_environments` - List Cloudflare environments
- `deploy_to_cloudflare` - Deploy project (via AI)
- `start_preview_server` - Start preview server (via AI)
- `update_configuration` - Update configuration (via AI)

### Available Resources

- `opennextjs://config/wrangler.toml` - Wrangler configuration
- `opennextjs://config/open-next.config.ts` - OpenNext.js configuration
- `opennextjs://config/package.json` - Package configuration
- `opennextjs://project/structure` - Project file tree

See [packages/opennextjs-mcp/README.md](packages/opennextjs-mcp/README.md) for detailed MCP documentation.

## Requirements

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0 or higher (recommended) or npm/yarn/bun
- **Cloudflare Account** (for deployment)
- **Wrangler CLI** (installed automatically)

## Caching Strategies

The CLI supports multiple caching strategies:

- **`static-assets`** - SSG-only, no R2 needed (simplest)
- **`r2`** - R2 Incremental Cache (recommended for most cases)
- **`r2-do-queue`** - ISR with time-based revalidation
- **`r2-do-queue-tag-cache`** - Full-featured with on-demand revalidation

## Roadmap

We maintain a comprehensive development plan that tracks all features, improvements, and outstanding tasks. The plan includes:

- **Completed Features** - All Phase 1, Phase 2, and Phase 5 (MCP Server) features
- **Pending Features** - Phase 3 and Phase 4 features including templates, migration helpers, CI/CD integration, testing setup, and more
- **Implementation Details** - Architecture decisions, file locations, and dependencies

For the complete roadmap and development plan, see [`.cursor/plans/opennext.js_cli_complete_feature_implementation_fbd97a4b.plan.md`](.cursor/plans/opennext.js_cli_complete_feature_implementation_fbd97a4b.plan.md).

### Quick Summary of Pending Features

**Phase 3 (Nice to Have):**
- Template selection (basic, with-auth, with-database, with-analytics)
- Migration helpers (from Vercel, Netlify)
- Dry-run mode for all commands
- Configuration export/import

**Phase 4 (Advanced):**
- CI/CD integration (GitHub Actions, GitLab CI)
- Testing setup (Jest/Vitest, Playwright)
- Monitoring setup (Cloudflare Analytics, Sentry)
- Auto-completion (bash/zsh/fish)

**Phase 5 (MCP Server):**
- MCP server testing and integration tests

## Related Projects

- **[OpenNext.js](https://opennext.js.org/)** - The core adapter that makes this possible
- **[OpenNext.js Cloudflare](https://github.com/opennextjs/opennextjs-cloudflare)** - Cloudflare-specific implementation
- **[Cloudflare Workers](https://workers.cloudflare.com/)** - Deployment platform

## License

MIT License - see [LICENSE](LICENSE) file for details.

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

# Run CLI locally
cd packages/opennextjs-cli
pnpm dev
```

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

[![Star History Chart](https://api.star-history.com/svg?repos=jsonbored/opennext-cli&type=date&legend=top-left)](https://www.star-history.com/#jsonbored/opennext-cli&type=date&legend=top-left)

</div>

---

<div align="center">

Made with ❤️ by [JSONbored](https://github.com/JSONbored)

[Star on GitHub](https://github.com/JSONbored/opennextjs-cli) • [npm](https://www.npmjs.com/package/@jsonbored/opennextjs-cli) • [Report Issue](https://github.com/JSONbored/opennextjs-cli/issues)

</div>
