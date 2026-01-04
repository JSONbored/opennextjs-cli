/**
 * Status Command
 *
 * Displays current project status and configuration information.
 *
 * @packageDocumentation
 */

import { Command } from 'commander';
import * as p from '@clack/prompts';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { detectNextJsProject, getNextJsVersion } from '../utils/project-detector.js';
import { readWranglerToml, readOpenNextConfig, readPackageJson, extractWorkerName, extractAccountId, extractCachingStrategy, extractEnvironments } from '../utils/config-reader.js';
import { detectMonorepo } from '../utils/monorepo-detector.js';
import { logger } from '../utils/logger.js';

/**
 * Creates the `status` command for displaying project status
 *
 * @description
 * This command shows comprehensive information about the current OpenNext.js
 * project including configuration, dependencies, and deployment status.
 *
 * @returns Configured Commander command
 *
 * @example
 * ```bash
 * opennextjs-cli status
 * ```
 */
export function statusCommand(): Command {
  const command = new Command('status');

  command
    .description('Display current project status and configuration information')
    .summary('Show OpenNext.js project status')
    .option(
      '--json',
      'Output status information as JSON'
    )
    .addHelpText(
      'after',
      `
Examples:
  opennextjs-cli status              Display project status
  opennextjs-cli status --json       Output as JSON

What it shows:
  • Next.js version and project detection
  • OpenNext.js Cloudflare configuration status
  • Installed dependencies (@opennextjs/cloudflare, wrangler)
  • Cloudflare Worker name and account ID
  • Caching strategy
  • Environment configurations
  • Package manager detection

Use this command to quickly check your project setup and configuration.
`
    )
    .action(async (options: { json?: boolean }) => {
      try {
        if (!options.json) {
          p.intro('📊 Project Status');
        }

        // Step 1: Detect project location and all workers
        const detectSpinner = p.spinner();
        if (!options.json) {
          detectSpinner.start('Scanning monorepo...');
          // Add minimum delay so spinner is visible
          await new Promise((resolve) => setTimeout(resolve, 300));
        }
        
        let projectRoot = process.cwd();
        let detection = detectNextJsProject(projectRoot);
        const allWorkers: Array<{ path: string; name?: string; isOpenNext?: boolean }> = [];
        
        // Check if we're in a monorepo
        const monorepo = detectMonorepo(projectRoot);
        if (monorepo.isMonorepo && monorepo.workspaceRoot) {
          const workspaceRoot = monorepo.workspaceRoot;
          const workspaces = monorepo.workspaces || [];
          
          // Expand workspace patterns (e.g., 'apps/*' -> all directories in apps/)
          const workspaceDirs: string[] = [];
          for (const pattern of workspaces) {
            if (pattern.includes('*')) {
              const baseDir = pattern.replace('/*', '').replace('\\*', '');
              const fullPath = join(workspaceRoot, baseDir);
              if (existsSync(fullPath)) {
                try {
                  const dirs = readdirSync(fullPath, { withFileTypes: true })
                    .filter((dirent) => dirent.isDirectory())
                    .map((dirent) => join(fullPath, dirent.name));
                  workspaceDirs.push(...dirs);
                } catch {
                  // Ignore read errors
                }
              }
            } else {
              workspaceDirs.push(join(workspaceRoot, pattern));
            }
          }
          
          // Search for Next.js projects and all Cloudflare Workers
          for (const workspaceDir of workspaceDirs) {
            if (existsSync(workspaceDir)) {
              // Check for wrangler config files (any Cloudflare Worker)
              const wranglerFiles = [
                join(workspaceDir, 'wrangler.toml'),
                join(workspaceDir, 'wrangler.json'),
                join(workspaceDir, 'wrangler.jsonc'),
              ];
              
              for (const wranglerPath of wranglerFiles) {
                if (existsSync(wranglerPath)) {
                  try {
                    const wranglerContent = readFileSync(wranglerPath, 'utf-8');
                    // For JSON/JSONC files, try to parse and extract name
                    let workerName: string | undefined;
                    if (wranglerPath.endsWith('.json') || wranglerPath.endsWith('.jsonc')) {
                      try {
                        // Remove comments from JSONC (both // and /* */ style)
                        const jsonContent = wranglerContent
                          .replace(/\/\/.*$/gm, '') // Remove // comments
                          .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove /* */ comments
                        const config = JSON.parse(jsonContent) as { name?: string };
                        workerName = typeof config.name === 'string' ? config.name : undefined;
                      } catch {
                        // If parsing fails, try regex extraction
                        const nameMatch = wranglerContent.match(/"name"\s*:\s*"([^"]+)"/);
                        workerName = nameMatch?.[1];
                      }
                    } else {
                      workerName = extractWorkerName(wranglerContent);
                    }
                    
                    const isOpenNext = existsSync(join(workspaceDir, 'open-next.config.ts'));
                    
                    const worker: { path: string; name?: string; isOpenNext?: boolean } = {
                      path: workspaceDir,
                      isOpenNext,
                    };
                    if (workerName) {
                      worker.name = workerName;
                    }
                    allWorkers.push(worker);
                    break; // Found a wrangler config, move to next workspace
                  } catch {
                    // Ignore read errors
                  }
                }
              }
              
              // Check for Next.js projects
              if (!detection.isNextJsProject) {
                const workspaceDetection = detectNextJsProject(workspaceDir);
                if (workspaceDetection.isNextJsProject) {
                  projectRoot = workspaceDir;
                  detection = workspaceDetection;
                }
              }
            }
          }
        } else {
          // Not a monorepo - check current directory for worker
          const wranglerFiles = [
            join(projectRoot, 'wrangler.toml'),
            join(projectRoot, 'wrangler.json'),
            join(projectRoot, 'wrangler.jsonc'),
          ];
          
          for (const wranglerPath of wranglerFiles) {
            if (existsSync(wranglerPath)) {
              try {
                const wranglerContent = readFileSync(wranglerPath, 'utf-8');
                // For JSON/JSONC files, try to parse and extract name
                let workerName: string | undefined;
                if (wranglerPath.endsWith('.json') || wranglerPath.endsWith('.jsonc')) {
                  try {
                    // Remove comments from JSONC (both // and /* */ style)
                    const jsonContent = wranglerContent
                      .replace(/\/\/.*$/gm, '') // Remove // comments
                      .replace(/\/\*[\s\S]*?\*\//g, ''); // Remove /* */ comments
                    const config = JSON.parse(jsonContent) as { name?: string };
                    workerName = typeof config.name === 'string' ? config.name : undefined;
                  } catch {
                    // If parsing fails, try regex extraction
                    const nameMatch = wranglerContent.match(/"name"\s*:\s*"([^"]+)"/);
                    workerName = nameMatch?.[1];
                  }
                } else {
                  workerName = extractWorkerName(wranglerContent);
                }
                
                const isOpenNext = existsSync(join(projectRoot, 'open-next.config.ts'));
                
                const worker: { path: string; name?: string; isOpenNext?: boolean } = {
                  path: projectRoot,
                  isOpenNext,
                };
                if (workerName) {
                  worker.name = workerName;
                }
                allWorkers.push(worker);
                break; // Found a wrangler config
              } catch {
                // Ignore read errors
              }
            }
          }
        }
        
        if (!options.json) {
          if (allWorkers.length > 0) {
            detectSpinner.stop(`Found ${allWorkers.length} worker(s)`);
          } else if (detection.isNextJsProject) {
            detectSpinner.stop('Project detected');
          } else {
            detectSpinner.stop('No workers found');
          }
        }
        
        // Step 2: Read configuration files
        const configSpinner = p.spinner();
        if (!options.json) {
          configSpinner.start('Reading configuration...');
          await new Promise((resolve) => setTimeout(resolve, 200));
        }
        
        const nextJsVersion = getNextJsVersion(projectRoot);
        const packageJson = readPackageJson(projectRoot);
        const wranglerToml = readWranglerToml(projectRoot);
        const openNextConfig = readOpenNextConfig(projectRoot);
        
        if (!options.json) {
          configSpinner.stop('Configuration read');
        }

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
          allWorkers?: Array<{ path: string; name?: string; isOpenNext?: boolean }>;
        } = {};

        // Next.js status
  status.nextJs = {
    detected: detection.isNextJsProject,
    ...(nextJsVersion ? { version: nextJsVersion } : {}),
  };

        // OpenNext.js status
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

        // Dependencies
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

        // Package manager
        if (detection.packageManager) {
          status.packageManager = detection.packageManager;
        }
        
        // All workers
        if (allWorkers.length > 0) {
          status.allWorkers = allWorkers;
        }

        // Output
        if (options.json) {
          console.log(JSON.stringify(status, null, 2));
          return;
        }

        // Display status with beautiful, structured animations
        await new Promise((resolve) => setTimeout(resolve, 150));
        
        // Group 1: Cloudflare Workers (if in monorepo)
        if (status.allWorkers && status.allWorkers.length > 0) {
          const workersList = status.allWorkers.map((worker) => {
            const relativePath = worker.path.replace(process.cwd() + '/', '');
            const workerType = worker.isOpenNext ? 'OpenNext.js' : 'Cloudflare Worker';
            if (worker.name) {
              return `  • ${worker.name} (${workerType})\n    Path: ${relativePath}`;
            }
            return `  • ${relativePath} (${workerType})`;
          }).join('\n\n');
          
          await new Promise((resolve) => setTimeout(resolve, 100));
          p.note(workersList, 'Cloudflare Workers');
          await new Promise((resolve) => setTimeout(resolve, 150));
        }
        
        // Group 2: Next.js Project Status
        const nextJsInfo: string[] = [];
        if (status.nextJs?.detected) {
          nextJsInfo.push(`  ✓ Next.js ${status.nextJs.version || 'unknown version'} detected`);
        } else {
          nextJsInfo.push('  ✗ No Next.js project detected in current directory');
        }
        
        await new Promise((resolve) => setTimeout(resolve, 100));
        p.note(nextJsInfo.join('\n'), 'Next.js Project');
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Group 3: OpenNext.js Cloudflare Configuration
        const openNextInfo: string[] = [];
        if (status.openNext?.configured) {
          openNextInfo.push('  ✓ OpenNext.js Cloudflare is configured');
          
          if (status.openNext.workerName) {
            openNextInfo.push(`  Worker Name: ${status.openNext.workerName}`);
          }
          if (status.openNext.accountId) {
            openNextInfo.push(`  Account ID: ${status.openNext.accountId}`);
          }
          if (status.openNext.cachingStrategy) {
            openNextInfo.push(`  Caching Strategy: ${status.openNext.cachingStrategy}`);
          }
          if (status.openNext.environments && status.openNext.environments.length > 0) {
            const uniqueEnvs = [...new Set(status.openNext.environments)];
            if (uniqueEnvs.length <= 5) {
              openNextInfo.push(`  Environments: ${uniqueEnvs.join(', ')}`);
            } else {
              openNextInfo.push(`  Environments: ${uniqueEnvs.slice(0, 5).join(', ')} (+${uniqueEnvs.length - 5} more)`);
            }
          }
        } else {
          openNextInfo.push('  ✗ OpenNext.js Cloudflare is not configured');
          openNextInfo.push('  Run "opennextjs-cli add" to set up OpenNext.js');
        }
        
        await new Promise((resolve) => setTimeout(resolve, 100));
        p.note(openNextInfo.join('\n'), 'OpenNext.js Cloudflare');
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Group 4: Dependencies
        const depsInfo: string[] = [];
        if (status.dependencies?.opennextjsCloudflare) {
          depsInfo.push(`  ✓ @opennextjs/cloudflare: ${status.dependencies.opennextjsCloudflare}`);
        } else {
          depsInfo.push('  ✗ @opennextjs/cloudflare: not installed');
        }
        if (status.dependencies?.wrangler) {
          depsInfo.push(`  ✓ wrangler: ${status.dependencies.wrangler}`);
        } else {
          depsInfo.push('  ✗ wrangler: not installed');
        }
        
        await new Promise((resolve) => setTimeout(resolve, 100));
        p.note(depsInfo.join('\n'), 'Dependencies');
        await new Promise((resolve) => setTimeout(resolve, 150));

        // Group 5: Package Manager (if detected)
        if (status.packageManager) {
          await new Promise((resolve) => setTimeout(resolve, 100));
          p.note(`  Detected: ${status.packageManager}`, 'Package Manager');
          await new Promise((resolve) => setTimeout(resolve, 150));
        }

        await new Promise((resolve) => setTimeout(resolve, 150));
        p.outro('Status check complete');
      } catch (error) {
        logger.error('Failed to get project status', error);
        process.exit(1);
      }
    });

  return command;
}
