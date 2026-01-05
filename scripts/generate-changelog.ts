#!/usr/bin/env tsx

/**
 * Generate Package-Specific Changelog
 *
 * Generates changelog with separate sections for CLI and MCP packages.
 * Uses git-cliff with --include-path to filter commits by package.
 *
 * Usage:
 *   pnpm changelog:generate [version]
 *
 * Examples:
 *   pnpm changelog:generate          # Generate for current version
 *   pnpm changelog:generate 0.1.0    # Generate for specific version
 */

import { execSync } from 'node:child_process';
import { readFileSync, writeFileSync, existsSync, mkdtempSync, rmSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { tmpdir } from 'node:os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');
const TEMP_DIR = mkdtempSync(join(tmpdir(), 'changelog-'));

function getVersion(): string {
  const version = process.argv[2];
  if (version) {
    return version;
  }
  
  // Read from CLI package.json
  const cliPackageJson = JSON.parse(
    readFileSync(join(ROOT, 'packages/opennextjs-cli/package.json'), 'utf8')
  );
  return cliPackageJson.version;
}

function generateChangelog(version: string): void {
  const tag = `v${version}`;
  const date = new Date().toISOString().split('T')[0];
  
  console.log(`📝 Generating changelog for ${tag}...`);
  
  const cliChangelogPath = join(TEMP_DIR, 'cli-changelog.md');
  const mcpChangelogPath = join(TEMP_DIR, 'mcp-changelog.md');
  
  try {
    // Generate CLI section
    console.log('  → Generating CLI section...');
    execSync(
      `git-cliff --config cliff.toml --include-path "packages/opennextjs-cli/**" --tag ${tag} --latest --unreleased --output "${cliChangelogPath}"`,
      { cwd: ROOT, stdio: 'inherit' }
    );
  } catch (error) {
    console.warn('  ⚠️  CLI changelog generation failed, continuing...');
  }
  
  try {
    // Generate MCP section
    console.log('  → Generating MCP section...');
    execSync(
      `git-cliff --config cliff.toml --include-path "packages/opennextjs-mcp/**" --tag ${tag} --latest --unreleased --output "${mcpChangelogPath}"`,
      { cwd: ROOT, stdio: 'inherit' }
    );
  } catch (error) {
    console.warn('  ⚠️  MCP changelog generation failed, continuing...');
  }
  
  // Read generated sections
  const cliContent = existsSync(cliChangelogPath)
    ? readFileSync(cliChangelogPath, 'utf8')
    : '';
  const mcpContent = existsSync(mcpChangelogPath)
    ? readFileSync(mcpChangelogPath, 'utf8')
    : '';
  
  // Cleanup temp files
  try {
    rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }
  
  // Extract body from CLI section (skip header and version line)
  let cliBody = '';
  if (cliContent) {
    const lines = cliContent.split('\n');
    const versionIndex = lines.findIndex(line => line.startsWith(`## [${version}]`));
    if (versionIndex !== -1) {
      const bodyLines = lines.slice(versionIndex + 1);
      const nextVersionIndex = bodyLines.findIndex(line => line.startsWith('## ['));
      cliBody = bodyLines
        .slice(0, nextVersionIndex === -1 ? undefined : nextVersionIndex)
        .join('\n')
        .trim();
    }
  }
  
  // Extract body from MCP section (skip header and version line)
  let mcpBody = '';
  if (mcpContent) {
    const lines = mcpContent.split('\n');
    const versionIndex = lines.findIndex(line => line.startsWith(`## [${version}]`));
    if (versionIndex !== -1) {
      const bodyLines = lines.slice(versionIndex + 1);
      const nextVersionIndex = bodyLines.findIndex(line => line.startsWith('## ['));
      mcpBody = bodyLines
        .slice(0, nextVersionIndex === -1 ? undefined : nextVersionIndex)
        .join('\n')
        .trim();
    }
  }
  
  // Build new changelog section
  let newSection = `## [${version}] - ${date}\n\n`;
  
  if (cliBody) {
    newSection += `### @jsonbored/opennextjs-cli\n\n${cliBody}\n\n`;
  }
  
  if (mcpBody) {
    newSection += `### @jsonbored/opennextjs-mcp\n\n${mcpBody}\n\n`;
  }
  
  if (!cliBody && !mcpBody) {
    newSection += `Initial release of OpenNext.js CLI and MCP server packages.\n\n`;
  }
  
  // Read existing changelog or create header
  const changelogPath = join(ROOT, 'CHANGELOG.md');
  let existingContent = '';
  
  if (existsSync(changelogPath)) {
    existingContent = readFileSync(changelogPath, 'utf8');
  } else {
    existingContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
  }
  
  // Prepend new section
  const updatedContent = existingContent.replace(
    /^# Changelog\n\n.*?\n\n/,
    (match) => match + newSection
  );
  
  // If no replacement happened, prepend to beginning
  const finalContent = updatedContent === existingContent
    ? existingContent + newSection
    : updatedContent;
  
  writeFileSync(changelogPath, finalContent);
  console.log(`✅ Changelog generated: ${changelogPath}`);
}

try {
  const version = getVersion();
  generateChangelog(version);
} catch (error) {
  console.error('❌ Failed to generate changelog:', error);
  process.exit(1);
}
