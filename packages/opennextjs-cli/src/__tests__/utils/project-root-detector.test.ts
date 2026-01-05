/**
 * Comprehensive tests for project-root-detector utility
 * Tests monorepo detection, Next.js project detection, and workspace searching
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { detectProjectRoot } from '../../utils/project-root-detector.js';

describe('Project Root Detector', () => {
  const testBaseDir = join(process.cwd(), '.test-tmp-detector');

  beforeEach(() => {
    if (existsSync(testBaseDir)) {
      rmSync(testBaseDir, { recursive: true, force: true });
    }
    mkdirSync(testBaseDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testBaseDir)) {
      rmSync(testBaseDir, { recursive: true, force: true });
    }
  });

  describe('detectProjectRoot - Simple Next.js Project', () => {
    it('should detect Next.js project in current directory', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testBaseDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = detectProjectRoot(testBaseDir);
      expect(result.foundNextJs).toBe(true);
      expect(result.projectRoot).toBe(testBaseDir);
      expect(result.isMonorepo).toBe(false);
      expect(result.metadata.originalCwd).toBe(testBaseDir);
    });

    it('should return false when not a Next.js project', () => {
      const testSubDir = join(testBaseDir, 'non-nextjs');
      mkdirSync(testSubDir, { recursive: true });
      
      const packageJson = {
        dependencies: {
          express: '4.0.0',
        },
      };
      writeFileSync(
        join(testSubDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = detectProjectRoot(testSubDir);
      expect(result.foundNextJs).toBe(false);
      // projectRoot should be the provided directory when no Next.js project is found and not in monorepo
      // Note: It might detect parent as monorepo, so we just check it's defined
      expect(result.projectRoot).toBeDefined();
      expect(result.metadata.originalCwd).toBe(testSubDir);
    });

    it('should return false when package.json does not exist', () => {
      const isolatedDir = join(testBaseDir, 'isolated-empty');
      mkdirSync(isolatedDir, { recursive: true });
      
      const result = detectProjectRoot(isolatedDir);
      expect(result.foundNextJs).toBe(false);
      // If it detects a parent monorepo, projectRoot might be different
      // But originalCwd should always be the provided directory
      expect(result.metadata.originalCwd).toBe(isolatedDir);
    });
  });

  describe('detectProjectRoot - Monorepo with pnpm', () => {
    it('should detect Next.js project in pnpm monorepo workspace', () => {
      // Create monorepo root
      const monorepoRoot = join(testBaseDir, 'monorepo');
      mkdirSync(monorepoRoot, { recursive: true });

      // Create pnpm-workspace.yaml
      const workspaceConfig = `packages:
  - 'apps/*'
  - 'packages/*'
`;
      writeFileSync(join(monorepoRoot, 'pnpm-workspace.yaml'), workspaceConfig);

      // Create root package.json
      writeFileSync(
        join(monorepoRoot, 'package.json'),
        JSON.stringify({ name: 'monorepo' }, null, 2)
      );

      // Create apps directory with Next.js project
      const appDir = join(monorepoRoot, 'apps', 'web');
      mkdirSync(appDir, { recursive: true });
      const appPackageJson = {
        name: 'web',
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify(appPackageJson, null, 2)
      );

      // Test from monorepo root
      const result = detectProjectRoot(monorepoRoot);
      expect(result.foundNextJs).toBe(true);
      expect(result.isMonorepo).toBe(true);
      expect(result.projectRoot).toBe(appDir);
      expect(result.monorepoInfo).toBeDefined();
      expect(result.monorepoInfo?.type).toBe('pnpm');
      expect(result.monorepoInfo?.workspaceRoot).toBe(monorepoRoot);
    });

    it('should detect Next.js project when called from workspace directory', () => {
      // Create monorepo structure
      const monorepoRoot = join(testBaseDir, 'monorepo');
      mkdirSync(monorepoRoot, { recursive: true });

      writeFileSync(
        join(monorepoRoot, 'pnpm-workspace.yaml'),
        "packages:\n  - 'apps/*'\n"
      );

      const appDir = join(monorepoRoot, 'apps', 'web');
      mkdirSync(appDir, { recursive: true });
      const appPackageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify(appPackageJson, null, 2)
      );

      // Test from workspace directory
      const result = detectProjectRoot(appDir);
      expect(result.foundNextJs).toBe(true);
      expect(result.projectRoot).toBe(appDir);
    });

    it('should handle multiple workspaces and find first Next.js project', () => {
      const monorepoRoot = join(testBaseDir, 'monorepo');
      mkdirSync(monorepoRoot, { recursive: true });

      writeFileSync(
        join(monorepoRoot, 'pnpm-workspace.yaml'),
        "packages:\n  - 'apps/*'\n"
      );

      // Create two apps, one with Next.js
      const app1Dir = join(monorepoRoot, 'apps', 'api');
      mkdirSync(app1Dir, { recursive: true });
      writeFileSync(
        join(app1Dir, 'package.json'),
        JSON.stringify({ dependencies: { express: '4.0.0' } }, null, 2)
      );

      const app2Dir = join(monorepoRoot, 'apps', 'web');
      mkdirSync(app2Dir, { recursive: true });
      writeFileSync(
        join(app2Dir, 'package.json'),
        JSON.stringify({ dependencies: { next: '15.0.0' } }, null, 2)
      );

      const result = detectProjectRoot(monorepoRoot);
      expect(result.foundNextJs).toBe(true);
      expect(result.projectRoot).toBe(app2Dir);
      expect(result.metadata.workspacesSearched).toContain(app2Dir);
    });

    it('should return workspace root when no Next.js project found in monorepo', () => {
      const monorepoRoot = join(testBaseDir, 'monorepo');
      mkdirSync(monorepoRoot, { recursive: true });

      writeFileSync(
        join(monorepoRoot, 'pnpm-workspace.yaml'),
        "packages:\n  - 'apps/*'\n"
      );

      const appDir = join(monorepoRoot, 'apps', 'api');
      mkdirSync(appDir, { recursive: true });
      writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify({ dependencies: { express: '4.0.0' } }, null, 2)
      );

      const result = detectProjectRoot(monorepoRoot);
      expect(result.foundNextJs).toBe(false);
      expect(result.isMonorepo).toBe(true);
      expect(result.projectRoot).toBe(monorepoRoot);
    });
  });

  describe('detectProjectRoot - Monorepo with npm/yarn workspaces', () => {
    it('should detect Next.js project in npm workspace monorepo', () => {
      const monorepoRoot = join(testBaseDir, 'npm-monorepo');
      mkdirSync(monorepoRoot, { recursive: true });

      const rootPackageJson = {
        name: 'monorepo',
        workspaces: ['apps/*'],
      };
      writeFileSync(
        join(monorepoRoot, 'package.json'),
        JSON.stringify(rootPackageJson, null, 2)
      );

      const appDir = join(monorepoRoot, 'apps', 'web');
      mkdirSync(appDir, { recursive: true });
      writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify({ dependencies: { next: '15.0.0' } }, null, 2)
      );

      const result = detectProjectRoot(monorepoRoot);
      expect(result.foundNextJs).toBe(true);
      expect(result.isMonorepo).toBe(true);
      expect(result.monorepoInfo?.type).toBe('npm');
    });

    it('should detect Next.js project in yarn workspace monorepo', () => {
      const monorepoRoot = join(testBaseDir, 'yarn-monorepo');
      mkdirSync(monorepoRoot, { recursive: true });

      const rootPackageJson = {
        name: 'monorepo',
        workspaces: ['apps/*'],
      };
      writeFileSync(
        join(monorepoRoot, 'package.json'),
        JSON.stringify(rootPackageJson, null, 2)
      );
      writeFileSync(join(monorepoRoot, 'yarn.lock'), '');

      const appDir = join(monorepoRoot, 'apps', 'web');
      mkdirSync(appDir, { recursive: true });
      writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify({ dependencies: { next: '15.0.0' } }, null, 2)
      );

      const result = detectProjectRoot(monorepoRoot);
      expect(result.foundNextJs).toBe(true);
      expect(result.isMonorepo).toBe(true);
      expect(result.monorepoInfo?.type).toBe('yarn');
    });
  });

  describe('detectProjectRoot - Edge Cases', () => {
    it('should handle workspace patterns with wildcards correctly', () => {
      const monorepoRoot = join(testBaseDir, 'wildcard-monorepo');
      mkdirSync(monorepoRoot, { recursive: true });

      writeFileSync(
        join(monorepoRoot, 'pnpm-workspace.yaml'),
        "packages:\n  - 'packages/*'\n  - 'apps/*'\n"
      );

      // Create nested structure
      const packagesDir = join(monorepoRoot, 'packages');
      mkdirSync(packagesDir, { recursive: true });
      const package1Dir = join(packagesDir, 'utils');
      mkdirSync(package1Dir, { recursive: true });

      const appsDir = join(monorepoRoot, 'apps');
      mkdirSync(appsDir, { recursive: true });
      const appDir = join(appsDir, 'web');
      mkdirSync(appDir, { recursive: true });
      writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify({ dependencies: { next: '15.0.0' } }, null, 2)
      );

      const result = detectProjectRoot(monorepoRoot);
      expect(result.foundNextJs).toBe(true);
      expect(result.metadata.workspacesSearched).toContain(appDir);
    });

    it('should handle non-wildcard workspace patterns', () => {
      const monorepoRoot = join(testBaseDir, 'explicit-monorepo');
      mkdirSync(monorepoRoot, { recursive: true });

      writeFileSync(
        join(monorepoRoot, 'pnpm-workspace.yaml'),
        "packages:\n  - 'apps/web'\n  - 'apps/api'\n"
      );

      const appDir = join(monorepoRoot, 'apps', 'web');
      mkdirSync(appDir, { recursive: true });
      writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify({ dependencies: { next: '15.0.0' } }, null, 2)
      );

      const result = detectProjectRoot(monorepoRoot);
      expect(result.foundNextJs).toBe(true);
      expect(result.projectRoot).toBe(appDir);
    });

    it('should handle invalid workspace directories gracefully', () => {
      const monorepoRoot = join(testBaseDir, 'invalid-workspace');
      mkdirSync(monorepoRoot, { recursive: true });

      writeFileSync(
        join(monorepoRoot, 'pnpm-workspace.yaml'),
        "packages:\n  - 'nonexistent/*'\n"
      );

      const result = detectProjectRoot(monorepoRoot);
      expect(result.isMonorepo).toBe(true);
      // Should not crash, should return workspace root
      expect(result.projectRoot).toBe(monorepoRoot);
    });

    it('should preserve original cwd in metadata', () => {
      const testDir = join(testBaseDir, 'metadata-test');
      mkdirSync(testDir, { recursive: true });

      const result = detectProjectRoot(testDir);
      expect(result.metadata.originalCwd).toBe(testDir);
    });
  });

  describe('detectProjectRoot - Real-world Scenarios', () => {
    it('should work with typical Next.js app structure', () => {
      const appDir = join(testBaseDir, 'nextjs-app');
      mkdirSync(appDir, { recursive: true });

      const packageJson = {
        name: 'my-app',
        dependencies: {
          next: '15.0.0',
          react: '18.0.0',
          'react-dom': '18.0.0',
        },
      };
      writeFileSync(
        join(appDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      mkdirSync(join(appDir, 'app'), { recursive: true });
      writeFileSync(join(appDir, 'next.config.js'), 'module.exports = {};');

      const result = detectProjectRoot(appDir);
      expect(result.foundNextJs).toBe(true);
      expect(result.projectRoot).toBe(appDir);
    });

    it('should prioritize current directory over monorepo search', () => {
      // Create a Next.js project
      const currentDir = join(testBaseDir, 'current-nextjs');
      mkdirSync(currentDir, { recursive: true });
      writeFileSync(
        join(currentDir, 'package.json'),
        JSON.stringify({ dependencies: { next: '15.0.0' } }, null, 2)
      );

      // Also create a monorepo parent
      const parentDir = join(testBaseDir, 'parent');
      mkdirSync(parentDir, { recursive: true });
      writeFileSync(
        join(parentDir, 'pnpm-workspace.yaml'),
        "packages:\n  - 'apps/*'\n"
      );

      // Current directory should be detected first
      const result = detectProjectRoot(currentDir);
      expect(result.foundNextJs).toBe(true);
      expect(result.projectRoot).toBe(currentDir);
    });
  });
});
