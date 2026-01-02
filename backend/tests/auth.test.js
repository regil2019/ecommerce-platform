import request from 'supertest';
import app from '../src/app.js';
import { User } from '../src/models/index.js';
import bcrypt from 'bcrypt';

describe('Authentication Tests', () => {
  describe('POST /api/auth/register', () => {
    it('should register a new user successfully', async () => {
      const userData = {
        name: 'Test User',
        email: 'test@example.com',
        address: '123 Test Street',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Usuário registrado com sucesso');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.name).toBe(userData.name);
      expect(response.body.user.email).toBe(userData.email);
      expect(response.body.user.role).toBe('user');
      expect(response.body).toHaveProperty('token');
    });

    it('should register an admin user with admin email', async () => {
      const userData = {
        name: 'Admin User',
        email: 'admin@example.com',
        address: '123 Admin Street',
        password: 'admin123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.user.role).toBe('admin');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '',
        email: 'invalid-email',
        address: '',
        password: '123'
      };

      const response = await request(app)
        .post('/api/auth/register')
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should return 409 for duplicate email', async () => {
      const userData = {
        name: 'Test User',
        email: 'duplicate@example.com',
        address: '123 Test Street',
        password: 'password123'
      };

      // First registration
      await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(201);

      // Second registration with same email
      const response = await request(app)
        .post('/api/auth/register')
        .send(userData)
        .expect(409);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email já registrado');
    });
  });

  describe('POST /api/auth/login', () => {
    beforeEach(async () => {
      // Create a test user with hashed password
      const hashedPassword = await bcrypt.hash('password123', 10);
      await User.create({
        name: 'Login Test User',
        email: 'login@example.com',
        address: '123 Login Street',
        password: hashedPassword,
        role: 'user'
      });
    });

    it('should login successfully with correct credentials', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Login successful');
      expect(response.body.user).toHaveProperty('id');
      expect(response.body.user.email).toBe(loginData.email);
      expect(response.body).toHaveProperty('token');
    });

    it('should return 401 for invalid email', async () => {
      const loginData = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 401 for invalid password', async () => {
      const loginData = {
        email: 'login@example.com',
        password: 'wrongpassword'
      };

      const response = await request(app)
        .post('/api/auth/login')
        .send(loginData)
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Invalid credentials');
    });

    it('should return 400 for missing fields', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({})
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toBe('Email and password are required');
    });
  });

  describe('GET /api/auth/me', () => {
    let token;

    beforeEach(async () => {
      // Create a test user and get token
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        name: 'Profile Test User',
        email: 'profile@example.com',
        address: '123 Profile Street',
        password: hashedPassword,
        role: 'user'
      });

      // Generate token manually for testing
      const jwt = (await import('jsonwebtoken')).default;
      token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
    });

    it('should return user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe('Profile Test User');
      expect(response.body.email).toBe('profile@example.com');
      expect(response.body.role).toBe('user');
      expect(response.body.address).toBe('123 Profile Street');
    });

    it('should return 401 without token', async () => {
      const response = await request(app)
        .get('/api/auth/me')
        .expect(401);

      expect(response.body.error).toBe('Token não fornecido');
    });
  });

  describe('PUT /api/auth/profile', () => {
    let token;

    beforeEach(async () => {
      // Create a test user and get token
      const hashedPassword = await bcrypt.hash('password123', 10);
      const user = await User.create({
        name: 'Update Profile User',
        email: 'update@example.com',
        address: '123 Update Street',
        password: hashedPassword,
        role: 'user'
      });

      // Generate token manually for testing
      const jwt = (await import('jsonwebtoken')).default;
      token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'test-secret',
        { expiresIn: '1h' }
      );
    });

    it('should update user profile successfully', async () => {
      const updateData = {
        name: 'Updated Name',
        address: '456 Updated Street'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(updateData)
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBe('Perfil atualizado com sucesso');
      expect(response.body.user.name).toBe(updateData.name);
      expect(response.body.user.address).toBe(updateData.address);
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: ''
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });

    it('should return 401 without token', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/auth/profile')
        .send(updateData)
        .expect(401);

      expect(response.body.error).toBe('Token não fornecido');
    });
  });
});