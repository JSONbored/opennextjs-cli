/**
 * Comprehensive tests for validator utility
 * Tests all validation functions with real scenarios
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import {
  validateConfiguration,
  validateProjectStructureAsync,
  validateWranglerTomlAsync,
  validateOpenNextConfigAsync,
  validatePackageScriptsAsync,
  validateDependenciesAsync,
  validateCloudflareConnectionAsync,
} from '../../utils/validator.js';

describe('Validator Utility', () => {
  const testDir = join(process.cwd(), '.test-tmp-validator');

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

  describe('validateProjectStructureAsync', () => {
    it('should pass for valid Next.js project with next.config.js', async () => {
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

      const result = await validateProjectStructureAsync(testDir);
      expect(result.status).toBe('pass');
      expect(result.name).toBe('Next.js project structure');
    });

    it('should pass for valid Next.js project with next.config.mjs', async () => {
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

      const result = await validateProjectStructureAsync(testDir);
      expect(result.status).toBe('pass');
    });

    it('should pass for valid Next.js project with next.config.ts', async () => {
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

      const result = await validateProjectStructureAsync(testDir);
      expect(result.status).toBe('pass');
    });

    it('should warn when Next.js project has no config file', async () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validateProjectStructureAsync(testDir);
      expect(result.status).toBe('warning');
      expect(result.name).toBe('Next.js config');
      expect(result.message).toContain('No next.config.* file found');
    });

    it('should fail for non-Next.js project', async () => {
      const packageJson = {
        dependencies: {
          express: '4.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validateProjectStructureAsync(testDir);
      expect(result.status).toBe('fail');
      expect(result.name).toBe('Next.js project');
      expect(result.message).toBe('Not a Next.js project');
      expect(result.fix).toBeDefined();
    });

    it('should fail when package.json does not exist', async () => {
      const result = await validateProjectStructureAsync(testDir);
      expect(result.status).toBe('fail');
    });
  });

  describe('validateWranglerTomlAsync', () => {
    it('should pass for valid wrangler.toml with name and account_id', async () => {
      const wranglerToml = `name = "test-worker"
account_id = "test-account-id"
`;
      writeFileSync(join(testDir, 'wrangler.toml'), wranglerToml);

      const result = await validateWranglerTomlAsync(testDir);
      expect(result.status).toBe('pass');
      expect(result.name).toBe('wrangler.toml syntax');
    });

    it('should pass for wrangler.toml with name and env-specific account_id', async () => {
      const wranglerToml = `name = "test-worker"

[env.production]
account_id = "prod-account-id"
`;
      writeFileSync(join(testDir, 'wrangler.toml'), wranglerToml);

      const result = await validateWranglerTomlAsync(testDir);
      expect(result.status).toBe('pass');
    });

    it('should fail when wrangler.toml is missing', async () => {
      const result = await validateWranglerTomlAsync(testDir);
      expect(result.status).toBe('fail');
      expect(result.name).toBe('wrangler.toml exists');
      expect(result.message).toBe('wrangler.toml file not found');
      expect(result.fix).toContain('opennextjs-cli add');
    });

    it('should fail when wrangler.toml is missing name field', async () => {
      const wranglerToml = `account_id = "test-account-id"
`;
      writeFileSync(join(testDir, 'wrangler.toml'), wranglerToml);

      const result = await validateWranglerTomlAsync(testDir);
      expect(result.status).toBe('fail');
      expect(result.name).toBe('wrangler.toml name');
      expect(result.message).toContain('missing required "name" field');
      expect(result.fix).toBeDefined();
    });

    it('should warn when account_id is missing', async () => {
      const wranglerToml = `name = "test-worker"
`;
      writeFileSync(join(testDir, 'wrangler.toml'), wranglerToml);

      const result = await validateWranglerTomlAsync(testDir);
      expect(result.status).toBe('warning');
      expect(result.name).toBe('wrangler.toml account_id');
      expect(result.fix).toBeDefined();
    });
  });

  describe('validateOpenNextConfigAsync', () => {
    it('should pass for valid open-next.config.ts with default export', async () => {
      const config = `export default {
  adapter: 'cloudflare',
};
`;
      writeFileSync(join(testDir, 'open-next.config.ts'), config);

      const result = await validateOpenNextConfigAsync(testDir);
      expect(result.status).toBe('pass');
      expect(result.name).toBe('open-next.config.ts syntax');
    });

    it('should pass for config with export default on separate line', async () => {
      const config = `const config = {
  adapter: 'cloudflare',
};

export default config;
`;
      writeFileSync(join(testDir, 'open-next.config.ts'), config);

      const result = await validateOpenNextConfigAsync(testDir);
      expect(result.status).toBe('pass');
    });

    it('should fail when open-next.config.ts is missing', async () => {
      const result = await validateOpenNextConfigAsync(testDir);
      expect(result.status).toBe('fail');
      expect(result.name).toBe('open-next.config.ts exists');
      expect(result.message).toBe('open-next.config.ts file not found');
      expect(result.fix).toContain('opennextjs-cli add');
    });

    it('should fail when config is missing default export', async () => {
      const config = `const config = {
  adapter: 'cloudflare',
};
`;
      writeFileSync(join(testDir, 'open-next.config.ts'), config);

      const result = await validateOpenNextConfigAsync(testDir);
      expect(result.status).toBe('fail');
      expect(result.name).toBe('open-next.config.ts export');
      expect(result.message).toContain('missing default export');
      expect(result.fix).toBeDefined();
    });
  });

  describe('validatePackageScriptsAsync', () => {
    it('should pass when all required scripts are present', async () => {
      const packageJson = {
        scripts: {
          preview: 'wrangler dev',
          deploy: 'wrangler deploy',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validatePackageScriptsAsync(testDir);
      expect(result.status).toBe('pass');
      expect(result.name).toBe('package.json scripts');
      expect(result.message).toBe('Required scripts are present');
    });

    it('should warn when preview script is missing', async () => {
      const packageJson = {
        scripts: {
          deploy: 'wrangler deploy',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validatePackageScriptsAsync(testDir);
      expect(result.status).toBe('warning');
      expect(result.message).toContain('Missing recommended scripts');
      expect(result.message).toContain('preview');
      expect(result.fix).toBeDefined();
    });

    it('should warn when deploy script is missing', async () => {
      const packageJson = {
        scripts: {
          preview: 'wrangler dev',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validatePackageScriptsAsync(testDir);
      expect(result.status).toBe('warning');
      expect(result.message).toContain('deploy');
    });

    it('should warn when both scripts are missing', async () => {
      const packageJson = {
        scripts: {},
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validatePackageScriptsAsync(testDir);
      expect(result.status).toBe('warning');
      expect(result.message).toContain('preview');
      expect(result.message).toContain('deploy');
    });

    it('should fail when package.json does not exist', async () => {
      const result = await validatePackageScriptsAsync(testDir);
      expect(result.status).toBe('fail');
      expect(result.name).toBe('package.json exists');
    });
  });

  describe('validateDependenciesAsync', () => {
    it('should pass when all required dependencies are present', async () => {
      const packageJson = {
        dependencies: {
          '@opennextjs/cloudflare': '1.0.0',
        },
        devDependencies: {
          wrangler: '3.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validateDependenciesAsync(testDir);
      expect(result.status).toBe('pass');
      expect(result.name).toBe('required dependencies');
      expect(result.message).toBe('All required dependencies are installed');
    });

    it('should pass when wrangler is in dependencies', async () => {
      const packageJson = {
        dependencies: {
          '@opennextjs/cloudflare': '1.0.0',
          wrangler: '3.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validateDependenciesAsync(testDir);
      expect(result.status).toBe('pass');
    });

    it('should fail when @opennextjs/cloudflare is missing', async () => {
      const packageJson = {
        devDependencies: {
          wrangler: '3.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validateDependenciesAsync(testDir);
      expect(result.status).toBe('fail');
      expect(result.name).toBe('required dependencies');
      expect(result.message).toContain('@opennextjs/cloudflare');
      expect(result.fix).toBeDefined();
      expect(result.fix).toContain('pnpm add');
    });

    it('should fail when wrangler is missing', async () => {
      const packageJson = {
        dependencies: {
          '@opennextjs/cloudflare': '1.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validateDependenciesAsync(testDir);
      expect(result.status).toBe('fail');
      expect(result.message).toContain('wrangler');
    });

    it('should fail when both dependencies are missing', async () => {
      const packageJson = {
        dependencies: {},
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = await validateDependenciesAsync(testDir);
      expect(result.status).toBe('fail');
      expect(result.message).toContain('@opennextjs/cloudflare');
      expect(result.message).toContain('wrangler');
    });

    it('should fail when package.json does not exist', async () => {
      const result = await validateDependenciesAsync(testDir);
      expect(result.status).toBe('fail');
      expect(result.name).toBe('dependencies check');
    });
  });

  describe('validateCloudflareConnectionAsync', () => {
    it('should return a validation check (may pass or warn depending on environment)', async () => {
      const result = await validateCloudflareConnectionAsync();
      expect(result).toBeDefined();
      expect(result.name).toBeDefined();
      expect(['pass', 'warning']).toContain(result.status);
    });

    it('should have proper structure regardless of result', async () => {
      const result = await validateCloudflareConnectionAsync();
      expect(result).toHaveProperty('name');
      expect(result).toHaveProperty('status');
      expect(result).toHaveProperty('message');
      expect(['pass', 'fail', 'warning']).toContain(result.status);
    });
  });

  describe('validateConfiguration', () => {
    it('should return valid result for complete valid project', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
          '@opennextjs/cloudflare': '1.0.0',
        },
        devDependencies: {
          wrangler: '3.0.0',
        },
        scripts: {
          preview: 'wrangler dev',
          deploy: 'wrangler deploy',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, 'next.config.js'), 'module.exports = {};');
      writeFileSync(
        join(testDir, 'wrangler.toml'),
        'name = "test-worker"\naccount_id = "test-account"'
      );
      writeFileSync(
        join(testDir, 'open-next.config.ts'),
        'export default { adapter: "cloudflare" };'
      );

      const result = validateConfiguration(testDir);
      expect(result).toHaveProperty('valid');
      expect(result).toHaveProperty('checks');
      expect(result).toHaveProperty('errors');
      expect(result).toHaveProperty('warnings');
      expect(Array.isArray(result.checks)).toBe(true);
      expect(Array.isArray(result.errors)).toBe(true);
      expect(Array.isArray(result.warnings)).toBe(true);
    });

    it('should aggregate all checks correctly', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const result = validateConfiguration(testDir);
      expect(result.checks.length).toBeGreaterThan(0);
      expect(result.valid).toBe(false); // Should have errors
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should separate errors and warnings correctly', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
          '@opennextjs/cloudflare': '1.0.0',
        },
        scripts: {
          deploy: 'wrangler deploy',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(testDir, 'next.config.js'), 'module.exports = {};');
      writeFileSync(join(testDir, 'wrangler.toml'), 'name = "test-worker"');

      const result = validateConfiguration(testDir);
      // Should have warnings (missing preview script, missing account_id)
      // Should have errors (missing open-next.config.ts, missing wrangler)
      expect(result.checks.some((c) => c.status === 'warning')).toBe(true);
      expect(result.checks.some((c) => c.status === 'fail')).toBe(true);
    });
  });
});
