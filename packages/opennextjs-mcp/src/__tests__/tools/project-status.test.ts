/**
 * Comprehensive tests for project-status MCP tool
 * Tests actual tool functionality with real file system operations
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { handleGetProjectStatus } from '../../tools/project-status.js';

describe('MCP Tool: get_project_status', () => {
  const testDir = join(process.cwd(), '.test-tmp-mcp-project-status');

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

  it('should return project status for Next.js project', async () => {
    const packageJson = {
      name: 'test-project',
      dependencies: {
        next: '15.0.0',
      },
    };
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    // Change to test directory
    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleGetProjectStatus({});
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      
      const status = JSON.parse(result.content[0].text);
      expect(status.nextJs).toBeDefined();
      expect(status.nextJs.detected).toBe(true);
      expect(status.nextJs.version).toBe('15.0.0');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should detect OpenNext.js configuration', async () => {
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
    writeFileSync(
      join(testDir, 'wrangler.toml'),
      'name = "test-worker"\naccount_id = "test-account"'
    );
    writeFileSync(
      join(testDir, 'open-next.config.ts'),
      'export default { adapter: "cloudflare" };'
    );

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleGetProjectStatus({});
      const status = JSON.parse(result.content[0].text);
      
      expect(status.openNext).toBeDefined();
      expect(status.openNext.configured).toBe(true);
      expect(status.openNext.workerName).toBe('test-worker');
      expect(status.openNext.accountId).toBe('test-account');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should return dependencies information', async () => {
    const packageJson = {
      dependencies: {
        next: '15.0.0',
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

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleGetProjectStatus({});
      const status = JSON.parse(result.content[0].text);
      
      expect(status.dependencies).toBeDefined();
      expect(status.dependencies.opennextjsCloudflare).toBe('1.0.0');
      expect(status.dependencies.wrangler).toBe('3.0.0');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should detect package manager', async () => {
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

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleGetProjectStatus({});
      const status = JSON.parse(result.content[0].text);
      
      expect(status.packageManager).toBe('pnpm');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should handle missing Next.js project gracefully', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleGetProjectStatus({});
      const status = JSON.parse(result.content[0].text);
      
      expect(status.nextJs).toBeDefined();
      expect(status.nextJs.detected).toBe(false);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should extract caching strategy from config', async () => {
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
    writeFileSync(
      join(testDir, 'wrangler.toml'),
      'name = "test-worker"'
    );
    writeFileSync(
      join(testDir, 'open-next.config.ts'),
      'export default { cachingStrategy: "r2" };'
    );

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleGetProjectStatus({});
      const status = JSON.parse(result.content[0].text);
      
      expect(status.openNext?.cachingStrategy).toBe('r2');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should extract environments from wrangler.toml', async () => {
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
    writeFileSync(
      join(testDir, 'wrangler.toml'),
      `name = "test-worker"

[env.production]
account_id = "prod"

[env.staging]
account_id = "staging"
`
    );
    writeFileSync(
      join(testDir, 'open-next.config.ts'),
      'export default { adapter: "cloudflare" };'
    );

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleGetProjectStatus({});
      const status = JSON.parse(result.content[0].text);
      
      expect(status.openNext?.environments).toBeDefined();
      expect(Array.isArray(status.openNext?.environments)).toBe(true);
      expect(status.openNext?.environments.length).toBeGreaterThan(0);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
