import express from 'express'
import Stripe from 'stripe'
import { authenticate } from '../middleware/authMiddleware.js'
import db from '../config/database.js'
import logger from '../config/logger.js'
import Cart from '../models/Cart.js'
import Order from '../models/Order.js'
import OrderItem from '../models/OrderItem.js'
import Product from '../models/Product.js'
import Promotion from '../models/Promotion.js'
import User from '../models/User.js'
import { sendOrderConfirmationEmail } from '../services/emailService.js'
import config from '../config/env.js'

const router = express.Router()

// Defensive Stripe initialization
const stripeKey = config.stripe.secretKey
const stripe = (stripeKey && typeof stripeKey === 'string' && stripeKey.startsWith('sk_')) 
  ? new Stripe(stripeKey) 
  : null

router.post('/create-checkout-session', authenticate, async (req, res, next) => {
  if (!stripe) {
    logger.error('Stripe client not initialized (missing or invalid STRIPE_SECRET_KEY)')
    return res.status(500).json({ error: 'Payment configuration error' })
  }
  
  if (!config.frontendUrl) {
    logger.error('FRONTEND_URL not set')
    return res.status(500).json({ error: 'Payment configuration error' })
  }

  const transaction = await db.transaction()

  try {
    const userId = req.user.id
    const { currency, promo_code } = req.body

    const cartItems = await Cart.findAll({
      where: { userId },
      include: [{
        model: Product,
        as: 'product',
        attributes: ['id', 'name', 'price', 'stock'],
        required: true
      }],
      transaction
    })

    if (cartItems.length === 0) {
      return res.status(400).json({ error: 'Cart is empty' })
    }

    let subtotal = 0
    const stockErrors = []

    for (const item of cartItems) {
      if (item.quantity < 1) {
        stockErrors.push(`Invalid quantity for ${item.product.name}`)
      } else if (item.quantity > item.product.stock) {
        stockErrors.push(`Insufficient stock for ${item.product.name}`)
      }
      subtotal += item.quantity * item.product.price
    }

    if (stockErrors.length > 0) {
      return res.status(400).json({ errors: stockErrors })
    }

    subtotal = parseFloat(subtotal.toFixed(2))

    let discount = 0
    let validPromotion = null

    if (promo_code) {
      const promotion = await Promotion.findOne({
        where: { code: promo_code.toUpperCase() },
        transaction
      })

      if (promotion && promotion.isValid()) {
        if (subtotal >= promotion.min_purchase_amount) {
          discount = promotion.calculateDiscount(subtotal)
          validPromotion = promotion
        }
      }
    }

    let total = subtotal - discount
    if (total < 0) total = 0

    const order = await Order.create({
      userId: req.user.id,
      total,
      subtotal,
      discount,
      promotionId: validPromotion ? validPromotion.id : null,
      status: 'pending_payment',
      paymentStatus: 'pending',
      shippingAddress: req.user.address || 'Address not provided'
    }, { transaction })

    await Promise.all(
      cartItems.map(async (item) => {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.product.price
        }, { transaction })
      })
    )

    const EXCHANGE_RATES = {
      EUR: 1,
      USD: 1.08,
      RUB: 100
    }

    const selectedCurrency = (currency || 'EUR').toUpperCase()
    const rate = EXCHANGE_RATES[selectedCurrency] || 1

    const lineItems = cartItems.map(item => {
      let priceInCurrency = item.product.price * rate
      if (selectedCurrency === 'RUB') {
        priceInCurrency = Math.round(priceInCurrency)
      } else {
        priceInCurrency = parseFloat(priceInCurrency.toFixed(2))
      }

      return {
        price_data: {
          currency: selectedCurrency.toLowerCase(),
          product_data: {
            name: item.product.name
          },
          unit_amount: Math.round(priceInCurrency * 100)
        },
        quantity: item.quantity
      }
    })

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${config.frontendUrl}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${config.frontendUrl}/cart`,
      metadata: {
        orderId: order.id.toString(),
        promo_code: promo_code || ''
      }
    })

    await transaction.commit()
    res.json({ url: session.url, orderId: order.id })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
})

router.post('/webhook', async (req, res, next) => {
  const sig = req.headers['stripe-signature']
  let event

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, config.stripe.webhookSecret)
  } catch (err) {
    logger.warn(`Webhook signature verification failed: ${err.message}`)
    return res.status(400).send(`Webhook Error: ${err.message}`)
  }

  const transaction = await db.transaction()

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object
        const orderId = session.metadata.orderId

        if (orderId) {
          const order = await Order.findByPk(orderId, { transaction })
          if (order && order.paymentStatus !== 'paid') {
            await order.update({
              status: 'completed',
              paymentStatus: 'paid'
            }, { transaction })

            const orderItems = await OrderItem.findAll({
              where: { orderId: order.id },
              include: [Product],
              transaction
            })

            await Promise.all(
              orderItems.map(async (item) => {
                await item.Product.decrement('stock', {
                  by: item.quantity,
                  transaction
                })
              })
            )

            await Cart.destroy({
              where: { userId: order.userId },
              transaction
            })

            if (order.promo_code) {
              const promotion = await Promotion.findOne({
                where: { code: order.promo_code },
                transaction
              })
              if (promotion) {
                await promotion.increment('usage_count', { transaction })
              }
            }

            try {
              const orderWithDetails = await Order.findByPk(orderId, {
                include: [
                  { model: OrderItem, include: [Product] },
                  { model: User, attributes: ['email', 'name'] }
                ]
              })

              if (orderWithDetails) {
                await sendOrderConfirmationEmail(orderWithDetails.User.email, {
                  id: orderWithDetails.id,
                  createdAt: orderWithDetails.createdAt,
                  totalAmount: orderWithDetails.total,
                  items: orderWithDetails.OrderItems,
                  user: { name: orderWithDetails.User.name }
                })
              }
            } catch (emailError) {
              logger.error('Error sending order confirmation email:', emailError)
            }
          }
        }
        break
      }

      case 'checkout.session.expired': {
        const expiredSession = event.data.object
        const expiredOrderId = expiredSession.metadata.orderId

        if (expiredOrderId) {
          const order = await Order.findByPk(expiredOrderId, { transaction })
          if (order && (order.status === 'pending' || order.status === 'pending_payment')) {
            await order.update({
              status: 'cancelled',
              paymentStatus: 'pending'
            }, { transaction })
          }
        }
        break
      }
    }

    await transaction.commit()
    res.json({ received: true })
  } catch (error) {
    await transaction.rollback()
    next(error)
  }
})

router.get('/order-by-session/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params

    const session = await stripe.checkout.sessions.retrieve(sessionId)

    if (!session.metadata || !session.metadata.orderId) {
      return res.status(404).json({ error: 'Order not found for this session' })
    }

    const orderId = session.metadata.orderId

    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id },
      include: [{
        model: OrderItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'images']
        }]
      }]
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    res.json(order)
  } catch (error) {
    next(error)
  }
})

export default router
