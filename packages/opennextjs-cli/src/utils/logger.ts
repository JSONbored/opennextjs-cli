/**
 * Logger Utility
 *
 * Provides beautiful, modern terminal output using @clack/prompts (same as next-forge).
 *
 * @packageDocumentation
 */

import * as p from '@clack/prompts';

/**
 * Log level
 */
export type LogLevel = 'info' | 'verbose' | 'debug';

/**
 * Global log level setting
 */
let globalLogLevel: LogLevel = 'info';

/**
 * Set global log level
 */
export function setLogLevel(level: LogLevel): void {
  globalLogLevel = level;
}

/**
 * Get global log level
 */
export function getLogLevel(): LogLevel {
  return globalLogLevel;
}

/**
 * Check if verbose logging is enabled
 */
function isVerbose(): boolean {
  return globalLogLevel === 'verbose' || globalLogLevel === 'debug';
}

/**
 * Check if debug logging is enabled
 */
function isDebug(): boolean {
  return globalLogLevel === 'debug';
}

/**
 * Logger class using @clack/prompts
 *
 * @description
 * Provides methods for logging messages using @clack/prompts, matching next-forge's implementation.
 */
export class Logger {
  /**
   * Log an informational message
   */
  info(message: string, data?: unknown): void {
    p.log.info(message);
    if (data && (isVerbose() || isDebug())) {
      p.log.info(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log a verbose message (only shown in verbose/debug mode)
   */
  verbose(message: string, data?: unknown): void {
    if (isVerbose()) {
      p.log.info(`[verbose] ${message}`);
      if (data && isDebug()) {
        p.log.info(JSON.stringify(data, null, 2));
      }
    }
  }

  /**
   * Log a debug message (only shown in debug mode)
   */
  debug(message: string, data?: unknown): void {
    if (isDebug()) {
      p.log.info(`[debug] ${message}`);
      if (data) {
        p.log.info(JSON.stringify(data, null, 2));
      }
    }
  }

  /**
   * Log a success message
   */
  success(message: string, data?: unknown): void {
    p.log.success(message);
    if (data) {
      p.log.info(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log a warning message
   */
  warning(message: string, data?: unknown): void {
    p.log.warning(message);
    if (data) {
      p.log.info(JSON.stringify(data, null, 2));
    }
  }

  /**
   * Log an error message
   */
  error(message: string, error?: unknown): void {
    p.log.error(message);
    if (error instanceof Error) {
      p.log.error(error.message);
      if (error.stack) {
        p.log.info(error.stack);
      }
    } else if (error) {
      p.log.info(JSON.stringify(error, null, 2));
    }
  }

  /**
   * Create a spinner for async operations
   */
  spinner(_text: string): ReturnType<typeof p.spinner> {
    return p.spinner();
  }

  /**
   * Display a note/boxed message
   */
  box(message: string, options?: { title?: string }): void {
    p.note(message, options?.title);
  }

  /**
   * Display a section header
   */
  section(title: string): void {
    p.log.step(title);
  }
}

/**
 * Default logger instance
 */
export const logger = new Logger();
