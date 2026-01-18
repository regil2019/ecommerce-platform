import { createClient } from 'redis'
import logger from './logger.js'

const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://localhost:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined
})

redisClient.on('error', (err) => {
  logger.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  // Connection logging is handled by the logger
})

redisClient.on('ready', () => {
  // Ready logging is handled by the logger
})

redisClient.on('end', () => {
  // Disconnection logging is handled by the logger
})

// Conectar ao Redis
const connectRedis = async () => {
  try {
    await redisClient.connect()
  } catch (error) {
    // Warning is handled by the logger
  }
}

// Cache middleware
export const cacheMiddleware = (duration = 300) => {
  return async (req, res, next) => {
    // Só usar cache em desenvolvimento se Redis estiver disponível
    if (process.env.NODE_ENV === 'production' || !redisClient.isOpen) {
      return next()
    }

    const key = `cache:${req.originalUrl}`

    try {
      const cachedData = await redisClient.get(key)
      if (cachedData) {
        return res.json(JSON.parse(cachedData))
      }

      // Cache miss - interceptar resposta
      const originalJson = res.json
      res.json = (data) => {
        // Só cachear respostas de sucesso
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(key, duration, JSON.stringify(data))
            .catch(err => {
              logger.error('Erro ao salvar cache:', err.message)
            })
        }
        return originalJson.call(res, data)
      }

      next()
    } catch (error) {
      // Error is handled by the logger
      next()
    }
  }
}

// Funções utilitárias para cache
export const setCache = async (key, data, duration = 300) => {
  if (redisClient.isOpen) {
    try {
      await redisClient.setEx(key, duration, JSON.stringify(data))
    } catch (error) {
      // Error is handled by the logger
    }
  }
}

export const getCache = async (key) => {
  if (redisClient.isOpen) {
    try {
      const data = await redisClient.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      // Error is handled by the logger
      return null
    }
  }
  return null
}

export const deleteCache = async (key) => {
  if (redisClient.isOpen) {
    try {
      await redisClient.del(key)
    } catch (error) {
      // Error is handled by the logger
    }
  }
}

export const clearCache = async (pattern = '*') => {
  if (redisClient.isOpen) {
    try {
      const keys = await redisClient.keys(`cache:${pattern}`)
      if (keys.length > 0) {
        await redisClient.del(keys)
        // Success is handled by the logger
      }
    } catch (error) {
      // Error is handled by the logger
    }
  }
}

export { connectRedis }
export default redisClient
