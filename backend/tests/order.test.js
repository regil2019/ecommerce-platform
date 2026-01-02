import request from 'supertest';
import app from '../src/app.js';
import { User, Product, Category, Cart, Order, OrderItem } from '../src/models/index.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

describe('Order Tests', () => {
  let adminToken;
  let userToken;
  let userId;
  let productId;
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

    userId = user.id;
    userToken = jwt.sign(
      { id: user.id, role: user.role },
      process.env.JWT_SECRET || 'test-secret',
      { expiresIn: '1h' }
    );

    // Create category and product
    const category = await Category.create({
      name: 'Test Category'
    });
    categoryId = category.id;

    const product = await Product.create({
      name: 'Test Product',
      price: 50.00,
      description: 'Test product description',
      stock: 10,
      categoryId: categoryId
    });
    productId = product.id;
  });

  describe('POST /api/orders/checkout', () => {
    beforeEach(async () => {
      // Add item to cart
      await Cart.create({
        userId: userId,
        productId: productId,
        quantity: 2
      });
    });

    it('should create order successfully from cart', async () => {
      const response = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(201);

      expect(response.body).toHaveProperty('id');
      expect(response.body.userId).toBe(userId);
      expect(response.body.total).toBe(100.00); // 2 * 50.00
      expect(response.body.status).toBe('pending');
      expect(response.body.PaymentStatus).toBe('pending');
      expect(response.body).toHaveProperty('orderItems');
      expect(response.body.orderItems).toHaveLength(1);
      expect(response.body.orderItems[0].quantity).toBe(2);
      expect(response.body.orderItems[0].price).toBe(50.00);

      // Verify cart is empty
      const cartItems = await Cart.findAll({ where: { userId: userId } });
      expect(cartItems).toHaveLength(0);

      // Verify stock is reduced
      const updatedProduct = await Product.findByPk(productId);
      expect(updatedProduct.stock).toBe(8);
    });

    it('should return 400 for empty cart', async () => {
      // Clear cart
      await Cart.destroy({ where: { userId: userId } });

      const response = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.error).toBe('Carrinho vazio');
    });

    it('should return 400 for insufficient stock', async () => {
      // Update product stock to less than cart quantity
      await Product.update({ stock: 1 }, { where: { id: productId } });

      const response = await request(app)
        .post('/api/orders/checkout')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(400);

      expect(response.body.errors).toBeDefined();
      expect(response.body.errors[0]).toContain('Estoque insuficiente');
    });

    it('should return 401 without authentication', async () => {
      const response = await request(app)
        .post('/api/orders/checkout')
        .expect(401);

      expect(response.body.error).toBe('Token não fornecido');
    });
  });

  describe('GET /api/orders', () => {
    beforeEach(async () => {
      // Create orders for the user
      const order1 = await Order.create({
        userId: userId,
        total: 100.00,
        status: 'pending',
        PaymentStatus: 'pending'
      });

      const order2 = await Order.create({
        userId: userId,
        total: 200.00,
        status: 'completed',
        PaymentStatus: 'paid'
      });

      // Create order items
      await OrderItem.create({
        orderId: order1.id,
        productId: productId,
        quantity: 2,
        price: 50.00
      });

      await OrderItem.create({
        orderId: order2.id,
        productId: productId,
        quantity: 4,
        price: 50.00
      });
    });

    it('should return user orders', async () => {
      const response = await request(app)
        .get('/api/orders')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('data');
      expect(response.body).toHaveProperty('pagination');
      expect(Array.isArray(response.body.data)).toBe(true);
      expect(response.body.data).toHaveLength(2);
      expect(response.body.data[0]).toHaveProperty('orderItems');
    });

    it('should filter orders by status', async () => {
      const response = await request(app)
        .get('/api/orders?status=completed')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.data[0].status).toBe('completed');
    });

    it('should paginate orders', async () => {
      const response = await request(app)
        .get('/api/orders?page=1&limit=1')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.data).toHaveLength(1);
      expect(response.body.pagination.page).toBe(1);
      expect(response.body.pagination.limit).toBe(1);
      expect(response.body.pagination.total).toBe(2);
    });
  });

  describe('GET /api/orders/:id', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        userId: userId,
        total: 150.00,
        status: 'processing',
        PaymentStatus: 'paid'
      });

      orderId = order.id;

      await OrderItem.create({
        orderId: order.id,
        productId: productId,
        quantity: 3,
        price: 50.00
      });
    });

    it('should return order details for owner', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(200);

      expect(response.body.id).toBe(orderId);
      expect(response.body.total).toBe(150.00);
      expect(response.body.status).toBe('processing');
      expect(response.body.orderItems).toHaveLength(1);
    });

    it('should return order details for admin', async () => {
      const response = await request(app)
        .get(`/api/orders/${orderId}`)
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.id).toBe(orderId);
    });

    it('should return 404 for non-existent order', async () => {
      const response = await request(app)
        .get('/api/orders/999')
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.error).toBe('Pedido não encontrado');
    });

    it('should return 404 for order not owned by user', async () => {
      // Create order for different user
      const otherUser = await User.create({
        name: 'Other User',
        email: 'other@example.com',
        address: '123 Other Street',
        password: await bcrypt.hash('other123', 10),
        role: 'user'
      });

      const otherOrder = await Order.create({
        userId: otherUser.id,
        total: 50.00,
        status: 'pending',
        PaymentStatus: 'pending'
      });

      const response = await request(app)
        .get(`/api/orders/${otherOrder.id}`)
        .set('Authorization', `Bearer ${userToken}`)
        .expect(404);

      expect(response.body.error).toBe('Pedido não encontrado');
    });
  });

  describe('PATCH /api/orders/:id/status', () => {
    let orderId;

    beforeEach(async () => {
      const order = await Order.create({
        userId: userId,
        total: 100.00,
        status: 'pending',
        PaymentStatus: 'pending'
      });

      orderId = order.id;
    });

    it('should update order status as admin', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'processing' })
        .expect(200);

      expect(response.body.status).toBe('processing');

      // Verify in database
      const updatedOrder = await Order.findByPk(orderId);
      expect(updatedOrder.status).toBe('processing');
    });

    it('should return 400 for invalid status', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'invalid' })
        .expect(400);

      expect(response.body.error).toBe('Status inválido');
    });

    it('should return 403 for non-admin user', async () => {
      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${userToken}`)
        .send({ status: 'processing' })
        .expect(403);

      expect(response.body.error).toBe('Acesso negado. Apenas administradores.');
    });

    it('should prevent cancelling shipped orders', async () => {
      // Update order to shipped
      await Order.update({ status: 'shipped' }, { where: { id: orderId } });

      const response = await request(app)
        .patch(`/api/orders/${orderId}/status`)
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'cancelled' })
        .expect(400);

      expect(response.body.error).toBe('Não é possível cancelar um pedido já enviado');
    });
  });
});