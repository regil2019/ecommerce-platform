import dotenv from 'dotenv';
import path from 'path';

// Load .env file
dotenv.config();

/**
 * Validates critical environment variables.
 * In a production environment, we should use a library like Zod or Joi.
 * For now, we use a custom validator to ensure system integrity.
 */
const validateEnv = () => {
  const requiredVars = {
    // Security
    JWT_SECRET: (val) => val && val.length >= 32,

    // Database (Aceita DATABASE_URL ou as variáveis individuais)
    DB_CONNECTION: () => {
      const hasUrl = !!process.env.DATABASE_URL;
      const hasIndividual = !!(
        process.env.DB_HOST &&
        process.env.DB_USER &&
        process.env.DB_PASSWORD !== undefined &&
        process.env.DB_NAME
      );
      return hasUrl || hasIndividual;
    },

    // Services
    CLOUDINARY_CLOUD_NAME: (val) => !!val,
    CLOUDINARY_API_KEY: (val) => !!val,
    CLOUDINARY_API_SECRET: (val) => !!val,
    STRIPE_SECRET_KEY: (val) => !!val && val.startsWith('sk_'),

    // URLs
    FRONTEND_URL: (val) => !!val && val.startsWith('http'),
  };

  const missingOrInvalid = [];

  for (const [key, validator] of Object.entries(requiredVars)) {
    const value = process.env[key];
    if (!validator(value)) {
      missingOrInvalid.push(key);
    }
  }

  if (missingOrInvalid.length > 0) {
    console.error('\x1b[31m%s\x1b[0m', '❌ CRITICAL ERROR: Missing or invalid environment variables:');
    missingOrInvalid.forEach(key => {
      const reason = !process.env[key] ? 'missing' : 'invalid format';
      console.error('\x1b[33m%s\x1b[0m', `   - ${key} (${reason})`);
    });

    if (process.env.NODE_ENV === 'production') {
      console.error('\x1b[31m%s\x1b[0m', 'Aborting startup due to security risks in production.');
      process.exit(1);
    } else {
      console.warn('\x1b[33m%s\x1b[0m', 'Warning: Proceeding in non-production mode, but some features may fail.');
    }
  } else {
    console.log('\x1b[32m%s\x1b[0m', '✅ Environment variables validated successfully.');
  }
};

validateEnv();

export const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '4000', 10),
  jwtSecret: process.env.JWT_SECRET,
  frontendUrl: process.env.FRONTEND_URL,
  db: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    name: process.env.DB_NAME,
    port: parseInt(process.env.DB_PORT || '3306', 10),
    url: process.env.DATABASE_URL
  },
  cloudinary: {
    cloudName: process.env.CLOUDINARY_CLOUD_NAME,
    apiKey: process.env.CLOUDINARY_API_KEY,
    apiSecret: process.env.CLOUDINARY_API_SECRET
  },
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET
  },
  emailjs: {
    serviceId: process.env.EMAILJS_SERVICE_ID,
    publicKey: process.env.EMAILJS_PUBLIC_KEY,
    privateKey: process.env.EMAILJS_PRIVATE_KEY
  },
  redis: {
    url: process.env.REDIS_URL,
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD
  }
};

export default config;
