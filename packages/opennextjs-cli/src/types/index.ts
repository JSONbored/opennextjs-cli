/**
 * Type Definitions
 *
 * Core TypeScript type definitions for the OpenNext.js CLI.
 *
 * @packageDocumentation
 */

/**
 * Caching strategy options for OpenNext.js Cloudflare
 *
 * @description
 * Available caching strategies supported by OpenNext.js Cloudflare adapter.
 */
export type CachingStrategy =
  | 'static-assets'
  | 'r2'
  | 'r2-do-queue'
  | 'r2-do-queue-tag-cache';

/**
 * Database binding options for Cloudflare Workers
 *
 * @description
 * Available database integration options.
 */
export type DatabaseOption = 'none' | 'hyperdrive' | 'd1';

/**
 * Environment configuration
 *
 * @description
 * Configuration for a deployment environment (dev, production, etc.).
 */
export interface EnvironmentConfig {
  /** Environment name */
  name: string;
  /** Observability settings */
  observability: {
    /** Enable logging */
    logs: boolean;
    /** Log sampling rate (0-1) */
    logSamplingRate: number;
    /** Enable tracing */
    traces: boolean;
    /** Trace sampling rate (0-1) */
    traceSamplingRate: number;
    /** Enable logpush */
    logpush: boolean;
  };
  /** Environment variables */
  vars?: Record<string, string>;
}

/**
 * Cloudflare platform configuration
 *
 * @description
 * Complete configuration for OpenNext.js Cloudflare deployment.
 */
export interface CloudflareConfig {
  /** Worker name */
  workerName: string;
  /** Caching strategy */
  cachingStrategy: CachingStrategy;
  /** Database option */
  database: DatabaseOption;
  /** Enable image optimization */
  imageOptimization: boolean;
  /** Enable analytics engine */
  analyticsEngine: boolean;
  /** Environments */
  environments: EnvironmentConfig[];
  /** Next.js version */
  nextJsVersion: string;
  /** Compatibility date for Cloudflare Workers */
  compatibilityDate: string;
}

/**
 * Project detection result
 *
 * @description
 * Result of detecting an existing Next.js project.
 */
export interface ProjectDetectionResult {
  /** Whether a Next.js project was detected */
  isNextJsProject: boolean;
  /** Whether OpenNext is already configured */
  hasOpenNext: boolean;
  /** Detected Next.js version */
  nextJsVersion?: string;
  /** Package manager detected */
  packageManager?: 'npm' | 'pnpm' | 'yarn';
}
