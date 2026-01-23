import express from 'express'
import { body, validationResult } from 'express-validator'
import Category from '../models/Category.js'
import { authenticate, isAdmin } from '../middleware/authMiddleware.js'
import multer from 'multer'
import { CloudinaryStorage } from 'multer-storage-cloudinary'
import cloudinary from '../config/cloudinary.js'
import logger from '../config/logger.js'
import { generateSlug, sanitizeInput } from '../utils/helpers.js'

// Validações comuns
const categoryValidations = [
  body('name')
    .trim()
    .notEmpty().withMessage('Nome da categoria é obrigatório')
    .isLength({ min: 2, max: 100 }).withMessage('Nome deve ter entre 2 e 100 caracteres'),
  body('slug')
    .optional()
    .trim()
    .isLength({ min: 2, max: 150 }).withMessage('Slug deve ter entre 2 e 150 caracteres')
    .matches(/^[a-z0-9-]+$/).withMessage('Slug deve conter apenas letras minúsculas, números e hífens'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 }).withMessage('Descrição muito longa (máx. 500 caracteres)'),
  body('isActive')
    .optional()
]

const router = express.Router()

// Configure multer to handle both file uploads and regular form data
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
}).any()

// GET /api/categories - Get all categories (public)
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
router.post('/', authenticate, isAdmin, upload, categoryValidations, async (req, res) => {
  try {
    console.log('📥 Category creation request received');
    console.log('📋 Request body:', req.body);
    console.log('📎 Request files:', req.files);

    // Sanitize inputs
    const sanitizedBody = sanitizeInput(req.body)
    let { name, slug, description, isActive } = sanitizedBody
    const image = req.files?.find(file => file.fieldname === 'image')

    // Validate request
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      logger.warn('Validation errors', { errors: errors.array() })
      return res.status(422).json({ errors: errors.array() })
    }

    // Check if category already exists by name
    const existingCategory = await Category.findOne({
      where: { name: name.trim() }
    })

    if (existingCategory) {
      return res.status(409).json({ error: 'Categoria com este nome já existe' })
    }

    // Generate slug if not provided
    const finalSlug = slug || generateSlug(name)

    // Check if slug already exists
    const existingSlug = await Category.findOne({
      where: { slug: finalSlug }
    })

    if (existingSlug) {
      return res.status(409).json({ error: 'Slug já está em uso. Escolha um slug diferente.' })
    }

    const categoryData = {
      name: name.trim(),
      slug: finalSlug,
      description: description || '',
      isActive: isActive === 'true' || isActive === true
    }

    // If image is uploaded, upload to Cloudinary
    if (image) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'categories',
              allowed_formats: ['jpg', 'jpeg', 'png']
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(image.buffer);
        });
        categoryData.image = result.secure_url;
      } catch (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        // Continue without image
      }
    }

    console.log('💾 Creating category with data:', categoryData);
    const category = await Category.create(categoryData)
    res.status(201).json(category)
  } catch (error) {
    console.error('❌ Erro ao criar categoria:', error)
    console.error('🔍 Error details:', {
      message: error.message,
      stack: error.stack,
      name: error.name
    })
    res.status(500).json({ error: 'Erro ao criar categoria', details: error.message })
  }
})

// PUT /api/categories/:id - Update a category (Admin only)
router.put('/:id',
  authenticate,
  isAdmin,
  upload,
  categoryValidations,
  async (req, res) => {
  try {
    const { id } = req.params
    console.log('📎 Request files:', req.files);
    // Sanitize inputs
    const sanitizedBody = sanitizeInput(req.body)
    let { name, slug, description, isActive } = sanitizedBody
    const image = req.files?.find(file => file.fieldname === 'image')

    // Validate request
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      logger.warn('Validation errors in update', { errors: errors.array() })
      return res.status(422).json({ errors: errors.array() })
    }

    const categoryData = {
      name: name.trim(),
      slug: slug || name.trim().toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, ''),
      description: description || '',
      isActive: isActive === 'true' || isActive === true
    }

    // If image is uploaded, upload to Cloudinary
    if (image) {
      try {
        const result = await new Promise((resolve, reject) => {
          const uploadStream = cloudinary.uploader.upload_stream(
            {
              folder: 'categories',
              allowed_formats: ['jpg', 'jpeg', 'png']
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            }
          );
          uploadStream.end(image.buffer);
        });
        categoryData.image = result.secure_url;
      } catch (uploadError) {
        console.error('Erro ao fazer upload da imagem:', uploadError);
        // Continue without image
      }
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
