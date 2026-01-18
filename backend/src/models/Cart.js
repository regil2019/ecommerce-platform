// src/models/Cart.js
import { DataTypes } from 'sequelize'
import db from '../config/database.js'
import Product from './Product.js' //
import User from './User.js' // Importar o modelo User (opcional, se quiser associar ao User)

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
      model: User, // Referência à tabela users (opcional, mas recomendado)
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: Product, // Referência à tabela products
      key: 'id'
    }
  },
  quantity: {
    type: DataTypes.INTEGER,
    defaultValue: 1,
    validate: {
      min: 1 // Quantidade mínima de 1
    }
  }
}, {
  tableName: 'cart', // Nome da tabela no MySQL
  timestamps: true // Adiciona createdAt e updatedAt
})

// Associações (IMPORTANTE!)
Product.hasMany(Cart, { foreignKey: 'productId' })
Cart.belongsTo(Product, { foreignKey: 'productId' })

// Associação com User (opcional, se quiser)
User.hasMany(Cart, { foreignKey: 'userId' })
Cart.belongsTo(User, { foreignKey: 'userId' })

export default Cart
