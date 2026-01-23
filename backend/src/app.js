/* =========================
   Imports
========================= */
import express from 'express'
import dotenv from 'dotenv'
import swaggerUi from 'swagger-ui-express'
import expressWinston from 'express-winston'

/* Config & utils */
import specs from './config/swagger.js'
import logger from './config/logger.js'
import monitoringService from './services/monitoringService.js'
import limiter from './middleware/rateLimiter.js' // Novo import

/* Routes */
import authRoutes from './routes/authRoutes.js'
import productRoutes from './routes/productRoutes.js'
import categoryRoutes from './routes/categoryRoutes.js'
import orderRoutes from './routes/orderRoutes.js'
import adminRoutes from './routes/adminRoutes.js'
import cartRoutes from './routes/cartRoutes.js'
import paymentRoutes from './routes/paymentRoutes.js'
import uploadRoutes from './routes/uploadRoutes.js'
import healthRoutes from './routes/healthRoutes.js'
import reviewRoutes from './routes/reviewRoutes.js'
import favoriteRoutes from './routes/favoriteRoutes.js'
import recommendationRoutes from './routes/recommendationRoutes.js'

/* =========================
   App setup
========================= */
dotenv.config()
const app = express()

/* =========================
   Webhook (RAW body)
========================= */
app.use(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' })
)

/* =========================
   JSON parser
========================= */
app.use(express.json())

/* =========================
   URL-encoded parser
========================= */
app.use(express.urlencoded({ extended: true }))

/* =========================
   Request logging
========================= */
app.use(
  expressWinston.logger({
    winstonInstance: logger,
    meta: true,
    msg: 'HTTP {{req.method}} {{req.url}} {{res.statusCode}} {{res.responseTime}}ms',
    expressFormat: true,
    colorize: false
  })
)

/* =========================
   Performance monitoring
========================= */
app.use((req, res, next) => {
  const start = Date.now()
  monitoringService.incrementRequests()

  res.on('finish', () => {
    const duration = Date.now() - start
    monitoringService.recordResponseTime(
      req.originalUrl,
      req.method,
      duration
    )
    monitoringService.recordStatusCode(res.statusCode)

    if (res.statusCode >= 400) {
      monitoringService.incrementErrors()
    }
  })

  next()
})

/* =========================
   Health base
========================= */
app.get('/', (req, res) => {
  res.send('O servidor está rodando...')
})

/* =========================
   Rate Limiter
========================= */
app.use(limiter)

/* =========================
   API routes
========================= */
app.use('/api/auth', authRoutes)
app.use('/api/products', productRoutes)
app.use('/api/categories', categoryRoutes)
app.use('/api/orders', orderRoutes)
app.use('/api/admin', adminRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/payment', paymentRoutes)
app.use('/api/upload', uploadRoutes)
app.use('/api/health', healthRoutes)
app.use('/api/reviews', reviewRoutes)
app.use('/api/favorites', favoriteRoutes)
app.use('/api/recommendations', recommendationRoutes)

/* =========================
   Swagger
========================= */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs))

/* =========================
   404
========================= */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint não encontrado' })
})

/* =========================
   Error logging
========================= */
app.use(
  expressWinston.errorLogger({
    winstonInstance: logger
  })
)

/* =========================
   Error handler final
========================= */
app.use((err, req, res, next) => {
  logger.error('Unhandled error', {
    error: err.message,
    stack: err.stack,
    url: req.url,
    method: req.method,
    ip: req.ip
  })

  res.status(500).json({ error: 'Internal server error' })
})

export default app
