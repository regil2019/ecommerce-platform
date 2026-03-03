// src/models/Cart.js
import { DataTypes } from 'sequelize'
import db from '../config/database.js'
import Product from './Product.js'
import User from './User.js'

const Cart = db.define('Cart', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product,
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1
    }
  }
}, {
  tableName: 'cart',
  timestamps: true,
  underscored: true
})

// Associations defined in models/index.js with proper aliases

export default Cart
