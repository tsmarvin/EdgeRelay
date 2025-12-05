# Cloudflare Setup Guide

This guide walks you through setting up the required Cloudflare resources for EdgeRelay.

## Prerequisites

- A Cloudflare account with Workers, Durable Objects, KV, R2, and Queues enabled
- Wrangler CLI installed (`npm install -g wrangler` or use `npx wrangler`)
- Wrangler authenticated with your Cloudflare account

## Authentication

### Option 1: Interactive Login (Recommended)

```bash
npx wrangler login
```

This will open a browser window for you to authenticate with Cloudflare.

### Option 2: API Token

1. Go to [Cloudflare API Tokens](https://dash.cloudflare.com/profile/api-tokens)
2. Create a token with the following permissions:
   - Account - Workers Scripts - Edit
   - Account - Workers KV Storage - Edit
   - Account - Workers R2 Storage - Edit
   - (Optional) If you use Queues: Account - Workers Queues - Edit

   > **Security Note:**  
   > Grant only the minimal permissions required. Do **not** add `Cloudflare Pages - Edit` or `D1 - Edit` unless your deployment specifically needs them.  
   > For best security, use a separate API token per project/environment.

3. Save the token and set it as an environment variable:

```bash
export CLOUDFLARE_API_TOKEN=your_token_here
export CLOUDFLARE_ACCOUNT_ID=your_account_id_here
```

## Create Resources

### 1. KV Namespaces

Create KV namespaces for event indices:

```bash
# Preview/Development
npx wrangler kv:namespace create EVENT_INDEX --preview
# Note the ID returned

# Development
npx wrangler kv:namespace create EVENT_INDEX --env develop

# Production
npx wrangler kv:namespace create EVENT_INDEX --env production
```

### 2. R2 Buckets

Create R2 buckets for event storage:

```bash
# Preview/Development
npx wrangler r2 bucket create edgerelay-events-preview

# Development
npx wrangler r2 bucket create edgerelay-events-dev

# Production
npx wrangler r2 bucket create edgerelay-events-prod
```

### 3. Queues

Create queues for event processing:

```bash
# Preview/Development
npx wrangler queues create edgerelay-events-preview

# Development
npx wrangler queues create edgerelay-events-dev

# Production
npx wrangler queues create edgerelay-events-prod
```

## Configure wrangler.toml

Update `wrangler.toml` with the resource IDs you created:

```toml
# For preview/development (local testing)
[[kv_namespaces]]
binding = "EVENT_INDEX"
id = "your_preview_kv_id_here"

# For develop environment
[env.develop.kv_namespaces]
binding = "EVENT_INDEX"
id = "your_develop_kv_id_here"

# For production environment
[env.production.kv_namespaces]
binding = "EVENT_INDEX"
id = "your_production_kv_id_here"
```

**Note**: R2 buckets and Queues are referenced by name, not ID, so no additional configuration is needed for them in `wrangler.toml` beyond what's already there.

## Set R2 Lifecycle Policies

Configure automatic deletion of old events (62-day retention):

### Via Cloudflare Dashboard

1. Go to [Cloudflare R2 Dashboard](https://dash.cloudflare.com/?to=/:account/r2)
2. Select your bucket (e.g., `edgerelay-events-prod`)
3. Go to "Settings" → "Lifecycle policies"
4. Add a new policy:
   - **Rule name**: Delete old events
   - **Action**: Delete objects
   - **Prefix**: (leave empty to apply to all objects)
   - **Days after creation**: 62

### Via Wrangler (Coming Soon)

Lifecycle policies via Wrangler are not yet fully supported but will be in future versions.

## Configure Secrets

Set any required secrets (if needed in the future):

```bash
# Development
npx wrangler secret put SECRET_NAME --env develop

# Production
npx wrangler secret put SECRET_NAME --env production
```

## GitHub Actions Setup

For automated deployments, configure these secrets in your GitHub repository:

1. Go to your repository on GitHub
2. Navigate to Settings → Secrets and variables → Actions
3. Add the following repository secrets:
   - `CLOUDFLARE_API_TOKEN`: Your Cloudflare API token
   - `CLOUDFLARE_ACCOUNT_ID`: Your Cloudflare account ID

## Verify Setup

Test your configuration locally:

```bash
npm run dev
```

This will start a local development server. Visit the health endpoint:

```bash
curl http://localhost:8787/health
```

Expected response:
```json
{
  "status": "ok",
  "environment": "unknown",
  "timestamp": "2024-12-05T03:00:00.000Z"
}
```

## Deploy

### Manual Deployment

Deploy to preview:
```bash
npm run deploy
```

Deploy to develop:
```bash
npx wrangler deploy --env develop
```

Deploy to production:
```bash
npx wrangler deploy --env production
```

### Automated Deployment

Deployments are automatically triggered via GitHub Actions:
- Push to `develop` branch → deploys to dev.edgerelay.at
- Push to `main` branch → deploys to edgerelay.at

## Troubleshooting

### Error: "No namespace found with ID..."

You need to update the KV namespace IDs in `wrangler.toml`. Make sure you've created the namespaces and copied the IDs correctly.

### Error: "Error: No bucket found with name..."

You need to create the R2 buckets. Run:
```bash
npx wrangler r2 bucket create bucket-name
```

### Error: "Error: No queue found with name..."

You need to create the queues. Run:
```bash
npx wrangler queues create queue-name
```

### Authentication Issues

If you're having authentication issues:
1. Log out: `npx wrangler logout`
2. Log in again: `npx wrangler login`
3. Verify account: `npx wrangler whoami`

### Local Development Issues

If local development isn't working:
1. Clear wrangler cache: `rm -rf .wrangler`
2. Reinstall dependencies: `rm -rf node_modules && npm install`
3. Try running with verbose logging: `npx wrangler dev --log-level debug`

## Next Steps

After setting up Cloudflare resources:

1. Follow the [DEVELOPMENT.md](./DEVELOPMENT.md) roadmap
2. Read the [CONTRIBUTING.md](./CONTRIBUTING.md) guide
3. Start with Phase 1 tasks
4. Join development discussions on GitHub

## Additional Resources

- [Cloudflare Workers Documentation](https://developers.cloudflare.com/workers/)
- [Wrangler CLI Documentation](https://developers.cloudflare.com/workers/wrangler/)
- [Cloudflare KV Documentation](https://developers.cloudflare.com/kv/)
- [Cloudflare R2 Documentation](https://developers.cloudflare.com/r2/)
- [Cloudflare Queues Documentation](https://developers.cloudflare.com/queues/)
- [Durable Objects Documentation](https://developers.cloudflare.com/durable-objects/)
