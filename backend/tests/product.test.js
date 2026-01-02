import request from 'supertest';
import app from '../src/app.js';
import { User, Product, Category } from '../src/models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Product Tests', () => {
  let adminToken;
  let userToken;
  let categoryId;

  beforeEach(async () => {
    // Create admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@example.com',
      address: '123 Admin Street',
      password: hashedPassword,
      role: 'admin'
    });

    adminToken = jwt.sign(
      { id: admin.id, role: admin.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create regular user
    const userHashedPassword = await bcrypt.hash('user123', 10);
    const user = await User.create({
      name: 'Regular User',
      email: 'user@example.com',
      address: '123 User Street',
      password: userHashedPassword,
      role: 'user'
    });

    userToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create a category
    const category = await Category.create({
      name: 'Test Category'
    });
    categoryId = category.id;
  });

  describe('POST /api/products', () => {
    it('should create a product successfully as admin', async () => {
      const productData = {
        name: 'Test Product',
        price: 99.99,
        description: 'A test product description',
        stock: 10,
        images: ['image1.jpg', 'image2.jpg'],
        categoryId: categoryId
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.name).toBe(productData.name);
      expect(response.body.price).toBe(productData.price);
      expect(response.body.description).toBe(productData.description);
      expect(response.body.stock).toBe(productData.stock);
      expect(response.body.images).toEqual(productData.images);
      expect(response.body.categoryId).toBe(productData.categoryId);
    });

    it('should return 401 for non-admin user', async () => {
      const productData = {
        name: 'Test Product',
        price: 99.99,
        description: 'A test product description',
        stock: 10,
        categoryId: categoryId
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${userToken}`)
        .send(productData)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado. Apenas administradores.');
    });

    it('should return 400 for invalid category', async () => {
      const productData = {
        name: 'Test Product',
        price: 99.99,
        description: 'A test product description',
        stock: 10,
        categoryId: 999 // Non-existent category
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(productData)
        .expect(400);

      expect(response.body.error).toBe('Categoria inválida');
    });

    it('should return 400 for invalid data', async () => {
      const invalidData = {
        name: '',
        price: -10,
        description: '',
        stock: -5
      };

      const response = await request(app)
        .post('/api/products')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(invalidData)
        .expect(400);

      expect(response.body.errors).toBeDefined();
    });
  });

  describe('GET /api/products', () => {
    beforeEach(async () => {
      // Create test products
      await Product.create({
        name: 'Product 1',
        price: 50.00,
        description: 'Description 1',
        stock: 5,
        categoryId: categoryId
      });

      await Product.create({
        name: 'Product 2',
        price: 100.00,
        description: 'Description 2',
        stock: 10,
        categoryId: categoryId
      });

      await Product.create({
        name: 'Out of Stock Product',
        price: 25.00,
        description: 'Out of stock',
        stock: 0,
        categoryId: categoryId
      });
    });

    it('should return all products with stock > 0', async () => {
      const response = await request(app)
        .get('/api/products')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2); // Only products with stock > 0
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('price');
      expect(response.body[0]).toHaveProperty('category');
    });

    it('should filter products by category', async () => {
      const response = await request(app)
        .get('/api/products?category=Test Category')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(2);
    });

    it('should filter products by search term', async () => {
      const response = await request(app)
        .get('/api/products?search=Product 1')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Product 1');
    });

    it('should filter products by price range', async () => {
      const response = await request(app)
        .get('/api/products?minPrice=60&maxPrice=120')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body.length).toBe(1);
      expect(response.body[0].name).toBe('Product 2');
    });

    it('should sort products by price ascending', async () => {
      const response = await request(app)
        .get('/api/products?sort=price_asc')
        .expect(200);

      expect(Array.isArray(response.body)).toBe(true);
      expect(response.body[0].price).toBe(50.00);
      expect(response.body[1].price).toBe(100.00);
    });
  });

  describe('GET /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Single Product',
        price: 75.00,
        description: 'Single product description',
        stock: 8,
        categoryId: categoryId
      });
      productId = product.id;
    });

    it('should return product by id', async () => {
      const response = await request(app)
        .get(`/api/products/${productId}`)
        .expect(200);

      expect(response.body).toHaveProperty('id', productId);
      expect(response.body.name).toBe('Single Product');
      expect(response.body.price).toBe(75.00);
      expect(response.body.description).toBe('Single product description');
      expect(response.body.stock).toBe(8);
      expect(response.body).toHaveProperty('category');
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .get('/api/products/999')
        .expect(404);

      expect(response.body.error).toBe('Produto não encontrado');
    });
  });

  describe('PUT /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Update Product',
        price: 60.00,
        description: 'Original description',
        stock: 5,
        categoryId: categoryId
      });
      productId = product.id;
    });

    it('should update product successfully as admin', async () => {
      const updateData = {
        name: 'Updated Product',
        price: 80.00,
        description: 'Updated description',
        stock: 15,
        images: ['new-image.jpg']
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body.name).toBe(updateData.name);
      expect(response.body.price).toBe(updateData.price);
      expect(response.body.description).toBe(updateData.description);
      expect(response.body.stock).toBe(updateData.stock);
      expect(response.body.images).toEqual(updateData.images);
    });

    it('should return 404 for non-existent product', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put('/api/products/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .send(updateData)
        .expect(404);

      expect(response.body.error).toBe('Produto não encontrado');
    });

    it('should return 403 for non-admin user', async () => {
      const updateData = {
        name: 'Updated Name'
      };

      const response = await request(app)
        .put(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .send(updateData)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado. Apenas administradores.');
    });
  });

  describe('DELETE /api/products/:id', () => {
    let productId;

    beforeEach(async () => {
      const product = await Product.create({
        name: 'Delete Product',
        price: 40.00,
        description: 'Product to delete',
        stock: 3,
        categoryId: categoryId
      });
      productId = product.id;
    });

    it('should delete product successfully as admin', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(204);

      // Verify product is deleted
      const deletedProduct = await Product.findByPk(productId);
      expect(deletedProduct).toBeNull();
    });

    it('should return 404 for non-existent product', async () => {
      const response = await request(app)
        .delete('/api/products/999')
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(404);

      expect(response.body.error).toBe('Produto não encontrado');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .delete(`/api/products/${productId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(403);

      expect(response.body.error).toBe('Acesso negado. Apenas administradores.');
    });
  });
});