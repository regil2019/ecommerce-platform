import rateLimit from 'express-rate-limit'

// Configuração básica de rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: process.env.NODE_ENV === 'production' ? 2000 : 10000, // 10000 em dev, 2000 em prod
  message: 'Muitas requisições. Tente novamente em alguns minutos.',
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiter mais permissivo para endpoints de favoritos
const favoritesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Limite de 1000 requisições por IP para favoritos
  message: 'Muitas requisições. Tente novamente em alguns minutos.',
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiter para endpoints de produtos (mais permissivo)
const productsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 2000, // Limite de 2000 requisições por IP para produtos
  message: 'Muitas requisições. Tente novamente em alguns minutos.',
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiter para endpoints de categorias (mais permissivo)
const categoriesLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1000, // Limite de 1000 requisições por IP para categorias
  message: 'Muitas requisições. Tente novamente em alguns minutos.',
  standardHeaders: true,
  legacyHeaders: false
})

// Rate limiter para endpoints de recomendações (mais permissivo)
const recommendationsLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 500, // Limite de 500 requisições por IP para recomendações
  message: 'Muitas requisições. Tente novamente em alguns minutos.',
  standardHeaders: true,
  legacyHeaders: false
})

export { limiter, favoritesLimiter, productsLimiter, categoriesLimiter, recommendationsLimiter }
export default limiter
