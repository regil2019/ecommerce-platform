import express from 'express'
import { authenticate, isAdmin } from '../middleware/authMiddleware.js'
import db from '../config/database.js'
import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import Product from '../models/Product.js'
import User from '../models/User.js'
import Category from '../models/Category.js'
import { Op } from 'sequelize'

const router = express.Router()

/**
 * @route GET /api/admin/stats
 * @description Get admin dashboard statistics
 * @access Private (Admin only)
 */
router.get('/stats', authenticate, isAdmin, async (req, res, next) => {
  try {
    const today = new Date();
    const last7Days = new Date(today);
    last7Days.setDate(today.getDate() - 7);

    // 1. Total Revenue & Sales Count
    const revenueStats = await Order.findOne({
      attributes: [
        [db.fn('SUM', db.col('total')), 'total'],
        [db.fn('COUNT', db.col('id')), 'count']
      ],
      where: {
        status: { [Op.not]: 'cancelled' },
        paymentStatus: 'paid'
      },
      raw: true
    });

    // 2. Orders Stats
    const totalOrders = await Order.count();
    const pendingOrders = await Order.count({
      where: { status: { [Op.in]: ['pending', 'pending_payment'] } }
    });

    // 3. Products Stats
    const totalProducts = await Product.count();
    const inactiveProducts = await Product.count({ where: { isActive: false } }); // Assuming model defines isActive (camelCase in where)

    // 4. Categories Stats
    const totalCategories = await Category.count();
    const emptyCategories = 0;

    // 5. Sales & Orders Last 7 Days
    const salesLast7DaysRaw = await Order.findAll({
      attributes: [
        [db.fn('DATE', db.col('created_at')), 'day'],
        [db.fn('SUM', db.col('total')), 'total'],
        [db.fn('COUNT', db.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: last7Days },
        status: { [Op.not]: 'cancelled' },
        paymentStatus: 'paid'
      },
      group: [db.fn('DATE', db.col('created_at'))],
      order: [[db.fn('DATE', db.col('created_at')), 'ASC']],
      raw: true
    });

    const ordersLast7DaysRaw = await Order.findAll({
      attributes: [
        [db.fn('DATE', db.col('created_at')), 'day'],
        [db.fn('COUNT', db.col('id')), 'count']
      ],
      where: {
        created_at: { [Op.gte]: last7Days }
      },
      group: [db.fn('DATE', db.col('created_at'))],
      order: [[db.fn('DATE', db.col('created_at')), 'ASC']],
      raw: true
    });

    // Format charts for frontend
    const formatDate = (date) => new Date(date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

    // Fill missing days with 0
    const salesLast7Days = [];
    const ordersLast7Days = [];

    for (let i = 6; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0];
      const dayLabel = formatDate(d);

      // Robust comparison for DATE strings/objects
      const saleDay = salesLast7DaysRaw.find(s => {
        const sDate = s.day instanceof Date ? s.day.toISOString().split('T')[0] : s.day;
        return sDate === dateStr;
      });
      const orderDay = ordersLast7DaysRaw.find(s => {
        const sDate = s.day instanceof Date ? s.day.toISOString().split('T')[0] : s.day;
        return sDate === dateStr;
      });

      salesLast7Days.push({
        day: dayLabel,
        vendas: saleDay ? parseFloat(saleDay.total) : 0,
        total: saleDay ? parseFloat(saleDay.total) : 0
      });

      ordersLast7Days.push({
        day: dayLabel,
        pedidos: orderDay ? parseInt(orderDay.count) : 0
      });
    }

    // 6. Recent Orders
    const recentOrders = await Order.findAll({
      limit: 5,
      order: [['created_at', 'DESC']],
      include: [{ model: User, as: 'user', attributes: ['name', 'email'] }]
    });

    // 7. Top Selling Products (Safe Manual Fetch)
    const topItems = await OrderItem.findAll({
      attributes: [
        ['product_id', 'id'],
        [db.fn('SUM', db.col('quantity')), 'totalSold']
      ],
      group: ['product_id'],
      order: [[db.literal('totalSold'), 'DESC']],
      limit: 5,
      raw: true
    });

    const productIds = topItems.map(i => i.id);
    const productsInfo = await Product.findAll({
      where: { id: productIds },
      attributes: ['id', 'name', 'price'],
      raw: true
    });

    const topSellingProducts = topItems.map(item => {
      const prod = productsInfo.find(p => p.id === item.id);
      return {
        id: item.id,
        name: prod ? prod.name : 'Unknown',
        price: prod ? prod.price : 0,
        totalSold: parseInt(item.totalSold)
      };
    });

    res.json({
      totalRevenue: {
        total: revenueStats?.total || 0,
        count: revenueStats?.count || 0
      },
      orders: {
        total: totalOrders,
        pending: pendingOrders
      },
      products: {
        total: totalProducts,
        inactive: inactiveProducts
      },
      categories: {
        total: totalCategories,
        empty: emptyCategories
      },
      salesLast7Days,
      ordersLast7Days,
      recentOrders,
      topSellingProducts
    });

  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/admin/analytics/sales
 * @description Get sales analytics for chart (last 30 days)
 * @access Private (Admin only)
 */
router.get('/analytics/sales', authenticate, isAdmin, async (req, res, next) => {
  try {
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

    // Group sales by date
    const salesData = await Order.findAll({
      attributes: [
        [db.fn('DATE', db.col('created_at')), 'date'],
        [db.fn('SUM', db.col('total')), 'amount'],
        [db.fn('COUNT', db.col('id')), 'count']
      ],
      where: {
        created_at: {
          [Op.gte]: thirtyDaysAgo
        },
        status: {
          [Op.ne]: 'cancelled'
        },
        paymentStatus: 'paid'
      },
      group: [db.fn('DATE', db.col('created_at'))],
      order: [[db.fn('DATE', db.col('created_at')), 'ASC']],
      raw: true
    })

    res.json(salesData)
  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/admin/analytics/top-products
 * @description Get top selling products
 * @access Private (Admin only)
 */
router.get('/analytics/top-products', authenticate, isAdmin, async (req, res, next) => {
  try {
    const topProducts = await OrderItem.findAll({
      attributes: [
        ['product_id', 'productId'],
        [db.fn('SUM', db.col('quantity')), 'totalSold'],
        [db.fn('SUM', db.literal('price * quantity')), 'revenue']
      ],
      include: [{
        model: Product,
        attributes: ['name', 'images']
      }],
      group: ['product_id', 'Product.id'],
      order: [[db.literal('totalSold'), 'DESC']],
      limit: 5
    })

    res.json(topProducts)
  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/admin/users
 * @description Get all users (admin only)
 * @access Private (Admin only)
 */
router.get('/users', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, search } = req.query
    const where = {}

    if (search) {
      where[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { email: { [Op.like]: `%${search}%` } }
      ]
    }

    const { count, rows: users } = await User.findAndCountAll({
      where,
      attributes: ['id', 'name', 'email', 'role', 'address'],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    })

    res.json({
      data: users,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @route PATCH /api/admin/users/:id/role
 * @description Update user role (admin only)
 * @access Private (Admin only)
 */
router.patch('/users/:id/role', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params
    const { role } = req.body

    const validRoles = ['admin', 'user']
    if (!validRoles.includes(role)) {
      return res.status(400).json({ error: 'Role inválida' })
    }

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Não permitir alterar o próprio role
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Não é possível alterar seu próprio role' })
    }

    await user.update({ role })

    res.json({
      message: 'Role atualizada com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/admin/products
 * @description Get all products for admin (includes out-of-stock)
 * @access Private (Admin only)
 */
router.get('/products', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 10, search } = req.query
    const where = {}

    if (search) {
      where.name = { [Op.like]: `%${search}%` }
    }

    const offset = (parseInt(page) - 1) * parseInt(limit)

    const { count, rows: products } = await Product.findAndCountAll({
      where,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset
    })

    res.json({
      products,
      totalProducts: count,
      page: parseInt(page),
      totalPages: Math.ceil(count / parseInt(limit))
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @route GET /api/admin/orders
 * @description Get all orders (admin only)
 * @access Private (Admin only)
 */
router.get('/orders', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query
    const where = {}

    if (status && status.trim()) where.status = status
    if (search) {
      where[Op.or] = [
        { '$user.name$': { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } }
      ]
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      subQuery: false, // Required when filtering by associated model fields ($user.name$)
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Product,
            as: 'product',
            attributes: ['id', 'name', 'price']
          }]
        }
      ],
      order: [['created_at', 'DESC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    })

    res.json({
      data: orders,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @route PUT /api/admin/orders/:id/status
 * @description Update order status (admin only)
 * @access Private (Admin only)
 */
router.put('/orders/:id/status', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' })
    }

    const order = await Order.findByPk(req.params.id)

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    // Lógica adicional para status específicos
    if (status === 'cancelled' && order.status === 'shipped') {
      return res.status(400).json({ error: 'Não é possível cancelar um pedido já enviado' })
    }

    // Start transaction only after all validations pass
    const transaction = await db.transaction()
    try {
      await order.update({ status }, { transaction })
      await transaction.commit()
    } catch (txError) {
      await transaction.rollback()
      throw txError
    }

    // Buscar pedido atualizado para resposta
    const updatedOrder = await Order.findByPk(order.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          as: 'orderItems',
          include: [{
            model: Product,
            as: 'product'
          }]
        }
      ]
    })

    res.json(updatedOrder)
  } catch (error) {
    next(error)
  }
})

/**
 * @route PUT /api/admin/users/:id
 * @description Update user profile (admin only)
 * @access Private (Admin only)
 */
router.put('/users/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params
    const { name, email, address } = req.body

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Check if email is already taken by another user
    if (email && email !== user.email) {
      const existingUser = await User.findOne({
        where: { email: email.toLowerCase().trim() }
      })
      if (existingUser) {
        return res.status(400).json({ error: 'Email já está em uso' })
      }
    }

    const updateData = {}
    if (name) updateData.name = name.trim()
    if (email) updateData.email = email.toLowerCase().trim()
    if (address !== undefined) updateData.address = address ? address.trim() : null

    await user.update(updateData)

    res.json({
      message: 'Usuário atualizado com sucesso',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        address: user.address,
        role: user.role
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @route DELETE /api/admin/users/:id
 * @description Delete user (admin only)
 * @access Private (Admin only)
 */
router.delete('/users/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const { id } = req.params

    const user = await User.findByPk(id)
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' })
    }

    // Não permitir excluir o próprio usuário
    if (user.id === req.user.id) {
      return res.status(400).json({ error: 'Não é possível excluir seu próprio usuário' })
    }

    // Check if user has orders
    const orderCount = await db.models.Order.count({
      where: { userId: id }
    })

    if (orderCount > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir usuário com pedidos associados'
      })
    }

    await user.destroy()

    res.json({
      message: 'Usuário excluído com sucesso'
    })
  } catch (error) {
    next(error)
  }
})

export default router
