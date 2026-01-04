/**
 * Template System
 *
 * Handles template-specific project generation and configuration.
 * Templates add dependencies, example code, and configuration presets.
 *
 * @packageDocumentation
 */

import { writeFile, mkdir, readFile } from 'fs/promises';
import { join } from 'path';
import { addDependency } from './package-manager.js';
import { logger } from './logger.js';
import type { PackageManager } from './package-manager.js';

/**
 * Template configuration interface
 */
export interface TemplateConfig {
  name: string;
  description: string;
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  files?: Array<{
    path: string;
    content: string;
  }>;
  scripts?: Record<string, string>;
  postInstall?: (projectPath: string, packageManager: PackageManager) => Promise<void>;
}

/**
 * Template registry
 */
const TEMPLATES: Record<string, TemplateConfig> = {
  basic: {
    name: 'Basic Next.js',
    description: 'Minimal setup with TypeScript and Tailwind',
    // Basic template is the default, no additional setup needed
  },
  minimal: {
    name: 'Minimal',
    description: 'Absolute minimum configuration',
    // Same as basic
  },
  starter: {
    name: 'Starter',
    description: 'Basic starter with common patterns',
    files: [
      {
        path: 'app/layout.tsx',
        content: `import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'My App',
  description: 'Generated with OpenNext.js CLI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
`,
      },
    ],
  },
  'with-auth': {
    name: 'With Authentication',
    description: 'Includes auth setup (NextAuth, Clerk, etc.)',
    dependencies: {
      'next-auth': '^5.0.0',
    },
    files: [
      {
        path: 'lib/auth.ts',
        content: `/**
 * Authentication Configuration
 * 
 * This file contains authentication setup. You can use:
 * - NextAuth.js (next-auth)
 * - Clerk
 * - Auth0
 * - Or any other auth provider
 */

// Example NextAuth configuration
export const authConfig = {
  // Add your auth configuration here
};
`,
      },
      {
        path: 'app/api/auth/[...nextauth]/route.ts',
        content: `import { NextAuthOptions } from 'next-auth';
import NextAuth from 'next-auth';

const authOptions: NextAuthOptions = {
  // Configure your auth providers here
  providers: [],
  // Add other NextAuth options
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
`,
      },
    ],
  },
  'with-database': {
    name: 'With Database',
    description: 'Includes database setup (D1, Hyperdrive, Prisma)',
    dependencies: {
      '@prisma/client': '^5.0.0',
    },
    devDependencies: {
      prisma: '^5.0.0',
    },
    files: [
      {
        path: 'prisma/schema.prisma',
        content: `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Example {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // Add your models here
}
`,
      },
      {
        path: 'lib/db.ts',
        content: `/**
 * Database Client
 * 
 * This file exports your database client.
 * For Cloudflare D1, use @cloudflare/workers-types
 * For Prisma, use PrismaClient
 */

// Example Prisma client
// import { PrismaClient } from '@prisma/client';
// export const db = new PrismaClient();
`,
      },
    ],
    scripts: {
      'db:generate': 'prisma generate',
      'db:push': 'prisma db push',
      'db:migrate': 'prisma migrate dev',
    },
  },
  'with-analytics': {
    name: 'With Analytics',
    description: 'Includes analytics setup',
    dependencies: {
      '@vercel/analytics': '^1.0.0',
    },
    files: [
      {
        path: 'components/analytics.tsx',
        content: `'use client';

import { Analytics } from '@vercel/analytics/react';

export function AnalyticsProvider() {
  return <Analytics />;
}
`,
      },
      {
        path: 'lib/analytics.ts',
        content: `/**
 * Analytics Configuration
 * 
 * This file contains analytics setup.
 * You can use:
 * - Vercel Analytics
 * - Cloudflare Analytics
 * - Google Analytics
 * - Or any other analytics provider
 */

export function trackEvent(event: string, properties?: Record<string, unknown>) {
  // Add your analytics tracking here
  if (typeof window !== 'undefined') {
    // Client-side tracking
    console.log('Track event:', event, properties);
  }
}
`,
      },
    ],
  },
  'fullstack-api': {
    name: 'Full-Stack with API',
    description: 'Complete API setup',
    files: [
      {
        path: 'app/api/example/route.ts',
        content: `import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({ message: 'Hello from API!' });
}

export async function POST(request: Request) {
  const body = await request.json();
  return NextResponse.json({ received: body });
}
`,
      },
      {
        path: 'lib/api-client.ts',
        content: `/**
 * API Client
 * 
 * Client-side API utilities for making requests to your API routes
 */

export async function apiRequest<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const response = await fetch(\`/api/\${endpoint}\`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
  });

  if (!response.ok) {
    throw new Error(\`API request failed: \${response.statusText}\`);
  }

  return response.json();
}
`,
      },
    ],
  },
  'fullstack-db': {
    name: 'Full-Stack with Database',
    description: 'Complete database integration',
    dependencies: {
      '@prisma/client': '^5.0.0',
    },
    devDependencies: {
      prisma: '^5.0.0',
    },
    files: [
      {
        path: 'prisma/schema.prisma',
        content: `// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "sqlite"
  url      = env("DATABASE_URL")
}

model Example {
  id        String   @id @default(cuid())
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  // Add your models here
}
`,
      },
      {
        path: 'lib/db.ts',
        content: `/**
 * Database Client
 * 
 * This file exports your database client.
 */

// Example Prisma client
// import { PrismaClient } from '@prisma/client';
// export const db = new PrismaClient();
`,
      },
      {
        path: 'app/api/example/route.ts',
        content: `import { NextResponse } from 'next/server';
// import { db } from '@/lib/db';

export async function GET() {
  // Example: const items = await db.example.findMany();
  return NextResponse.json({ message: 'API with database ready!' });
}
`,
      },
    ],
    scripts: {
      'db:generate': 'prisma generate',
      'db:push': 'prisma db push',
      'db:migrate': 'prisma migrate dev',
    },
  },
};

