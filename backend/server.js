import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./src/config/database.js";
import authRoutes from "./src/routes/authRoutes.js";
import productRoutes from "./src/routes/productRoutes.js";
import cartRoutes from "./src/routes/cartRoutes.js";
import orderRoutes from "./src/routes/orderRoutes.js";
import { errorHandler } from "./src/middleware/errorHandler.js";
import helmet from 'helmet';
import rateLimit from "express-rate-limit";
import uploadRoutes from './src/routes/uploadRoutes.js';
import categoryRoutes from './src/routes/categoryRoutes.js';
import paymentRoutes from './src/routes/paymentRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import reviewRoutes from './src/routes/reviewRoutes.js';
import favoriteRoutes from './src/routes/favoriteRoutes.js';
import healthRoutes from './src/routes/healthRoutes.js';

// Configuração inicial
dotenv.config();
const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares essenciais
app.use(cors({
  origin: process.env.FRONTEND_URL,
  credentials: true
}));
app.use(express.json());
app.set('trust proxy', 1);
app.use(errorHandler);
app.use(helmet());

// Rate limiting desativado para desenvolvimento
if (process.env.NODE_ENV === 'production') {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limit each IP to 100 requests per windowMs
    message: 'Too many requests from this IP, please try again later.',
    standardHeaders: true,
    legacyHeaders: false,
  });
  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30, // stricter limit for auth endpoints
    message: 'Too many authentication requests, please try again later.',
    skipSuccessfulRequests: true, // Don't count successful requests
  });
  app.use(limiter);
  app.use("/api/auth", authLimiter);
}

// Rotas
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/cart", cartRoutes);
app.use("/api/orders", orderRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/payment', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/health', healthRoutes);
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'healthy' });
});

// Rotas de status
app.get("/", (req, res) => {
  res.json({
    status: "online",
    message: "API E-commerce funcionando",
    endpoints: {
      auth: "/api/auth",
      products: "/api/products",
      cart: "/api/cart",
      orders: "/api/orders",
      favorites: "/api/favorites",
      reviews: "/api/reviews",
      recommendations: "/api/recommendations",
      health: "/api/health"
    }
  });
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "healthy" });
});

// Inicialização do servidor
// server.js → MUDANÇA CRÍTICA:
const startServer = async () => {
  try {
    await db.authenticate();
    console.log("✔ Conexão com o banco estabelecida");

    if (process.env.NODE_ENV !== "production") {
      await db.sync({ alter: true });
      console.log("✔ Modelos sincronizados (dev)");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 Servidor rodando na porta ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Falha na inicialização:", error);
    process.exit(1);
  }
};



startServer();
