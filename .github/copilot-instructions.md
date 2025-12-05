# GitHub Copilot Instructions for EdgeRelay

## Project Overview
EdgeRelay is an AT Protocol Relay implementation built specifically for Cloudflare Workers. All code in this repository runs on the Cloudflare serverless stack.

## Technology Stack
- **Runtime**: Cloudflare Workers (serverless edge computing)
- **Language**: TypeScript (with strict type-checking)
- **Module System**: ES Modules (use `import`/`export` syntax)
- **Deployment**: Wrangler CLI
- **Protocol**: AT Protocol (Authenticated Transfer Protocol)

## Development Environment

### Prerequisites
- Use Wrangler CLI for all development, testing, and deployment
- Run `npx wrangler types` to generate/update TypeScript type definitions when configuration changes
- Local development with `wrangler dev`, deployment with `wrangler deploy`

### Configuration
- Store configuration in `wrangler.toml`
- Use `wrangler secret put` for sensitive values (API keys, tokens)
- Never commit secrets to the repository

## Code Style and Standards

### TypeScript Guidelines
- Use strict TypeScript configuration (`"strict": true` in `tsconfig.json`)
- Prefer explicit types over implicit when it improves clarity
- Use ES Module syntax (`import`/`export`), not CommonJS (`require`)
- Generate types with `npx wrangler types` after any Worker configuration changes
- All async functions must properly handle errors and return typed responses

### Code Quality
- Configure and use ESLint for code quality (run `npm run lint` before committing)
- Configure and use Prettier for consistent code formatting (run `npm run format`)
- Write clear, concise comments for complex logic, especially AT Protocol-specific handling
- Document all public functions and exported modules

### Naming Conventions
- Use camelCase for variables and functions
- Use PascalCase for classes and types
- Use UPPER_SNAKE_CASE for constants
- Prefix interface names with 'I' when it improves clarity

## Cloudflare Workers Best Practices

### Runtime Constraints
- No Node.js built-in modules (use Cloudflare Workers-compatible alternatives)
- No file system access (use KV, R2, or Durable Objects for persistence)
- Be aware of CPU time limits and memory constraints
- Use Web APIs (fetch, Request, Response, Headers) instead of Node.js equivalents

### Request Handling
- Validate and sanitize all incoming requests
- Use structured error responses with appropriate HTTP status codes
- Implement proper error boundaries and logging
- Handle CORS appropriately for relay endpoints

### State Management
- Use KV namespaces for simple key-value storage
- Consider Durable Objects for stateful relay logic or AT Protocol sessions
- Design for edge-first, distributed architecture

### Security
- Validate all external input to prevent injection attacks
- Use secure headers (e.g., CSP, CORS)
- Implement rate limiting where appropriate
- Never expose sensitive configuration or internal errors in responses

## AT Protocol Relay Specifics

### Message Handling
- **ALWAYS follow the AT Protocol specifications strictly** for message formats and schemas
- When in doubt, look up the latest specification documentation at [atproto.com](https://atproto.com/)
- Validate AT Protocol message structures before processing
- Handle streaming data efficiently using Workers' native fetch and stream APIs
- Implement proper backpressure handling for relayed streams

### Error Handling
- Return AT Protocol-compliant error codes and messages
- Log relay errors for debugging without exposing sensitive data
- Implement circuit breakers for upstream failures

## Testing

### Local Testing
- Test locally with `wrangler dev` before deploying
- Use Miniflare for unit testing Workers code
- Mock external dependencies appropriately
- Test edge cases and error conditions

### Coverage Expectations
- Write tests for all public APIs and critical paths
- Test AT Protocol message validation logic thoroughly
- Include integration tests for relay functionality when possible

## Git Workflow

### Commits
- Write clear, descriptive commit messages
- Keep commits focused and atomic
- Reference issues in commit messages when applicable

### Pull Requests
- Ensure code passes linting and builds successfully
- Include description of changes and testing performed
- Update documentation if adding/changing functionality

## Boundaries and Restrictions

### Do Not Touch
- Never modify `.git/` directory or git configuration
- Do not commit build artifacts or `node_modules/`
- Do not add or modify CI/CD workflows without explicit request

### Communication Guidelines
- Do not create extraneous documents (like PLAN.md, NOTES.md, TODO.md) in the repository to communicate with developers
- Internal notes for Copilot review can be placed in a designated location (e.g., `.copilot/` directory)
- All communication to end users should go through:
  - README.md for project documentation and setup instructions
  - Pull request comments for code review feedback and discussions
  - Code comments for implementation details that need to be preserved in the codebase

### Security Requirements
- Never commit API keys, tokens, or secrets
- Do not introduce dependencies with known vulnerabilities
- Always validate and sanitize external input
- Follow OWASP security guidelines for web applications

## Documentation

### Code Comments
- Comment complex AT Protocol logic and relay mechanisms
- Document any workarounds for Cloudflare Workers limitations
- Explain non-obvious security decisions

### Project Documentation
- Keep README.md up to date with setup and usage instructions
- Document API endpoints and their expected inputs/outputs
- Include examples for common relay operations

## Commands Reference

### Development
- `npx wrangler dev` - Start local development server
- `npx wrangler types` - Generate TypeScript definitions
- `npm run lint` - Run linter (if configured)
- `npm run format` - Format code (if configured)
- `npm test` - Run tests (if configured)

### Deployment
- `npx wrangler deploy` - Deploy to Cloudflare Workers
- `npx wrangler secret put <KEY>` - Set secret value
- `npx wrangler tail` - View logs from deployed worker

## Additional Resources
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [AT Protocol Specifications](https://atproto.com/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
