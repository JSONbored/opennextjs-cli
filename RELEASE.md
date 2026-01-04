# Release Process

This document explains how to release new versions of `@jsonbored/opennextjs-cli` to npm.

## Overview

The release process is **fully automated** via GitHub Actions. You just need to:
1. Bump the version
2. Create and push a git tag
3. The workflow handles the rest

## First Release Setup

For the **first release**, you need to set up an npm automation token because OIDC trusted publishing requires the package to already exist.

### Step 1: Create npm Automation Token

1. Go to [npmjs.com → Account Settings → Access Tokens](https://www.npmjs.com/settings/JSONbored/tokens)
2. Click **"Generate New Token"**
3. Select **"Automation"** token type
4. Copy the token (you won't see it again!)

### Step 2: Add NPM_TOKEN Secret to GitHub

1. Go to your GitHub repository: `https://github.com/JSONbored/opennextjs-cli`
2. Navigate to **Settings → Secrets and variables → Actions**
3. Click **"New repository secret"**
4. Name: `NPM_TOKEN`
5. Value: Paste your npm automation token
6. Click **"Add secret"**

### Step 3: Release!

Now you can proceed with the normal release process below.

## Subsequent Releases (After First Release)

After the first release, you can (and should) set up OIDC trusted publishing for better security:

1. Go to [npmjs.com → Account Settings → Automation](https://www.npmjs.com/settings/JSONbored/automation)
2. Click **"Add GitHub Actions"** or **"Configure"** next to **"Trusted Publishers"**
3. Select repository: `JSONbored/opennextjs-cli`
4. Select workflow: `.github/workflows/release.yml`
5. Click **"Save"**

Once OIDC is configured:
- ✅ More secure (no token needed)
- ✅ Automatic token rotation
- ✅ You can remove the `NPM_TOKEN` secret from GitHub

The workflow will automatically use OIDC if available, and fall back to `NPM_TOKEN` if not.

## Normal Release Process

### Step 1: Bump Version

From the `packages/opennextjs-cli` directory:

```bash
cd packages/opennextjs-cli

# Bump patch version (0.1.0 → 0.1.1)
pnpm bump:patch

# Or bump minor version (0.1.0 → 0.2.0)
pnpm bump:minor

# Or bump major version (1.0.0 → 2.0.0)
pnpm bump:major
```

This updates `package.json` version automatically.

### Step 2: Commit Version Change

```bash
git add packages/opennextjs-cli/package.json
git commit -m "chore: bump version to 0.1.0"
git push origin main
```

### Step 3: Create and Push Tag

```bash
# Create tag matching package.json version (e.g., v0.1.0)
git tag v0.1.0

# Push tag to trigger release workflow
git push origin main --tags
```

**Important:** The tag version must **exactly match** the `package.json` version (without the `v` prefix).

### Step 4: Automation Takes Over

The GitHub Actions workflow (`.github/workflows/release.yml`) will:

1. ✅ Build the package
2. ✅ Verify version matches
3. ✅ Generate changelog with git-cliff
4. ✅ Publish to npm (tries OIDC first, falls back to NPM_TOKEN)
5. ✅ Create GitHub Release with changelog

You can monitor progress in the **Actions** tab of your GitHub repository.

## What Gets Published

- **Package name:** `@jsonbored/opennextjs-cli`
- **Registry:** `https://registry.npmjs.org`
- **Access:** Public
- **Files:** Only the `dist/` directory (as specified in `package.json`)

## Version Bumping Rules

Follow [Semantic Versioning](https://semver.org/):

- **Major** (1.0.0 → 2.0.0): Breaking changes, major redesigns
- **Minor** (1.0.0 → 1.1.0): New features, new functionality
- **Patch** (1.0.0 → 1.0.1): Bug fixes, small improvements

## Troubleshooting

### "Version mismatch" error

The tag version must match `package.json` version exactly:
- ✅ Tag: `v0.1.0` → package.json: `0.1.0`
- ❌ Tag: `v0.1.0` → package.json: `0.1.1`

### "NPM_TOKEN secret not found" error

For first release, you need to add the `NPM_TOKEN` secret to GitHub (see "First Release Setup" above).

### "OIDC publish failed" message

This is normal for first release. The workflow will automatically fall back to `NPM_TOKEN`.

### Changelog not generated

The workflow tries to install `git-cliff` automatically. If it fails, the release will continue without a changelog (you can generate it manually later).

## Manual Changelog Generation

To preview or generate changelog manually:

```bash
# Preview unreleased changes
cd packages/opennextjs-cli
pnpm changelog:preview

# Generate changelog for specific version
pnpm changelog:generate
```

## Related Files

- `.github/workflows/release.yml` - Release workflow
- `cliff.toml` - git-cliff configuration
- `scripts/bump-version.ts` - Version bumping script
- `packages/opennextjs-cli/package.json` - Package configuration
