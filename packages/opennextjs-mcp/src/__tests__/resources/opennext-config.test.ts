/**
 * Comprehensive tests for opennext-config MCP resource
 * Tests actual resource reading functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { readOpenNextConfigResource } from '../../resources/opennext-config.js';

describe('MCP Resource: opennext-config', () => {
  const testDir = join(process.cwd(), '.test-tmp-mcp-opennext-resource');

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

  it('should read open-next.config.ts content', async () => {
    const configContent = 'export default { adapter: "cloudflare", cachingStrategy: "r2" };';
    writeFileSync(join(testDir, 'open-next.config.ts'), configContent);

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await readOpenNextConfigResource('opennextjs://config/open-next.config.ts');
      expect(result).toBeDefined();
      expect(result.contents).toBeDefined();
      expect(result.contents[0].mimeType).toBe('text/typescript');
      expect(result.contents[0].text).toContain('adapter: "cloudflare"');
      expect(result.contents[0].text).toContain('cachingStrategy: "r2"');
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should handle missing open-next.config.ts gracefully', async () => {
    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      await expect(
        readOpenNextConfigResource('opennextjs://config/open-next.config.ts')
      ).rejects.toThrow();
    } finally {
      process.chdir(originalCwd);
    }
  });
});
