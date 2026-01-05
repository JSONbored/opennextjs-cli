# @jsonbored/opennextjs-cli

<div align="center">

**🚀 Interactive CLI/TUI tool for setting up and configuring OpenNext.js projects for Cloudflare Workers**

[![npm version](https://img.shields.io/npm/v/@jsonbored/opennextjs-cli)](https://www.npmjs.com/package/@jsonbored/opennextjs-cli)
[![npm downloads](https://img.shields.io/npm/dm/@jsonbored/opennextjs-cli)](https://www.npmjs.com/package/@jsonbored/opennextjs-cli)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

[Installation](#installation) • [Quick Start](#quick-start) • [Commands](#commands) • [Configuration](#configuration)

</div>

---

## Overview

`@jsonbored/opennextjs-cli` is a comprehensive, interactive command-line tool that simplifies setting up and managing OpenNext.js projects for Cloudflare Workers. Built with modern UX principles using `@clack/prompts` (same as `next-forge`), it provides a beautiful, intuitive interface for project setup, configuration, deployment, and maintenance.

### Key Features

- 🎨 **Beautiful TUI** - Modern terminal UI using `@clack/prompts`
- 🛡️ **Safety First** - Comprehensive validation, backups, and rollback support
- 📦 **Monorepo Support** - Detects and handles monorepo structures automatically
- ⚙️ **Smart Defaults** - Best practices built-in with sensible defaults
- 🔧 **Type-Safe** - Full TypeScript with Zod validation
- 🤖 **AI-Ready** - MCP server integration for AI tools
- 📖 **Documentation Links** - Validation warnings include helpful documentation URLs

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
onjs validate
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
opennextjs-cli init --caching-strategy r2    # Specify caching strategy
opennextjs-cli init --next-version 15.1.0    # Specify Next.js version
```

**Options:**

- `-y, --yes` - Skip all prompts, use defaults
- `--next-version <version>` - Specify Next.js version (default: latest 15.x)
- `--worker-name <name>` - Cloudflare Worker name
- `--caching-strategy <strategy>` - Caching strategy (static-assets, r2, r2-do-queue, r2-do-queue-tag-cache)
- `--template <templates>` - Comma-separated list of templates (future feature)

**What it creates:**

- New Next.js project directory
- `wrangler.toml` configuration
- `open-next.config.ts` configuration
- `package.json` with required dependencies and scripts
- `.env.example` file

#### `add`

Add OpenNext.js Cloudflare configuration to an existing Next.js project.

```bash
opennextjs-cli add
opennextjs-cli add --yes                     # Skip prompts
opennextjs-cli add --worker-name my-worker  # Custom worker name
opennextjs-cli add --caching-strategy r2    # Specify caching strategy
opennextjs-cli add --skip-cloudflare-check  # Skip Cloudflare auth check
opennextjs-cli add --skip-backup            # Skip creating backups
opennextjs-cli add --dry-run                 # Preview without changes
```

**Options:**

- `-y, --yes` - Skip all prompts
- `--worker-name <name>` - Cloudflare Worker name
- `--caching-strategy <strategy>` - Caching strategy
- `--skip-cloudflare-check` - Skip Cloudflare authentication check
- `--skip-backup` - Skip creating backups
- `--dry-run` - Preview changes without applying

**What it does:**

- Detects existing Next.js project
- Adds `wrangler.toml` configuration
- Adds `open-next.config.ts` configuration
- Installs required dependencies (`@opennextjs/cloudflare`, `wrangler`)
- Updates `package.json` scripts (preview, deploy)
- Creates backups of existing files (if any)

#### `config`

Update or reconfigure OpenNext.js Cloudflare settings.

```bash
opennextjs-cli config                        # Interactive update
opennextjs-cli config --worker-name new-name # Update worker name
opennextjs-cli config --caching-strategy r2  # Update caching strategy
opennextjs-cli config --reset                # Reset to defaults
opennextjs-cli config --yes                  # Skip prompts
```

**Options:**

- `-y, --yes` - Skip prompts
- `--worker-name <name>` - Update worker name
- `--caching-strategy <strategy>` - Update caching strategy
- `--reset` - Reset configuration to defaults

**What it updates:**

- `wrangler.toml` (worker name, account ID, environments)
- `open-next.config.ts` (caching strategy, database options, etc.)

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
- Monorepo information (if applicable)

**Output Format:**

- Structured sections using `@clack/prompts`
- Clear visual indicators (✓, ✗, ▲, ■)
- Grouped information for easy reading

#### `validate`

Validate OpenNext.js Cloudflare configuration and check for issues.

```bash
opennextjs-cli validate
opennextjs-cli validate --json               # Output as JSON
```

**Checks:**

- `wrangler.toml` configuration (exists, syntax, required fields)
- `open-next.config.ts` configuration (exists, syntax, exports)
- `package.json` scripts and dependencies
- Cloudflare connection (wrangler CLI, authentication)
- Project structure (Next.js detection, required files)

**Output:**

- ✓ Passing checks (green checkmarks)
- ⚠ Warnings with documentation links (yellow warning icons)
- ✗ Errors with documentation links (red cross marks)
- Fix suggestions for each issue
- Documentation URLs for warnings and errors

**Example Output:**

```bash
⚠  wrangler.toml account_id: wrangler.toml missing account_id
   Fix: Add "account_id = \"your-account-id\"" to wrangler.toml
   📖 Docs: https://developers.cloudflare.com/workers/configuration/configuration-files/#account_id
```

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

**Auto-Fix:**

- With `--fix` flag, automatically fixes issues where possible
- Creates backups before making changes
- Shows what was fixed

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

**Configuration Files:**

- Global: `~/.opennextjs-cli/config.json`
- Project: `.opennextjs-cli.json` (project root)

### Deployment & Development

#### `deploy`

Build and deploy the project to Cloudflare Workers.

```bash
opennextjs-cli deploy
opennextjs-cli deploy --env production      # Deploy to specific environment
opennextjs-cli deploy --env staging        # Deploy to staging
opennextjs-cli deploy --preview            # Deploy as preview
opennextjs-cli deploy --dry-run            # Show what would be deployed
opennextjs-cli deploy --skip-validation   # Skip validation before deploy
```

**Options:**

- `--env <environment>` - Deploy to specific environment (default: production)
- `--preview` - Deploy as preview (not production)
- `--dry-run` - Show deployment plan without deploying
- `--skip-validation` - Skip configuration validation before deployment

**Process:**

1. Validates configuration (unless `--skip-validation`)
2. Builds the project
3. Deploys to Cloudflare Workers
4. Returns deployment URL

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

**What it does:**

- Starts `wrangler dev` server
- Shows preview URL
- Runs until interrupted (Ctrl+C)

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

**What it updates:**

- `@opennextjs/cloudflare` package
- `wrangler` package
- Configuration files if needed

### Environment & Cloudflare

#### `env`

Manage environment variables for Cloudflare Workers.

```bash
opennextjs-cli env setup                   # Interactive setup
opennextjs-cli env validate                # Validate variables
opennextjs-cli env list                    # List all variables
opennextjs-cli env set KEY value           # Set variable
opennextjs-cli env set KEY value --secret  # Set as Cloudflare secret
```

**Subcommands:**

- `env setup` - Interactive environment setup
  - Prompts for Cloudflare Account ID
  - Prompts for API Token (optional, for secrets)
  - Creates `.env.example` file
  - Updates `wrangler.toml` with account ID
- `env validate` - Validate environment variables
  - Checks for required variables
  - Validates format
  - Shows missing variables
- `env list` - List all environment variables
  - Shows variables from `.env` files
  - Shows variables from `wrangler.toml`
  - Shows Cloudflare secrets (if authenticated)
- `env set <key> <value>` - Set an environment variable
  - `--secret` - Set as Cloudflare secret (production)

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
  - Opens browser for OAuth login
  - Stores credentials locally
- `cloudflare verify` - Verify current authentication
  - Checks if authenticated
  - Shows account information
  - Verifies account ID in `wrangler.toml`
- `cloudflare account` - Show account information
  - Displays account details
  - Shows account ID
- `cloudflare logout` - Clear authentication
  - Removes stored credentials

### Advanced Commands

#### `migrate`

Migrate from Vercel or Netlify to OpenNext.js Cloudflare.

```bash
opennextjs-cli migrate                     # Auto-detect platform
opennextjs-cli migrate --from vercel       # Migrate from Vercel
opennextjs-cli migrate --from netlify      # Migrate from Netlify
opennextjs-cli migrate --dry-run           # Preview migration
```

**Options:**

- `--from <platform>` - Source platform: vercel or netlify (auto-detected if not specified)
- `--dry-run` - Preview migration without making changes

**What it does:**

1. Detects source platform (Vercel/Netlify) or uses `--from` flag
2. Reads existing configuration files (`vercel.json`, `netlify.toml`)
3. Converts configuration to OpenNext.js Cloudflare format
4. Migrates environment variables
5. Updates package.json scripts
6. Generates migration report
7. Creates backups of original files

**Migration Process:**

- Converts `vercel.json` → `wrangler.toml` + `open-next.config.ts`
- Converts `netlify.toml` → `wrangler.toml` + `open-next.config.ts`
- Migrates environment variables
- Updates deployment scripts
- Creates backup of original files

**Note:** Some features may require manual configuration (redirect rules, header rules, custom rewrites).

#### `mcp setup`

Set up MCP server configuration for AI tools (Cursor, Claude Desktop).

```bash
opennextjs-cli mcp setup
```

**What it does:**

- Detects MCP configuration file location
- Adds `@jsonbored/opennextjs-mcp` server configuration
- Verifies the setup
- Provides instructions for restarting AI tool

**Configuration Files:**

- Cursor: `~/.cursor/mcp.json`
- Claude Desktop: `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS)

#### `completion`

Generate shell completion scripts for bash, zsh, and fish.

```bash
opennextjs-cli completion bash             # Generate bash completion
opennextjs-cli completion zsh              # Generate zsh completion
opennextjs-cli completion fish             # Generate fish completion
```

**Usage:**

```bash
# Bash
opennextjs-cli completion bash > ~/.bash_completion.d/opennextjs-cli
source ~/.bash_completion.d/opennextjs-cli

# Zsh
opennextjs-cli completion zsh > ~/.zsh/completions/_opennextjs-cli
# Add to ~/.zshrc: fpath=(~/.zsh/completions $fpath)

# Fish
opennextjs-cli completion fish > ~/.config/fish/completions/opennextjs-cli.fish
```

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

### Configuration Files

#### `wrangler.toml`

Cloudflare Workers configuration file:

```toml
name = "my-worker"
account_id = "your-account-id"
compatibility_date = "2024-01-01"

[env.production]
account_id = "prod-account-id"

[env.staging]
account_id = "staging-account-id"
```

#### `open-next.config.ts`

OpenNext.js Cloudflare configuration:

```typescript
export default {
  adapter: 'cloudflare',
  cachingStrategy: 'r2',
  // ... other options
};
```

## Caching Strategies

The CLI supports multiple caching strategies for different use cases:

| Strategy                | Description                               | Use Case                        |
| ----------------------- | ----------------------------------------- | ------------------------------- |
| `static-assets`         | SSG-only, no R2 needed                    | Simple static sites             |
| `r2`                    | R2 Incremental Cache                      | Most Next.js apps (recommended) |
| `r2-do-queue`           | ISR with time-based revalidation          | Dynamic content with ISR        |
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

**How it works:**

- Detects monorepo root automatically
- Finds Next.js projects within workspaces
- Detects Cloudflare Workers in monorepo
- Works correctly from any directory within monorepo

**Example:**

```bash
# From monorepo root
cd my-monorepo
onjs status  # Detects Next.js project in packages/web

# From workspace package
cd my-monorepo/packages/web
onjs status  # Works correctly
```

## Package Exports

This package exports utilities for use by other packages (e.g., MCP server):

```typescript
import { detectNextJsProject } from '@jsonbored/opennextjs-cli/utils';
import { validateConfiguration } from '@jsonbored/opennextjs-cli/utils';
import { readWranglerToml } from '@jsonbored/opennextjs-cli/utils';
import { detectProjectRoot } from '@jsonbored/opennextjs-cli/utils';
```

**Available Exports:**

- `./utils` - Utility functions (project detection, validation, config reading)
- `./schemas` - Zod schemas for configuration validation
- `./platforms/cloudflare` - Cloudflare platform utilities

**Key Utilities:**

- `detectNextJsProject()` - Detect Next.js projects
- `detectProjectRoot()` - Detect project root (monorepo-aware)
- `validateConfiguration()` - Validate OpenNext.js configuration
- `readWranglerToml()` - Read wrangler.toml
- `readOpenNextConfig()` - Read open-next.config.ts
- `readPackageJson()` - Read package.json
- `extractWorkerName()` - Extract worker name from wrangler.toml
- `extractAccountId()` - Extract account ID from wrangler.toml
- `extractEnvironments()` - Extract environments from wrangler.toml

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

### Migration from Vercel

```bash
# Auto-detect and migrate
opennextjs-cli migrate

# Or specify platform
opennextjs-cli migrate --from vercel

# Preview first
opennextjs-cli migrate --dry-run
```

### Health Diagnostics

```bash
# Run health checks
opennextjs-cli doctor

# Auto-fix issues
opennextjs-cli doctor --fix
```

### Environment Variables

```bash
# Interactive setup
opennextjs-cli env setup

# List all variables
opennextjs-cli env list

# Set variable
opennextjs-cli env set DATABASE_URL "postgres://..."

# Set as Cloudflare secret
opennextjs-cli env set API_KEY "secret" --secret
```

## Troubleshooting

### Common Issues

**"No Next.js project detected"**

- Ensure you're in a Next.js project directory
- Check that `package.json` exists and has `next` dependency
- In monorepos, ensure you're in the correct workspace

**"Version mismatch"**

- Ensure Node.js version is 18+
- Check with: `node --version`

**"Cloudflare authentication failed"**

- Run: `opennextjs-cli cloudflare login`
- Or: `wrangler login`

**"Package manager not detected"**

- Install pnpm: `npm install -g pnpm`
- Or use npm/yarn/bun

**"Monorepo detection failed"**

- Ensure `pnpm-workspace.yaml` or `package.json` workspaces is configured
- Try running from monorepo root

**"Validation warnings/errors"**

- Check the documentation links provided in warnings
- Run `opennextjs-cli doctor --fix` to auto-fix issues
- Review the fix suggestions in the output

### Getting Help

```bash
# Get help for any command
opennextjs-cli --help
opennextjs-cli <command> --help

# Run diagnostics
opennextjs-cli doctor
opennextjs-cli doctor --fix

# Check status
opennextjs-cli status

# Validate configuration
opennextjs-cli validate
```

## Requirements

- **Node.js** 18.0.0 or higher
- **pnpm** 8.0.0+ (recommended) or npm/yarn/bun
- **Cloudflare Account** (for deployment)
- **Wrangler CLI** (installed automatically)

## Related

- **[Main Repository](https://github.com/JSONbored/opennextjs-cli)** - Full project documentation
- **[MCP Server Package](../opennextjs-mcp/README.md)** - AI integration package
- **[OpenNext.js](https://opennext.js.org/)** - Core adapter documentation
- **[Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)** - Cloudflare documentation

## License

MIT License - see [LICENSE](../../LICENSE) file for details.

---

<div align="center">

Made with ❤️ by [JSONbored](https://github.com/JSONbored)

[⭐ Star on GitHub](https://github.com/JSONbored/opennextjs-cli) • [📦 npm](https://www.npmjs.com/package/@jsonbored/opennextjs-cli)

</div>
