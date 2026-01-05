# Test Suite

This directory contains comprehensive tests for the OpenNext.js CLI.

## Test Structure

```
__tests__/
├── commands/          # Unit tests for each command
├── utils/            # Unit tests for utilities
└── e2e/              # End-to-end integration tests
```

## Running Tests

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm run test:watch

# Run tests with coverage
pnpm run test:coverage
```

## Test Categories

### Unit Tests (`commands/`, `utils/`)
- Test individual command functions
- Test utility functions in isolation
- Mock external dependencies
- Fast execution

### Integration Tests (`e2e/`)
- Test complete command workflows
- Test with real file system operations
- Test monorepo scenarios
- Test error handling

## Writing Tests

### Example Unit Test

```typescript
import { describe, it, expect } from '@jest/globals';
import { validateCommand } from '../commands/validate.js';

describe('validateCommand', () => {
  it('should create a command with correct name', () => {
    const command = validateCommand();
    expect(command.name()).toBe('validate');
  });
});
```

### Example E2E Test

```typescript
import { describe, it, expect } from '@jest/globals';
import { execa } from 'execa';

describe('validate command e2e', () => {
  it('should validate a Next.js project', async () => {
    const { stdout } = await execa('node', [
      './dist/index.js',
      'validate',
    ], {
      cwd: './test-fixtures/nextjs-project',
    });
    
    expect(stdout).toContain('Validating Configuration');
  });
});
```
