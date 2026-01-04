/**
 * Dry-Run Utilities
 *
 * Tracks file operations and generates previews for dry-run mode.
 *
 * @packageDocumentation
 */

import { existsSync } from 'fs';
import * as p from '@clack/prompts';

/**
 * File operation type
 */
export type FileOperation = 'create' | 'update' | 'delete' | 'backup';

/**
 * Tracked file operation
 */
export interface FileOperationRecord {
  type: FileOperation;
  path: string;
  content?: string;
  oldContent?: string;
  backupPath?: string;
}

/**
 * Dry-run manager
 */
export class DryRunManager {
  private operations: FileOperationRecord[] = [];
  private enabled: boolean;

  constructor(enabled: boolean = false) {
    this.enabled = enabled;
  }

  /**
   * Track a file operation
   */
  track(operation: FileOperationRecord): void {
    if (this.enabled) {
      this.operations.push(operation);
    }
  }

  /**
   * Get all tracked operations
   */
  getOperations(): FileOperationRecord[] {
    return this.operations;
  }

  /**
   * Display dry-run preview
   */
  displayPreview(): void {
    if (!this.enabled || this.operations.length === 0) {
      return;
    }

    const filesByType: Record<FileOperation, FileOperationRecord[]> = {
      create: [],
      update: [],
      delete: [],
      backup: [],
    };

    for (const op of this.operations) {
      filesByType[op.type].push(op);
    }

    const sections: string[] = [];

    if (filesByType.create.length > 0) {
      sections.push('Files to be created:');
      for (const op of filesByType.create) {
        sections.push(`  + ${op.path}`);
      }
    }

    if (filesByType.update.length > 0) {
      sections.push('\nFiles to be updated:');
      for (const op of filesByType.update) {
        const exists = existsSync(op.path) ? '(exists)' : '(new)';
        sections.push(`  ~ ${op.path} ${exists}`);
        if (op.oldContent && op.content) {
          // Show a simple diff indicator
          const oldLines = op.oldContent.split('\n').length;
          const newLines = op.content.split('\n').length;
          if (oldLines !== newLines) {
            sections.push(`    (${oldLines} → ${newLines} lines)`);
          }
        }
      }
    }

    if (filesByType.delete.length > 0) {
      sections.push('\nFiles to be deleted:');
      for (const op of filesByType.delete) {
        sections.push(`  - ${op.path}`);
      }
    }

    if (filesByType.backup.length > 0) {
      sections.push('\nFiles to be backed up:');
      for (const op of filesByType.backup) {
        sections.push(`  📦 ${op.path} → ${op.backupPath || 'backup'}`);
      }
    }

    if (sections.length > 0) {
      p.note(sections.join('\n'), 'Dry-Run Preview');
    }
  }

  /**
   * Clear all tracked operations
   */
  clear(): void {
    this.operations = [];
  }

  /**
   * Check if dry-run is enabled
   */
  isEnabled(): boolean {
    return this.enabled;
  }
}

/**
 * Create a dry-run manager instance
 */
export function createDryRunManager(enabled: boolean): DryRunManager {
  return new DryRunManager(enabled);
}
