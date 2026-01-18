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
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('pending', 'pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'),
    defaultValue: 'pending'
  },
  total: {
    type: DataTypes.FLOAT
  },
  PaymentStatus: {
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
  }
})
Order.hasMany(OrderItem, { foreignKey: 'orderId' })
export default Order
