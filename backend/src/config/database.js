import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';

dotenv.config();

const enableSSL = process.env.TIDB_ENABLE_SSL === 'true' || process.env.NODE_ENV === 'production';

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASSWORD,
  {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    dialect: 'mysql',
    logging: false,

    dialectOptions: {
      ssl: enableSSL
        ? {
            minVersion: 'TLSv1.2',
            rejectUnauthorized: true,
          }
        : null,
    },

    pool: {
      max: 10,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },

    define: {
      timestamps: true,
      underscored: true,
    },
  }
);

export default sequelize;
