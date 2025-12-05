# EdgeRelay

An AT Protocol Relay implementation built specifically for Cloudflare Workers, providing a scalable, edge-deployed firehose and Jetstream service with 62-day rolling retention.

[![CI](https://github.com/tsmarvin/EdgeRelay/actions/workflows/ci.yml/badge.svg)](https://github.com/tsmarvin/EdgeRelay/actions/workflows/ci.yml)
[![Deploy to Development](https://github.com/tsmarvin/EdgeRelay/actions/workflows/deploy-develop.yml/badge.svg)](https://github.com/tsmarvin/EdgeRelay/actions/workflows/deploy-develop.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](./LICENSE)

## Overview

EdgeRelay is a serverless AT Protocol relay that ingests events from Personal Data Servers (PDS) and provides real-time firehose and Jetstream endpoints for consuming the AT Protocol event stream. Built entirely on Cloudflare's serverless stack, it leverages Workers, Durable Objects, KV, R2, and Queues to deliver a globally distributed, highly scalable relay service.

### Key Features

- **Serverless Architecture**: Runs entirely on Cloudflare Workers with zero infrastructure management
- **Global Distribution**: Deployed to Cloudflare's edge network for low-latency access worldwide
- **62-Day Retention**: Rolling window of event data with automatic cleanup via R2 lifecycle policies
- **Dual Endpoints**: 
  - Firehose: Real-time streaming via WebSocket (`/xrpc/com.atproto.sync.subscribeRepos`)
  - Jetstream: Cursor-based replay for historical data (`/jetstream`)
- **Horizontal Scalability**: Stateless Workers for client connections, single Durable Object for state coordination
- **Efficient Storage**: Compressed event storage with blob references (CIDs) instead of full media files
- **Backpressure Management**: Built-in throttling and client management to maintain relay stability

## Architecture

EdgeRelay uses a multi-component architecture designed for Cloudflare's serverless platform:

### Components

1. **Ingestion Worker** (Edge Entry)
   - Receives PDS event stream (firehose subscription)
   - Validates and normalizes incoming events
   - Pushes events to Cloudflare Queues for fan-out

2. **Ingestion Durable Object** (State & Cursor Management)
   - Maintains AT Protocol subscription cursor
   - Handles reconnection with exponential backoff
   - Compresses events (brotli/gzip) before storage
   - Broadcasts to connected workers via WebSocket

3. **Storage Layer**
   - **KV Namespace**: Fast lookups for event indices and metadata
   - **R2 Buckets**: Time-sliced event segments (hourly partitions)
   - **Queue**: Event fan-out for processing and distribution
   - Automatic 62-day TTL via R2 lifecycle rules

4. **Distribution Worker** (Firehose/Jetstream)
   - Stateless worker serving client connections
   - Live WebSocket streaming for real-time events
   - Cursor-based replay from R2 segments
   - Backpressure-aware client management

5. **RelayState Durable Object** (Global Coordination)
   - Single source of truth for relay state
   - Cursor checkpoints and PDS subscription offsets
   - Connection registry and health monitoring
   - Periodic cleanup via Durable Object alarms

### Data Flow

```
PDS Events → Ingestion Worker → Queue → Ingestion DO → Storage (KV/R2)
                                                              ↓
                                  Distribution Worker ← Storage (KV/R2)
                                                              ↓
                                                    Client Connections
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- Cloudflare account with Workers, Durable Objects, KV, R2, and Queues enabled
- Wrangler CLI (installed via npm)

### Installation

1. Clone the repository:
```bash
git clone https://github.com/tsmarvin/EdgeRelay.git
cd EdgeRelay
```

2. Install dependencies:
```bash
npm install
```

3. Configure Cloudflare credentials:
```bash
# Set your Cloudflare API token
npx wrangler login

# Or use environment variables
export CLOUDFLARE_API_TOKEN=your_token_here
export CLOUDFLARE_ACCOUNT_ID=your_account_id
```

4. Update `wrangler.toml` with your resource IDs:
   - Create KV namespaces: `npx wrangler kv:namespace create EVENT_INDEX`
   - Create R2 buckets: `npx wrangler r2 bucket create edgerelay-events-preview`
   - Create Queues: `npx wrangler queues create edgerelay-events-preview`
   - Update the placeholder IDs in `wrangler.toml`

### Development

Run the development server locally:
```bash
npm run dev
```

This starts a local Cloudflare Workers environment with hot-reloading.

### Testing

Run the test suite:
```bash
npm test
```

Run tests in watch mode:
```bash
npm run test:watch
```

### Linting and Formatting

```bash
# Check formatting
npm run format:check

# Fix formatting issues
npm run format

# Run linter
npm run lint

# Fix linting issues
npm run lint:fix

# Type checking
npm run typecheck
```

## Deployment

EdgeRelay uses GitHub Actions for automated deployment to two environments:

### Development Environment

- **Branch**: `develop`
- **URL**: https://dev.edgerelay.at
- **Trigger**: Push to `develop` branch
- **Versioning**: Beta versions (e.g., `0.1.0-beta.1`)

### Production Environment

- **Branch**: `main`
- **URL**: https://edgerelay.at
- **Trigger**: Push to `main` branch (typically via merge from `develop`)
- **Versioning**: Stable versions (e.g., `1.0.0`)

### GitHub Secrets Required

Configure the following secrets in your GitHub repository:

- `CLOUDFLARE_API_TOKEN`: Cloudflare API token with Workers, KV, R2, and Queues permissions
- `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

### Manual Deployment

Deploy to preview environment:
```bash
npm run deploy
```

Deploy to specific environment:
```bash
npx wrangler deploy --env develop
npx wrangler deploy --env production
```

## API Endpoints

### Health Check
```
GET /health
```
Returns relay health status and environment information.

### Service Info
```
GET /
```
Returns service metadata and available endpoints.

### Firehose (Real-time Stream)
```
WebSocket /xrpc/com.atproto.sync.subscribeRepos
```
AT Protocol standard firehose endpoint for real-time event streaming.

### Jetstream (Cursor-based Replay)
```
WebSocket /jetstream?cursor=<cursor>
```
Cursor-based historical replay endpoint.

## Configuration

### Environment Variables

Configure via `wrangler.toml` or Wrangler secrets:

- `ENVIRONMENT`: Environment name (develop/production)
- `VERSION`: Deployed version (set automatically by CI/CD)

### Cloudflare Resources

#### KV Namespace
- **Binding**: `EVENT_INDEX`
- **Purpose**: Event metadata and index storage
- **TTL**: 62 days

#### R2 Bucket
- **Binding**: `EVENT_STORAGE`
- **Purpose**: Compressed event segment storage
- **Lifecycle**: 62-day automatic deletion

#### Queue
- **Binding**: `EVENT_QUEUE`
- **Purpose**: Event fan-out and backpressure management
- **Batch Size**: 100 messages
- **Batch Timeout**: 30 seconds

#### Durable Object
- **Binding**: `RELAY_STATE`
- **Class**: `RelayState`
- **Purpose**: Global state coordination and cursor management

## Monitoring

### Health Endpoint

Monitor relay health via the `/health` endpoint:
```bash
curl https://edgerelay.at/health
```

Response includes:
- Relay status
- Environment
- Timestamp

### Cloudflare Analytics

View metrics in the Cloudflare dashboard:
- Request volume and latency
- Error rates
- Worker CPU time
- KV/R2 operations
- Queue depth

### Logs

View live logs:
```bash
npx wrangler tail
npx wrangler tail --env develop
npx wrangler tail --env production
```

## Contributing

We follow strict development standards:

### Commit Messages

All commits must follow [Conventional Commits](https://www.conventionalcommits.org/):
- `feat:` - New features
- `fix:` - Bug fixes
- `docs:` - Documentation changes
- `chore:` - Maintenance tasks
- `refactor:` - Code refactoring
- `test:` - Test updates
- `ci:` - CI/CD changes

### Versioning

Version numbers follow [Semantic Versioning (SemVer)](https://semver.org/) and are automatically calculated using [GitVersion](https://gitversion.net/) based on commit messages.

### Pull Request Process

1. Fork the repository
2. Create a feature branch from `develop`
3. Make your changes following the code style
4. Ensure all tests pass and linting is clean
5. Submit a PR to `develop` branch
6. Wait for CI checks and code review
7. After approval, merge to `develop` for deployment

## Development Roadmap

See [DEVELOPMENT.md](./DEVELOPMENT.md) for the comprehensive step-by-step development outline and implementation phases.

## License

This project is licensed under the MIT License - see the [LICENSE](./LICENSE) file for details.

## References

- [AT Protocol Specification](https://atproto.com/)
- [Bluesky AT Protocol GitHub](https://github.com/bluesky-social/atproto)
- [Indigo Relay Implementation](https://github.com/bluesky-social/indigo/blob/main/cmd/relay/README.md)
- [Microcosm Constellation Relay](https://www.microcosm.blue/)
- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)

## Support

For issues, questions, or contributions, please open an issue on the [GitHub repository](https://github.com/tsmarvin/EdgeRelay/issues).

---

Built with ❤️ using Cloudflare Workers
