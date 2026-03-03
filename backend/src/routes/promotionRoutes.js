import express from 'express'
import { body, validationResult } from 'express-validator'
import Promotion from '../models/Promotion.js'
import { authenticate, isAdmin } from '../middleware/authMiddleware.js'
import { Op } from 'sequelize'
import logger from '../config/logger.js'

const router = express.Router()

// Validation rules
const promotionValidations = [
    body('code')
        .trim()
        .notEmpty().withMessage('Promotion code is required')
        .isLength({ min: 3, max: 50 }).withMessage('Code must be between 3 and 50 characters')
        .isUppercase().withMessage('Code must be uppercase')
        .matches(/^[A-Z0-9_-]+$/).withMessage('Code can only contain uppercase letters, numbers, hyphens, and underscores'),
    body('discount_type')
        .isIn(['percentage', 'fixed']).withMessage('Discount type must be percentage or fixed'),
    body('discount_value')
        .isFloat({ min: 0 }).withMessage('Discount value must be a positive number'),
    body('start_date')
        .isISO8601().withMessage('Start date must be a valid date'),
    body('end_date')
        .isISO8601().withMessage('End date must be a valid date')
]

/**
 * @route GET /api/promotions/validate/:code
 * @description Validate a promotion code (public endpoint for checkout)
 * @access Public
 */
router.get('/validate/:code', async (req, res) => {
    try {
        const { code } = req.params
        const { amount } = req.query

        if (!code) {
            return res.status(400).json({ error: 'Promotion code is required' })
        }

        const promotion = await Promotion.findOne({
            where: { code: code.toUpperCase() }
        })

        if (!promotion) {
            return res.status(404).json({
                valid: false,
                error: 'Invalid promotion code'
            })
        }

        if (!promotion.isValid()) {
            let reason = 'Promotion code is not valid'
            const now = new Date()

            if (!promotion.is_active) {
                reason = 'Promotion code is inactive'
            } else if (now < promotion.start_date) {
                reason = 'Promotion has not started yet'
            } else if (now > promotion.end_date) {
                reason = 'Promotion has expired'
            } else if (promotion.usage_limit && promotion.usage_count >= promotion.usage_limit) {
                reason = 'Promotion usage limit reached'
            }

            return res.status(400).json({
                valid: false,
                error: reason
            })
        }

        const purchaseAmount = parseFloat(amount) || 0
        if (purchaseAmount < promotion.min_purchase_amount) {
            return res.status(400).json({
                valid: false,
                error: `Minimum purchase amount is €${promotion.min_purchase_amount}`
            })
        }

        const discount = promotion.calculateDiscount(purchaseAmount)

        res.json({
            valid: true,
            promotion: {
                code: promotion.code,
                description: promotion.description,
                discount_type: promotion.discount_type,
                discount_value: promotion.discount_value,
                discount_amount: discount,
                min_purchase_amount: promotion.min_purchase_amount
            }
        })
    } catch (error) {
        logger.error('Error validating promotion:', error)
        res.status(500).json({ error: 'Error validating promotion code' })
    }
})

/**
 * @route GET /api/admin/promotions
 * @description Get all promotions with pagination and filters
 * @access Private (Admin only)
 */
router.get('/admin/promotions', authenticate, isAdmin, async (req, res) => {
    try {
        const { page = 1, limit = 20, status = 'all', search } = req.query
        const where = {}

        // Filter by status
        if (status === 'active') {
            where.is_active = true
            where.end_date = { [Op.gte]: new Date() }
        } else if (status === 'expired') {
            where.end_date = { [Op.lt]: new Date() }
        } else if (status === 'inactive') {
            where.is_active = false
        }

        // Search by code or description
        if (search) {
            where[Op.or] = [
                { code: { [Op.like]: `%${search}%` } },
                { description: { [Op.like]: `%${search}%` } }
            ]
        }

        const { count, rows: promotions } = await Promotion.findAndCountAll({
            where,
            order: [['created_at', 'DESC']],
            limit: parseInt(limit),
            offset: (parseInt(page) - 1) * parseInt(limit)
        })

        res.json({
            data: promotions,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total: count,
                totalPages: Math.ceil(count / parseInt(limit))
            }
        })
    } catch (error) {
        logger.error('Error fetching promotions:', error)
        res.status(500).json({ error: 'Error fetching promotions' })
    }
})

