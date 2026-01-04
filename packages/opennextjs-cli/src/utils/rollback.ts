/**
 * Rollback Utility
 *
 * Provides rollback capabilities for failed operations.
 *
 * @packageDocumentation
 */

import { existsSync, copyFileSync, unlinkSync, writeFileSync } from 'fs';
import { logger } from './logger.js';

/**
 * Rollback operation record
 */
export interface RollbackOperation {
  type: 'backup' | 'delete' | 'restore';
  filePath: string;
  backupPath?: string;
  originalContent?: string;
}

/**
 * Rollback manager
 */
export class RollbackManager {
  private operations: RollbackOperation[] = [];

  /**
   * Record a file backup for rollback
   */
  recordBackup(filePath: string, backupPath: string): void {
    this.operations.push({
      type: 'backup',
      filePath,
      backupPath,
    });
  }

  /**
   * Record a file deletion for rollback
   */
  recordDelete(filePath: string, originalContent?: string): void {
    this.operations.push({
      type: 'delete',
      filePath,
      ...(originalContent !== undefined ? { originalContent } : {}),
    });
  }

  /**
   * Record a file restore for rollback
   */
  recordRestore(filePath: string, backupPath: string): void {
    this.operations.push({
      type: 'restore',
      filePath,
      backupPath,
    });
  }

  /**
   * Rollback all recorded operations
   */
  rollback(): void {
    logger.section('Rolling Back Changes');

    // Reverse operations to rollback in reverse order
    for (let i = this.operations.length - 1; i >= 0; i--) {
      const op = this.operations[i];
      if (!op) continue;

      try {
        switch (op.type) {
          case 'backup':
            // Restore from backup
            if (op.backupPath && existsSync(op.backupPath)) {
              copyFileSync(op.backupPath, op.filePath);
              logger.success(`Restored ${op.filePath} from backup`);
            }
            break;

          case 'delete':
            // Restore deleted file
            if (op.originalContent) {
              writeFileSync(op.filePath, op.originalContent, 'utf-8');
              logger.success(`Restored deleted file ${op.filePath}`);
            }
            break;

          case 'restore':
            // Remove restored file (reverse the restore)
            if (existsSync(op.filePath)) {
              unlinkSync(op.filePath);
              logger.success(`Removed ${op.filePath}`);
            }
            break;
        }
      } catch (error) {
        logger.warning(`Failed to rollback ${op.filePath}:`, error);
      }
    }

    this.operations = [];
  }

  /**
   * Clear all recorded operations (on success)
   */
  clear(): void {
    this.operations = [];
  }
}

/**
 * Global rollback manager instance
 */
let globalRollbackManager: RollbackManager | null = null;

/**
 * Get or create global rollback manager
 */
export function getRollbackManager(): RollbackManager {
  if (!globalRollbackManager) {
    globalRollbackManager = new RollbackManager();
  }
  return globalRollbackManager;
}

/**
 * Reset global rollback manager
 */
export function resetRollbackManager(): void {
  globalRollbackManager = null;
}
