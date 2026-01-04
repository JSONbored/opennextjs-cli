/**
 * Configuration Manager
 *
 * Manages global and project-specific configuration files.
 *
 * @packageDocumentation
 */

import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import { homedir } from 'os';
import { logger } from './logger.js';

/**
 * Configuration file structure
 */
export interface CliConfig {
  defaultPackageManager?: 'pnpm' | 'npm' | 'yarn';
  defaultCachingStrategy?: 'static-assets' | 'r2' | 'r2-do-queue' | 'r2-do-queue-tag-cache';
  autoBackup?: boolean;
  confirmDestructive?: boolean;
  verbose?: boolean;
  theme?: 'default' | 'minimal' | 'colorful' | 'high-contrast';
  projectDefaults?: {
    workerName?: string;
    accountId?: string;
  };
}

/**
 * Gets the global config file path
 */
export function getGlobalConfigPath(): string {
  return join(homedir(), '.opennextjs-cli', 'config.json');
}

/**
 * Gets the project config file path
 */
export function getProjectConfigPath(projectRoot: string = process.cwd()): string {
  return join(projectRoot, '.opennextjs-cli.json');
}

/**
 * Reads global configuration
 */
export function readGlobalConfig(): CliConfig | null {
  const configPath = getGlobalConfigPath();
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as CliConfig;
  } catch {
    return null;
  }
}

/**
 * Reads project-specific configuration
 */
export function readProjectConfig(projectRoot: string = process.cwd()): CliConfig | null {
  const configPath = getProjectConfigPath(projectRoot);
  if (!existsSync(configPath)) {
    return null;
  }

  try {
    const content = readFileSync(configPath, 'utf-8');
    return JSON.parse(content) as CliConfig;
  } catch {
    return null;
  }
}

/**
 * Merges global and project configs (project takes precedence)
 */
export function getMergedConfig(projectRoot: string = process.cwd()): CliConfig {
  const global = readGlobalConfig() || {};
  const project = readProjectConfig(projectRoot) || {};
  return { ...global, ...project };
}

/**
 * Writes global configuration
 */
export function writeGlobalConfig(config: CliConfig): void {
  const configPath = getGlobalConfigPath();
  const configDir = join(homedir(), '.opennextjs-cli');

  try {
    mkdirSync(configDir, { recursive: true });
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
    logger.success('Global configuration updated');
  } catch (error) {
    logger.error('Failed to write global config', error);
    throw error;
  }
}

/**
 * Writes project-specific configuration
 */
export function writeProjectConfig(config: CliConfig, projectRoot: string = process.cwd()): void {
  const configPath = getProjectConfigPath(projectRoot);

  try {
    writeFileSync(configPath, JSON.stringify(config, null, 2) + '\n', 'utf-8');
    logger.success('Project configuration updated');
  } catch (error) {
    logger.error('Failed to write project config', error);
    throw error;
  }
}
