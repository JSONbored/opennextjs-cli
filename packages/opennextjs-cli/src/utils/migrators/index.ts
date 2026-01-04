/**
 * Migration Utilities
 *
 * Exports all migration utilities.
 *
 * @packageDocumentation
 */

export * from './platform-detector.js';
export { migrateFromVercel, type VercelConfig } from './vercel-migrator.js';
export type { MigrationResult as VercelMigrationResult } from './vercel-migrator.js';
export { migrateFromNetlify, type NetlifyConfig } from './netlify-migrator.js';
export type { MigrationResult as NetlifyMigrationResult } from './netlify-migrator.js';
