/**
 * Comprehensive tests for project-detector utility
 * Tests Next.js project detection, version extraction, and OpenNext.js detection
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import {
  detectNextJsProject,
  getNextJsVersion,
} from '../../utils/project-detector.js';

describe('Project Detector Utility', () => {
  const testDir = join(process.cwd(), '.test-tmp-project-detector');

  beforeEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
    mkdirSync(testDir, { recursive: true });
  });

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('detectNextJsProject', () => {
    it('should detect Next.js project from dependencies', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
          react: '18.0.0',
          'react-dom': '18.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(true);
      expect(result.nextJsVersion).toBe('15.0.0');
    });

    it('should detect Next.js project from devDependencies', () => {
      const packageJson = {
        devDependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(true);
    });

    it('should detect OpenNext.js Cloudflare when present', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
          '@opennextjs/cloudflare': '1.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(true);
      expect(result.hasOpenNext).toBe(true);
    });

    it('should not detect OpenNext.js when not present', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(true);
      expect(result.hasOpenNext).toBe(false);
    });

    it('should detect package manager from lock files', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, 'pnpm-lock.yaml'), '');

      const result = detectNextJsProject(testDir);
      expect(result.packageManager).toBe('pnpm');
    });

    it('should detect npm from package-lock.json', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, 'package-lock.json'), '');

      const result = detectNextJsProject(testDir);
      expect(result.packageManager).toBe('npm');
    });

    it('should detect yarn from yarn.lock', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, 'yarn.lock'), '');

      const result = detectNextJsProject(testDir);
      expect(result.packageManager).toBe('yarn');
    });

    it('should handle version prefixes correctly', () => {
      const packageJson = {
        dependencies: {
          next: '^15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = detectNextJsProject(testDir);
      expect(result.nextJsVersion).toBe('15.0.0');
    });

    it('should handle tilde version prefix', () => {
      const packageJson = {
        dependencies: {
          next: '~15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = detectNextJsProject(testDir);
      expect(result.nextJsVersion).toBe('15.0.0');
    });

    it('should return false for non-Next.js project', () => {
      const packageJson = {
        dependencies: {
          express: '4.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(false);
      expect(result.hasOpenNext).toBe(false);
    });

    it('should return false when package.json does not exist', () => {
      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(false);
      expect(result.hasOpenNext).toBe(false);
    });

    it('should handle invalid package.json gracefully', () => {
      writeFileSync(join(testDir, 'package.json'), '{ invalid json }');

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(false);
    });

    it('should detect app directory structure', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      mkdirSync(join(testDir, 'app'), { recursive: true });

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(true);
    });

    it('should detect src/app directory structure', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      mkdirSync(join(testDir, 'src', 'app'), { recursive: true });

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(true);
    });

    it('should detect pages directory structure', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      mkdirSync(join(testDir, 'pages'), { recursive: true });

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(true);
    });

    it('should detect next.config.js', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, 'next.config.js'), 'module.exports = {};');

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(true);
    });

    it('should detect next.config.mjs', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, 'next.config.mjs'), 'export default {};');

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(true);
    });

    it('should detect next.config.ts', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, 'next.config.ts'), 'export default {};');

      const result = detectNextJsProject(testDir);
      expect(result.isNextJsProject).toBe(true);
    });
  });

  describe('getNextJsVersion', () => {
    it('should extract Next.js version from dependencies', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = getNextJsVersion(testDir);
      expect(result).toBe('15.0.0');
    });

    it('should extract version from devDependencies', () => {
      const packageJson = {
        devDependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = getNextJsVersion(testDir);
      expect(result).toBe('15.0.0');
    });

    it('should remove version prefix (^)', () => {
      const packageJson = {
        dependencies: {
          next: '^15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = getNextJsVersion(testDir);
      expect(result).toBe('15.0.0');
    });

    it('should remove version prefix (~)', () => {
      const packageJson = {
        dependencies: {
          next: '~15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = getNextJsVersion(testDir);
      expect(result).toBe('15.0.0');
    });

    it('should return undefined when Next.js is not in dependencies', () => {
      const packageJson = {
        dependencies: {
          express: '4.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = getNextJsVersion(testDir);
      expect(result).toBeUndefined();
    });

    it('should return undefined when package.json does not exist', () => {
      const result = getNextJsVersion(testDir);
      expect(result).toBeUndefined();
    });

    it('should handle invalid package.json gracefully', () => {
      writeFileSync(join(testDir, 'package.json'), '{ invalid json }');

      const result = getNextJsVersion(testDir);
      expect(result).toBeUndefined();
    });

    it('should handle exact version without prefix', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = getNextJsVersion(testDir);
      expect(result).toBe('15.0.0');
    });

    it('should handle version ranges', () => {
      const packageJson = {
        dependencies: {
          next: '>=15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = getNextJsVersion(testDir);
      // Should still extract the version part
      expect(result).toBeDefined();
    });
  });
});
