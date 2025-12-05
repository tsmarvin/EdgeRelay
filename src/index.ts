/**
 * EdgeRelay - AT Protocol Relay for Cloudflare Workers
 *
 * This is the main entry point for the EdgeRelay worker.
 * It handles incoming requests and routes them to appropriate handlers.
 */

export interface Env {
  RELAY_STATE: DurableObjectNamespace;
  EVENT_INDEX: KVNamespace;
  EVENT_STORAGE: R2Bucket;
  EVENT_QUEUE: Queue;
  ENVIRONMENT?: string;
}

/**
 * Main Worker handler
 */
export default {
  fetch(request: Request, env: Env, _ctx: ExecutionContext): Response {
    const url = new URL(request.url);

    // Health check endpoint
    if (url.pathname === '/health') {
      return new Response(
        JSON.stringify({
          status: 'ok',
          environment: env.ENVIRONMENT ?? 'unknown',
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // API version endpoint
    if (url.pathname === '/') {
      return new Response(
        JSON.stringify({
          name: 'EdgeRelay',
          description: 'AT Protocol Relay for Cloudflare Workers',
          version: '0.0.0',
          endpoints: {
            health: '/health',
            firehose: '/xrpc/com.atproto.sync.subscribeRepos',
            jetstream: '/jetstream',
          },
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Placeholder for firehose endpoint
    if (url.pathname === '/xrpc/com.atproto.sync.subscribeRepos') {
      return new Response('Firehose endpoint - Coming soon', { status: 501 });
    }

    // Placeholder for jetstream endpoint
    if (url.pathname === '/jetstream') {
      return new Response('Jetstream endpoint - Coming soon', { status: 501 });
    }

    return new Response('Not Found', { status: 404 });
  },
};

/**
 * RelayState Durable Object
 *
 * This Durable Object maintains the global state for the relay,
 * including cursor positions, PDS subscriptions, and connection management.
 */
export class RelayState implements DurableObject {
  private state: DurableObjectState;
  // Will be used in future phases for accessing Cloudflare resources
  // private _env: Env;

  constructor(state: DurableObjectState, _env: Env) {
    this.state = state;
    // this._env = env;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // State query endpoint
    if (url.pathname === '/state') {
      const cursor = await this.state.storage.get<string>('cursor');
      return new Response(
        JSON.stringify({
          cursor: cursor ?? null,
          timestamp: new Date().toISOString(),
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    return new Response('Not Found', { status: 404 });
  }
}
