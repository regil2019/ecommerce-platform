import { createClient } from 'redis'

const redisClient = createClient({
  url: process.env.REDIS_URL || `redis://localhost:${process.env.REDIS_PORT || 6379}`,
  password: process.env.REDIS_PASSWORD || undefined
})

redisClient.on('error', (err) => {
  console.error('Redis Client Error:', err)
})

redisClient.on('connect', () => {
  console.log('✔ Redis conectado')
})

redisClient.on('ready', () => {
  console.log('✔ Redis pronto para uso')
})

redisClient.on('end', () => {
  console.log('✔ Conexão Redis encerrada')
})

// Conectar ao Redis
const connectRedis = async () => {
  try {
    await redisClient.connect()
  } catch (error) {
    console.warn('⚠️ Redis não disponível, continuando sem cache:', error.message)
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
        console.log(`📋 Cache hit: ${key}`)
        return res.json(JSON.parse(cachedData))
      }

      // Cache miss - interceptar resposta
      const originalJson = res.json
      res.json = (data) => {
        // Só cachear respostas de sucesso
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(key, duration, JSON.stringify(data))
            .catch(err => console.warn('Erro ao salvar cache:', err.message))
        }
        return originalJson.call(res, data)
      }

      next()
    } catch (error) {
      console.warn('Erro no cache middleware:', error.message)
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
      console.warn('Erro ao definir cache:', error.message)
    }
  }
}

export const getCache = async (key) => {
  if (redisClient.isOpen) {
    try {
      const data = await redisClient.get(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.warn('Erro ao obter cache:', error.message)
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
      console.warn('Erro ao deletar cache:', error.message)
    }
  }
}

export const clearCache = async (pattern = '*') => {
  if (redisClient.isOpen) {
    try {
      const keys = await redisClient.keys(`cache:${pattern}`)
      if (keys.length > 0) {
        await redisClient.del(keys)
        console.log(`🗑️ Cache limpo: ${keys.length} chaves`)
      }
    } catch (error) {
      console.warn('Erro ao limpar cache:', error.message)
    }
  }
}

export { connectRedis }
export default redisClient
