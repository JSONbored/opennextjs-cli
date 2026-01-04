# @jsonbored/opennextjs-cli

<div align="center">

**🚀 Interactive CLI/TUI tool for setting up and configuring OpenNext.js projects for Cloudflare Workers**

[![npm version](https://img.shields.io/npm/v/@jsonbored/opennextjs-cli)](https://www.npmjs.com/package/@jsonbored/opennextjs-cli)
[![npm downloads](https://img.shields.io/npm/dm/@jsonbored/opennextjs-cli)](https://www.npmjs.com/package/@jsonbored/opennextjs-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Installation](#installation) • [Quick Start](#quick-start) • [Commands](#commands) • [Documentation](#documentation)

</div>

---

## Overview

`@jsonbored/opennextjs-cli` is a comprehensive, interactive command-line tool that simplifies setting up and managing OpenNext.js projects for Cloudflare Workers. Built with modern UX principles using `@clack/prompts` (same as `next-forge`), it provides a beautiful, intuitive interface for project setup, configuration, deployment, and maintenance.

### Key Features

- 🎨 **Beautiful TUI** - Modern terminal UI using `@clack/prompts`
- 🛡️ **Safety First** - Comprehensive validation, backups, and rollback support
- 📦 **Monorepo Support** - Detects and handles monorepo structures
- ⚙️ **Smart Defaults** - Best practices built-in
- 🔧 **Type-Safe** - Full TypeScript with Zod validation
- 🤖 **AI-Ready** - MCP server integration for AI tools

## Installation

### Global Installation (Recommended)

```bash
npm install -g @jsonbored/opennextjs-cli
# or
pnpm add -g @jsonbored/opennextjs-cli
# or
yarn global add @jsonbored/opennextjs-cli
# or
bun install -g @jsonbored/opennextjs-cli
```

### Use with npx (No Installation)

```bash
npx @jsonbored/opennextjs-cli init my-project
```

### Aliases

After installation, you can use the shorter alias:

```bash
onjs init my-project
onjs add
onjs status
```

## Quick Start

### 1. Create a New Project

```bash
opennextjs-cli init my-project
# or
onjs init my-project
```

This will:
- Create a new Next.js project with TypeScript
- Configure OpenNext.js for Cloudflare Workers
- Set up `wrangler.toml` and `open-next.config.ts`
- Install all required dependencies
- Configure package.json scripts

### 2. Add to Existing Project

```bash
cd your-existing-nextjs-project
opennextjs-cli add
# or
onjs add
```

This will:
- Detect your existing Next.js project
- Add OpenNext.js Cloudflare configuration
- Install required dependencies
- Update package.json with deploy scripts

### 3. Deploy

```bash
pnpm deploy
# or
npm run deploy
```

## Commands

### Project Setup

#### `init [project-name]`

Create a new Next.js project with OpenNext.js Cloudflare configuration.

```bash
opennextjs-cli init my-app
opennextjs-cli init --yes                    # Skip prompts, use defaults
opennextjs-cli init --worker-name my-worker  # Custom worker name
```

**Options:**
- `-y, --yes` - Skip all prompts, use defaults
- `--next-version <version>` - Specify Next.js version (default: latest 15.x)
- `--worker-name <name>` - Cloudflare Worker name
- `--caching-strategy <strategy>` - Caching strategy (static-assets, r2, r2-do-queue, r2-do-queue-tag-cache)

#### `add`

Add OpenNext.js Cloudflare configuration to an existing Next.js project.

```bash
opennextjs-cli add
opennextjs-cli add --yes                     # Skip prompts
opennextjs-cli add --worker-name my-worker  # Custom worker name
opennextjs-cli add --caching-strategy r2    # Specify caching strategy
```

**Options:**
- `-y, --yes` - Skip all prompts
- `--worker-name <name>` - Cloudflare Worker name
- `--caching-strategy <strategy>` - Caching strategy
- `--skip-cloudflare-check` - Skip Cloudflare authentication check
- `--skip-backup` - Skip creating backups

#### `config`

Update or reconfigure OpenNext.js Cloudflare settings.

```bash
opennextjs-cli config                        # Interactive update
opennextjs-cli config --worker-name new-name # Update worker name
opennextjs-cli config --caching-strategy r2  # Update caching strategy
opennextjs-cli config --reset                # Reset to defaults
```

**Options:**
- `-y, --yes` - Skip prompts
- `--worker-name <name>` - Update worker name
- `--caching-strategy <strategy>` - Update caching strategy
- `--reset` - Reset configuration to defaults

### Project Management

#### `status`

Display current project status and configuration information.

```bash
opennextjs-cli status
opennextjs-cli status --json                 # Output as JSON
```

**Shows:**
- Next.js version and project detection
- OpenNext.js Cloudflare configuration status
- Installed dependencies
- Cloudflare Worker name and account ID
- Caching strategy
- Environment configurations
- Package manager detection

#### `validate`

Validate OpenNext.js Cloudflare configuration and check for issues.

```bash
opennextjs-cli validate
```

**Checks:**
- `wrangler.toml` configuration
- `open-next.config.ts` configuration
- `package.json` scripts and dependencies
- Cloudflare connection
- Common misconfigurations

#### `doctor`

Run health checks and diagnose issues with auto-fix support.

```bash
opennextjs-cli doctor                       # Run health checks
opennextjs-cli doctor --fix                 # Auto-fix issues
```

**Checks:**
- Node.js version (must be 18+)
- Package manager installation
- Wrangler CLI availability
- Project structure
- Required dependencies
- Configuration files
- Cloudflare authentication
- Common errors and misconfigurations

#### `setup`

Configure CLI settings (global or project-specific).

```bash
opennextjs-cli setup                        # Project-specific settings
opennextjs-cli setup --global              # Global settings
```

**Configures:**
- Default package manager
- Default caching strategy
- Auto-backup preferences
- Confirmation preferences
- Verbose logging

### Deployment & Development

#### `deploy`

Build and deploy the project to Cloudflare Workers.

```bash
opennextjs-cli deploy
opennextjs-cli deploy --env production      # Deploy to specific environment
opennextjs-cli deploy --preview            # Deploy to preview
opennextjs-cli deploy --dry-run            # Show what would be deployed
```

**Options:**
- `--env <environment>` - Deploy to specific environment
- `--preview` - Deploy to preview (not production)
- `--dry-run` - Show deployment plan without deploying

#### `preview`

Start local preview server with Cloudflare Workers.

```bash
opennextjs-cli preview
opennextjs-cli preview --port 8787         # Custom port
opennextjs-cli preview --env production    # Use production environment
```

**Options:**
- `--port <number>` - Custom port (default: 8787)
- `--env <environment>` - Use specific environment

#### `update`

Update OpenNext.js configuration and dependencies.

```bash
opennextjs-cli update
opennextjs-cli update --check              # Check for updates only
opennextjs-cli update --force              # Force update
opennextjs-cli update --package <name>    # Update specific package
```

**Options:**
- `--check` - Check for updates without installing
- `--force` - Force update even if already latest
- `--package <name>` - Update specific package only

### Environment & Cloudflare

#### `env`

Manage environment variables for Cloudflare Workers.

```bash
opennextjs-cli env setup                   # Interactive setup
opennextjs-cli env validate                # Validate variables
opennextjs-cli env list                    # List all variables
opennextjs-cli env set KEY value           # Set variable
```

**Subcommands:**
- `env setup` - Interactive environment setup
- `env validate` - Validate environment variables
- `env list` - List all environment variables
- `env set <key> <value>` - Set an environment variable

#### `cloudflare`

Manage Cloudflare account authentication and connection.

```bash
opennextjs-cli cloudflare login            # Authenticate
opennextjs-cli cloudflare verify           # Verify authentication
opennextjs-cli cloudflare account          # Show account info
opennextjs-cli cloudflare logout           # Clear authentication
```

**Subcommands:**
- `cloudflare login` - Authenticate with Cloudflare
- `cloudflare verify` - Verify current authentication
- `cloudflare account` - Show account information
- `cloudflare logout` - Clear authentication

### AI Integration

#### `mcp setup`

Set up MCP server configuration for AI tools (Cursor, Claude Desktop).

```bash
opennextjs-cli mcp setup
```

This automatically configures your MCP client to use `@jsonbored/opennextjs-mcp`.

## Global Options

All commands support these global options:

- `--verbose, -V` - Enable verbose logging
- `--debug, -D` - Enable debug logging (includes verbose)
- `--version, -v` - Display version number
- `--help, -h` - Display help for command

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

## Caching Strategies

The CLI supports multiple caching strategies for different use cases:

| Strategy | Description | Use Case |
|----------|-------------|----------|
| `static-assets` | SSG-only, no R2 needed | Simple static sites |
| `r2` | R2 Incremental Cache | Most Next.js apps (recommended) |
| `r2-do-queue` | ISR with time-based revalidation | Dynamic content with ISR |
| `r2-do-queue-tag-cache` | Full-featured with on-demand revalidation | Complex apps with on-demand ISR |

## Safety Features

### Pre-Operation Validation

- ✅ Directory access checks
- ✅ Package.json validation
- ✅ Next.js project detection
- ✅ Git repository detection
- ✅ Uncommitted changes warnings
- ✅ Node.js version validation
- ✅ Monorepo detection and warnings

### Automatic Backups

- 💾 Timestamped backups in `.backup/` directory
- 🔄 Automatic rollback on failure
- ⚙️ Configurable via `autoBackup` setting

### Path Safety

- 🛡️ Path traversal prevention
- ✅ Safe file path validation
- 🚫 Blocks dangerous operations

## Monorepo Support

The CLI automatically detects monorepo structures:

- ✅ **pnpm workspaces** - Detected and supported
- ✅ **npm/yarn workspaces** - Detected and supported
- ✅ **Lerna** - Detected and supported
- ✅ **Nx** - Detected and supported
- ✅ **Turborepo** - Detected and supported

When operating in a monorepo, the CLI will:
- Warn you about the monorepo structure
- Confirm you want to proceed
- Work correctly within workspace packages

## Requirements

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0+ (recommended) or npm/yarn/bun
- **Cloudflare Account** (for deployment)
- **Wrangler CLI** (installed automatically)

## Examples

### Complete Workflow

```bash
# 1. Create new project
opennextjs-cli init my-app
cd my-app

# 2. Check status
opennextjs-cli status

# 3. Validate configuration
opennextjs-cli validate

# 4. Run health checks
opennextjs-cli doctor

# 5. Preview locally
opennextjs-cli preview

# 6. Deploy to Cloudflare
opennextjs-cli deploy
```

### Adding to Existing Project

```bash
cd your-existing-nextjs-project

# Add OpenNext.js
opennextjs-cli add

# Configure environment variables
opennextjs-cli env setup

# Authenticate with Cloudflare
opennextjs-cli cloudflare login

# Deploy
opennextjs-cli deploy
```

### Configuration Management

```bash
# Update configuration
opennextjs-cli config

# Update specific setting
opennextjs-cli config --caching-strategy r2-do-queue

# Reset to defaults
opennextjs-cli config --reset
```

## Package Exports

This package exports utilities for use by other packages (e.g., MCP server):

```typescript
import { detectNextJsProject } from '@jsonbored/opennextjs-cli/utils';
import { validateConfiguration } from '@jsonbored/opennextjs-cli/utils';
import { readWranglerToml } from '@jsonbored/opennextjs-cli/utils';
```

**Available Exports:**
- `./utils` - Utility functions (project detection, validation, config reading)
- `./schemas` - Zod schemas for configuration validation
- `./platforms/cloudflare` - Cloudflare platform utilities

## Troubleshooting

### Common Issues

**"No Next.js project detected"**
- Ensure you're in a Next.js project directory
- Check that `package.json` exists and has `next` dependency

**"Version mismatch"**
- Ensure Node.js version is 18+
- Check with: `node --version`

**"Cloudflare authentication failed"**
- Run: `opennextjs-cli cloudflare login`
- Or: `wrangler login`

**"Package manager not detected"**
- Install pnpm: `npm install -g pnpm`
- Or use npm/yarn/bun

### Getting Help

```bash
# Get help for any command
opennextjs-cli --help
opennextjs-cli <command> --help

# Run diagnostics
opennextjs-cli doctor
opennextjs-cli doctor --fix
```

## Related

- **[Main Repository](https://github.com/JSONbored/opennextjs-cli)** - Full project documentation
- **[MCP Server Package](../opennextjs-mcp/README.md)** - AI integration package
- **[OpenNext.js](https://opennext.js.org/)** - Core adapter documentation

## License

MIT License - see [LICENSE](../../LICENSE) file for details.
