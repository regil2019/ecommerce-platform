import request from 'supertest';
import express from 'express';
import { authenticate, isAdmin } from '../src/middleware/authMiddleware.js';
import { User } from '../src/models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Create a test app for middleware testing
const createTestApp = () => {
  const app = express();
  app.use(express.json());

  // Test route with authenticate middleware
  app.get('/protected', authenticate, (req, res) => {
    res.json({ message: 'Access granted', user: req.user });
  });

  // Test route with authenticate and isAdmin middleware
  app.get('/admin-only', authenticate, isAdmin, (req, res) => {
    res.json({ message: 'Admin access granted', user: req.user });
  });

  return app;
};

describe('Authentication Middleware Tests', () => {
  let testApp;
  let userToken;
  let adminToken;
  let invalidToken;

  beforeEach(async () => {
    testApp = createTestApp();

    // Create test tokens
    const userPayload = { id: 1, role: 'user' };
    const adminPayload = { id: 2, role: 'admin' };

    userToken = jwt.sign(userPayload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
    adminToken = jwt.sign(adminPayload, process.env.JWT_SECRET || 'test-secret', { expiresIn: '1h' });
    invalidToken = jwt.sign(userPayload, 'wrong-secret', { expiresIn: '1h' });
  });

  describe('authenticate middleware', () => {
    it('should allow access with valid token', async () => {
      const response = await request(testApp)
        .get('/protected')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.message).toBe('Access granted');
      expect(response.body.user).toHaveProperty('id', 1);
      expect(response.body.user).toHaveProperty('role', 'user');
    });

    it('should return 401 without token', async () => {
      const response = await request(testApp)
        .get('/protected')
        .expect(401);

      expect(response.body.error).toBe('Token não fornecido');
    });

    it('should return 401 with malformed authorization header', async () => {
      const response = await request(testApp)
        .get('/protected')
        .set('Authorization', 'InvalidFormat')
        .expect(401);

      expect(response.body.error).toBe('Token não fornecido');
    });

    it('should return 401 with invalid token', async () => {
      const response = await request(testApp)
        .get('/protected')
        .set('Authorization', `Bearer ${invalidToken}`)
        .expect(401);

      expect(response.body.error).toBe('Token inválido ou expirado');
    });

    it('should return 401 with expired token', async () => {
      const expiredToken = jwt.sign(
        { id: 1, role: 'user' },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '-1h' } // Already expired
      );

      const response = await request(testApp)
        .get('/protected')
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);

      expect(response.body.error).toBe('Token inválido ou expirado');
    });
  });

  describe('isAdmin middleware', () => {
    it('should allow access for admin user', async () => {
      const response = await request(testApp)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Admin access granted');
      expect(response.body.user).toHaveProperty('role', 'admin');
    });

    it('should deny access for regular user', async () => {
      const response = await request(testApp)
        .get('/admin-only')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado. Requer admin');
    });

    it('should return 401 when no user in request', async () => {
      // Create a route that bypasses authenticate but uses isAdmin
      const app = express();
      app.use(express.json());
      app.get('/test-admin', isAdmin, (req, res) => {
        res.json({ message: 'Should not reach here' });
      });

      const response = await request(app)
        .get('/test-admin')
        .expect(401);

      expect(response.body.error).toBe('Faça login primeiro');
    });

    it('should return 401 when user has no role', async () => {
      const noRoleToken = jwt.sign(
        { id: 1 }, // No role property
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );

      const response = await request(testApp)
        .get('/admin-only')
        .set('Authorization', `Bearer ${noRoleToken}`)
        .expect(401);

      expect(response.body.error).toBe('Faça login primeiro');
    });
  });

  describe('Combined middleware behavior', () => {
    it('should process authenticate before isAdmin', async () => {
      // Test that authenticate runs first and fails
      const response = await request(testApp)
        .get('/admin-only')
        .expect(401);

      expect(response.body.error).toBe('Token não fornecido');
      // Should not reach isAdmin check
    });

    it('should allow admin access through both middlewares', async () => {
      const response = await request(testApp)
        .get('/admin-only')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.message).toBe('Admin access granted');
    });

    it('should deny non-admin access through both middlewares', async () => {
      const response = await request(testApp)
        .get('/admin-only')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado. Requer admin');
    });
  });
});