/**
 * Wrangler TOML Generator
 *
 * Generates wrangler.toml configuration file for Cloudflare Workers.
 *
 * @packageDocumentation
 */

import { writeFileSync } from 'fs';
import { join } from 'path';
import type { CloudflareConfig } from '../../../schemas/config.js';
import { logger } from '../../../utils/logger.js';

/**
 * Generates wrangler.toml file
 *
 * @description
 * Creates the Cloudflare Workers configuration file with all necessary bindings,
 * environments, and observability settings.
 *
 * @param config - Cloudflare configuration
 * @param projectRoot - Root directory of the project
 * @returns Promise that resolves when file is written
 *
 * @example
 * ```typescript
 * await generateWranglerToml(config, process.cwd());
 * ```
 */
export async function generateWranglerToml(
  config: CloudflareConfig,
  projectRoot: string
): Promise<void> {
  const filePath = join(projectRoot, 'wrangler.toml');
  const content = generateWranglerTomlContent(config);

  writeFileSync(filePath, content, 'utf-8');
  logger.success(`Generated wrangler.toml`);
}

/**
 * Generates the content for wrangler.toml
 *
 * @description
 * Creates the TOML configuration content with all bindings and settings.
 *
 * @param config - Cloudflare configuration
 * @returns TOML configuration content as string
 */
function generateWranglerTomlContent(config: CloudflareConfig): string {
  const { workerName, cachingStrategy, database, imageOptimization, analyticsEngine, environments, compatibilityDate } = config;

  let content = `name = "${workerName}"
main = ".open-next/worker.js"
compatibility_date = "${compatibilityDate}"
compatibility_flags = ["nodejs_compat", "global_fetch_strictly_public"]
logpush = ${environments.some((e) => e.observability.logpush)}

# Static assets binding - required for OpenNext.js Cloudflare
[assets]
directory = ".open-next/assets"
binding = "ASSETS"
run_worker_first = false

`;

  // Service binding for ISR revalidation
  if (cachingStrategy !== 'static-assets') {
    content += `# Service binding - self reference required for ISR revalidation and res.revalidate
[[services]]
binding = "WORKER_SELF_REFERENCE"
service = "${workerName}"

`;
  }

  // R2 bucket for caching (if not using static assets)
  if (cachingStrategy !== 'static-assets') {
    content += `# R2 bucket for incremental cache (ISR/SSG pages)
[[r2_buckets]]
binding = "NEXT_INC_CACHE_R2_BUCKET"
bucket_name = "${workerName}-cache"

`;
  }

  // Durable Objects for queue and tag cache
  if (cachingStrategy === 'r2-do-queue' || cachingStrategy === 'r2-do-queue-tag-cache') {
    content += `# Durable Object for queue
[[durable_objects.bindings]]
name = "NEXT_QUEUE"
class_name = "Queue"

`;
    if (cachingStrategy === 'r2-do-queue-tag-cache') {
      content += `# Durable Object for tag cache
[[durable_objects.bindings]]
name = "NEXT_TAG_CACHE"
class_name = "TagCache"

`;
    }
  }

  // Database bindings
  if (database === 'd1') {
    content += `# D1 database binding
# TODO: Create your D1 database and update the database_id
# Run: wrangler d1 create ${workerName}-db
[[d1_databases]]
binding = "DB"
database_name = "${workerName}-db"
database_id = "YOUR_DATABASE_ID_HERE"

`;
  } else if (database === 'hyperdrive') {
    content += `# Hyperdrive binding for PostgreSQL acceleration
# TODO: Create your Hyperdrive configuration and update the config_id
# Run: wrangler hyperdrive create ${workerName}-hyperdrive --connection-string "postgresql://..."
[[hyperdrive]]
binding = "HYPERDRIVE"
id = "YOUR_HYPERDRIVE_ID_HERE"

`;
  }

  // Image optimization binding
  if (imageOptimization) {
    content += `# Image optimization binding (Cloudflare Images)
[images]
binding = "IMAGES"

`;
  }

  // Analytics Engine binding
  if (analyticsEngine) {
    content += `# Analytics Engine binding
[[analytics_engine_datasets]]
binding = "ANALYTICS"

`;
  }

  // Observability configuration
  const devEnv = environments.find((e) => e.name === 'development');
  const prodEnv = environments.find((e) => e.name === 'production');

  if (devEnv) {
    content += `[observability]
enabled = true
head_sampling_rate = ${devEnv.observability.logSamplingRate}

[observability.logs]
enabled = ${devEnv.observability.logs}
head_sampling_rate = ${devEnv.observability.logSamplingRate}
invocation_logs = true
persist = true

[observability.traces]
enabled = ${devEnv.observability.traces}
head_sampling_rate = ${devEnv.observability.traceSamplingRate}
persist = true

`;
  }

  // Environment-specific configurations
  if (prodEnv) {
    content += `# Production environment
[env.production]
compatibility_date = "${compatibilityDate}"

[env.production.observability]
enabled = true
head_sampling_rate = ${prodEnv.observability.logSamplingRate}

[env.production.observability.logs]
enabled = ${prodEnv.observability.logs}
head_sampling_rate = ${prodEnv.observability.logSamplingRate}
invocation_logs = true
persist = true

[env.production.observability.traces]
enabled = ${prodEnv.observability.traces}
head_sampling_rate = ${prodEnv.observability.traceSamplingRate}
persist = true

`;
  }

  // Smart placement
  content += `# Smart placement - automatically positions Worker in optimal data center
[placement]
mode = "smart"
`;

  return content;
}
