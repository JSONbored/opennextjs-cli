/**
 * Generate Changelog for OpenNext.js CLI and MCP Packages
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

  // Check if tag exists
  let tagExists = false;
  try {
    execSync(`git rev-parse ${tag}`, { cwd: ROOT, stdio: 'ignore' });
    tagExists = true;
  } catch {
    tagExists = false;
  }

  const cliChangelogPath = join(TEMP_DIR, 'cli-changelog.md');
  const mcpChangelogPath = join(TEMP_DIR, 'mcp-changelog.md');

  // Determine git-cliff flags:
  // - If tag exists: use --tag to get commits up to that tag
  // - If tag doesn't exist: use --unreleased to get all commits (for first release)
  const gitCliffFlags = tagExists
    ? `--tag ${tag} --latest` // Tag exists: get commits up to this tag
    : `--unreleased`; // Tag doesn't exist: get all unreleased commits

  // Exclude paths that shouldn't appear in changelog (docs-only changes, etc.)
  const excludePaths = [
    '**/*.md', // Exclude README/docs-only changes
    '**/.github/**', // Exclude GitHub workflow changes
    '**/.cursor/**', // Exclude Cursor config changes
    '**/node_modules/**', // Exclude node_modules
    '**/dist/**', // Exclude build outputs
    '**/.git/**', // Exclude git files
  ]
    .map((path) => `--exclude-path "${path}"`)
    .join(' ');

  try {
    // Generate CLI section
    console.log(`  → Generating CLI section (${tagExists ? 'tag exists' : 'unreleased'})...`);
    execSync(
      `git-cliff --config cliff.toml --include-path "packages/opennextjs-cli/**" ${excludePaths} ${gitCliffFlags} --output "${cliChangelogPath}"`,
      { cwd: ROOT, stdio: 'inherit' }
    );
  } catch (error) {
    console.warn('  ⚠️  CLI changelog generation failed, continuing...');
  }

  try {
    // Generate MCP section
    console.log(`  → Generating MCP section (${tagExists ? 'tag exists' : 'unreleased'})...`);
    execSync(
      `git-cliff --config cliff.toml --include-path "packages/opennextjs-mcp/**" ${excludePaths} ${gitCliffFlags} --output "${mcpChangelogPath}"`,
      { cwd: ROOT, stdio: 'inherit' }
    );
  } catch (error) {
    console.warn('  ⚠️  MCP changelog generation failed, continuing...');
  }

  // Read generated sections
  const cliContent = existsSync(cliChangelogPath) ? readFileSync(cliChangelogPath, 'utf8') : '';
  const mcpContent = existsSync(mcpChangelogPath) ? readFileSync(mcpChangelogPath, 'utf8') : '';

  // Cleanup temp files
  try {
    rmSync(TEMP_DIR, { recursive: true, force: true });
  } catch {
    // Ignore cleanup errors
  }

  // Extract body from CLI section
  // Handle both cases: versioned release (## [0.1.0]) or unreleased (## [Unreleased])
  let cliBody = '';
  if (cliContent) {
    const lines = cliContent.split('\n');
    // Look for either version header or Unreleased header
    const versionIndex = lines.findIndex(
      (line) => line.startsWith(`## [${version}]`) || line.startsWith('## [Unreleased]')
    );
    if (versionIndex !== -1) {
      // Find the end: next version header, footer marker, or end of file
      let endIndex = lines.length;
      for (let i = versionIndex + 1; i < lines.length; i++) {
        if (
          (lines[i].startsWith('## [') && !lines[i].startsWith('## [Unreleased]')) ||
          lines[i].startsWith('<!-- generated')
        ) {
          endIndex = i;
          break;
        }
      }
      // Extract body (skip header line, get everything up to end)
      const bodyLines = lines.slice(versionIndex + 1, endIndex);
      // Remove trailing empty lines and trim
      while (bodyLines.length > 0 && !bodyLines[bodyLines.length - 1].trim()) {
        bodyLines.pop();
      }
      cliBody = bodyLines.join('\n').trim();
    }
  }

  // Extract body from MCP section (same logic)
  let mcpBody = '';
  if (mcpContent) {
    const lines = mcpContent.split('\n');
    const versionIndex = lines.findIndex(
      (line) => line.startsWith(`## [${version}]`) || line.startsWith('## [Unreleased]')
    );
    if (versionIndex !== -1) {
      let endIndex = lines.length;
      for (let i = versionIndex + 1; i < lines.length; i++) {
        if (
          (lines[i].startsWith('## [') && !lines[i].startsWith('## [Unreleased]')) ||
          lines[i].startsWith('<!-- generated')
        ) {
          endIndex = i;
          break;
        }
      }
      const bodyLines = lines.slice(versionIndex + 1, endIndex);
      while (bodyLines.length > 0 && !bodyLines[bodyLines.length - 1].trim()) {
        bodyLines.pop();
      }
      mcpBody = bodyLines.join('\n').trim();
    }
  }

  // Extract statistics from full repository changelog (not package-specific)
  // Statistics are release-level, so we need to generate them from the full repo
  // Only generate statistics if we have a tag (statistics not available for --unreleased)
  let statisticsSection = '';
  if (tagExists) {
    try {
      const fullChangelogPath = join(TEMP_DIR, 'full-changelog.md');
      // Generate full changelog without --include-path to get release-level statistics
      // Use --tag since we know tag exists
      const statsFlags = `--tag ${tag} --latest`;
      execSync(
        `git-cliff --config cliff.toml ${excludePaths} ${statsFlags} --output "${fullChangelogPath}"`,
        { cwd: ROOT, stdio: 'ignore' }
      );

      if (existsSync(fullChangelogPath)) {
        const fullContent = readFileSync(fullChangelogPath, 'utf8');
        const lines = fullContent.split('\n');

        // Look for statistics section - it should be after the version header
        const versionHeaderIndex = lines.findIndex((line) => line.startsWith(`## [${version}]`));

        if (versionHeaderIndex !== -1) {
          // Search for Statistics section after the version header
          const statsStartIndex = lines.findIndex(
            (line, idx) => idx > versionHeaderIndex && line.trim() === '### Statistics'
          );

          if (statsStartIndex !== -1) {
            // Find the end of statistics section (next ### or ## or footer or link)
            let statsEndIndex = lines.length;
            for (let i = statsStartIndex + 1; i < lines.length; i++) {
              const line = lines[i];
              if (
                line.startsWith('### ') ||
                (line.startsWith('## [') && !line.startsWith('## [Unreleased]')) ||
                line.startsWith('<!-- generated') ||
                (line.startsWith('[') && line.includes(']:'))
              ) {
                statsEndIndex = i;
                break;
              }
            }
            const statsLines = lines.slice(statsStartIndex, statsEndIndex);
            statisticsSection = statsLines.join('\n').trim();
            if (statisticsSection) {
              statisticsSection = '\n' + statisticsSection + '\n';
            }
          }
        }
      }
    } catch (error) {
      // Statistics extraction failed, continue without them (silently)
    }
  }

  // Build new changelog section
  // Only create versioned section if tag exists; otherwise use [Unreleased]
  let newSection = '';
  if (tagExists) {
    // Tag exists: create versioned section
    newSection = `## [${version}] - ${date}\n\n`;

    if (cliBody) {
      newSection += `### @jsonbored/opennextjs-cli\n\n${cliBody}\n\n`;
    }

    if (mcpBody) {
      newSection += `### @jsonbored/opennextjs-mcp\n\n${mcpBody}\n\n`;
    }

    if (!cliBody && !mcpBody) {
      newSection += `Initial release of OpenNext.js CLI and MCP server packages.\n\n`;
    }

    // Add statistics section at the end of the release (release-level, not package-specific)
    if (statisticsSection) {
      newSection += statisticsSection + '\n';
    }
  } else {
    // Tag doesn't exist: create [Unreleased] section
    newSection = `## [Unreleased]\n\n`;

    if (cliBody) {
      newSection += `### @jsonbored/opennextjs-cli\n\n${cliBody}\n\n`;
    } else {
      newSection += `### @jsonbored/opennextjs-cli\n\n_No unreleased changes yet._\n\n`;
    }

    if (mcpBody) {
      newSection += `### @jsonbored/opennextjs-mcp\n\n${mcpBody}\n\n`;
    } else {
      newSection += `### @jsonbored/opennextjs-mcp\n\n_No unreleased changes yet._\n\n`;
    }

    // Statistics not available for unreleased sections
  }

  // Read existing changelog or create header
  const changelogPath = join(ROOT, 'CHANGELOG.md');
  const header = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;

  // Always include [Unreleased] section at the top (per Keep a Changelog format)
  const unreleasedSection = `## [Unreleased]

### @jsonbored/opennextjs-cli

_No unreleased changes yet._

### @jsonbored/opennextjs-mcp

_No unreleased changes yet._

`;

  let existingContent = '';
  let existingSections = '';

  if (existsSync(changelogPath)) {
    const fullContent = readFileSync(changelogPath, 'utf8');

    // Extract header (everything before first ## [)
    const versionMatch = fullContent.match(/^(.*?)(## \[)/s);
    if (versionMatch) {
      // Keep only the standard header
      existingContent = header;
      // Extract all sections (everything after header)
      existingSections = fullContent.substring(versionMatch[1].length);
    } else {
      // No version sections yet, just use header
      existingContent = header;
      existingSections = '';
    }

    // Remove any existing entry for this version (only if tag exists)
    if (tagExists) {
      const versionPattern = new RegExp(
        `## \\[${version.replace(/\./g, '\\.')}\\][^]*?(?=## \\[|<!-- generated|$)`,
        'g'
      );
      existingSections = existingSections.replace(versionPattern, '');
    }

    // Remove existing [Unreleased] section if present (we'll add it fresh)
    const unreleasedPattern = /## \[Unreleased\][^]*?(?=## \[|<!-- generated|$)/s;
    existingSections = existingSections.replace(unreleasedPattern, '');

    // Clean up multiple consecutive newlines (max 2)
    existingSections = existingSections.replace(/\n{3,}/g, '\n\n');
  } else {
    existingContent = header;
    existingSections = '';
  }

  // Combine sections based on whether tag exists
  let finalContent = '';
  if (tagExists) {
    // Tag exists: header + [Unreleased] + new versioned section + existing sections
    finalContent = existingContent + unreleasedSection + newSection + existingSections;
  } else {
    // Tag doesn't exist: header + new [Unreleased] section + existing sections
    // (newSection is already [Unreleased] in this case)
    finalContent = existingContent + newSection + existingSections;
  }

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
