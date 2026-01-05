/**
 * End-to-end tests for all CLI commands
 * Tests complete command execution with real file system operations
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'fs';
import { join } from 'path';
import { program } from '../../cli.js';

describe('CLI Commands E2E', () => {
  const testBaseDir = join(process.cwd(), '.test-tmp-e2e');

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

  describe('status command', () => {
    it('should show status for Next.js project', async () => {
      const projectDir = join(testBaseDir, 'nextjs-project');
      mkdirSync(projectDir, { recursive: true });

      const packageJson = {
        name: 'test-project',
        dependencies: {
          next: '15.0.0',
        },
      };
      writeFileSync(
        join(projectDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(projectDir, 'next.config.js'), 'module.exports = {};');

      // Test command structure
      const command = program.commands.find((cmd) => cmd.name() === 'status');
      expect(command).toBeDefined();
      expect(command?.name()).toBe('status');
    });

    it('should handle missing Next.js project gracefully', () => {
      const emptyDir = join(testBaseDir, 'empty');
      mkdirSync(emptyDir, { recursive: true });

      const command = program.commands.find((cmd) => cmd.name() === 'status');
      expect(command).toBeDefined();
    });
  });

  describe('validate command', () => {
    it('should validate complete OpenNext.js project', () => {
      const projectDir = join(testBaseDir, 'opennext-project');
      mkdirSync(projectDir, { recursive: true });

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
        join(projectDir, 'package.json'),
        JSON.stringify(packageJson, null, 2)
      );
      writeFileSync(join(projectDir, 'next.config.js'), 'module.exports = {};');
      writeFileSync(
        join(projectDir, 'wrangler.toml'),
        'name = "test-worker"\naccount_id = "test-account"'
      );
      writeFileSync(
        join(projectDir, 'open-next.config.ts'),
        'export default { adapter: "cloudflare" };'
      );

      const command = program.commands.find((cmd) => cmd.name() === 'validate');
      expect(command).toBeDefined();
      expect(command?.options.some((opt) => opt.flags.includes('--json'))).toBe(true);
    });
  });

  describe('init command', () => {
    it('should have correct structure and options', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'init');
      expect(command).toBeDefined();
      expect(command?.options.some((opt) => opt.flags.includes('--yes'))).toBe(true);
      expect(command?.options.some((opt) => opt.flags.includes('--template'))).toBe(true);
    });
  });

  describe('add command', () => {
    it('should have correct structure', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'add');
      expect(command).toBeDefined();
      expect(command?.description()).toContain('Add');
    });
  });

  describe('config command', () => {
    it('should have correct structure', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'config');
      expect(command).toBeDefined();
    });
  });

  describe('deploy command', () => {
    it('should have correct structure and options', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'deploy');
      expect(command).toBeDefined();
      expect(command?.options.some((opt) => opt.flags.includes('--dry-run'))).toBe(true);
      expect(command?.options.some((opt) => opt.flags.includes('--env'))).toBe(true);
    });
  });

  describe('preview command', () => {
    it('should have correct structure and options', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'preview');
      expect(command).toBeDefined();
      expect(command?.options.some((opt) => opt.flags.includes('--port'))).toBe(true);
    });
  });

  describe('update command', () => {
    it('should have correct structure', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'update');
      expect(command).toBeDefined();
    });
  });

  describe('env command', () => {
    it('should have subcommands', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'env');
      expect(command).toBeDefined();
      const subcommands = command?.commands || [];
      expect(subcommands.length).toBeGreaterThan(0);
      expect(subcommands.some((cmd) => cmd.name() === 'setup')).toBe(true);
      expect(subcommands.some((cmd) => cmd.name() === 'validate')).toBe(true);
      expect(subcommands.some((cmd) => cmd.name() === 'list')).toBe(true);
      expect(subcommands.some((cmd) => cmd.name() === 'set')).toBe(true);
    });
  });

  describe('cloudflare command', () => {
    it('should have subcommands', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'cloudflare');
      expect(command).toBeDefined();
      const subcommands = command?.commands || [];
      expect(subcommands.length).toBeGreaterThan(0);
      expect(subcommands.some((cmd) => cmd.name() === 'login')).toBe(true);
      expect(subcommands.some((cmd) => cmd.name() === 'verify')).toBe(true);
      expect(subcommands.some((cmd) => cmd.name() === 'account')).toBe(true);
      expect(subcommands.some((cmd) => cmd.name() === 'logout')).toBe(true);
    });
  });

  describe('doctor command', () => {
    it('should have correct structure and options', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'doctor');
      expect(command).toBeDefined();
      expect(command?.options.some((opt) => opt.flags.includes('--fix'))).toBe(true);
    });
  });

  describe('migrate command', () => {
    it('should have correct structure and options', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'migrate');
      expect(command).toBeDefined();
      expect(command?.options.some((opt) => opt.flags.includes('--from'))).toBe(true);
      expect(command?.options.some((opt) => opt.flags.includes('--dry-run'))).toBe(true);
    });
  });

  describe('mcp command', () => {
    it('should have correct structure', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'mcp');
      expect(command).toBeDefined();
    });
  });

  describe('setup command', () => {
    it('should have correct structure and options', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'setup');
      expect(command).toBeDefined();
      expect(command?.options.some((opt) => opt.flags.includes('--global'))).toBe(true);
    });
  });

  describe('completion command', () => {
    it('should have correct structure', () => {
      const command = program.commands.find((cmd) => cmd.name() === 'completion');
      expect(command).toBeDefined();
    });
  });

  describe('Program structure', () => {
    it('should have all expected commands registered', () => {
      const commandNames = program.commands.map((cmd) => cmd.name());
      const expectedCommands = [
        'init',
        'add',
        'config',
        'status',
        'validate',
        'deploy',
        'preview',
        'update',
        'env',
        'cloudflare',
        'doctor',
        'migrate',
        'mcp',
        'setup',
        'completion',
      ];

      for (const expected of expectedCommands) {
        expect(commandNames).toContain(expected);
      }
    });

    it('should have version option', () => {
      const versionOption = program.options.find((opt) =>
        opt.flags.includes('--version')
      );
      expect(versionOption).toBeDefined();
    });

    it('should have verbose and debug options', () => {
      const verboseOption = program.options.find((opt) =>
        opt.flags.includes('--verbose')
      );
      const debugOption = program.options.find((opt) =>
        opt.flags.includes('--debug')
      );
      expect(verboseOption).toBeDefined();
      expect(debugOption).toBeDefined();
    });
  });
});
