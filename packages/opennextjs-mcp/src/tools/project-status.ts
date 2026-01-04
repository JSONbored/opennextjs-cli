/**
 * Project Status Tool
 *
 * MCP tool for getting project status information.
 *
 * @packageDocumentation
 */

import { detectNextJsProject, getNextJsVersion } from '@jsonbored/opennextjs-cli/utils';
import { readWranglerToml, readOpenNextConfig, readPackageJson, extractWorkerName, extractAccountId, extractCachingStrategy, extractEnvironments } from '@jsonbored/opennextjs-cli/utils';

/**
 * Handle get_project_status tool call
 */
export async function handleGetProjectStatus(_args: unknown): Promise<{
  content: Array<{
    type: 'text';
    text: string;
  }>;
}> {
  const projectRoot = process.cwd();
  const detection = detectNextJsProject(projectRoot);
  const nextJsVersion = getNextJsVersion(projectRoot);
  const packageJson = readPackageJson(projectRoot);
  const wranglerToml = readWranglerToml(projectRoot);
  const openNextConfig = readOpenNextConfig(projectRoot);

  const status: {
    nextJs?: {
      detected: boolean;
      version?: string;
    };
    openNext?: {
      configured: boolean;
      workerName?: string;
      accountId?: string;
      cachingStrategy?: string;
      environments?: string[];
    };
    dependencies?: {
      opennextjsCloudflare?: string;
      wrangler?: string;
    };
    packageManager?: string;
  } = {};

  status.nextJs = {
    detected: detection.isNextJsProject,
    ...(nextJsVersion ? { version: nextJsVersion } : {}),
  };

  if (detection.hasOpenNext && wranglerToml) {
    const workerName = extractWorkerName(wranglerToml);
    const accountId = extractAccountId(wranglerToml);
    const environments = extractEnvironments(wranglerToml);
    let cachingStrategy: string | undefined;

    if (openNextConfig) {
      cachingStrategy = extractCachingStrategy(openNextConfig);
    }

    status.openNext = {
      configured: true,
      ...(workerName ? { workerName } : {}),
      ...(accountId ? { accountId } : {}),
      ...(cachingStrategy ? { cachingStrategy } : {}),
      environments,
    };
  } else {
    status.openNext = {
      configured: false,
    };
  }

  if (packageJson) {
    const deps = {
      ...((packageJson['dependencies'] as Record<string, string>) || {}),
      ...((packageJson['devDependencies'] as Record<string, string>) || {}),
    };

    const opennextjsCloudflare = deps['@opennextjs/cloudflare'];
    const wrangler = deps['wrangler'];

    status.dependencies = {
      ...(opennextjsCloudflare ? { opennextjsCloudflare } : {}),
      ...(wrangler ? { wrangler } : {}),
    };
  }

  if (detection.packageManager) {
    status.packageManager = detection.packageManager;
  }

  return {
    content: [
      {
        type: 'text',
        text: JSON.stringify(status, null, 2),
      },
    ],
  };
}
