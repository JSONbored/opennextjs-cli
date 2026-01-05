#!/usr/bin/env tsx

/**
 * Generate Package-Specific Changelog
 *
 * Generates changelog for a specific package using git-cliff's standard workflow.
 * Each package gets its own CHANGELOG.md file.
 *
 * This follows git-cliff's intended workflow:
 * 1. Tags must exist in git (v0.1.0, v0.2.0, etc.)
 * 2. Use --include-path to filter commits for the package
 * 3. Let git-cliff handle structure, statistics, formatting automatically
 * 4. Write directly to package's CHANGELOG.md
 *
 * Usage:
 *   pnpm changelog:package <package-name> [--tag <tag>] [--unreleased]
 *
 * Examples:
 *   pnpm changelog:package opennextjs-cli --tag v0.1.0
 *   pnpm changelog:package opennextjs-mcp --unreleased
 */

import { execSync } from 'node:child_process';
import {
  readFileSync,
  writeFileSync,
  existsSync,
  openSync,
  closeSync,
  ftruncateSync,
  readSync,
  writeSync,
  constants,
} from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = join(__dirname, '..');

interface GenerateOptions {
  packageName: string;
  tag?: string;
  unreleased?: boolean;
}

function parseArgs(): GenerateOptions {
  const args = process.argv.slice(2);
  const packageName = args[0];

  if (!packageName) {
    console.error('❌ Error: Package name is required');
    console.error('\nUsage: pnpm changelog:package <package-name> [--tag <tag>] [--unreleased]');
    process.exit(1);
  }

  const options: GenerateOptions = { packageName };

  for (let i = 1; i < args.length; i++) {
    if (args[i] === '--tag' && args[i + 1]) {
      options.tag = args[i + 1];
      i++;
    } else if (args[i] === '--unreleased') {
      options.unreleased = true;
    }
  }

  return options;
}

function generateChangelog(options: GenerateOptions): void {
  const { packageName, tag, unreleased } = options;
  const packagePath = join(ROOT, 'packages', packageName);
  const changelogPath = join(packagePath, 'CHANGELOG.md');

  // Verify package exists
  if (!existsSync(packagePath)) {
    console.error(`❌ Error: Package '${packageName}' not found at ${packagePath}`);
    process.exit(1);
  }

  // Determine git-cliff flags
  let gitCliffFlags = '';
  if (unreleased) {
    gitCliffFlags = '--unreleased';
  } else if (tag) {
    // Verify tag exists
    try {
      execSync(`git rev-parse ${tag}`, { cwd: ROOT, stdio: 'ignore' });
      gitCliffFlags = `--tag ${tag} --latest`;
    } catch {
      console.error(`❌ Error: Tag '${tag}' does not exist in git`);
      console.error('   Create the tag first: git tag v0.1.0');
      process.exit(1);
    }
  } else {
    // Default: use latest tag
    try {
      const latestTag = execSync('git describe --tags --abbrev=0', {
        cwd: ROOT,
        encoding: 'utf8',
      }).trim();
      gitCliffFlags = `--tag ${latestTag} --latest`;
      console.log(`📝 Using latest tag: ${latestTag}`);
    } catch {
      console.error('❌ Error: No tags found in repository');
      console.error('   Use --unreleased for first release or create a tag first');
      process.exit(1);
    }
  }

  // Exclude paths that shouldn't appear in changelog
  const excludePaths = [
    '**/*.md',
    '**/.github/**',
    '**/.cursor/**',
    '**/node_modules/**',
    '**/dist/**',
    '**/.git/**',
  ]
    .map((path) => `--exclude-path "${path}"`)
    .join(' ');

  console.log(`📝 Generating changelog for ${packageName}...`);
  console.log(`   Using: ${gitCliffFlags}`);

  try {
    // Generate changelog using git-cliff
    // Use --include-path to filter commits for this package only
    const output = execSync(
      `git-cliff --config cliff.toml --include-path "packages/${packageName}/**" ${excludePaths} ${gitCliffFlags} --output -`,
      { cwd: ROOT, encoding: 'utf8', stdio: ['pipe', 'pipe', 'inherit'] }
    );

    // git-cliff outputs the full changelog (header + body + footer)
    // We need to prepend it to the existing changelog
    prependToChangelog(changelogPath, output.trim());

    console.log(`✅ Changelog generated: ${changelogPath}`);
  } catch (error) {
    console.error(`❌ Failed to generate changelog for ${packageName}:`, error);
    process.exit(1);
  }
}

/**
 * Prepends a new changelog entry to the package's CHANGELOG.md file.
 *
 * This follows the same pattern as claudepro-directory:
 * - Removes header from git-cliff output (we already have one)
 * - Inserts entry after the `# Changelog` header
 * - Maintains proper formatting
 */
function prependToChangelog(changelogPath: string, newEntry: string): void {
  // Remove header from git-cliff output (we already have one)
  const entryWithoutHeader = newEntry.replace(/^#\s+Changelog\s*\n/, '');

  // Open file with file descriptor to avoid race conditions
  const fd = openSync(changelogPath, constants.O_CREAT | constants.O_RDWR, 0o644);

  try {
    // Read existing content
    let existingContent = '';
    try {
      const buffer = Buffer.alloc(65536); // 64KB buffer
      const bytesRead = readSync(fd, buffer, 0, buffer.length, 0);
      existingContent = buffer.toString('utf8', 0, bytesRead);
    } catch {
      // File is empty or doesn't exist yet
    }

    // Ensure we have a header
    if (!existingContent.trim() || !existingContent.includes('# Changelog')) {
      existingContent = `# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

`;
    }

    // Find where to insert (after the main header)
    const lines = existingContent.split('\n');
    const headerIndex = lines.findIndex((line) => line.startsWith('# Changelog'));

    let newContent: string;
    if (headerIndex === -1) {
      // No header found, prepend everything
      newContent = `# Changelog\n\n${entryWithoutHeader}\n${existingContent}`;
    } else {
      // Find end of header (first ## or empty line after header)
      let insertIndex = headerIndex + 1;
      for (let i = headerIndex + 1; i < lines.length; i++) {
        if (lines[i].startsWith('## ')) {
          insertIndex = i;
          break;
        }
        if (lines[i].trim() === '' && i > headerIndex + 3) {
          insertIndex = i + 1;
          break;
        }
      }

      // Insert after header
      lines.splice(insertIndex, 0, entryWithoutHeader);
      newContent = lines.join('\n');
    }

    // Truncate file to 0 before writing
    ftruncateSync(fd, 0);
    // Write using file descriptor
    const buffer = Buffer.from(newContent, 'utf8');
    writeSync(fd, buffer, 0, buffer.length, 0);
  } catch (error) {
    console.error('❌ Error writing to CHANGELOG.md:', error);
    throw error;
  } finally {
    // Always close file descriptor
    closeSync(fd);
  }
}

try {
  const options = parseArgs();
  generateChangelog(options);
} catch (error) {
  console.error('❌ Failed to generate changelog:', error);
  process.exit(1);
}
