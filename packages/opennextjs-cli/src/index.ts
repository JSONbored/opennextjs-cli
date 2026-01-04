#!/usr/bin/env node

/**
 * OpenNext.js CLI - Main Entry Point
 *
 * Interactive CLI/TUI tool for setting up and configuring OpenNext.js projects
 * for Cloudflare Workers deployments.
 *
 * @packageDocumentation
 */

import { program } from './cli.js';

// Execute CLI
program.parse(process.argv);
