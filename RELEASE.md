# Release Process Documentation

This document explains how to release `@jsonbored/opennextjs-cli` and `@jsonbored/opennextjs-mcp` packages to npm.

## Overview

The release process is managed by a single consolidated GitHub Actions workflow (`.github/workflows/release.yml`) that supports multiple phases and triggers. Both packages are always released with synchronized versions.

## Workflow Phases

The release workflow supports the following phases, which can run independently or together:

### 1. **full-release** (Default)

Complete release process:

- Version bump → Changelog generation → Build → Publish to npm → GitHub Release

### 2. **version-bump**

Only bump versions and create tag:

- Calculate new version (auto or manual)
- Update both package.json files
- Update MCP's dependency on CLI
- Commit and create tag

### 3. **changelog-update**

Only update unreleased changelogs:

- Generate changelogs for unreleased commits
- Commit changelog updates to main branch

### 4. **changelog-generate**

Generate changelogs for specific tag:

- Generate changelogs for a specific version/tag
- Used when tag exists and you want to regenerate

### 5. **build-only**

Only build packages:

- Run lint, type-check, and tests
- Build both CLI and MCP packages
- Validates compilation

### 6. **publish-only**

Only publish to npm (requires tag):

- Verify package.json versions match tag
- Publish both packages to npm
- Create GitHub Release

## Triggers

### Manual Trigger (workflow_dispatch)

1. Go to GitHub Actions → "Release" workflow
2. Click "Run workflow"
3. Select:
   - **Phase:** Choose the phase to execute (default: `full-release`)
   - **Version:** Optional version (e.g., `0.1.0`). Leave empty to auto-calculate from commits
   - **Bump type:** Only used if version is empty. Options: `auto`, `major`, `minor`, `patch`
4. Click "Run workflow"

### Automatic Tag Push

When you push a version tag (e.g., `v1.0.0`), the workflow automatically:

- Runs the `publish-only` phase
- Publishes both packages to npm
- Creates a GitHub Release

```bash
git tag v1.0.0
git push origin v1.0.0
```

### PR Merge to Main

When a PR is merged to `main` that changes files in `packages/`, the workflow automatically:

- Runs `version-bump` phase (auto-calculates version from commits)
- Runs `changelog-update` phase (updates unreleased changelogs)

## First Release (v0.1.0)

### Prerequisites

1. ✅ Both packages already at v0.1.0 in package.json
2. ✅ NPM_TOKEN secret configured in GitHub
3. ✅ Repository ready for release

### Steps for First Release

**Option 1: Full Release (Recommended)**

1. Go to GitHub Actions → "Release" workflow
2. Click "Run workflow"
3. Select:
   - **Phase:** `full-release`
   - **Version:** `0.1.0` (or leave empty to use package.json version)
   - **Bump type:** `auto` (not used if version is provided)
