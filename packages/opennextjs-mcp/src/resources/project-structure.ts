/**
 * Project Structure Resource
 *
 * MCP resource for reading project file structure.
 *
 * @packageDocumentation
 */

import { readdirSync, statSync } from 'fs';
import { join } from 'path';

/**
 * Read project structure resource
 */
export async function readProjectStructure(uri: string) {
  const projectRoot = process.cwd();
  const structure: { files: string[]; directories: string[] } = {
    files: [],
    directories: [],
  };

  function scanDir(dir: string, depth: number = 0): void {
    if (depth > 3) return; // Limit depth

    try {
      const entries = readdirSync(dir);
      for (const entry of entries) {
        if (entry.startsWith('.') && depth === 0) continue; // Skip hidden at root
        if (entry === 'node_modules' || entry === '.next' || entry === 'dist') continue;

        const fullPath = join(dir, entry);
        const stat = statSync(fullPath);
        const relativePath = fullPath.replace(projectRoot + '/', '');

        if (stat.isDirectory()) {
          structure.directories.push(relativePath);
          scanDir(fullPath, depth + 1);
        } else {
          structure.files.push(relativePath);
        }
      }
    } catch {
      // Ignore errors
    }
  }

  scanDir(projectRoot);

  return {
    contents: [
      {
        uri,
        mimeType: 'application/json',
        text: JSON.stringify(structure, null, 2),
      },
    ],
  };
}
