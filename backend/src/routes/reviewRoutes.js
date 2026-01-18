import express from 'express'
import { Review, User, Product } from '../models/index.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

// Validação básica para reviews
const reviewValidators = [
  (req, res, next) => {
    const { rating, comment } = req.body
    const errors = []

    if (!rating || rating < 1 || rating > 5) {
      errors.push({ msg: 'Rating deve ser entre 1 e 5', param: 'rating' })
    }

    if (comment && comment.length > 1000) {
      errors.push({ msg: 'Comentário deve ter no máximo 1000 caracteres', param: 'comment' })
    }

    if (errors.length > 0) {
      return res.status(400).json({ errors })
    }
    next()
  }
]

// Buscar reviews de um produto
router.get('/product/:productId', async (req, res) => {
  try {
    const { productId } = req.params

    const reviews = await Review.findAll({
      where: { productId },
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    })

    res.json(reviews)
  } catch (error) {
    console.error('Erro ao buscar reviews:', error)
    res.status(500).json({ error: 'Erro ao buscar reviews' })
  }
})

// Criar review (apenas usuários autenticados)
router.post('/', authenticate, reviewValidators, async (req, res) => {
  try {
    const { productId, rating, comment } = req.body
    const userId = req.user.id

    // Verifica se o produto existe
    const product = await Product.findByPk(productId)
    if (!product) {
      return res.status(404).json({ error: 'Produto não encontrado' })
    }

    // Verifica se o usuário já fez uma review para este produto
    const existingReview = await Review.findOne({
      where: { userId, productId }
    })

    if (existingReview) {
      return res.status(400).json({ error: 'Você já fez uma avaliação para este produto' })
    }

    const review = await Review.create({
      userId,
      productId,
      rating,
      comment
    })

    // Busca a review com dados do usuário
    const reviewWithUser = await Review.findByPk(review.id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    })

    res.status(201).json(reviewWithUser)
  } catch (error) {
    console.error('Erro ao criar review:', error)
    res.status(500).json({ error: 'Erro ao criar review' })
  }
})

// Atualizar review (apenas o dono da review)
router.put('/:id', authenticate, reviewValidators, async (req, res) => {
  try {
    const { id } = req.params
    const { rating, comment } = req.body
    const userId = req.user.id

    const review = await Review.findByPk(id)
    if (!review) {
      return res.status(404).json({ error: 'Review não encontrada' })
    }

    // Verifica se o usuário é o dono da review
    if (review.userId !== userId) {
      return res.status(403).json({ error: 'Você não tem permissão para editar esta review' })
    }

    await review.update({ rating, comment })

    // Busca a review atualizada com dados do usuário
    const updatedReview = await Review.findByPk(id, {
      include: [
        {
          model: User,
          as: 'user',
          attributes: ['id', 'name']
        }
      ]
    })

    res.json(updatedReview)
  } catch (error) {
    console.error('Erro ao atualizar review:', error)
    res.status(500).json({ error: 'Erro ao atualizar review' })
  }
})

// Deletar review (dono da review ou admin)
router.delete('/:id', authenticate, async (req, res) => {
  try {
    const { id } = req.params
    const userId = req.user.id
    const isUserAdmin = req.user.role === 'admin'

    const review = await Review.findByPk(id)
    if (!review) {
      return res.status(404).json({ error: 'Review não encontrada' })
    }

    // Verifica se o usuário é o dono da review ou admin
    if (review.userId !== userId && !isUserAdmin) {
      return res.status(403).json({ error: 'Você não tem permissão para deletar esta review' })
    }

    await review.destroy()
    res.status(204).end()
  } catch (error) {
    console.error('Erro ao deletar review:', error)
    res.status(500).json({ error: 'Erro ao deletar review' })
  }
})

export default router
