import app from "./src/app.js";
import db from "./src/config/database.js";
import { DataTypes } from "sequelize";
import path from "path";

const PORT = process.env.PORT || 4000;

/* =========================
   Auto Migrations
   Safely adds new columns to existing tables without dropping data.
   Runs in all environments so production Docker containers stay in sync.
========================= */
const runAutoMigrations = async () => {
  const qi = db.getQueryInterface();

  try {
    const productsDesc = await qi.describeTable('products');
    if (!productsDesc['sizes']) {
      await qi.addColumn('products', 'sizes', {
        type: DataTypes.JSON,
        allowNull: true,
        defaultValue: null,
      });
      console.log("✔ Migration: added 'sizes' to products");
    }
  } catch (e) {
    console.warn("⚠ Auto-migration 'sizes' skipped:", e.message);
  }

  try {
    const categoriesDesc = await qi.describeTable('categories');
    if (!categoriesDesc['category_type']) {
      await qi.addColumn('categories', 'category_type', {
        type: DataTypes.STRING(50),
        allowNull: true,
        defaultValue: 'other',
      });
      console.log("✔ Migration: added 'category_type' to categories");
    }
  } catch (e) {
    console.warn("⚠ Auto-migration 'category_type' skipped:", e.message);
  }
};

/* =========================
   Start Server
========================= */
const startServer = async () => {
  try {
    await db.authenticate();
    console.log("✔ Database connected");

    // Run additive migrations (safe: only adds columns, never drops)
    await runAutoMigrations();

    // sync() sem alter: cria tabelas que não existam, não modifica as existentes.
    // Alterações de schema devem ser geridas via migrações Sequelize (pnpm sequelize db:migrate)
    if (process.env.NODE_ENV !== "production" && !process.env.DATABASE_URL) {
      await db.sync();
      console.log("✔ Models synced");
    }

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`🚀 API running on port ${PORT}`);
      console.log(`📂 Static uploads mapped to: ${path.join(process.cwd(), 'uploads')}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
