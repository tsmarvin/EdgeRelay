import { describe, it, expect } from 'vitest';

describe('EdgeRelay Worker', () => {
  describe('Main Worker', () => {
    const mockEnv = {
      RELAY_STATE: {} as DurableObjectNamespace,
      EVENT_INDEX: {} as KVNamespace,
      EVENT_STORAGE: {} as R2Bucket,
      EVENT_QUEUE: {} as Queue,
      ENVIRONMENT: 'test',
    };

    it('should return health status on /health endpoint', async () => {
      const { default: worker } = await import('../index');
      const request = new Request('http://localhost/health');
      const response = worker.fetch(request, mockEnv, {} as ExecutionContext);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const text = await response.text();
      const data = JSON.parse(text) as { status: string; environment: string; timestamp: string };
      expect(data.status).toBe('ok');
      expect(data.environment).toBe('test');
      expect(data.timestamp).toBeDefined();
    });

    it('should return service info on root endpoint', async () => {
      const { default: worker } = await import('../index');
      const request = new Request('http://localhost/');
      const response = worker.fetch(request, mockEnv, {} as ExecutionContext);

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');

      const text = await response.text();
      const data = JSON.parse(text) as {
        name: string;
        description: string;
        version: string;
        endpoints: { health: string; firehose: string; jetstream: string };
      };
      expect(data.name).toBe('EdgeRelay');
      expect(data.description).toBe('AT Protocol Relay for Cloudflare Workers');
      expect(data.version).toBe('0.0.0');
      expect(data.endpoints).toHaveProperty('health');
      expect(data.endpoints).toHaveProperty('firehose');
      expect(data.endpoints).toHaveProperty('jetstream');
    });

    it('should return 501 for firehose endpoint (not implemented)', async () => {
      const { default: worker } = await import('../index');
      const request = new Request('http://localhost/xrpc/com.atproto.sync.subscribeRepos');
      const response = worker.fetch(request, mockEnv, {} as ExecutionContext);

      expect(response.status).toBe(501);
      expect(await response.text()).toBe('Firehose endpoint - Coming soon');
    });

    it('should return 501 for jetstream endpoint (not implemented)', async () => {
      const { default: worker } = await import('../index');
      const request = new Request('http://localhost/jetstream');
      const response = worker.fetch(request, mockEnv, {} as ExecutionContext);

      expect(response.status).toBe(501);
      expect(await response.text()).toBe('Jetstream endpoint - Coming soon');
    });

    it('should return 404 for unknown endpoints', async () => {
      const { default: worker } = await import('../index');
      const request = new Request('http://localhost/unknown');
      const response = worker.fetch(request, mockEnv, {} as ExecutionContext);

      expect(response.status).toBe(404);
      expect(await response.text()).toBe('Not Found');
    });
  });
});
