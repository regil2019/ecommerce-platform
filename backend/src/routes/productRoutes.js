import express from 'express'
import { Product, Category } from '../models/index.js'
import { authenticate, isAdmin } from '../middleware/authMiddleware.js'
import { productsLimiter } from '../middleware/rateLimiter.js'
import { Op, ValidationError } from 'sequelize'
import { validationResult } from 'express-validator'
import { productValidators } from '../validators/productValidators.js'
import behaviorService from '../services/behaviorService.js'

const router = express.Router()

// Middleware para converter categoryId para número
const convertCategoryId = (req, res, next) => {
  if (req.body.categoryId) {
    req.body.categoryId = parseInt(req.body.categoryId)
  }
  next()
}

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - price
 *               - stock
 *               - categoryId
 *             properties:
 *               name:
 *                 type: string
 *                 description: Product name
 *               description:
 *                 type: string
 *                 description: Product description
 *               price:
 *                 type: number
 *                 format: float
 *                 description: Product price
 *               stock:
 *                 type: integer
 *                 description: Available stock quantity
 *               categoryId:
 *                 type: integer
 *                 description: Category ID
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *                 description: Array of image URLs
 *               weight:
 *                 type: number
 *                 format: float
 *                 description: Product weight in kg
 *           example:
 *             name: "Wireless Headphones"
 *             description: "High-quality wireless headphones with noise cancellation"
 *             price: 199.99
 *             stock: 50
 *             categoryId: 1
 *             images: ["https://example.com/image1.jpg", "https://example.com/image2.jpg"]
 *             weight: 0.3
 *     responses:
 *       201:
 *         description: Product created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or invalid category
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       500:
 *         description: Internal server error
 */
router.post(
  '/',
  authenticate,
  isAdmin,
  productValidators,
  convertCategoryId,
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const { categoryId, ...productData } = req.body

      // Verifica se a categoria existe (quando enviada)
      if (categoryId) {
        const category = await Category.findByPk(categoryId)
        if (!category) {
          return res.status(400).json({ error: 'Categoria inválida' })
        }
      }

      // Garante que images é array
      const images = Array.isArray(productData.images) ? productData.images : []

      // Define main_image como a primeira imagem se houver imagens
      const main_image = images.length > 0 ? images[0] : null

      const product = await Product.create({ ...productData, images, main_image, categoryId })
      res.status(201).json(product)
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errorCode: 'VALIDATION_ERROR',
          details: error.errors?.map((e) => ({
            field: e.path,
            message: e.message
          }))
        })
      }
      next(error)
    }
  }
)

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *                 format: float
 *               stock:
 *                 type: integer
 *               categoryId:
 *                 type: integer
 *               images:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: uri
 *               weight:
 *                 type: number
 *                 format: float
 *           example:
 *             name: "Updated Wireless Headphones"
 *             price: 249.99
 *             stock: 30
 *     responses:
 *       200:
 *         description: Product updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Product'
 *       400:
 *         description: Validation error or invalid category
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.put(
  '/:id',
  authenticate,
  isAdmin,
  productValidators,
  convertCategoryId,
  async (req, res, next) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() })
    }

    try {
      const product = await Product.findByPk(req.params.id)
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' })
      }

      const { categoryId, ...productData } = req.body

      // Verifica se a nova categoria existe (quando enviada)
      if (categoryId) {
        const category = await Category.findByPk(categoryId)
        if (!category) {
          return res.status(400).json({ error: 'Categoria inválida' })
        }
      }

      // Garante que images é array
      const images = Array.isArray(productData.images) ? productData.images : []

      // Define main_image como a primeira imagem se houver imagens
      const main_image = images.length > 0 ? images[0] : product.main_image

      await product.update({ ...productData, images, main_image, categoryId })
      res.json(product)
    } catch (error) {
      if (error instanceof ValidationError) {
        return res.status(400).json({
          success: false,
          message: 'Validation Error',
          errorCode: 'VALIDATION_ERROR',
          details: error.errors?.map((e) => ({
            field: e.path,
            message: e.message
          }))
        })
      }
      next(error)
    }
  }
)

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product (Admin only)
 *     tags: [Products]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       204:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Admin only
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id', authenticate, isAdmin, async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id)
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    // Check for dependencies before deleting
    const { OrderItem, Favorite, Review } = await import('../models/index.js')

    const orderItemsCount = await OrderItem.count({ where: { product_id: req.params.id } })
    const favoritesCount = await Favorite.count({ where: { product_id: req.params.id } })
    const reviewsCount = await Review.count({ where: { product_id: req.params.id } })

    if (orderItemsCount > 0) {
      return res.status(400).json({
        success: false,
        message: `Cannot delete this product. It has ${orderItemsCount} associated order(s). Consider setting stock to 0 instead.`,
        errorCode: 'PRODUCT_HAS_ASSOCIATIONS'
      })
    }

    if (favoritesCount > 0 || reviewsCount > 0) {
      // Delete associated favorites and reviews first
      if (favoritesCount > 0) {
        await Favorite.destroy({ where: { product_id: req.params.id } })
      }
      if (reviewsCount > 0) {
        await Review.destroy({ where: { product_id: req.params.id } })
      }
    }

    await product.destroy()
    res.status(204).end()
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get list of products with optional filters
 *     tags: [Products]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category name
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in product names
 *       - in: query
 *         name: minPrice
 *         schema:
 *           type: number
 *           format: float
 *         description: Minimum price filter
 *       - in: query
 *         name: maxPrice
 *         schema:
 *           type: number
 *           format: float
 *         description: Maximum price filter
 *       - in: query
 *         name: sort
 *         schema:
 *           type: string
 *           enum: [price_asc, price_desc, newest]
 *         description: Sort order
 *     responses:
 *       200:
 *         description: List of products
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: integer
 *                   name:
 *                     type: string
 *                   price:
 *                     type: number
 *                     format: float
 *                   images:
 *                     type: array
 *                     items:
 *                       type: string
 *                       format: uri
 *                   stock:
 *                     type: integer
 *                   createdAt:
 *                     type: string
 *                     format: date-time
 *                   category:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: integer
 *                       name:
 *                         type: string
 *       500:
 *         description: Internal server error
 */
