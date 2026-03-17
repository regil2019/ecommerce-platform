import './config/env.js'
import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import expressWinston from 'express-winston';

/* Middleware & Config */
import { errorHandler } from "./middleware/errorHandler.js";
import logger from './config/logger.js';
import monitoringService from './services/monitoringService.js';
import specs from './config/swagger.js';
import swaggerUi from 'swagger-ui-express';

/* Routes */
import authRoutes from "./routes/authRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import cartRoutes from "./routes/cartRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";
import favoriteRoutes from "./routes/favoriteRoutes.js";
import healthRoutes from "./routes/healthRoutes.js";
import recommendationRoutes from "./routes/recommendationRoutes.js";
import promotionRoutes from "./routes/promotionRoutes.js";

dotenv.config();

const app = express();

/* =========================
   ✅ CORS Configuration
========================= */
const allowedOrigins = [
  process.env.FRONTEND_URL || "http://localhost:5173",
  "http://localhost:3000",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin) return callback(null, true);
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }
      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }
      return callback(new Error(`CORS blocked for origin: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "Cache-Control", "Pragma", "Expires", "x-requested-with"],
  })
);

/* =========================
   Base Middlewares
========================= */
app.use(
  '/api/payment/webhook',
  express.raw({ type: 'application/json' })
);

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.set("trust proxy", 1);

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      fontSrc: ["'self'", "https:", "data:"],
      connectSrc: ["'self'", "https:"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" }
}));

/* =========================
   Request Logging
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
   Performance Monitoring
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
   Rate Limiting
========================= */
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { error: 'Too many requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

app.use('/api/', apiLimiter);

/* =========================
   Routes
========================= */
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/reviews", reviewRoutes);
app.use("/api/favorites", favoriteRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/health", healthRoutes);
app.use("/api", promotionRoutes);

/* =========================
   Swagger Documentation
========================= */
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs));

/* =========================
   Root & Health
========================= */
app.get("/api", (req, res) => {
  res.json({
    message: "E-commerce API",
    version: "1.0.0",
    status: "online",
    timestamp: new Date().toISOString()
  });
});

app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "API E-commerce is running",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

/* =========================
   404 Handler
========================= */
app.use('*', (req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

/* =========================
   Error Handling
========================= */
app.use(
  expressWinston.errorLogger({
    winstonInstance: logger
  })
)

app.use(errorHandler);

export default app;