4. Click "Run workflow"
5. Workflow will execute all phases:
   - ✅ Generate unreleased changelogs (using `--unreleased` since tag doesn't exist)
   - ✅ Build both packages
   - ✅ Create tag `v0.1.0`
   - ✅ Publish both packages to npm (using NPM_TOKEN)
   - ✅ Create GitHub Release with changelog notes

**Option 2: Step-by-Step (For Testing/Debugging)**

1. **Update Changelogs First:**
   - Phase: `changelog-update`
   - This generates unreleased changelogs and commits them

2. **Build Packages:**
   - Phase: `build-only`
   - Verify packages build successfully

3. **Create Version Tag:**
   - Phase: `version-bump`
   - Version: `0.1.0`
   - This creates the tag

4. **Publish:**
   - Phase: `publish-only`
   - This publishes to npm and creates GitHub Release

### NPM_TOKEN Setup

For the first release, you need to configure an npm automation token:

1. **Create npm token:**
   - Go to: https://www.npmjs.com/settings/JSONbored/tokens
   - Click "Generate New Token"
   - Select "Automation" type
   - Copy the token

2. **Add secret to GitHub:**
   - Go to: GitHub repo → Settings → Secrets and variables → Actions
   - Click "New repository secret"
   - Name: `NPM_TOKEN`
   - Value: Your npm automation token
   - Click "Add secret"

## Subsequent Releases

### Automatic Release (Recommended)

1. **Merge PR to main:**
   - The workflow automatically:
     - Calculates new version from commits (using git-cliff)
     - Updates package.json files
     - Updates unreleased changelogs
     - Creates and pushes tag

2. **Tag push triggers publish:**
   - When the tag is pushed, the workflow automatically:
     - Builds both packages
     - Publishes to npm (using OIDC)
     - Creates GitHub Release

### Manual Release

1. Go to GitHub Actions → "Release" workflow
2. Click "Run workflow"
3. Select:
   - **Phase:** `full-release`
   - **Version:** Leave empty to auto-calculate, or specify version
   - **Bump type:** `auto` (or `major`/`minor`/`patch` if version is empty)
4. Click "Run workflow"

## OIDC Setup (After First Release)

Once both packages are published successfully, set up OIDC trusted publishing:

1. **Go to npm automation settings:**
   - https://www.npmjs.com/settings/JSONbored/automation

2. **Add trusted publisher for CLI:**
   - Click "Add GitHub Actions" or "Configure" next to "Trusted Publishers"
   - Repository: `JSONbored/opennextjs-cli`
   - Workflow: `.github/workflows/release.yml`
   - Save

3. **Add trusted publisher for MCP:**
   - Repeat the same steps for `@jsonbored/opennextjs-mcp`
   - Use the same repository and workflow

4. **Remove NPM_TOKEN (optional):**
   - After OIDC is configured and tested, you can remove the `NPM_TOKEN` secret
   - The workflow will automatically use OIDC for authentication

### Benefits of OIDC

- ✅ More secure than token-based authentication
- ✅ Automatic token rotation
- ✅ No need to manage npm tokens manually
- ✅ Works seamlessly with GitHub Actions

## Common Scenarios

### Scenario 1: Release a New Version

**Automatic (Recommended):**

- Merge PR to main → Workflow auto-bumps version → Tag push → Auto-publish

**Manual:**

- Run workflow with `full-release` phase → Enter version or leave empty for auto-calculate

### Scenario 2: Update Changelogs Without Releasing

- Run workflow with `changelog-update` phase
- This updates unreleased changelogs and commits them

### Scenario 3: Regenerate Changelog for Existing Tag

- Run workflow with `changelog-generate` phase
- Specify version or leave empty to use latest tag
- Changelogs are regenerated for the specified tag

### Scenario 4: Test Build Before Release

- Run workflow with `build-only` phase
- Verifies lint, type-check, tests, and builds pass

### Scenario 5: Publish Without Version Bump

- Create and push tag manually: `git tag v1.2.3 && git push origin v1.2.3`
- Workflow automatically runs `publish-only` phase

## Troubleshooting

### Error: "Tag 'vX.Y.Z' does not exist in git"

**Cause:** Trying to generate changelog for a tag that doesn't exist yet.

**Solution:**

- For first release, use `full-release` phase (it handles this automatically)
- For subsequent releases, ensure the tag exists before running `changelog-generate`

### Error: "NPM_TOKEN secret not found"

**Cause:** NPM_TOKEN not configured in GitHub secrets.

**Solution:**

1. Create npm automation token
2. Add `NPM_TOKEN` secret to GitHub repository
3. See "NPM_TOKEN Setup" section above

### Error: "Version mismatch: package.json (X.Y.Z) != tag (A.B.C)"

**Cause:** Package.json version doesn't match the tag version.

**Solution:**

- Ensure version-bump phase ran successfully before publish
- Or manually update package.json files to match tag version

### Error: "OIDC publish failed"

**Cause:** OIDC not configured or misconfigured.

**Solution:**

- Check OIDC setup in npm automation settings
- Verify repository and workflow path are correct
- Workflow will automatically fall back to NPM_TOKEN if OIDC fails

### Changelog Not Generated

**Cause:** No commits found or git-cliff configuration issue.

**Solution:**

- Check that commits exist since last tag
- Verify `cliff.toml` configuration
- Check git-cliff setup in workflow

## Workflow Architecture

The consolidated workflow uses a phase-based architecture:

1. **determine-phases job:** Determines which phases to run based on trigger and inputs
2. **version-bump job:** Runs if version bump is needed
3. **changelog-update job:** Runs if unreleased changelog update is needed
4. **changelog-generate job:** Runs if changelog generation for tag is needed
5. **build job:** Runs if build is needed
6. **publish job:** Runs if publish is needed

Jobs run in dependency order, with each job only running if its phase is enabled.

## Logging

The workflow uses comprehensive logging with emoji indicators:

- 🚀 Starting phase: Indicates a phase is starting
- 📋 Step: Indicates a step within a phase
- ⏳ Current action: Shows progress
- ✅ Success: Indicates successful completion
- ❌ Error: Indicates failure
- ⚠️ Warning: Indicates warning or fallback

## Version Synchronization

Both packages (`@jsonbored/opennextjs-cli` and `@jsonbored/opennextjs-mcp`) are always released with the same version number. The workflow ensures:

1. Both package.json files are updated to the same version
2. MCP's dependency on CLI is updated to match the new version
3. Both packages are published with the same version
4. GitHub Release includes both packages

## Support

For issues or questions about the release process:

1. Check this documentation
2. Review workflow logs in GitHub Actions
3. Check workflow file: `.github/workflows/release.yml`
4. Review git-cliff configuration: `cliff.toml`
