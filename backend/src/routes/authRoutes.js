import express from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { body, validationResult } from 'express-validator'
import User from '../models/User.js'
import { authenticate } from '../middleware/authMiddleware.js'

const router = express.Router()

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d'

// Admin emails that get auto-promoted
const ADMIN_EMAILS = ['danielnunda@gmail.com', 'admin@regil.com']

const signToken = (user) =>
    jwt.sign({ id: user.id, role: user.role }, JWT_SECRET, { expiresIn: JWT_EXPIRES_IN })

/* ─────────────────────────────────────────
   POST /api/auth/register
───────────────────────────────────────── */
router.post(
    '/register',
    [
        body('name').trim().notEmpty().withMessage('Nome é obrigatório'),
        body('email').isEmail().normalizeEmail().withMessage('Email inválido'),
        body('password')
            .isLength({ min: 6 })
            .withMessage('A password deve ter pelo menos 6 caracteres'),
        body('address').optional().trim()
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { name, email, password, address } = req.body

        try {
            const existing = await User.findOne({ where: { email } })
            if (existing) {
                return res.status(409).json({ success: false, message: 'Email já registrado' })
            }

            const hashedPassword = await bcrypt.hash(password, 12)

            // Auto-promote admin emails
            const role = ADMIN_EMAILS.includes(email) ? 'admin' : 'user'

            const user = await User.create({
                name,
                email,
                password: hashedPassword,
                address: address || null,
                role
            })

            const token = signToken(user)

            return res.status(201).json({
                success: true,
                message: 'Usuário registrado com sucesso',
                token,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role
                }
            })
        } catch (error) {
            console.error('[Auth] Register error:', error)
            return res.status(500).json({ success: false, message: 'Erro interno no servidor' })
        }
    }
)

/* ─────────────────────────────────────────
   POST /api/auth/login
───────────────────────────────────────── */
router.post('/login', async (req, res) => {
    const { email, password } = req.body

    if (!email || !password) {
        return res.status(400).json({ success: false, message: 'Email and password are required' })
    }

    try {
        const user = await User.findOne({ where: { email } })

        if (!user || !user.password || user.password === 'CLERK_AUTH_PLACEHOLDER') {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }

        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(401).json({ success: false, message: 'Invalid credentials' })
        }

        // Auto-promote admin emails on login too
        if (ADMIN_EMAILS.includes(user.email) && user.role !== 'admin') {
            user.role = 'admin'
            await user.save()
        }

        const token = signToken(user)

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                address: user.address
            }
        })
    } catch (error) {
        console.error('[Auth] Login error:', error)
        return res.status(500).json({ success: false, message: 'Erro interno no servidor' })
    }
})

/* ─────────────────────────────────────────
   GET /api/auth/me  (protected)
───────────────────────────────────────── */
router.get('/me', authenticate, async (req, res) => {
    try {
        const user = await User.findByPk(req.user.id, {
            attributes: ['id', 'name', 'email', 'role', 'address', 'created_at']
        })

        if (!user) {
            return res.status(404).json({ error: 'Usuário não encontrado' })
        }

        return res.json({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            address: user.address,
            createdAt: user.created_at
        })
    } catch (error) {
        console.error('[Auth] /me error:', error)
        return res.status(500).json({ error: 'Erro interno no servidor' })
    }
})

/* ─────────────────────────────────────────
   PUT /api/auth/profile  (protected)
───────────────────────────────────────── */
router.put(
    '/profile',
    authenticate,
    [
        body('name').optional().trim().notEmpty().withMessage('Nome não pode ser vazio'),
        body('address').optional().trim(),
        body('password')
            .optional()
            .isLength({ min: 6 })
            .withMessage('A nova password deve ter pelo menos 6 caracteres')
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { name, address, password } = req.body

        try {
            const user = await User.findByPk(req.user.id)
            if (!user) {
                return res.status(404).json({ error: 'Usuário não encontrado' })
            }

            if (name !== undefined) user.name = name
            if (address !== undefined) user.address = address
            if (password) {
                user.password = await bcrypt.hash(password, 12)
            }

            await user.save()

            return res.json({
                success: true,
                message: 'Perfil atualizado com sucesso',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    address: user.address
                }
            })
        } catch (error) {
            console.error('[Auth] Profile update error:', error)
            return res.status(500).json({ error: 'Erro interno no servidor' })
        }
    }
)

/* ─────────────────────────────────────────
   POST /api/auth/forgot-password
   (Generates a reset token – in a real app you'd email it)
───────────────────────────────────────── */
router.post('/forgot-password', async (req, res) => {
    const { email } = req.body
    if (!email) {
        return res.status(400).json({ success: false, message: 'Email é obrigatório' })
    }

    try {
        const user = await User.findOne({ where: { email } })

        // Always respond success to avoid user enumeration
        if (!user) {
            return res.json({
                success: true,
                message: 'Se o email existir, receberás um link de recuperação.'
            })
        }

        // Generate a short-lived reset token
        const resetToken = jwt.sign(
            { id: user.id, type: 'password_reset' },
            JWT_SECRET,
            { expiresIn: '1h' }
        )

        // In production: send email with resetToken
        // For portfolio: return the token in response (or log it)
        console.log(`[Auth] Password reset token for ${email}: ${resetToken}`)

        return res.json({
            success: true,
            message: 'Se o email existir, receberás um link de recuperação.',
            // Remove resetToken from response in production — only for dev/portfolio
            ...(process.env.NODE_ENV !== 'production' && { resetToken })
        })
    } catch (error) {
        console.error('[Auth] Forgot password error:', error)
        return res.status(500).json({ success: false, message: 'Erro interno no servidor' })
    }
})

/* ─────────────────────────────────────────
   POST /api/auth/reset-password/:token
───────────────────────────────────────── */
router.post(
    '/reset-password/:token',
    [
        body('password')
            .isLength({ min: 6 })
            .withMessage('A password deve ter pelo menos 6 caracteres')
    ],
    async (req, res) => {
        const errors = validationResult(req)
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() })
        }

        const { token } = req.params
        const { password } = req.body

        try {
            const decoded = jwt.verify(token, JWT_SECRET)

            if (decoded.type !== 'password_reset') {
                return res.status(400).json({ success: false, message: 'Token inválido' })
            }

            const user = await User.findByPk(decoded.id)
            if (!user) {
                return res.status(404).json({ success: false, message: 'Usuário não encontrado' })
            }

            user.password = await bcrypt.hash(password, 12)
            await user.save()

            return res.json({ success: true, message: 'Password redefinida com sucesso' })
        } catch (error) {
            if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
                return res.status(400).json({ success: false, message: 'Token inválido ou expirado' })
            }
            console.error('[Auth] Reset password error:', error)
            return res.status(500).json({ success: false, message: 'Erro interno no servidor' })
        }
    }
)

export default router
