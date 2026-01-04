/**
 * Configuration Schemas
 *
 * Zod schemas for validating configuration inputs and generating types.
 *
 * @packageDocumentation
 */

import { z } from 'zod';

/**
 * Caching strategy schema
 *
 * @description
 * Validates caching strategy selection.
 */
export const cachingStrategySchema = z.enum(['static-assets', 'r2', 'r2-do-queue', 'r2-do-queue-tag-cache']);

/**
 * Database option schema
 *
 * @description
 * Validates database binding selection.
 */
export const databaseOptionSchema = z.enum(['none', 'hyperdrive', 'd1']);

/**
 * Observability configuration schema
 *
 * @description
 * Validates observability settings for an environment.
 */
export const observabilitySchema = z.object({
  logs: z.boolean(),
  logSamplingRate: z.number().min(0).max(1),
  traces: z.boolean(),
  traceSamplingRate: z.number().min(0).max(1),
  logpush: z.boolean(),
});

/**
 * Environment configuration schema
 *
 * @description
 * Validates environment configuration.
 */
export const environmentConfigSchema = z.object({
  name: z.string().min(1, 'Environment name is required'),
  observability: observabilitySchema,
  vars: z.record(z.string(), z.string()).optional(),
});

/**
 * Cloudflare configuration schema
 *
 * @description
 * Complete schema for validating Cloudflare platform configuration.
 */
export const cloudflareConfigSchema = z.object({
  workerName: z.string().min(1, 'Worker name is required'),
  cachingStrategy: cachingStrategySchema,
  database: databaseOptionSchema,
  imageOptimization: z.boolean(),
  analyticsEngine: z.boolean(),
  environments: z.array(environmentConfigSchema).min(1, 'At least one environment is required'),
  nextJsVersion: z.string().regex(/^\d+\.\d+\.\d+$/, 'Invalid Next.js version format'),
  compatibilityDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Invalid date format (YYYY-MM-DD)'),
});

/**
 * Type inference from Cloudflare config schema
 */
export type CloudflareConfig = z.infer<typeof cloudflareConfigSchema>;

/**
 * Type inference from environment config schema
 */
export type EnvironmentConfig = z.infer<typeof environmentConfigSchema>;
