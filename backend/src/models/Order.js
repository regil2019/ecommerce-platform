import { DataTypes } from 'sequelize'
import db from '../config/database.js'
import OrderItem from './OrderItem.js'

const Order = db.define('Order', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true  // permite NULL para ON DELETE SET NULL na FK com customers
  },
  status: {
    type: DataTypes.ENUM('pending', 'pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  total: {
    type: DataTypes.FLOAT
  },
  paymentStatus: {
    type: DataTypes.ENUM('pending', 'paid', 'refunded'),
    defaultValue: 'pending'
  },
  shippingCost: {
    type: DataTypes.FLOAT,
    allowNull: true,
    defaultValue: 0.0
  },
  shippingMethod: {
    type: DataTypes.ENUM('standard', 'express'),
    allowNull: true
  },
//   promoCode: {
//     type: DataTypes.STRING(50),
//     allowNull: true
//   },
//   discountAmount: {
//     type: DataTypes.DECIMAL(10, 2),
//     defaultValue: 0
//   }
}, {
  underscored: true
})


// Association defined in models/index.js with alias 'orderItems'

export default Order
