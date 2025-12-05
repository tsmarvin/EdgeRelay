# Security Policy

## Reporting a Vulnerability

We take the security of EdgeRelay seriously. If you have discovered a security vulnerability, please report it to us privately.

### How to Report

**DO NOT** create a public GitHub issue for security vulnerabilities.

Instead, please report security issues by:

1. **Email**: Send details to the repository owner (check GitHub profile for contact)
2. **GitHub Security Advisory**: Use GitHub's [private vulnerability reporting](https://github.com/tsmarvin/EdgeRelay/security/advisories/new)

### What to Include

Please provide the following information in your report:

- **Type of vulnerability** (e.g., injection, authentication bypass, XSS)
- **Full description** of the vulnerability
- **Steps to reproduce** the issue
- **Potential impact** of the vulnerability
- **Suggested fix** (if you have one)
- **Your contact information** for follow-up

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your vulnerability report within 48 hours
- **Updates**: We will provide updates on the status of your report within 7 days
- **Resolution**: We aim to resolve critical vulnerabilities within 30 days
- **Credit**: We will credit you in the security advisory (unless you prefer to remain anonymous)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 0.x.x   | :white_check_mark: |

Currently, EdgeRelay is in initial development (0.x.x versions). Security updates will be applied to the latest version.

## Security Best Practices

### For Contributors

- Never commit secrets, API keys, or tokens to the repository
- Use Wrangler secrets for sensitive configuration
- Follow secure coding practices from OWASP
- Validate and sanitize all user inputs
- Use parameterized queries for database operations
- Implement proper authentication and authorization
- Keep dependencies up to date

### For Users

- Keep your Cloudflare API tokens secure
- Rotate API tokens regularly
- Use environment-specific credentials
- Review Cloudflare Workers security best practices
- Monitor your deployment for suspicious activity
- Keep your deployment up to date with the latest version

## Security Features

EdgeRelay implements the following security measures:

- **Input Validation**: All external inputs are validated
- **Rate Limiting**: Protection against abuse and DoS attacks
- **Secure Headers**: CORS and security headers are properly configured
- **Dependency Scanning**: Automated dependency vulnerability scanning
- **Code Analysis**: Static code analysis for security issues

## Known Security Considerations

### Cloudflare Workers Environment

- EdgeRelay runs on Cloudflare Workers, which provides built-in DDoS protection
- Workers are isolated and sandboxed by design
- No file system access reduces attack surface
- TLS/SSL is handled by Cloudflare infrastructure

### Data Storage

- Event data is stored in R2 buckets (encrypted at rest)
- KV namespace data is encrypted at rest
- Blob references are stored, not the actual binary data
- Automatic 62-day retention reduces data exposure

### Authentication

- Authentication for PDS subscriptions follows AT Protocol standards
- Client authentication is handled according to AT Protocol specifications
- No custom authentication schemes that could introduce vulnerabilities

## Vulnerability Disclosure Policy

We follow a coordinated disclosure policy:

1. **Private Disclosure**: Vulnerabilities are initially reported privately
2. **Investigation**: We investigate and develop a fix
3. **Coordinated Release**: Security fix is released with an advisory
4. **Public Disclosure**: After fix is deployed, details are made public

## Security Updates

Security updates will be:

- Released as soon as possible after verification
- Announced via GitHub Security Advisories
- Documented in CHANGELOG.md
- Tagged with the `security` label

## Contact

For security concerns, contact the repository maintainers through:

- GitHub Security Advisories (preferred)
- Repository owner's contact information on GitHub profile

## Resources

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Cloudflare Workers Security](https://developers.cloudflare.com/workers/platform/security/)
- [AT Protocol Security Considerations](https://atproto.com/specs/security)

---

Thank you for helping keep EdgeRelay and its users safe!
