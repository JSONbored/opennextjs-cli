import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        project: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
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
    ignores: [
      'node_modules/**',
      'dist/**',
      '.turbo/**',
      '*.config.js',
      '*.config.mjs',
      'scripts/**',
    ],
  }
);
