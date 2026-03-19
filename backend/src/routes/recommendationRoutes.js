import express from 'express'
import { authenticate, optionalAuthenticate } from '../middleware/authMiddleware.js'
import { Favorite } from '../models/index.js'

import recommendationsLimiter from '../middleware/rateLimiter.js'
import logger from '../config/logger.js'
import cacheService from '../services/cacheService.js'
import { Sequelize } from 'sequelize'

const router = express.Router()

// Test route
router.get('/test', (req, res) => {
  res.json({
    success: true,
    message: 'Recommendation routes are working!',
    timestamp: new Date().toISOString()
  })
})

// Popular products
router.get('/popular', optionalAuthenticate, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 8
    const cacheKey = `popular_${limit}`
    const cachedData = cacheService.get(cacheKey)
    
    let popularProducts

    if (cachedData) {
      popularProducts = JSON.parse(JSON.stringify(cachedData))
    } else {
      const { Product, Category } = await import('../models/index.js')
      const products = await Product.findAll({
        limit,
        order: [['createdAt', 'DESC']],
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }]
      })
      popularProducts = products.map(p => p.get({ plain: true }))
      cacheService.set(cacheKey, popularProducts)
    }

    // Decorate with isFavorite
    if (req.user) {
      const favorites = await Favorite.findAll({
        where: { userId: req.user.id },
        attributes: ['productId'],
        raw: true
      })
      const favoriteIds = new Set(favorites.map(f => f.productId))
      popularProducts.forEach(product => {
        product.isFavorite = favoriteIds.has(product.id)
      })
    } else {
      popularProducts.forEach(product => {
        product.isFavorite = false
      })
    }

    res.json({ success: true, data: popularProducts })
  } catch (error) {
    logger.error('Error getting popular products:', error)
    res.status(500).json({ success: false, message: 'Error getting popular products' })
  }
})

// Personalized recommendations
router.get('/personalized', optionalAuthenticate, recommendationsLimiter, async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10
    const cacheKey = `personalized_${limit}`
    const cachedData = cacheService.get(cacheKey)
    
    let recommendations

    if (cachedData) {
      recommendations = JSON.parse(JSON.stringify(cachedData))
    } else {
      const { Product, Category } = await import('../models/index.js')
      const allProducts = await Product.findAll({
        include: [{
          model: Category,
          as: 'category',
          attributes: ['id', 'name', 'slug']
        }]
      })

      const shuffled = allProducts.sort(() => 0.5 - Math.random())
      recommendations = shuffled.slice(0, limit).map(p => p.get({ plain: true }))
      cacheService.set(cacheKey, recommendations)
    }

    // Decorate with isFavorite
    if (req.user) {
      const favorites = await Favorite.findAll({
        where: { userId: req.user.id },
        attributes: ['productId'],
        raw: true
      })
      const favoriteIds = new Set(favorites.map(f => f.productId))
      recommendations.forEach(product => {
        product.isFavorite = favoriteIds.has(product.id)
      })
    } else {
      recommendations.forEach(product => {
        product.isFavorite = false
      })
    }

    res.json({ success: true, data: recommendations })
  } catch (error) {
    logger.error('Error getting personalized recommendations:', error)
    res.status(500).json({ success: false, message: 'Error getting personalized recommendations' })
  }
})

// Similar products
router.get('/similar/:productId', optionalAuthenticate, async (req, res) => {
  try {
    const { productId } = req.params
    const limit = parseInt(req.query.limit) || 4

    // Get the current product to find its category
    const Product = (await import('../models/index.js')).Product
    const Category = (await import('../models/index.js')).Category

    const currentProduct = await Product.findByPk(productId, {
      include: [{ model: Category, as: 'category' }]
    })

    if (!currentProduct) {
      return res.json({
        success: true,
        data: []
      })
    }

    // Find similar products in the same category, excluding the current product
    const similarProducts = await Product.findAll({
      where: {
        categoryId: currentProduct.categoryId,
        id: { [Sequelize.Op.ne]: productId } // Exclude current product
      },
      include: [{ model: Category, as: 'category' }],
      limit,
      order: [['createdAt', 'DESC']] // Show newer products first
    })

    // Decorate with isFavorite if user is authenticated
    if (req.user) {
      const favorites = await Favorite.findAll({
        where: { userId: req.user.id },
        attributes: ['productId'],
        raw: true
      })
      const favoriteIds = new Set(favorites.map(f => f.productId))
      similarProducts.forEach(product => {
        product.dataValues.isFavorite = favoriteIds.has(product.id)
      })
    } else {
      similarProducts.forEach(product => {
        product.dataValues.isFavorite = false
      })
    }

    res.json({
      success: true,
      data: similarProducts
    })
  } catch (error) {
    logger.error('Error getting similar products:', error)
    res.status(500).json({
      success: false,
      message: 'Error getting similar products'
    })
  }
})

export default router
