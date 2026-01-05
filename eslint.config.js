import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked.map((config) => ({
    ...config,
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      ...config.languageOptions,
      parserOptions: {
        ...config.languageOptions?.parserOptions,
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  })),
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
        },
      ],
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/no-explicit-any': 'error',
    },
  },
  {
    // MCP handlers need to be async for MCP SDK compatibility
    // even if they don't use await internally
    files: [
      'packages/opennextjs-mcp/src/tools/**/*.ts',
      'packages/opennextjs-mcp/src/prompts/**/*.ts',
      'packages/opennextjs-mcp/src/resources/**/*.ts',
    ],
    rules: {
      '@typescript-eslint/require-await': 'off',
    },
  },
  {
    // p.tasks() requires async functions, but some tasks may not use await
    files: ['packages/opennextjs-cli/src/commands/**/*.ts'],
    rules: {
      '@typescript-eslint/require-await': 'off',
      // Allow missing return types for task functions (they're inferred from p.tasks())
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },
  {
    files: ['**/*.js', '**/*.mjs'],
    languageOptions: {
      parserOptions: {
        project: false,
      },
    },
  },
  {
    ignores: [
      'node_modules/**',
      'dist/**',
      '.turbo/**',
      '*.config.js',
      '**/*.config.js',
      '*.config.mjs',
      'scripts/**',
    ],
  }
);
