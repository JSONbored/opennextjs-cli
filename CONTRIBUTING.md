# Contributing to OpenNext.js CLI

Thank you for your interest in contributing to OpenNext.js CLI! This document provides guidelines and instructions for contributing.

## Getting Started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/opennextjs-cli.git`
3. Create a branch: `git checkout -b feature/your-feature-name`
4. Install dependencies: `pnpm install`
5. Make your changes
6. Test your changes: `pnpm test`
7. Commit your changes: `git commit -m "Add feature: your feature"`
8. Push to your fork: `git push origin feature/your-feature-name`
9. Open a Pull Request

## Development Setup

```bash
# Install dependencies
pnpm install

# Run linting
pnpm lint

# Run type checking
pnpm type-check

# Build the project
pnpm build
```

## Code Style

- We use Prettier for code formatting
- We use ESLint for linting
- We use TypeScript with strict mode
- All code must have JSDoc comments
- All user inputs must be validated with Zod schemas

## Commit Messages

We follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `style:` Code style changes (formatting, etc.)
- `refactor:` Code refactoring
- `test:` Adding or updating tests
- `chore:` Maintenance tasks

## Pull Request Process

1. Ensure all tests pass
2. Update documentation if needed
3. Add JSDoc comments for new functions
4. Ensure code follows our style guidelines
5. Request review from maintainers

## Questions?

Feel free to open an issue or discussion if you have questions!