/**
 * Apply template to project
 */
export async function applyTemplate(
  templateName: string,
  projectPath: string,
  packageManager: PackageManager
): Promise<void> {
  const template = TEMPLATES[templateName];
  
  if (!template) {
    logger.warning(`Template "${templateName}" not found, skipping`);
    return;
  }

  // Skip basic/minimal templates (they're the default)
  if (templateName === 'basic' || templateName === 'minimal') {
    return;
  }

  logger.info(`Applying template: ${template.name}`);

  // Install dependencies
  if (template.dependencies) {
    for (const [dep, version] of Object.entries(template.dependencies)) {
      addDependency(`${dep}@${version}`, false, projectPath, packageManager);
    }
  }

  if (template.devDependencies) {
    for (const [dep, version] of Object.entries(template.devDependencies)) {
      addDependency(`${dep}@${version}`, true, projectPath, packageManager);
    }
  }

  // Create files
  if (template.files) {
    for (const file of template.files) {
      const filePath = join(projectPath, file.path);
      const fileDir = join(filePath, '..');
      
      // Ensure directory exists
      await mkdir(fileDir, { recursive: true });
      
      // Check if file already exists (from create-next-app)
      try {
        const existing = await readFile(filePath, 'utf-8');
        // If file exists and has content, skip (don't overwrite)
        if (existing.trim().length > 0) {
          logger.debug(`File ${file.path} already exists, skipping`);
          continue;
        }
      } catch {
        // File doesn't exist, create it
      }
      
      await writeFile(filePath, file.content, 'utf-8');
      logger.debug(`Created file: ${file.path}`);
    }
  }

  // Update package.json scripts (if needed)
  if (template.scripts) {
    try {
      const packageJsonPath = join(projectPath, 'package.json');
      const packageJson = JSON.parse(await readFile(packageJsonPath, 'utf-8')) as {
        scripts?: Record<string, string>;
        [key: string]: unknown;
      };
      
      if (!packageJson.scripts) {
        packageJson.scripts = {};
      }
      
      Object.assign(packageJson.scripts, template.scripts);
      
      await writeFile(packageJsonPath, JSON.stringify(packageJson, null, 2) + '\n', 'utf-8');
    } catch (error) {
      logger.warning('Failed to update package.json scripts', error);
    }
  }

  // Run post-install hook if provided
  if (template.postInstall) {
    await template.postInstall(projectPath, packageManager);
  }
}

/**
 * Apply multiple templates
 */
export async function applyTemplates(
  templateNames: string[],
  projectPath: string,
  packageManager: PackageManager
): Promise<void> {
  // Filter out basic/minimal (they're the default)
  const templatesToApply = templateNames.filter(
    (name) => name !== 'basic' && name !== 'minimal'
  );

  if (templatesToApply.length === 0) {
    return;
  }

  for (const templateName of templatesToApply) {
    await applyTemplate(templateName, projectPath, packageManager);
  }
}

/**
 * Get template information
 */
export function getTemplateInfo(templateName: string): TemplateConfig | undefined {
  return TEMPLATES[templateName];
}

/**
 * Get all available templates
 */
export function getAllTemplates(): Record<string, TemplateConfig> {
  return TEMPLATES;
}
