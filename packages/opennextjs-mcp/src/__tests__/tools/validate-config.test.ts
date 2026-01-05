/**
 * Comprehensive tests for validate-config MCP tool
 * Tests actual validation functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { handleValidateConfig } from '../../tools/validate-config.js';

describe('MCP Tool: validate_configuration', () => {
  const testDir = join(process.cwd(), '.test-tmp-mcp-validate');

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

  it('should validate complete OpenNext.js project', async () => {
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

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleValidateConfig({});
      expect(result).toBeDefined();
      expect(result.content).toBeDefined();
      expect(result.content[0].type).toBe('text');
      
      const validation = JSON.parse(result.content[0].text);
      expect(validation).toHaveProperty('valid');
      expect(validation).toHaveProperty('checks');
      expect(validation).toHaveProperty('errors');
      expect(validation).toHaveProperty('warnings');
      expect(Array.isArray(validation.checks)).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should detect missing wrangler.toml', async () => {
    const packageJson = {
      dependencies: {
        next: '15.0.0',
      },
    };
    writeFileSync(
      join(testDir, 'package.json'),
      JSON.stringify(packageJson, null, 2)
    );

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleValidateConfig({});
      const validation = JSON.parse(result.content[0].text);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
      expect(validation.errors.some((e: { name: string }) => e.name.includes('wrangler.toml'))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should detect missing dependencies', async () => {
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

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleValidateConfig({});
      const validation = JSON.parse(result.content[0].text);
      
      expect(validation.errors.some((e: { name: string }) => e.name.includes('dependencies'))).toBe(true);
    } finally {
      process.chdir(originalCwd);
    }
  });

  it('should include documentation URLs in validation results', async () => {
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
    writeFileSync(
      join(testDir, 'wrangler.toml'),
      'name = "test-worker"'
    );

    const originalCwd = process.cwd();
    process.chdir(testDir);

    try {
      const result = await handleValidateConfig({});
      const validation = JSON.parse(result.content[0].text);
      
      // Check if warnings/errors have docsUrl
      const itemsWithDocs = [
        ...validation.warnings,
        ...validation.errors,
      ].filter((item: { docsUrl?: string }) => item.docsUrl);
      
      // At least some items should have documentation URLs
      expect(itemsWithDocs.length).toBeGreaterThan(0);
    } finally {
      process.chdir(originalCwd);
    }
  });
});
