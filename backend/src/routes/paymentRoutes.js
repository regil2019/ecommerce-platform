import express from 'express';
import Stripe from 'stripe';
import { authenticate } from '../middleware/authMiddleware.js';
import db from '../config/database.js';
import logger from '../config/logger.js';
import Cart from '../models/Cart.js';
import Order from '../models/Order.js';
import OrderItem from '../models/OrderItem.js';
import Product from '../models/Product.js';
import User from '../models/User.js';
import { sendOrderConfirmationEmail } from '../services/emailService.js';

const router = express.Router();
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

router.post('/create-checkout-session', authenticate, async (req, res) => {
  if (!process.env.STRIPE_SECRET_KEY) {
    logger.error('STRIPE_SECRET_KEY not set');
    return res.status(500).json({ error: 'Payment configuration error' });
  }
  if (!process.env.FRONTEND_URL) {
    logger.error('FRONTEND_URL not set');
    return res.status(500).json({ error: 'Payment configuration error' });
  }

  const transaction = await db.transaction();

  try {
    // 1. Get cart items with products
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
      return res.status(400).json({ error: 'Cart is empty' });
    }

    // 2. Calculate total and validate stock
    let total = 0;
    const stockErrors = [];

    for (const item of cartItems) {
      logger.info(`Checking stock for ${item.Product.name}: requested ${item.quantity}, available ${item.Product.stock}`);
      if (item.quantity < 1) {
        stockErrors.push(`Invalid quantity for ${item.Product.name}`);
      } else if (item.quantity > item.Product.stock) {
        stockErrors.push(`Insufficient stock for ${item.Product.name}`);
      }
      total += item.quantity * item.Product.price;
    }

    logger.info(`Calculated total before rounding: ${total}`);

    if (stockErrors.length > 0) {
      return res.status(400).json({ errors: stockErrors });
    }

    total = parseFloat(total.toFixed(2));
    logger.info(`Total after rounding: ${total}`);

    // 3. Create order (but don't decrement stock yet)
    const order = await Order.create({
      userId: req.user.id,
      total,
      status: 'pending_payment',
      PaymentStatus: 'pending',
      shippingAddress: req.user.address
    }, { transaction });

    // 4. Create order items
    await Promise.all(
      cartItems.map(async (item) => {
        await OrderItem.create({
          orderId: order.id,
          productId: item.productId,
          quantity: item.quantity,
          price: item.Product.price
        }, { transaction });
      })
    );

    // 5. Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: cartItems.map(item => ({
        price_data: {
          currency: 'usd',
          product_data: {
            name: item.Product.name,
          },
          unit_amount: Math.round(item.Product.price * 100),
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: `${process.env.FRONTEND_URL}/order-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/cart`,
      metadata: {
        orderId: order.id.toString()
      }
    });

    await transaction.commit();
    res.json({ url: session.url, orderId: order.id });

  } catch (error) {
    await transaction.rollback();
    logger.error('Error creating checkout session:', error);
    res.status(500).json({
      error: 'Error creating checkout session',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    });
  }
});

router.post('/webhook', async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
  } catch (err) {
    logger.warn(`Webhook signature verification failed: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const transaction = await db.transaction();

  try {
    logger.info(`Processing webhook event: ${event.type}`);
    switch (event.type) {
      case 'checkout.session.completed':
        const session = event.data.object;
        const orderId = session.metadata.orderId;

        if (orderId) {
          // Update order status to completed and payment status to paid
          const order = await Order.findByPk(orderId, { transaction });
          if (order) {
            await order.update({
              status: 'completed',
              PaymentStatus: 'paid'
            }, { transaction });

            // Get order items and decrement stock
            const orderItems = await OrderItem.findAll({
              where: { orderId: order.id },
              include: [Product],
              transaction
            });

            await Promise.all(
              orderItems.map(async (item) => {
                logger.info(`Decrementing stock for product ${item.Product.id}: current ${item.Product.stock}, decrementing by ${item.quantity}`);
                await item.Product.decrement('stock', {
                  by: item.quantity,
                  transaction
                });
              })
            );

            // Clear user's cart
            await Cart.destroy({
              where: { userId: order.userId },
              transaction
            });

            // Send order confirmation email
            try {
              const orderWithDetails = await Order.findByPk(orderId, {
                include: [
                  { model: OrderItem, include: [Product] },
                  { model: User, attributes: ['email', 'name'] }
                ]
              });

              if (orderWithDetails) {
                await sendOrderConfirmationEmail(orderWithDetails.User.email, {
                  id: orderWithDetails.id,
                  createdAt: orderWithDetails.createdAt,
                  totalAmount: orderWithDetails.total,
                  items: orderWithDetails.OrderItems,
                  user: { name: orderWithDetails.User.name }
                });
              }
            } catch (emailError) {
              logger.error('Error sending order confirmation email:', emailError);
            }
          }
        }
        break;

      case 'checkout.session.expired':
        const expiredSession = event.data.object;
        const expiredOrderId = expiredSession.metadata.orderId;

        if (expiredOrderId) {
          // Update order status to cancelled
          const order = await Order.findByPk(expiredOrderId, { transaction });
          if (order && (order.status === 'pending' || order.status === 'pending_payment')) {
            await order.update({
              status: 'cancelled',
              PaymentStatus: 'pending'
            }, { transaction });
          }
        }
        break;

      default:
        logger.info(`Unhandled event type ${event.type}`);
    }

    await transaction.commit();
    res.json({ received: true });

  } catch (error) {
    await transaction.rollback();
    logger.error('Error processing webhook:', error);
    res.status(500).json({ error: 'Webhook processing failed' });
  }
});

// Get order by Stripe session ID
router.get('/order-by-session/:sessionId', authenticate, async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Get session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (!session.metadata || !session.metadata.orderId) {
      return res.status(404).json({ error: 'Order not found for this session' });
    }

    const orderId = session.metadata.orderId;

    // Get order details
    const order = await Order.findOne({
      where: { id: orderId, userId: req.user.id },
      include: [{
        model: OrderItem,
        include: [{
          model: Product,
          attributes: ['id', 'name', 'price', 'images']
        }]
      }]
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json(order);
  } catch (error) {
    logger.error('Error retrieving order by session:', error);
    res.status(500).json({
      error: 'Error retrieving order',
      ...(process.env.NODE_ENV !== 'production' && {
        details: error.message
      })
    });
  }
});

export default router;
