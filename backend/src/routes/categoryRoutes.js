import express from "express";
import Category from "../models/Category.js";
import { authenticate, isAdmin } from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/categories - Get all categories
router.get("/", async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name'],
      order: [['name', 'ASC']],
    });
    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar categorias" });
  }
});

// POST /api/categories - Create a new category (Admin only)
router.post("/", authenticate, isAdmin, async (req, res) => {
  try {
    const { name } = req.body;

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: "Nome da categoria é obrigatório" });
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({ 
      where: { name: name.trim() } 
    });

    if (existingCategory) {
      return res.status(400).json({ error: "Categoria já existe" });
    }

    const category = await Category.create({ name: name.trim() });
    res.status(201).json(category);
  } catch (error) {
    console.error("Erro ao criar categoria:", error);
    res.status(500).json({ error: "Erro ao criar categoria" });
  }
});

export default router;
