/**
 * Template Selector Utilities
 *
 * Utilities for template selection using p.groupMultiselect().
 * Prepared for Phase 3 template feature implementation.
 *
 * @packageDocumentation
 */

import * as p from '@clack/prompts';
import { cancel, isCancel } from '@clack/prompts';

/**
 * Template category structure for groupMultiselect
 */
export interface TemplateCategory {
  [category: string]: Array<{
    value: string;
    label: string;
    hint?: string;
  }>;
}

/**
 * Available template categories and options
 * Prepared for Phase 3 implementation
 */
export const TEMPLATE_CATEGORIES: TemplateCategory = {
  'Basic Templates': [
    { value: 'basic', label: 'Basic Next.js', hint: 'Minimal setup with TypeScript and Tailwind' },
    { value: 'minimal', label: 'Minimal', hint: 'Absolute minimum configuration' },
    { value: 'starter', label: 'Starter', hint: 'Basic starter with common patterns' },
  ],
  'With Features': [
    { value: 'with-auth', label: 'With Authentication', hint: 'Includes auth setup (NextAuth, Clerk, etc.)' },
    { value: 'with-database', label: 'With Database', hint: 'Includes database setup (D1, Hyperdrive, etc.)' },
    { value: 'with-analytics', label: 'With Analytics', hint: 'Includes analytics setup' },
  ],
  'Full-Stack': [
    { value: 'fullstack-api', label: 'Full-Stack with API', hint: 'Complete API setup' },
    { value: 'fullstack-db', label: 'Full-Stack with Database', hint: 'Complete database integration' },
  ],
};

/**
 * Prompt for template selection using groupMultiselect
 * 
 * @param message - Prompt message
 * @param initialValues - Initial selected values
 * @returns Selected template values
 */
export async function promptTemplateSelection(
  message: string = 'Select project templates:',
  initialValues: string[] = ['basic']
): Promise<string[]> {
  const selected = await p.groupMultiselect({
    message,
    options: TEMPLATE_CATEGORIES,
    initialValues,
  });

  if (isCancel(selected)) {
    cancel('Operation cancelled.');
    process.exit(0);
  }

  return selected;
}

/**
 * Get template options for use in other prompts
 */
export function getTemplateOptions(): TemplateCategory {
  return TEMPLATE_CATEGORIES;
}
