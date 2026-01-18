// src/models/OrderItem.js
import { DataTypes } from 'sequelize'
import db from '../config/database.js'
import Product from './Product.js' // Importação necessária

const OrderItem = db.define('OrderItem', {
  quantity: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: { min: 1 }
  },
  price: {
    type: DataTypes.FLOAT,
    allowNull: false,
    validate: { min: 0.01 }
  }
})

// Relacionamentos
OrderItem.belongsTo(Product, { foreignKey: 'productId' })

export default OrderItem
