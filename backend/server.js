import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./src/config/database.js";
import { connectRedis } from "./src/config/redis.js";
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import uploadRoutes from "./src/routes/uploadRoutes.js";
import categoryRoutes from "./src/routes/categoryRoutes.js";
import paymentRoutes from "./src/routes/paymentRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import reviewRoutes from "./src/routes/reviewRoutes.js";
import favoriteRoutes from "./src/routes/favoriteRoutes.js";
import healthRoutes from "./src/routes/healthRoutes.js";
import recommendationRoutes from "./src/routes/recommendationRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 4000;

/* =========================
   ✅ CORS ÚNICO E CORRETO
========================= */
const allowedOrigins = [
  process.env.FRONTEND_URL,          // produção (Vercel principal)
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:3002",
  "http://localhost:5173",
];

app.use(
  cors({
    origin: (origin, callback) => {
      // Permite requests sem origin (Postman, cron, healthcheck)
      if (!origin) return callback(null, true);

      // Permite qualquer preview do Vercel
      if (origin.endsWith(".vercel.app")) {
        return callback(null, true);
      }

      if (allowedOrigins.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error(`CORS bloqueado: ${origin}`));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* =========================
   Middlewares base
========================= */
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.set("trust proxy", 1);

// Configuração avançada do Helmet para segurança
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
   Rate limit (produção e desenvolvimento)
========================= */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // 5 tentativas de login por IP
  message: { error: 'Muitas tentativas de login. Tente novamente em 15 minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests por IP
  message: { error: 'Muitas requisições. Tente novamente em alguns minutos.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests por IP por minuto
  message: { error: 'Limite de requisições excedido.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Aplicar rate limiting em todos os ambientes
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);
app.use('/api/admin', strictLimiter);
app.use('/api/', apiLimiter);

/* =========================
   Rotas
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

/* =========================
   API Root endpoint
========================= */
app.get("/api", (req, res) => {
  res.json({
    message: "E-commerce API",
    version: "1.0.0",
    status: "online",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      categories: "/api/categories",
      cart: "/api/cart",
      orders: "/api/orders",
      reviews: "/api/reviews",
      favorites: "/api/favorites",
      recommendations: "/api/recommendations",
      admin: "/api/admin",
      upload: "/api/upload",
      payment: "/api/payment",
      health: "/api/health"
    },
    documentation: "/api/health",
    timestamp: new Date().toISOString()
  });
});

/* =========================
   Health / Status
========================= */
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "API E-commerce funcionando",
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

/* =========================
   Error handler
========================= */
app.use(errorHandler);

/* =========================
   Start server
========================= */
const startServer = async () => {
  try {
    await db.authenticate();
    console.log("✔ Banco conectado");

    // Só faz sync em desenvolvimento LOCAL, não em produção/containers
    if (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL) {
      await db.sync({ alter: true });
      console.log("✔ Models sincronizados (dev local)");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 API rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Falha ao iniciar:", error);
    process.exit(1);
  }
};

startServer();
