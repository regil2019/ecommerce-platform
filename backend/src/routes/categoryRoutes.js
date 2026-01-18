import express from 'express'
import Category from '../models/Category.js'
import { authenticate, isAdmin } from '../middleware/authMiddleware.js'
import { categoriesLimiter } from '../middleware/rateLimiter.js'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'

const router = express.Router()

// Configura o armazenamento direto no Cloudinary para categorias
const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: 'categories', // pasta no Cloudinary
    allowed_formats: ['jpg', 'jpeg', 'png']
  }
})

const upload = multer({ storage })

// GET /api/categories - Get all categories
router.get('/', async (req, res) => {
  try {
    const categories = await Category.findAll({
      attributes: ['id', 'name', 'slug', 'description', 'isActive', 'image'],
      order: [['name', 'ASC']]
    })
    res.json(categories)
  } catch (error) {
    console.error('Erro ao buscar categorias:', error)
    res.status(500).json({ error: 'Erro ao buscar categorias' })
  }
})

// POST /api/categories - Create a new category (Admin only)
router.post('/', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { name, slug, description, isActive } = req.body
    const image = req.file

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' })
    }

    // Check if category already exists
    const existingCategory = await Category.findOne({
      where: { name: name.trim() }
    })

    if (existingCategory) {
      return res.status(400).json({ error: 'Categoria já existe' })
    }

    const categoryData = {
      name: name.trim(),
      slug: slug || name.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      description: description || '',
      isActive: isActive === 'true' || isActive === true
    }

    // If image is uploaded, use Cloudinary URL
    if (image) {
      categoryData.image = image.path // URL do Cloudinary
    }

    const category = await Category.create(categoryData)
    res.status(201).json(category)
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    res.status(500).json({ error: 'Erro ao criar categoria' })
  }
})

// PUT /api/categories/:id - Update a category (Admin only)
router.put('/:id', authenticate, isAdmin, upload.single('image'), async (req, res) => {
  try {
    const { id } = req.params
    const { name, slug, description, isActive } = req.body
    const image = req.file

    if (!name || name.trim() === '') {
      return res.status(400).json({ error: 'Nome da categoria é obrigatório' })
    }

    const categoryData = {
      name: name.trim(),
      slug: slug || name.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      description: description || '',
      isActive: isActive === 'true' || isActive === true
    }

    // If image is uploaded, use Cloudinary URL
    if (image) {
      categoryData.image = image.path // URL do Cloudinary
    }

    const [updated] = await Category.update(categoryData, {
      where: { id }
    })

    if (updated === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    const updatedCategory = await Category.findByPk(id)
    res.json(updatedCategory)
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    res.status(500).json({ error: 'Erro ao atualizar categoria' })
  }
})

// DELETE /api/categories/:id - Delete a category (Admin only)
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params

    const deleted = await Category.destroy({
      where: { id }
    })

    if (deleted === 0) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    res.json({ message: 'Categoria excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    res.status(500).json({ error: 'Erro ao excluir categoria' })
  }
})

export default router
