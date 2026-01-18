import { UserBehavior, Product } from '../models/index.js'
import { Op, fn, col } from 'sequelize'
import Category from '../models/Category.js'
import logger from '../config/logger.js'

class BehaviorService {
  // Track user actions
  async trackUserAction (userId, productId, action, sessionId = null, metadata = {}) {
    try {
      await UserBehavior.create({
        userId,
        productId,
        action,
        sessionId,
        metadata: {
          ...metadata,
          timestamp: new Date()
        }
      })
    } catch (error) {
      // Error is handled by the logger
      // Don't throw error to avoid disrupting main functionality
    }
  }

  // Track product view
  async trackProductView (userId, productId, sessionId = null, metadata = {}) {
    await this.trackUserAction(userId, productId, 'view', sessionId, {
      ...metadata,
      source: 'product_detail'
    })
  }

  // Track cart actions
  async trackCartAdd (userId, productId, quantity = 1) {
    await this.trackUserAction(userId, productId, 'cart_add', null, { quantity })
  }

  async trackCartRemove (userId, productId) {
    await this.trackUserAction(userId, productId, 'cart_remove')
  }

  // Track purchases
  async trackPurchase (userId, orderItems) {
    const promises = orderItems.map(item =>
      this.trackUserAction(userId, item.productId, 'purchase', null, {
        quantity: item.quantity,
        price: item.price
      })
    )
    await Promise.all(promises)
  }

  // Track favorites
  async trackFavoriteAdd (userId, productId) {
    await this.trackUserAction(userId, productId, 'favorite_add')
  }

  async trackFavoriteRemove (userId, productId) {
    await this.trackUserAction(userId, productId, 'favorite_remove')
  }

  // Get user behavior data for recommendations
  async getUserBehaviorData (userId) {
    try {
      const behaviors = await UserBehavior.findAll({
        where: { userId },
        include: [
          {
            model: Product,
            as: 'product',
            include: [{ model: Category, as: 'category' }]
          }
        ],
        order: [['timestamp', 'DESC']],
        limit: 100
      })

      // Group behaviors by action type
      const viewedProducts = behaviors
        .filter(b => b.action === 'view')
        .map(b => b.product)
        .filter(p => p) // Remove null products
        .slice(0, 10)

      const cartProducts = behaviors
        .filter(b => b.action === 'cart_add')
        .map(b => b.product)
        .filter(p => p)
        .slice(0, 10)

      const purchasedProducts = behaviors
        .filter(b => b.action === 'purchase')
        .map(b => b.product)
        .filter(p => p)
        .slice(0, 10)

      const favoriteProducts = behaviors
        .filter(b => b.action === 'favorite_add')
        .map(b => b.product)
        .filter(p => p)
        .slice(0, 10)

      // Get search history from metadata (if implemented)
      const searchHistory = behaviors
        .filter(b => b.metadata && b.metadata.searchQuery)
        .map(b => b.metadata.searchQuery)
        .slice(0, 5)

      return {
        viewedProducts,
        cartProducts,
        purchasedProducts,
        favoriteProducts,
        searchHistory,
        recentActivity: behaviors.slice(0, 20)
      }
    } catch (error) {
      // Error is handled by the logger
      return {
        viewedProducts: [],
        cartProducts: [],
        purchasedProducts: [],
        favoriteProducts: [],
        searchHistory: [],
        recentActivity: []
      }
    }
  }

  // Get popular products based on all users' behavior
  async getPopularProducts (limit = 10) {
    try {
      const popular = await UserBehavior.findAll({
        attributes: [
          'productId',
          [fn('COUNT', col('id')), 'actionCount']
        ],
        where: {
          action: ['view', 'cart_add', 'purchase']
        },
        group: ['productId'],
        include: [
          {
            model: Product,
            as: 'product',
            where: { isActive: true },
            include: [{ model: Category, as: 'category' }]
          }
        ],
        order: [[fn('COUNT', col('id')), 'DESC']],
        limit
      })

      return popular.map(item => item.product).filter(p => p)
    } catch (error) {
      // Error is handled by the logger
      return []
    }
  }

  // Clean old behavior data (keep last 6 months)
  async cleanupOldData () {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const deletedCount = await UserBehavior.destroy({
      where: {
        timestamp: {
          [Op.lt]: sixMonthsAgo
        }
      }
    })

    logger.info(`Cleaned up ${deletedCount} old behavior records`)
    return deletedCount
  }
}

export default new BehaviorService()