router.get('/', productsLimiter, async (req, res, next) => {
  try {
    const { category, search, minPrice, maxPrice, sort, page = 1, limit = 12 } = req.query

    // Pagination calculations
    const pageNum = parseInt(page, 10)
    const limitNum = parseInt(limit, 10)
    const offset = (pageNum - 1) * limitNum

    const where = { stock: { [Op.gt]: 0 } }

    // Filtro por categoria
    if (category) {
      where['$category.name$'] = category
    }

    // Filtro por texto
    if (search) {
      where.name = { [Op.like]: `%${search}%` }
    }

    // Filtro por preço
    if (minPrice || maxPrice) {
      where.price = {}
      if (minPrice) where.price[Op.gte] = parseFloat(minPrice)
      if (maxPrice) where.price[Op.lte] = parseFloat(maxPrice)
    }

    // Ordenação
    const order = []
    if (sort === 'price_asc') order.push(['price', 'ASC'])
    if (sort === 'price_desc') order.push(['price', 'DESC'])
    if (sort === 'newest') order.push(['createdAt', 'DESC'])

    // Default sort if none provided to ensure consistent pagination
    if (order.length === 0) {
      order.push(['id', 'DESC'])
    }

    const { count, rows } = await Product.findAndCountAll({
      attributes: ['id', 'name', 'price', 'images', 'main_image', 'stock', 'createdAt'],
      where,
      order,
      limit: limitNum,
      offset: offset,
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ],
      distinct: true // Important for correct count with includes
    })

    res.json({
      products: rows,
      total: count,
      page: pageNum,
      totalPages: Math.ceil(count / limitNum)
    })
  } catch (error) {
    next(error)
  }
})

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     tags: [Products]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 name:
 *                   type: string
 *                 price:
 *                   type: number
 *                   format: float
 *                 images:
 *                   type: array
 *                   items:
 *                     type: string
 *                     format: uri
 *                 stock:
 *                   type: integer
 *                 description:
 *                   type: string
 *                 categoryId:
 *                   type: integer
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 category:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     name:
 *                       type: string
 *       404:
 *         description: Product not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', async (req, res, next) => {
  try {
    const product = await Product.findByPk(req.params.id, {
      attributes: ['id', 'name', 'price', 'images', 'main_image', 'stock', 'description', 'categoryId', 'createdAt'],
      include: [
        {
          model: Category,
          as: 'category',
          attributes: ['id', 'name']
        }
      ]
    })
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    // Track product view if user is authenticated
    if (req.user && req.user.id) {
      await behaviorService.trackProductView(req.user.id, req.params.id)
    }

    res.json(product)
  } catch (error) {
    next(error)
  }
})

export default router
