/**
 * Backup Utility
 *
 * Creates backups of existing configuration files before modification.
 *
 * @packageDocumentation
 */

import { existsSync, copyFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { logger } from './logger.js';

/**
 * Creates a backup of a file
 *
 * @description
 * Copies a file to a backup location with a timestamp suffix.
 *
 * @param filePath - Path to the file to backup
 * @param backupDir - Directory to store backups (defaults to .backup)
 * @returns Path to the backup file, or undefined if file doesn't exist
 *
 * @example
 * ```typescript
 * const backupPath = await backupFile('wrangler.toml');
 * ```
 */
export function backupFile(filePath: string, backupDir: string = '.backup'): string | undefined {
  if (!existsSync(filePath)) {
    return undefined;
  }

  try {
    mkdirSync(backupDir, { recursive: true });
    const fileName = filePath.split('/').pop() || filePath;
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupPath = join(backupDir, `${fileName}.${timestamp}.backup`);

    copyFileSync(filePath, backupPath);
    logger.info(`Backed up ${fileName} to ${backupPath}`);

    return backupPath;
  } catch (error) {
    logger.warning(`Failed to backup ${filePath}:`, error);
    return undefined;
  }
}

/**
 * Creates backups of multiple files
 *
 * @description
 * Backs up an array of file paths to a backup directory.
 *
 * @param filePaths - Array of file paths to backup
 * @param backupDir - Directory to store backups
 * @returns Array of backup file paths (undefined for files that don't exist)
 *
 * @example
 * ```typescript
 * const backups = await backupFiles(['wrangler.toml', 'open-next.config.ts']);
 * ```
 */
export function backupFiles(filePaths: string[], backupDir: string = '.backup'): (string | undefined)[] {
  return filePaths.map((filePath) => backupFile(filePath, backupDir));
}
