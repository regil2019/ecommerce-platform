import express from 'express'
import { body, validationResult } from 'express-validator'
import Category from '../models/Category.js'
import { authenticate, isAdmin } from '../middleware/authMiddleware.js'
import multer from 'multer'
import logger from '../config/logger.js'
import { generateSlug, sanitizeInput } from '../utils/helpers.js'
import path from 'path'
import crypto from 'crypto'
import fs from 'fs'

const router = express.Router()

// Ensure upload directory exists
const uploadDir = 'uploads'
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true })
}

// Configure local disk storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir)
  },
  filename: (req, file, cb) => {
    const uniqueName = `${Date.now()}-${crypto.randomBytes(8).toString('hex')}${path.extname(file.originalname)}`
    cb(null, uniqueName)
  }
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
})

// Validations
const categoryValidations = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome da categoria é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('slug')
    .optional()
    .trim()
    .matches(/^[a-z0-9-]+$/).withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Descrição muito longa (máx. 500 caracteres)'),
  body('isActive')
    .optional()
]

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

// POST /api/categories - Create category (Admin)
router.post('/', authenticate, isAdmin, upload.single('image'), categoryValidations, async (req, res) => {
  try {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const { name, slug, description, isActive } = req.body

    // Check if category exists
    const existingCategory = await Category.findOne({ where: { name: name.trim() } })
    if (existingCategory) {
      return res.status(409).json({ error: 'Categoria com este nome já existe' })
    }

    const finalSlug = slug || generateSlug(name)
    const existingSlug = await Category.findOne({ where: { slug: finalSlug } })
    if (existingSlug) {
      return res.status(409).json({ error: 'Slug já está em uso' })
    }

    // Handle image
    let imageUrl = null
    if (req.file) {
      imageUrl = `/uploads/${req.file.filename}`
    } else if (req.body.image) {
      imageUrl = req.body.image // Allow image URL string
    }

    const category = await Category.create({
      name: name.trim(),
      slug: finalSlug,
      description: description || '',
      isActive: isActive === 'true' || isActive === true,
      image: imageUrl
    })

    res.status(201).json(category)
  } catch (error) {
    console.error('Erro ao criar categoria:', error)
    res.status(500).json({ error: 'Erro ao criar categoria' })
  }
})

// PUT /api/categories/:id - Update category (Admin)
router.put('/:id', authenticate, isAdmin, upload.single('image'), categoryValidations, async (req, res) => {
  try {
    const { id } = req.params
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() })
    }

    const { name, slug, description, isActive } = req.body
    const category = await Category.findByPk(id)

    if (!category) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    // Handle updates
    category.name = name.trim()
    category.slug = slug || generateSlug(name)
    category.description = description || ''
    category.isActive = isActive === 'true' || isActive === true

    if (req.file) {
      category.image = `/uploads/${req.file.filename}`
    } else if (req.body.image !== undefined) {
      category.image = req.body.image // Update if provided string, or clear if empty string
    }

    await category.save()
    res.json(category)
  } catch (error) {
    console.error('Erro ao atualizar categoria:', error)
    res.status(500).json({ error: 'Erro ao atualizar categoria' })
  }
})

// DELETE /api/categories/:id
router.delete('/:id', authenticate, isAdmin, async (req, res) => {
  try {
    const { id } = req.params
    const deleted = await Category.destroy({ where: { id } })

    if (!deleted) {
      return res.status(404).json({ error: 'Categoria não encontrada' })
    }

    res.json({ message: 'Categoria excluída com sucesso' })
  } catch (error) {
    console.error('Erro ao excluir categoria:', error)
    res.status(500).json({ error: 'Erro ao excluir categoria' })
  }
})

export default router
