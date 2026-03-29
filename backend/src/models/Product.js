import { DataTypes } from 'sequelize'
import db from '../config/database.js'

const Product = db.define('Product', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: {
      min: 0.01
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  images: {
    type: DataTypes.JSON, // array de URLs
    defaultValue: [],
    allowNull: false,
    get() {
      const raw = this.getDataValue('images')
      let parsed = [];
      if (Array.isArray(raw)) parsed = raw;
      else if (typeof raw === 'string' && raw) {
        try { parsed = JSON.parse(raw); } catch (e) { parsed = []; }
      }
      // Return only absolute URLs (Cloudinary)
      return parsed.filter(img => img && img.startsWith('http'));
    }
  },
  stock: {
    type: DataTypes.INTEGER,
    defaultValue: 0,
    validate: {
      min: 0
    }
  },
  categoryId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories', // Nome da tabela
      key: 'id'
    }
  },
  weight: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 1.0, // in kg
    validate: {
      min: 0.01
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  slug: {
    type: DataTypes.STRING,
    allowNull: true,
    unique: true
  },
  short_description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  original_price: {
    type: DataTypes.FLOAT,
    allowNull: true
  },
  discount_percentage: {
    type: DataTypes.INTEGER,
    defaultValue: 0
  },
  main_image: {
    type: DataTypes.STRING(255),
    allowNull: true,
    get() {
      const rawValue = this.getDataValue('main_image');
      if (!rawValue || !rawValue.startsWith('http')) return null;
      return rawValue;
    }
  },
  sku: {
    type: DataTypes.STRING(50),
    allowNull: true
  },
  is_featured: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  },
  dimensions: {
    type: DataTypes.STRING(100),
    allowNull: true
  },
  tags: {
    type: DataTypes.JSON,
    allowNull: true,
    get() {
      const raw = this.getDataValue('tags');
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string' && raw) {
        try { return JSON.parse(raw); } catch (e) { return []; }
      }
      return [];
    }
  },
  sizes: {
    type: DataTypes.JSON,
    allowNull: true,
    defaultValue: null,
    get() {
      const raw = this.getDataValue('sizes');
      if (Array.isArray(raw)) return raw;
      if (typeof raw === 'string' && raw) {
        try { return JSON.parse(raw); } catch (e) { return null; }
      }
      return null;
    }
  }
}, {
  tableName: 'products',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      fields: ['category_id']
    },
    {
      fields: ['price']
    },
    {
      fields: ['is_active']
    },
    {
      fields: ['slug']
    }
  ]
})

export default Product
