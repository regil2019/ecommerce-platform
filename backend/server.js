import app from "./src/app.js";
import db from "./src/config/database.js";
import path from "path";

const PORT = process.env.PORT || 4000;

/* =========================
   Start Server
========================= */
const startServer = async () => {
  try {
    await db.authenticate();
    console.log("✔ Database connected");

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
