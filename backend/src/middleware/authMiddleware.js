import jwt from 'jsonwebtoken'
import { config } from '../config/env.js'

const JWT_SECRET = config.jwtSecret

// Verify JWT token and attach decoded payload to req.user
export const authenticate = (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, JWT_SECRET)

    if (!decoded.id || !decoded.role) {
      return res.status(401).json({ error: 'Faça login primeiro' })
    }

    req.user = { id: decoded.id, role: decoded.role }
    next()
  } catch (error) {
    return res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

// Admin Authorization Middleware
export const isAdmin = (req, res, next) => {
  if (!req.user || !req.user.role) {
    return res.status(401).json({ error: 'Faça login primeiro' })
  }

  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Requer admin' })
  }

  next()
}
