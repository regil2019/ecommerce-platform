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
router.get('/stats', authenticate, isAdmin, async (req, res) => {
  try {
    // Calculate total sales (sum of completed orders)
    const totalSales = await Order.sum('total', {
      where: {
        status: 'completed',
        PaymentStatus: 'paid'
      }
    })

    // Count total products
    const totalProducts = await Product.count()

    // Count pending orders
    const pendingOrders = await Order.count({
      where: {
        status: 'pending',
        PaymentStatus: 'paid'
      }
    })

    // Count total users
    const totalUsers = await User.count()

    res.json({
      sales: totalSales || 0,
      products: totalProducts || 0,
      orders: pendingOrders || 0,
      users: totalUsers || 0
    })
  } catch (error) {
    console.error('Erro ao buscar estatísticas:', error)
    res.status(500).json({
      error: 'Erro ao buscar estatísticas do dashboard',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route GET /api/admin/users
 * @description Get all users (admin only)
 * @access Private (Admin only)
 */
router.get('/users', authenticate, isAdmin, async (req, res) => {
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
    console.error('Erro ao buscar usuários:', error)
    res.status(500).json({
      error: 'Erro ao buscar usuários',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route PATCH /api/admin/users/:id/role
 * @description Update user role (admin only)
 * @access Private (Admin only)
 */
router.patch('/users/:id/role', authenticate, isAdmin, async (req, res) => {
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
    console.error('Erro ao atualizar role:', error)
    res.status(500).json({
      error: 'Erro ao atualizar role do usuário',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route GET /api/admin/categories
 * @description Get all categories (admin only)
 * @access Private (Admin only)
 */
router.get('/categories', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, search } = req.query
    const where = {}

    if (search) {
      where.name = { [Op.like]: `%${search}%` }
    }

    const { count, rows: categories } = await Category.findAndCountAll({
      where,
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    })

    res.json({
      data: categories,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    res.status(500).json({
      error: 'Erro ao buscar categorias',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route POST /api/admin/categories
 * @description Create a new category (admin only)
 * @access Private (Admin only)
 */
router.post('/categories', authenticate, isAdmin, async (req, res) => {
  try {
    const { name } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' })
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: { name: name.trim() }
    })

    if (existingCategory) {
      return res.status(400).json({ error: 'Categoria já existe' })
    }

    const category = await Category.create({ name: name.trim() })

    res.status(201).json({
      message: 'Categoria criada com sucesso',
      category
    })
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    res.status(500).json({
      error: 'Erro ao criar categoria',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route PUT /api/admin/categories/:id
 * @description Update a category (admin only)
 * @access Private (Admin only)
 */
router.put('/categories/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const { name } = req.body

    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' })
    }

    const category = await Category.findByPk(id)
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    // Check if another category with the same name exists
    const existingCategory = await Category.findOne({
      where: {
        name: name.trim(),
        id: { [Op.ne]: id }
      }
    })

    if (existingCategory) {
      return res.status(400).json({ error: 'Já existe uma categoria com este nome' })
    }

    await category.update({ name: name.trim() })

    res.json({
      message: 'Categoria atualizada com sucesso',
      category
    })
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    res.status(500).json({
      error: 'Erro ao atualizar categoria',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route DELETE /api/admin/categories/:id
 * @description Delete a category (admin only)
 * @access Private (Admin only)
 */
router.delete('/categories/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const category = await Category.findByPk(id)
    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    // Check if category has associated products
    const productCount = await Product.count({
      where: { categoryId: id }
    })

    if (productCount > 0) {
      return res.status(400).json({
        error: 'Não é possível excluir categoria com produtos associados'
      })
    }

    await category.destroy()

    res.json({
      message: 'Categoria excluída com sucesso'
    })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    res.status(500).json({
      error: 'Erro ao excluir categoria',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route GET /api/admin/products
 * @description Get all products for admin (including zero stock products)
 * @access Private (Admin only)
 */
router.get('/products', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 10, search } = req.query

    const where = {}

    // Filtro por texto
    if (search) {
      where.name = { [Op.like]: `%${search}%` }
    }

    const { count, rows: products } = await Product.findAndCountAll({
      attributes: ['id', 'name', 'price', 'images', 'stock'],
      where,
      order: [['created_at', 'DESC']],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      limit: parseInt(limit),
      offset: (parseInt(page) - 1) * parseInt(limit)
    })

    res.json({
      products,
      totalProducts: count,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: count,
        totalPages: Math.ceil(count / parseInt(limit))
      }
    })
  } catch (error) {
    console.error('Erro ao buscar produtos para admin:', error)
    res.status(500).json({
      error: 'Erro ao buscar produtos',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route GET /api/admin/orders
 * @description Get all orders (admin only)
 * @access Private (Admin only)
 */
router.get('/orders', authenticate, isAdmin, async (req, res) => {
  try {
    const { page = 1, limit = 50, status, search } = req.query
    const where = {}

    if (status) where.status = status
    if (search) {
      where[Op.or] = [
        { '$user.name$': { [Op.like]: `%${search}%` } },
        { '$user.email$': { [Op.like]: `%${search}%` } }
      ]
    }

    const { count, rows: orders } = await Order.findAndCountAll({
      where,
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name', 'email']
        },
        {
          model: OrderItem,
          include: [{
            model: Product,
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
    console.error('Erro ao buscar pedidos:', error)
    res.status(500).json({
      error: 'Erro ao buscar pedidos',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route PUT /api/admin/orders/:id/status
 * @description Update order status (admin only)
 * @access Private (Admin only)
 */
router.put('/orders/:id/status', authenticate, isAdmin, async (req, res) => {
  const transaction = await db.transaction()
  try {
    const { status } = req.body
    const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']

    if (!validStatuses.includes(status)) {
      return res.status(400).json({ error: 'Status inválido' })
    }

    const order = await Order.findByPk(req.params.id, { transaction })

    if (!order) {
      return res.status(404).json({ error: 'Pedido não encontrado' })
    }

    // Lógica adicional para status específicos
    if (status === 'cancelled' && order.status === 'shipped') {
      return res.status(400).json({ error: 'Não é possível cancelar um pedido já enviado' })
    }

    await order.update({ status }, { transaction })
    await transaction.commit()

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
          include: [Product]
        }
      ]
    })

    res.json(updatedOrder)
  } catch (error) {
    await transaction.rollback()
    console.error('Erro ao atualizar status:', error)
    res.status(500).json({
      error: 'Erro ao atualizar status do pedido',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route PUT /api/admin/users/:id
 * @description Update user profile (admin only)
 * @access Private (Admin only)
 */
router.put('/users/:id', authenticate, isAdmin, async (req, res) => {
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
    console.error('Erro ao atualizar usuário:', error)
    res.status(500).json({
      error: 'Erro ao atualizar usuário',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

/**
 * @route DELETE /api/admin/users/:id
 * @description Delete user (admin only)
 * @access Private (Admin only)
 */
router.delete('/users/:id', authenticate, isAdmin, async (req, res) => {
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
    console.error('Erro ao excluir usuário:', error)
    res.status(500).json({
      error: 'Erro ao excluir usuário',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    })
  }
})

export default router
