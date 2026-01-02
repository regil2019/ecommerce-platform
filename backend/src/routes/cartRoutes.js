import express from "express";
import Cart from "../models/Cart.js";
import { authenticate } from "../middleware/authMiddleware.js";
import Product from "../models/Product.js";
import behaviorService from "../services/behaviorService.js";

const router = express.Router();

// Adicionar item (usuário logado)
router.post("/", authenticate, async (req, res) => {
  const {quantity} = req.body;
  if (!quantity || quantity < 1) {
    return res.status(400).json({error: "Quantidade invalida" });
  }
  try {
    const { productId, quantity = 1 } = req.body;
    const cartItem = await Cart.create({
      userId: req.user.id,
      productId,
      quantity
    });

    // Track cart add behavior
    await behaviorService.trackCartAdd(req.user.id, productId, quantity);

    res.status(201).json(cartItem);
  } catch (error) {
    res.status(500).json({ error: "Erro ao adicionar item" });
  }
});

// Listar itens (usuário logado)
router.get("/", authenticate, async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { userId: req.user.id },
      include: [{
        model: Product,
        attributes: ['id', 'name', 'price', 'images', 'description']
      }] // Trás dados do produto associado
    });
    res.json(cartItems);
  } catch (error) {
    res.status(500).json({ error: "Erro ao buscar carrinho" });
  }
});

// Atualizar quantidade (usuário logado)
router.put("/:itemId", authenticate, async (req, res) => {
  try {
    const { quantity } = req.body;
    const cartItem = await Cart.findOne({
      where: {
        id: req.params.itemId,
        userId: req.user.id // Só o dono pode atualizar
      }
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    cartItem.quantity = quantity;
    await cartItem.save();
    res.json(cartItem);
  } catch (error) {
    res.status(500).json({ error: "Erro ao atualizar item" });
  }
});

// Deletar item (usuário logado)
router.delete("/:itemId", authenticate, async (req, res) => {
  try {
    const cartItem = await Cart.findOne({
      where: {
        id: req.params.itemId,
        userId: req.user.id, // Só o dono pode deletar
      },
      include: [{model: Product, attributes: ["id", "name", "price"]}]
    });

    if (!cartItem) {
      return res.status(404).json({ error: "Item não encontrado" });
    }

    // Track cart remove behavior
    await behaviorService.trackCartRemove(req.user.id, cartItem.productId);

    await cartItem.destroy();
    res.status(204).end();
  } catch (error) {
    res.status(500).json({ error: "Erro ao deletar item" });
  }
});

export default router;