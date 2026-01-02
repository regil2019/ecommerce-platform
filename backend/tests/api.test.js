import request from 'supertest';
import app from '../src/app.js';

describe('Basic API Endpoint Tests', () => {
  describe('GET /', () => {
    it('should return server status message', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.text).toBe('O servidor está rodando...');
    });
  });

  describe('GET /api/health', () => {
    it('should return health status', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.body).toHaveProperty('status', 'healthy');
      expect(response.body).toHaveProperty('timestamp');
      expect(response.body).toHaveProperty('uptime');
      expect(response.body).toHaveProperty('environment');
      expect(response.body).toHaveProperty('version');

      // Validate timestamp format
      expect(() => new Date(response.body.timestamp)).not.toThrow();

      // Validate uptime is a number
      expect(typeof response.body.uptime).toBe('number');
      expect(response.body.uptime).toBeGreaterThan(0);
    });
  });

  describe('404 Handler', () => {
    it('should return 404 for non-existent routes', async () => {
      const response = await request(app)
        .get('/non-existent-route')
        .expect(404);

      expect(response.body.error).toBe('Endpoint não encontrado');
    });

    it('should return 404 for non-existent API routes', async () => {
      const response = await request(app)
        .get('/api/non-existent')
        .expect(404);

      expect(response.body.error).toBe('Endpoint não encontrado');
    });

    it('should return 404 for wrong HTTP methods', async () => {
      const response = await request(app)
        .post('/api/health') // Health endpoint only supports GET
        .expect(404);

      expect(response.body.error).toBe('Endpoint não encontrado');
    });
  });

  describe('CORS Headers', () => {
    it('should include CORS headers', async () => {
      const response = await request(app)
        .options('/api/health')
        .expect(200);

      // CORS headers should be present
      expect(response.headers).toHaveProperty('access-control-allow-origin');
      expect(response.headers).toHaveProperty('access-control-allow-methods');
      expect(response.headers).toHaveProperty('access-control-allow-headers');
    });
  });

  describe('Content-Type Headers', () => {
    it('should return JSON content type for API endpoints', async () => {
      const response = await request(app)
        .get('/api/health')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/application\/json/);
    });

    it('should return text content type for root endpoint', async () => {
      const response = await request(app)
        .get('/')
        .expect(200);

      expect(response.headers['content-type']).toMatch(/text\/html/);
    });
  });

  describe('Error Handling', () => {
    it('should handle malformed JSON gracefully', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .set('Content-Type', 'application/json')
        .send('{invalid json}')
        .expect(400);

      // Express should handle malformed JSON
      expect(response.status).toBe(400);
    });

    it('should handle large payloads appropriately', async () => {
      const largePayload = 'x'.repeat(1024 * 1024); // 1MB payload

      const response = await request(app)
        .post('/api/auth/login')
        .send({ data: largePayload })
        .expect(400);

      // Should be handled by body parser limits or validation
    });
  });
});