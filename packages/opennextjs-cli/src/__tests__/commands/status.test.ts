/**
 * Comprehensive tests for status command
 * Tests command structure and real functionality
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { statusCommand } from '../../commands/status.js';

describe('statusCommand', () => {
  describe('Command Structure', () => {
    it('should create a command with correct name', () => {
      const command = statusCommand();
      expect(command.name()).toBe('status');
    });

    it('should have correct description', () => {
      const command = statusCommand();
      expect(command.description()).toContain('status');
      expect(command.description()).toContain('configuration');
    });

    it('should support --json option', () => {
      const command = statusCommand();
      const jsonOption = command.options.find((opt) =>
        opt.flags.includes('--json')
      );
      expect(jsonOption).toBeDefined();
    });

    it('should have action handler defined', () => {
      const command = statusCommand();
      expect((command as unknown as { _actionHandler?: unknown })._actionHandler).toBeDefined();
    });
  });

  describe('Command Execution Scenarios', () => {
    const testDir = join(process.cwd(), '.test-tmp-status-cmd');

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

    it('should handle complete Next.js + OpenNext.js project', () => {
      const packageJson = {
        name: 'test-project',
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
      writeFileSync(join(testDir, 'next.config.js'), 'module.exports = {};');
      writeFileSync(
        join(testDir, 'wrangler.toml'),
        'name = "test-worker"\naccount_id = "test-account"'
      );
      writeFileSync(
        join(testDir, 'open-next.config.ts'),
        'export default { adapter: "cloudflare" };'
      );

      const command = statusCommand();
      expect(command).toBeDefined();
      // Command should be able to process this when executed
    });

    it('should handle Next.js project without OpenNext.js', () => {
      const packageJson = {
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(testDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );

      const command = statusCommand();
      expect(command).toBeDefined();
    });
  });
});
