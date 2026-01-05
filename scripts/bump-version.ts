/**
 * Version Bump Script for OpenNext.js Packages
 *
 * Command-line tool for bumping versions in both CLI and MCP package.json files
 * following semantic versioning. Both packages are kept in sync.
 * This script is used by the release workflow and can also be run manually.
 *
 * **Semantic Versioning Rules:**
 * - **Major** (1.0.0 → 2.0.0): Breaking changes, major redesigns, architecture changes
 * - **Minor** (1.0.0 → 1.1.0): New features, new functionality, significant improvements
 * - **Patch** (1.0.0 → 1.0.1): Bug fixes, small improvements, documentation updates
 *
 * **Usage:**
 * ```bash
 * tsx scripts/bump-version.ts [major|minor|patch]
 * ```
 *
 * **Examples:**
 * ```bash
 * # Bump minor version (0.1.0 → 0.2.0) for both packages
 * tsx scripts/bump-version.ts minor
 *
 * # Bump patch version (0.1.0 → 0.1.1) for both packages
 * tsx scripts/bump-version.ts patch
 *
 * # Bump major version (1.0.0 → 2.0.0) for both packages
 * tsx scripts/bump-version.ts major
 * ```
 *
 * **What it does:**
 * 1. Reads current version from `packages/opennextjs-cli/package.json`
 * 2. Increments version based on bump type
 * 3. Updates both `packages/opennextjs-cli/package.json` and `packages/opennextjs-mcp/package.json`
 * 4. Updates MCP's dependency on CLI to match new version
 * 5. Outputs new version to console
 *
 * **Exit codes:**
 * - `0` - Success
 * - `1` - Error (invalid type, file read/write error)
 *
 * @see {@link https://semver.org/ | Semantic Versioning Specification}
 */

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

// Get the repository root (where this script is located)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const REPO_ROOT = join(__dirname, '..');
const CLI_PACKAGE_JSON_PATH = join(REPO_ROOT, 'packages/opennextjs-cli/package.json');
const MCP_PACKAGE_JSON_PATH = join(REPO_ROOT, 'packages/opennextjs-mcp/package.json');

/**
 * Bumps the version in both CLI and MCP package.json files following semantic versioning.
 *
 * Reads the current version from CLI package.json, increments it based on the provided
 * type (major, minor, or patch), and updates both packages to the new version.
 * Also updates MCP's dependency on CLI to match the new version.
 *
 * **Version Increment Logic:**
 * - `major`: Increments major version, resets minor and patch to 0 (1.2.3 → 2.0.0)
 * - `minor`: Increments minor version, resets patch to 0 (1.2.3 → 1.3.0)
 * - `patch`: Increments patch version (1.2.3 → 1.2.4)
 *
 * @param type - The type of version bump: 'major', 'minor', or 'patch'
 * @returns The new version string (e.g., "1.2.3")
 * @throws {Error} If package.json cannot be read or written
 *
 * @example
 * ```typescript
 * const newVersion = bumpVersion('minor'); // "0.1.0" → "0.2.0"
 * console.log(newVersion); // "0.2.0"
 * ```
 */
function bumpVersion(type: 'major' | 'minor' | 'patch'): string {
  // Read CLI package.json to get current version
  const cliPackageJson = JSON.parse(readFileSync(CLI_PACKAGE_JSON_PATH, 'utf8'));
  const [major, minor, patch] = cliPackageJson.version.split('.').map(Number);

  // Calculate new version
  let newVersion: string;
  if (type === 'major') {
    newVersion = `${major + 1}.0.0`;
  } else if (type === 'minor') {
    newVersion = `${major}.${minor + 1}.0`;
  } else {
    newVersion = `${major}.${minor}.${patch + 1}`;
  }

  // Update CLI package.json
  cliPackageJson.version = newVersion;
  writeFileSync(CLI_PACKAGE_JSON_PATH, JSON.stringify(cliPackageJson, null, 2) + '\n');

  // Update MCP package.json
  const mcpPackageJson = JSON.parse(readFileSync(MCP_PACKAGE_JSON_PATH, 'utf8'));
  mcpPackageJson.version = newVersion;

  // Update MCP's dependency on CLI to match new version
  if (mcpPackageJson.dependencies && mcpPackageJson.dependencies['@jsonbored/opennextjs-cli']) {
    // Use caret to allow patch updates
    mcpPackageJson.dependencies['@jsonbored/opennextjs-cli'] = `^${newVersion}`;
  }

  writeFileSync(MCP_PACKAGE_JSON_PATH, JSON.stringify(mcpPackageJson, null, 2) + '\n');

  return newVersion;
}

const args = process.argv.slice(2);
const type = args[0] as 'major' | 'minor' | 'patch';

if (!['major', 'minor', 'patch'].includes(type)) {
  console.error('❌ Invalid version type. Use: major, minor, or patch');
  console.error('\nUsage: tsx scripts/bump-version.ts [major|minor|patch]\n');
  process.exit(1);
}

try {
  const newVersion = bumpVersion(type);
  console.log(`✅ Version bumped to ${newVersion}`);
  process.exit(0);
} catch (error) {
  console.error('❌ Failed to bump version:', error);
  process.exit(1);
}
