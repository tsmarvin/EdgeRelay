# Contributing to EdgeRelay

Thank you for your interest in contributing to EdgeRelay! This document provides guidelines and instructions for contributing to the project.

## Code of Conduct

By participating in this project, you agree to maintain a respectful and inclusive environment for all contributors.

## Getting Started

### Prerequisites

- Node.js 18 or later
- npm package manager
- Cloudflare account (for deployment testing)
- Git

### Setting Up Your Development Environment

1. Fork the repository on GitHub
2. Clone your fork locally:
   ```bash
   git clone https://github.com/YOUR_USERNAME/EdgeRelay.git
   cd EdgeRelay
   ```

3. Install dependencies:
   ```bash
   npm install
   ```

4. Run tests to verify setup:
   ```bash
   npm test
   ```

## Development Workflow

### Branch Strategy

- `main` - Production branch, deploys to edgerelay.at
- `develop` - Development branch, deploys to dev.edgerelay.at
- `feature/*` - Feature branches, created from `develop`

### Creating a Feature Branch

1. Ensure you're on the develop branch:
   ```bash
   git checkout develop
   git pull origin develop
   ```

2. Create a new feature branch:
   ```bash
   git checkout -b feature/your-feature-name
   ```

### Making Changes

1. Make your changes following the code style guidelines
2. Write or update tests as needed
3. Ensure all tests pass:
   ```bash
   npm test
   ```

4. Run linting:
   ```bash
   npm run lint
   ```

5. Run type checking:
   ```bash
   npm run typecheck
   ```

6. Format your code:
   ```bash
   npm run format
   ```

### Commit Messages

All commits must follow the [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

#### Types

- `feat` - New features
- `fix` - Bug fixes
- `docs` - Documentation changes
- `style` - Code style changes (formatting, etc.)
- `refactor` - Code refactoring
- `perf` - Performance improvements
- `test` - Test additions or updates
- `chore` - Maintenance tasks
- `ci` - CI/CD changes
- `build` - Build system changes

#### Examples

```bash
feat(firehose): add WebSocket connection handling
fix(storage): correct cursor checkpoint logic
docs(readme): update installation instructions
chore(deps): update @atproto/api to v0.13.0
```

### Testing Your Changes

1. Run unit tests:
   ```bash
   npm test
   ```

2. Run tests in watch mode during development:
   ```bash
   npm run test:watch
   ```

3. Test locally with Wrangler:
   ```bash
   npm run dev
   ```

## Code Style Guidelines

### TypeScript

- Use strict TypeScript (`strict: true`)
- Prefer explicit types over `any`
- Use ES Module syntax (`import`/`export`)
- Avoid Node.js built-in modules (use Web APIs)

### Formatting

- Single quotes for strings
- 2-space indentation
- Semicolons required
- 100 character line length
- Use Prettier for automatic formatting

### Naming Conventions

- camelCase for variables and functions
- PascalCase for classes and types
- UPPER_SNAKE_CASE for constants
- Descriptive names over abbreviations

### Comments

- Comment complex logic
- Document public APIs with JSDoc
- Explain "why" not "what" in comments
- Keep comments up-to-date with code

## Testing Guidelines

### Writing Tests

- Write tests for all new features
- Update tests when modifying existing features
- Use descriptive test names
- Test edge cases and error conditions
- Maintain high test coverage

### Test Structure

```typescript
import { describe, it, expect } from 'vitest';

describe('Feature Name', () => {
  it('should perform expected behavior', () => {
    // Arrange
    const input = 'test';
    
    // Act
    const result = someFunction(input);
    
    // Assert
    expect(result).toBe('expected');
  });
});
```

## Pull Request Process

### Before Submitting

1. Ensure all tests pass
2. Ensure linting passes
3. Ensure type checking passes
4. Update documentation if needed
5. Rebase on latest develop branch

### Submitting a Pull Request

1. Push your feature branch to your fork:
   ```bash
   git push origin feature/your-feature-name
   ```

2. Open a pull request on GitHub
3. Target the `develop` branch
4. Fill out the PR template completely
5. Link any related issues

### PR Title

PR titles should follow the same format as commit messages:

```
feat(component): add new feature
fix(bug): resolve issue with cursor
```

### PR Description

Include in your PR description:

- Summary of changes
- Motivation and context
- How to test the changes
- Screenshots (if UI changes)
- Related issues

### Review Process

1. All PRs require at least one approval
2. CI checks must pass
3. Address review feedback promptly
4. Keep PRs focused and reasonably sized
5. Squash commits if requested

## Architecture Guidelines

### Cloudflare Workers Constraints

- No file system access (use KV, R2, or Durable Objects)
- No Node.js built-in modules
- CPU time limits (10ms for free, 50ms for paid)
- Memory limits (128MB)
- Request timeout (30 seconds for HTTP, 15 minutes for WebSocket)

### Component Organization

```
src/
├── index.ts           # Worker entry point
├── handlers/          # Request handlers
├── storage/           # Storage abstractions
├── protocol/          # AT Protocol client
├── types/             # TypeScript types
└── __tests__/         # Test files
```

### Best Practices

- Keep Workers stateless
- Use Durable Objects for coordination only
- Implement backpressure handling
- Use structured logging
- Handle errors gracefully
- Validate all inputs
- Implement rate limiting

## Documentation

### When to Update Documentation

- Adding new features
- Changing existing behavior
- Adding new configuration options
- Changing deployment procedures

### Documentation Files

- `README.md` - Overview and getting started
- `DEVELOPMENT.md` - Development roadmap and phases
- `CONTRIBUTING.md` - This file
- Code comments - For complex logic
- JSDoc - For public APIs

## Getting Help

### Resources

- [AT Protocol Specification](https://atproto.com/)
- [Cloudflare Workers Docs](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Docs](https://developers.cloudflare.com/workers/wrangler/)

### Communication

- GitHub Issues - Bug reports and feature requests
- GitHub Discussions - Questions and general discussion
- Pull Requests - Code review and feedback

## Release Process

Releases are automated through GitHub Actions:

1. Merge to `develop` triggers beta deployment
2. Merge to `main` triggers production deployment
3. Semantic versioning via GitVersion based on commits
4. Automatic changelog generation

## License

By contributing, you agree that your contributions will be licensed under the MIT License.

## Questions?

If you have questions not covered here, please open a GitHub Discussion or Issue.

Thank you for contributing to EdgeRelay! 🎉
