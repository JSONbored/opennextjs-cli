# OpenNext.js CLI

> Interactive CLI/TUI tool for setting up and configuring OpenNext.js projects for Cloudflare Workers

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Overview

`opennextjs-cli` is an interactive command-line tool that guides you through setting up and configuring OpenNext.js for Cloudflare Workers deployments. Similar to `create-next-app` or `next-forge`, it automates the setup process with step-by-step prompts, making it easy to get started with OpenNext.js Cloudflare.

## Features

- 🚀 **Interactive Setup Wizard** - Step-by-step prompts for configuration
- ⚙️ **Automatic Configuration** - Generates `open-next.config.ts`, `wrangler.toml`, and more
- 🔧 **Smart Defaults** - Best practices built-in
- 📦 **Dependency Management** - Automatically installs required packages
- 🛡️ **Type-Safe** - Full TypeScript support with Zod validation
- 🎯 **Next.js Version Support** - Official support for Next.js 15.x, experimental for 16.x

## Quick Start

```bash
# Install globally
npm install -g opennextjs-cli

# Initialize a new project
opennextjs-cli init my-project

# Add OpenNext to existing project
opennextjs-cli add
```

## Installation

```bash
npm install -g opennextjs-cli
# or
pnpm add -g opennextjs-cli
# or
yarn global add opennextjs-cli
```

## Usage

### Initialize New Project

```bash
opennextjs-cli init <project-name>
```

This will:
- Create a new Next.js project
- Configure OpenNext.js for Cloudflare
- Set up all necessary configuration files
- Install dependencies

### Add to Existing Project

```bash
cd your-existing-project
opennextjs-cli add
```

This will:
- Detect your existing Next.js project
- Add OpenNext.js configuration
- Update your `package.json` with necessary scripts
- Install required dependencies

## Configuration Options

The CLI guides you through:

- **Caching Strategy**: Static Assets, R2, R2 + Durable Objects
- **Database Integration**: Hyperdrive, D1, or none
- **Observability**: Logs, traces, and sampling rates
- **Environments**: Development and production configurations
- **Next.js Version**: 15.x (official) or 16.x (experimental)

## Credits

This tool is built for and powered by [OpenNext.js](https://opennext.js.org/), 
an amazing project that makes deploying Next.js to various platforms possible.

- **OpenNext.js Cloudflare**: https://github.com/opennextjs/opennextjs-cloudflare
- **Official Documentation**: https://opennext.js.org/cloudflare
- **Package**: `@opennextjs/cloudflare` on npm

> **Note:** This is an unofficial community tool. It is not affiliated with or endorsed by the OpenNext.js team.

## License

MIT License - see [LICENSE](LICENSE) file for details.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## Support

- 📖 [Documentation](https://opennextjs-cli.dev) (coming soon)
- 🐛 [Report Issues](https://github.com/JSONbored/opennextjs-cli/issues)
- 💬 [Discussions](https://github.com/JSONbored/opennextjs-cli/discussions)
