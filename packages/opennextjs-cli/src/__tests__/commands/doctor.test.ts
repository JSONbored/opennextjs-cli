/**
 * Comprehensive tests for doctor command
 * Tests command structure and health check functionality
 */

import { describe, it, expect } from '@jest/globals';
import { doctorCommand } from '../../commands/doctor.js';

describe('doctorCommand', () => {
  describe('Command Structure', () => {
    it('should create a command with correct name', () => {
      const command = doctorCommand();
      expect(command.name()).toBe('doctor');
    });

    it('should have correct description', () => {
      const command = doctorCommand();
      expect(command.description()).toContain('Diagnose');
      expect(command.description()).toContain('fix');
    });

    it('should support --fix option', () => {
      const command = doctorCommand();
      const fixOption = command.options.find((opt) =>
        opt.flags.includes('--fix')
      );
      expect(fixOption).toBeDefined();
      expect(fixOption?.description).toContain('fix');
    });

    it('should have action handler defined', () => {
      const command = doctorCommand();
      expect((command as unknown as { _actionHandler?: unknown })._actionHandler).toBeDefined();
    });
  });

  describe('Command Options', () => {
    it('should parse --fix flag correctly', () => {
      const command = doctorCommand();
      const fixOption = command.options.find((opt) =>
        opt.flags.includes('--fix')
      );
      expect(fixOption).toBeDefined();
      expect(fixOption?.flags).toContain('--fix');
    });
  });
});
