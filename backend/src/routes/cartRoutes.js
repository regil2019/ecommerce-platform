import express from 'express'
import Cart from '../models/Cart.js'
import { authenticate } from '../middleware/authMiddleware.js'
import Product from '../models/Product.js'
import behaviorService from '../services/behaviorService.js'

const router = express.Router()

// Add item to cart (authenticated) — upsert: increment if exists, create if not
router.post('/', authenticate, async (req, res) => {
  try {
    const { productId, quantity = 1 } = req.body
    if (!productId) {
      return res.status(400).json({ error: 'productId is required' })
    }
    if (!quantity || quantity < 1) {
      return res.status(400).json({ error: 'Invalid quantity' })
    }

    const [cartItem, created] = await Cart.findOrCreate({
      where: { userId: req.user.id, productId },
      defaults: { userId: req.user.id, productId, quantity }
    })

    if (!created) {
      cartItem.quantity += quantity
      await cartItem.save()
    }

    // Track cart add behavior
    await behaviorService.trackCartAdd(req.user.id, productId, quantity)

    res.status(created ? 201 : 200).json(cartItem)
  } catch (error) {
    console.error('Cart add error:', error)
    res.status(500).json({ error: 'Error adding item to cart' })
  }
})

// List cart items (authenticated)
router.get('/', authenticate, async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'images', 'description']
      }]
    })
    res.json(cartItems)
  } catch (error) {
    console.error('Cart error:', error)
    res.status(500).json({ error: 'Error fetching cart', details: error.message })
  }
})

// Update quantity (authenticated)
router.put('/:itemId', authenticate, async (req, res) => {
  try {
    const { quantity } = req.body
    const cartItem = await Cart.findOne({
      where: {
        id: req.params.itemId,
        userId: req.user.id
      }
    })

    if (!cartItem) {
      return res.status(404).json({ error: 'Item not found' })
    }

    cartItem.quantity = quantity
    await cartItem.save()
    res.json(cartItem)
  } catch (error) {
    res.status(500).json({ error: 'Error updating item' })
  }
})

// Delete item (authenticated)
router.delete('/:itemId', authenticate, async (req, res) => {
  try {
    const cartItem = await Cart.findOne({
      where: {
        id: req.params.itemId,
        userId: req.user.id
      },
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'price'] }]
    })

    if (!cartItem) {
      return res.status(404).json({ error: 'Item not found' })
    }

    // Track cart remove behavior
    await behaviorService.trackCartRemove(req.user.id, cartItem.productId)

    await cartItem.destroy()
    res.status(204).end()
  } catch (error) {
    res.status(500).json({ error: 'Error deleting item' })
  }
})

export default router
