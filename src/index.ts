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
 * CORS headers for cross-origin requests
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/**
 * Create a JSON response with CORS headers
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Create a text response with CORS headers
 */
function textResponse(text: string, status = 200): Response {
  return new Response(text, {
    status,
    headers: {
      'Content-Type': 'text/plain',
      ...CORS_HEADERS,
    },
  });
}

/**
 * Main Worker handler
 */
export default {
  async fetch(request: Request, env: Env, _ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url);

      // Handle CORS preflight requests
      if (request.method === 'OPTIONS') {
        return new Response(null, {
          status: 204,
          headers: CORS_HEADERS,
        });
      }

      // Health check endpoint
      if (url.pathname === '/health') {
        return jsonResponse({
          status: 'ok',
          environment: env.ENVIRONMENT ?? 'unknown',
          timestamp: new Date().toISOString(),
        });
      }

      // API version endpoint
      if (url.pathname === '/') {
        return jsonResponse({
          name: 'EdgeRelay',
          description: 'AT Protocol Relay for Cloudflare Workers',
          version: '0.0.0',
          endpoints: {
            health: '/health',
            firehose: '/xrpc/com.atproto.sync.subscribeRepos',
            jetstream: '/jetstream',
          },
        });
      }

      // Placeholder for firehose endpoint
      if (url.pathname === '/xrpc/com.atproto.sync.subscribeRepos') {
        return textResponse('Firehose endpoint - Coming soon', 501);
      }

      // Placeholder for jetstream endpoint
      if (url.pathname === '/jetstream') {
        return textResponse('Jetstream endpoint - Coming soon', 501);
      }

      return textResponse('Not Found', 404);
    } catch (error) {
      // Basic error handling
      console.error('Worker error:', error);
      return jsonResponse(
        {
          error: 'Internal Server Error',
          message: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
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
