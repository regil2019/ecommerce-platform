import { Sequelize } from 'sequelize'
import dotenv from 'dotenv'

dotenv.config()

// Configuração SSL para TiDB Cloud
const getSSLConfig = () => {
  // Se DATABASE_URL contém SSL
  if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('ssl=')) {
    return {
      require: true,
      rejectUnauthorized: false
    }
  }

  // Configurações específicas para TiDB Cloud
  if (process.env.DB_SSL === 'true' ||
      process.env.DB_DIALECT_OPTIONS_SSL_REQUIRE === 'true' ||
      process.env.NODE_ENV === 'production') {
    return {
      require: true,
      rejectUnauthorized: process.env.DB_DIALECT_OPTIONS_SSL_REJECT_UNAUTHORIZED !== 'false'
    }
  }

  return null
}

let sequelize

// Se DATABASE_URL estiver definida, usar ela
if (process.env.DATABASE_URL) {
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'mysql',
    logging: false,
    dialectOptions: {
      ssl: getSSLConfig()
    },
    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000
    },
    define: {
      timestamps: true,
      underscored: true
    }
  })
} else {
  // Fallback para configuração individual
  sequelize = new Sequelize(
    process.env.DB_NAME,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      port: process.env.DB_PORT || 3306,
      dialect: 'mysql',
      logging: false,
      dialectOptions: {
        ssl: getSSLConfig()
      },
      pool: {
        max: 10,
        min: 0,
        acquire: 30000,
        idle: 10000
      },
      define: {
        timestamps: true,
        underscored: true
      }
    }
  )
}

export default sequelize
