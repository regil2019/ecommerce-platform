// authMiddleware
import jwt from 'jsonwebtoken'

export const authenticate = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Token não fornecido' })
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded // Inclui { id, role }
    next()
  } catch (error) {
    res.status(401).json({ error: 'Token inválido ou expirado' })
  }
}

export const isAdmin = (req, res, next) => {
  if (!req.user?.role) {
    return res.status(401).json({ error: 'Faça login primeiro' })
  }
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: 'Acesso negado. Requer admin' })
  }
  next()
}