/**
 * @route POST /api/admin/promotions
 * @description Create a new promotion
 * @access Private (Admin only)
 */
router.post('/admin/promotions', authenticate, isAdmin, promotionValidations, async (req, res) => {
    try {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }

        const {
            code,
            description,
            discount_type,
            discount_value,
            min_purchase_amount,
            max_discount_amount,
            usage_limit,
            start_date,
            end_date,
            is_active
        } = req.body

        // Check if code already exists
        const existingPromotion = await Promotion.findOne({
            where: { code: code.toUpperCase() }
        })

        if (existingPromotion) {
            return res.status(409).json({ error: 'Promotion code already exists' })
        }

        // Validate percentage discount
        if (discount_type === 'percentage' && discount_value > 100) {
            return res.status(400).json({ error: 'Percentage discount cannot exceed 100%' })
        }

        const promotion = await Promotion.create({
            code: code.toUpperCase(),
            description,
            discount_type,
            discount_value,
            min_purchase_amount: min_purchase_amount || 0,
            max_discount_amount,
            usage_limit,
            start_date,
            end_date,
            is_active: is_active !== undefined ? is_active : true
        })

        res.status(201).json(promotion)
    } catch (error) {
        logger.error('Error creating promotion:', error)
        res.status(500).json({ error: 'Error creating promotion', details: error.message })
    }
})

/**
 * @route PUT /api/admin/promotions/:id
 * @description Update a promotion
 * @access Private (Admin only)
 */
router.put('/admin/promotions/:id', authenticate, isAdmin, promotionValidations, async (req, res) => {
    try {
        const { id } = req.params
        const errors = validationResult(req)

        if (!errors.isEmpty()) {
            return res.status(422).json({ errors: errors.array() })
        }

        const promotion = await Promotion.findByPk(id)
        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' })
        }

        const {
            code,
            description,
            discount_type,
            discount_value,
            min_purchase_amount,
            max_discount_amount,
            usage_limit,
            start_date,
            end_date,
            is_active
        } = req.body

        // Check if code is being changed and if it already exists
        if (code.toUpperCase() !== promotion.code) {
            const existingPromotion = await Promotion.findOne({
                where: {
                    code: code.toUpperCase(),
                    id: { [Op.ne]: id }
                }
            })

            if (existingPromotion) {
                return res.status(409).json({ error: 'Promotion code already exists' })
            }
        }

        // Validate percentage discount
        if (discount_type === 'percentage' && discount_value > 100) {
            return res.status(400).json({ error: 'Percentage discount cannot exceed 100%' })
        }

        await promotion.update({
            code: code.toUpperCase(),
            description,
            discount_type,
            discount_value,
            min_purchase_amount: min_purchase_amount || 0,
            max_discount_amount,
            usage_limit,
            start_date,
            end_date,
            is_active: is_active !== undefined ? is_active : promotion.is_active
        })

        res.json(promotion)
    } catch (error) {
        logger.error('Error updating promotion:', error)
        res.status(500).json({ error: 'Error updating promotion' })
    }
})

/**
 * @route DELETE /api/admin/promotions/:id
 * @description Delete a promotion
 * @access Private (Admin only)
 */
router.delete('/admin/promotions/:id', authenticate, isAdmin, async (req, res) => {
    try {
        const { id } = req.params

        const promotion = await Promotion.findByPk(id)
        if (!promotion) {
            return res.status(404).json({ error: 'Promotion not found' })
        }

        await promotion.destroy()

        res.json({ message: 'Promotion deleted successfully' })
    } catch (error) {
        logger.error('Error deleting promotion:', error)
        res.status(500).json({ error: 'Error deleting promotion' })
    }
})

export default router
