// src/routes/orderRoutes.js
import express from 'express';
import { authenticate, isAdmin } from '../middleware/authMiddleware.js';
import db from '../config/database.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { Op } from 'sequelize';
import { sendOrderStatusUpdateEmail } from '../services/emailService.js';
import behaviorService from '../services/behaviorService.js';



const router = express.Router();

// Adicione no início do arquivo (após imports)
const validOrderStatuses = ['pending', 'processing', 'completed', 'cancelled'];

/**
 * @route POST /api/orders/checkout
 * @description Finaliza o carrinho e cria um novo pedido
 * @access Private
 */
router.post('/checkout', authenticate, async (req, res) => {
  const transaction = await db.transaction();

  try {
    // 1. Buscar itens do carrinho com produtos
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'stock'],
        required: true
      }],
      transaction
    });

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Carrinho vazio' });
    }

    // 2. Calcular total e validar estoque
    let total = 0;
    const stockErrors = [];
    
    for (const item of cartItems) {
      if (item.quantity < 1) {
        stockErrors.push(`Quantidade inválida para ${item.Product.name}`);
      } else if (item.quantity > item.Product.stock) {
        stockErrors.push(`Estoque insuficiente para ${item.Product.name}`);
      }
      total += item.quantity * item.Product.price;
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({ errors: stockErrors });
    }

    total = parseFloat(total.toFixed(2));

    // 3. Criar pedido
    // Modifique a criação do pedido (no checkout)
    const order = await Order.create({
        userId: req.user.id,
        total,
        status: 'pending',
        PaymentStatus: 'pending',
        shippingAddress: req.user.address // Assume que o User tem um campo 'address'
      }, { transaction });
      
    // 4. Criar itens do pedido e atualizar estoque
    await Promise.all(
      cartItems.map(async (item) => {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.Product.price
        }, { transaction });

        await item.Product.decrement('stock', {
          by: item.quantity,
          transaction
        });
      })
    );

    // 5. Limpar carrinho
    await Cart.destroy({
      where: { userId: req.user.id },
      transaction
    });

    // 6. Buscar pedido completo para resposta
    const completeOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'images']
        }]
      }],
      transaction
    });

    await transaction.commit();

    // Track purchase behavior for each order item
    try {
      const orderItems = completeOrder.OrderItems || [];
      await behaviorService.trackPurchase(req.user.id, orderItems);
    } catch (behaviorError) {
      console.error('Error tracking purchase behavior:', behaviorError);
      // Don't fail the checkout if behavior tracking fails
    }

    res.status(201).json(completeOrder);

  } catch (error) {
    await transaction.rollback();
    console.error('Erro no checkout:', error);
    res.status(500).json({
      error: 'Erro ao processar checkout',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message,
        stack: error.stack
      })
    });
  }
});

/**
 * @route GET /api/orders
 * @description Lista todos os pedidos do usuário com filtros
 * @access Private
 */
router.get('/', authenticate, async (req, res) => {
  try {
    const { status, startDate, endDate, page = 1, limit = 10 } = req.query;
    const where = { userId: req.user.id };
    
    // Filtros
    if (status) where.status = status;
    if (startDate && endDate) {
      where.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)]
      };
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [{
        model: OrderItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'images']
        }]
      }],
      order: [['createdAt', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    });

    res.json({
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    });
  } catch (error) {
    console.error('Erro ao buscar pedidos:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar histórico de pedidos',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    });
  }
});

/**
 * @route GET /api/orders/:id
 * @description Obtém detalhes de um pedido específico
 * @access Private (apenas dono do pedido ou admin)
 */
router.get('/:id', authenticate, async (req, res) => {
  try {
    const where = { id: req.params.id };
    
    // Admin pode ver qualquer pedido, usuário comum só os seus
    if (req.user.role !== 'admin') {
      where.userId = req.user.id;
    }

    const order = await Order.findOne({
      where,
      include: [{
        model: OrderItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'images', 'description']
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    res.json(order);
  } catch (error) {
    console.error('Erro ao buscar pedido:', error);
    res.status(500).json({ 
      error: 'Erro ao buscar detalhes do pedido',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    });
  }
});

/**
 * @route PATCH /api/orders/:id/status
 * @description Atualiza o status de um pedido (apenas admin)
 * @access Private (Admin)
 */
router.patch('/:id/status', authenticate, isAdmin, async (req, res) => {
  const transaction = await db.transaction();
  try {
    const { status } = req.body;
    const validStatus = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];

    if (!validStatus.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' });
    }

    const order = await Order.findByPk(req.params.id, { transaction });
    
    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' });
    }

    // Lógica adicional para status específicos
    if (status === 'cancelled' && order.status === 'shipped') {
      return res.status(400).json({ error: 'Não é possível cancelar um pedido já enviado' });
    }

    await order.update({ status }, { transaction });
    await transaction.commit();

    // Send order status update email
    try {
      const orderWithUser = await Order.findByPk(order.id, {
        include: [User]
      });

      if (orderWithUser && orderWithUser.User) {
        await sendOrderStatusUpdateEmail(orderWithUser.User.email, {
          id: orderWithUser.id,
          user: { name: orderWithUser.User.name }
        }, status);
      }
    } catch (emailError) {
      console.error('Error sending order status update email:', emailError);
    }

    // Buscar pedido atualizado para resposta
    const updatedOrder = await Order.findByPk(order.id, {
      include: [{
        model: OrderItem,
        include: [Product]
      }]
    });

    res.json(updatedOrder);
  } catch (error) {
    await transaction.rollback();
    console.error('Erro ao atualizar status:', error);
    res.status(500).json({ 
      error: 'Erro ao atualizar status do pedido',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    });

    
  }
});

export default router;