import express from 'express'
import { Favorite, Product, Category } from '../models/index.js'
import { authenticate } from '../middleware/authMiddleware.js'
import { favoritesLimiter } from '../middleware/rateLimiter.js'
import behaviorService from '../services/behaviorService.js'

const router = express.Router()

// Adicionar produto aos favoritos
router.post('/', authenticate, favoritesLimiter, async (req, res) => {
  try {
    const { productId } = req.body
    const userId = req.user.id

    // Verifica se o produto existe
    const product = await Product.findByPk(productId)
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    // Verifica se já está nos favoritos
    const existingFavorite = await Favorite.findOne({
      where: { userId, productId }
    })

    if (existingFavorite) {
      return res.status(400).json({ error: 'Produto já está nos favoritos' })
    }

    const favorite = await Favorite.create({
      userId,
      productId
    })

    // Track favorite add behavior
    await behaviorService.trackFavoriteAdd(userId, productId)

    // Busca o favorito com dados do produto
    const favoriteWithProduct = await Favorite.findByPk(favorite.id, {
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug']
            }
          ]
        }
      ]
    })

    res.status(201).json(favoriteWithProduct)
  } catch (error) {
    console.error('Erro ao adicionar favorito:', error)
    res.status(500).json({ error: 'Erro ao adicionar favorito' })
  }
})

// Remover produto dos favoritos
router.delete('/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user.id

    const favorite = await Favorite.findOne({
      where: { userId, productId }
    })

    if (!favorite) {
      return res.status(404).json({ error: 'Favorito não encontrado' })
    }

    // Track favorite remove behavior
    await behaviorService.trackFavoriteRemove(userId, productId)

    await favorite.destroy()
    res.status(204).end()
  } catch (error) {
    console.error('Erro ao remover favorito:', error)
    res.status(500).json({ error: 'Erro ao remover favorito' })
  }
})

// Listar favoritos do usuário
router.get('/', authenticate, async (req, res) => {
  try {
    const userId = req.user.id

    const favorites = await Favorite.findAll({
      where: { userId },
      include: [
        {
          model: Product,
          as: 'product',
          include: [
            {
              model: Category,
              as: 'category',
              attributes: ['id', 'name', 'slug']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json(favorites)
  } catch (error) {
    console.error('Erro ao buscar favoritos:', error)
    res.status(500).json({ error: 'Erro ao buscar favoritos' })
  }
})

// Verificar se produto está nos favoritos
router.get('/check/:productId', authenticate, async (req, res) => {
  try {
    const { productId } = req.params
    const userId = req.user.id

    const favorite = await Favorite.findOne({
      where: { userId, productId }
    })

    res.json({ isFavorite: !!favorite })
  } catch (error) {
    console.error('Erro ao verificar favorito:', error)
    res.status(500).json({ error: 'Erro ao verificar favorito' })
  }
})

export default router
