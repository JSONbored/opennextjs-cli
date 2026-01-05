/**
 * Comprehensive tests for wrangler-config MCP resource
 * Tests actual resource reading functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { readWranglerConfig } from '../../resources/wrangler-config.js';

describe('MCP Resource: wrangler-config', () => {
  const testDir = join(process.cwd(), '.test-tmp-mcp-wrangler-resource');

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

  it('should read wrangler.toml content', async () => {
    const wranglerContent = 'name = "test-worker"\naccount_id = "test-account"';
    writeFileSync(join(testDir, 'wrangler.toml'), wranglerContent);

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await readWranglerConfig('opennextjs://config/wrangler.toml');
      expect(result).toBeDefined();
      expect(result.contents).toBeDefined();
      expect(result.contents[0].mimeType).toBe('text/toml');
      expect(result.contents[0].text).toContain('name = "test-worker"');
      expect(result.contents[0].text).toContain('account_id = "test-account"');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should handle missing wrangler.toml gracefully', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      await expect(
        readWranglerConfig('opennextjs://config/wrangler.toml')
      ).rejects.toThrow();
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should read complex wrangler.toml with environments', async () => {
    const wranglerContent = `name = "test-worker"
account_id = "test-account"

[env.production]
account_id = "prod-account"

[env.staging]
account_id = "staging-account"
`;
    writeFileSync(join(testDir, 'wrangler.toml'), wranglerContent);

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await readWranglerConfig('opennextjs://config/wrangler.toml');
      expect(result.contents[0].text).toContain('[env.production]');
      expect(result.contents[0].text).toContain('[env.staging]');
    } finally {
      process.chdir(originalCwd);
    }
  });
});
