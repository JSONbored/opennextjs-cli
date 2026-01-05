/**
 * Comprehensive tests for config-reader utility
 * Tests file reading, parsing, and extraction functions
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import {
  readWranglerToml,
  readOpenNextConfig,
  readPackageJson,
  extractWorkerName,
  extractAccountId,
  extractCachingStrategy,
  extractEnvironments,
} from '../../utils/config-reader.js';

describe('Config Reader Utility', () => {
  const testDir = join(process.cwd(), '.test-tmp-config-reader');

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

  describe('readWranglerToml', () => {
    it('should read valid wrangler.toml file', () => {
      const tomlContent = 'name = "test-worker"\naccount_id = "test-account"';
      writeFileSync(join(testDir, 'wrangler.toml'), tomlContent);

      const result = readWranglerToml(testDir);
      expect(result).toBe(tomlContent);
    });

    it('should return undefined when wrangler.toml does not exist', () => {
      const result = readWranglerToml(testDir);
      expect(result).toBeUndefined();
    });

    it('should read complex wrangler.toml with environments', () => {
      const tomlContent = `name = "test-worker"
account_id = "test-account"

[env.production]
account_id = "prod-account"

[env.staging]
account_id = "staging-account"
`;
      writeFileSync(join(testDir, 'wrangler.toml'), tomlContent);

      const result = readWranglerToml(testDir);
      expect(result).toBe(tomlContent);
      expect(result).toContain('[env.production]');
      expect(result).toContain('[env.staging]');
    });

    it('should handle empty wrangler.toml', () => {
      writeFileSync(join(testDir, 'wrangler.toml'), '');

      const result = readWranglerToml(testDir);
      expect(result).toBe('');
    });
  });

  describe('readOpenNextConfig', () => {
    it('should read valid open-next.config.ts file', () => {
      const configContent = 'export default { adapter: "cloudflare" };';
      writeFileSync(join(testDir, 'open-next.config.ts'), configContent);

      const result = readOpenNextConfig(testDir);
      expect(result).toBe(configContent);
    });

    it('should return undefined when open-next.config.ts does not exist', () => {
      const result = readOpenNextConfig(testDir);
      expect(result).toBeUndefined();
    });

    it('should read complex config with caching strategy', () => {
      const configContent = `export default {
  adapter: 'cloudflare',
  cachingStrategy: 'r2',
  imageOptimization: true,
};
`;
      writeFileSync(join(testDir, 'open-next.config.ts'), configContent);

      const result = readOpenNextConfig(testDir);
      expect(result).toBe(configContent);
      expect(result).toContain('cachingStrategy');
    });
  });

  describe('readPackageJson', () => {
    it('should read and parse valid package.json', () => {
      const packageJson = {
        name: 'test-project',
        version: '1.0.0',
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = readPackageJson(testDir);
      expect(result).toBeDefined();
      expect(result?.name).toBe('test-project');
      expect(result?.version).toBe('1.0.0');
      expect(result?.dependencies?.next).toBe('15.0.0');
    });

    it('should return undefined when package.json does not exist', () => {
      const result = readPackageJson(testDir);
      expect(result).toBeUndefined();
    });

    it('should return undefined for invalid JSON', () => {
      writeFileSync(join(testDir, 'package.json'), '{ invalid json }');

      const result = readPackageJson(testDir);
      expect(result).toBeUndefined();
    });

    it('should handle package.json with workspaces', () => {
      const packageJson = {
        name: 'monorepo',
        workspaces: ['apps/*', 'packages/*'],
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = readPackageJson(testDir);
      expect(result?.workspaces).toEqual(['apps/*', 'packages/*']);
    });

    it('should handle package.json with object workspaces', () => {
      const packageJson = {
        name: 'monorepo',
        workspaces: {
          packages: ['apps/*', 'packages/*'],
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = readPackageJson(testDir);
      expect(result?.workspaces).toBeDefined();
    });
  });

  describe('extractWorkerName', () => {
    it('should extract worker name from wrangler.toml', () => {
      const tomlContent = 'name = "my-worker"';
      const result = extractWorkerName(tomlContent);
      expect(result).toBe('my-worker');
    });

    it('should extract worker name with single quotes', () => {
      const tomlContent = "name = 'my-worker'";
      const result = extractWorkerName(tomlContent);
      expect(result).toBe('my-worker');
    });

    it('should return undefined when name is not found', () => {
      const tomlContent = 'account_id = "test"';
      const result = extractWorkerName(tomlContent);
      expect(result).toBeUndefined();
    });

    it('should handle name with special characters', () => {
      const tomlContent = 'name = "my-worker-v2"';
      const result = extractWorkerName(tomlContent);
      expect(result).toBe('my-worker-v2');
    });

    it('should extract name from multiline toml', () => {
      const tomlContent = `account_id = "test"
name = "my-worker"
version = "1.0"
`;
      const result = extractWorkerName(tomlContent);
      expect(result).toBe('my-worker');
    });
  });

  describe('extractAccountId', () => {
    it('should extract account ID from wrangler.toml', () => {
      const tomlContent = 'account_id = "123456789"';
      const result = extractAccountId(tomlContent);
      expect(result).toBe('123456789');
    });

    it('should extract account ID with single quotes', () => {
      const tomlContent = "account_id = '123456789'";
      const result = extractAccountId(tomlContent);
      expect(result).toBe('123456789');
    });

    it('should return undefined when account_id is not found', () => {
      const tomlContent = 'name = "test"';
      const result = extractAccountId(tomlContent);
      expect(result).toBeUndefined();
    });

    it('should extract account ID from multiline toml', () => {
      const tomlContent = `name = "test"
account_id = "123456789"
version = "1.0"
`;
      const result = extractAccountId(tomlContent);
      expect(result).toBe('123456789');
    });
  });

  describe('extractCachingStrategy', () => {
    it('should extract r2 caching strategy', () => {
      const configContent = `export default {
  cachingStrategy: 'r2',
};
`;
      const result = extractCachingStrategy(configContent);
      expect(result).toBe('r2');
    });

    it('should extract static-assets caching strategy', () => {
      const configContent = `export default {
  cachingStrategy: 'static-assets',
};
`;
      const result = extractCachingStrategy(configContent);
      expect(result).toBe('static-assets');
    });

    it('should extract r2-do-queue caching strategy', () => {
      const configContent = `export default {
  cachingStrategy: 'r2-do-queue',
};
`;
      const result = extractCachingStrategy(configContent);
      expect(result).toBe('r2-do-queue');
    });

    it('should return undefined when caching strategy is not found', () => {
      const configContent = `export default {
  adapter: 'cloudflare',
};
`;
      const result = extractCachingStrategy(configContent);
      expect(result).toBeUndefined();
    });

    it('should handle caching strategy with double quotes', () => {
      const configContent = `export default {
  cachingStrategy: "r2",
};
`;
      const result = extractCachingStrategy(configContent);
      expect(result).toBe('r2');
    });
  });

  describe('extractEnvironments', () => {
    it('should extract environments from wrangler.toml', () => {
      const tomlContent = `name = "test"

[env.production]
account_id = "prod"

[env.staging]
account_id = "staging"

[env.development]
account_id = "dev"
`;
      const result = extractEnvironments(tomlContent);
      expect(result).toContain('production');
      expect(result).toContain('staging');
      expect(result).toContain('development');
      // extractEnvironments always includes 'production' by default, plus the env.* sections
      expect(result.length).toBeGreaterThanOrEqual(3);
    });

    it('should return array with production when no environments found', () => {
      const tomlContent = 'name = "test"';
      const result = extractEnvironments(tomlContent);
      // extractEnvironments always includes 'production' by default
      expect(result).toEqual(['production']);
    });

    it('should handle single environment', () => {
      const tomlContent = `name = "test"

[env.production]
account_id = "prod"
`;
      const result = extractEnvironments(tomlContent);
      // extractEnvironments always includes 'production' by default, and will add it again from [env.production]
      expect(result).toContain('production');
      expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should handle environments with underscores', () => {
      const tomlContent = `name = "test"

[env.prod_v2]
account_id = "prod"

[env.staging_v1]
account_id = "staging"
`;
      const result = extractEnvironments(tomlContent);
      expect(result).toContain('prod_v2');
      expect(result).toContain('staging_v1');
    });
  });
});
