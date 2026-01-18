import { DataTypes } from 'sequelize'
import db from '../config/database.js'
import User from './User.js'

const PasswordReset = db.define('PasswordReset', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: User,
      key: 'id'
    }
  },
  expiresAt: {
    type: DataTypes.DATE,
    allowNull: false
  }
}, {
  tableName: 'password_resets',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
})

export default PasswordReset

User.hasMany(PasswordReset, { foreignKey: 'userId' })
PasswordReset.belongsTo(User, { foreignKey: 'userId' })
