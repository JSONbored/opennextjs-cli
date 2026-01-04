/**
 * Logger Utility
 *
 * Provides colored terminal output for CLI messages.
 *
 * @packageDocumentation
 */

import chalk from 'chalk';

/**
 * Log levels for different types of messages
 */
export enum LogLevel {
  INFO = 'info',
  SUCCESS = 'success',
  WARNING = 'warning',
  ERROR = 'error',
}

/**
 * Logger class for colored terminal output
 *
 * @description
 * Provides methods for logging messages with appropriate colors
 * and formatting for the CLI interface.
 *
 * @example
 * ```typescript
 * import { logger } from './utils/logger.js';
 * logger.info('Starting setup...');
 * logger.success('Setup complete!');
 * logger.warning('This is experimental');
 * logger.error('Something went wrong');
 * ```
 */
export class Logger {
  /**
   * Log an informational message
   *
   * @param message - Message to display
   * @param data - Optional additional data to display
   */
  info(message: string, data?: unknown): void {
    console.log(chalk.blue('ℹ'), message);
    if (data) {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }

  /**
   * Log a success message
   *
   * @param message - Message to display
   * @param data - Optional additional data to display
   */
  success(message: string, data?: unknown): void {
    console.log(chalk.green('✓'), message);
    if (data) {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }

  /**
   * Log a warning message
   *
   * @param message - Message to display
   * @param data - Optional additional data to display
   */
  warning(message: string, data?: unknown): void {
    console.log(chalk.yellow('⚠'), message);
    if (data) {
      console.log(chalk.gray(JSON.stringify(data, null, 2)));
    }
  }

  /**
   * Log an error message
   *
   * @param message - Message to display
   * @param error - Optional error object
   */
  error(message: string, error?: unknown): void {
    console.error(chalk.red('✗'), message);
    if (error instanceof Error) {
      console.error(chalk.red(error.message));
      if (error.stack) {
        console.error(chalk.gray(error.stack));
      }
    } else if (error) {
      console.error(chalk.gray(JSON.stringify(error, null, 2)));
    }
  }
}

/**
 * Default logger instance
 *
 * @description
 * Singleton logger instance for use throughout the CLI.
 */
export const logger = new Logger();
