/**
 * Logger Utility
 *
 * Provides beautiful, modern terminal output using @clack/prompts (same as next-forge).
 *
 * @packageDocumentation
 */

import * as p from '@clack/prompts';

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
    if (data) {
      p.log.info(JSON.stringify(data, null, 2));
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
