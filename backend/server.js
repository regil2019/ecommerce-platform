import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import db from "./src/config/database.js";
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
app.use(express.json());
app.set("trust proxy", 1);
app.use(helmet());

/* =========================
   Rate limit (produção)
========================= */
if (process.env.NODE_ENV === "production") {
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
  });

  const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 30,
    skipSuccessfulRequests: true,
  });

  app.use(limiter);
  app.use("/api/auth", authLimiter);
}

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

    if (process.env.NODE_ENV !== "production") {
      await db.sync({ alter: true });
      console.log("✔ Models sincronizados (dev)");
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
