import { DataTypes } from 'sequelize';
import db from '../config/database.js';

const UserBehavior = db.define('UserBehavior', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'customers',
      key: 'id'
    }
  },
  productId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Products',
      key: 'id'
    }
  },
  action: {
    type: DataTypes.ENUM('view', 'cart_add', 'cart_remove', 'purchase', 'favorite_add', 'favorite_remove'),
    allowNull: false
  },
  timestamp: {
    type: DataTypes.DATE,
    defaultValue: DataTypes.NOW
  },
  sessionId: {
    type: DataTypes.STRING,
    allowNull: true // For anonymous users
  },
  metadata: {
    type: DataTypes.JSON,
    allowNull: true // Store additional data like time spent, source page, etc.
  }
}, {
  indexes: [
    {
      fields: ['userId', 'action', 'timestamp']
    },
    {
      fields: ['productId', 'action']
    },
    {
      fields: ['sessionId']
    }
  ]
});

export default UserBehavior;