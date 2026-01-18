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
    get () {
      const raw = this.getDataValue('images')
      return Array.isArray(raw) ? raw : []
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
  }
}, {
  tableName: 'products',
  timestamps: true
})

export default Product
