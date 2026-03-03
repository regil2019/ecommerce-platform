import { DataTypes } from 'sequelize'
import db from '../config/database.js'
import validator from 'validator'

const User = db.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  clerkId: {
    type: DataTypes.STRING,
    unique: true,
    allowNull: true // Changed to true to allow migration of legacy users
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O nome é obrigatório'
      }
    },
    set(value) {
      if (value) {
        this.setDataValue('name', validator.escape(value.trim()))
      }
    }
  },
  email: {
    type: DataTypes.STRING(255),
    allowNull: false,
    index: true,
    unique: {
      msg: 'Este email já está cadastrado'
    },
    validate: {
      isEmail: {
        msg: 'Email inválido'
      }
    },
    set(value) {
      if (value) {
        this.setDataValue('email', validator.normalizeEmail(value.toLowerCase().trim()))
      }
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true,
    set(value) {
      if (value) {
        this.setDataValue('address', validator.escape(value.trim()))
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: true // Changed to TRUE for Clerk auth
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user',
    validate: {
      isIn: {
        args: [['user', 'admin']],
        msg: 'Role inválido'
      }
    }
  }
}, {
  tableName: 'customers',
  timestamps: true,
  underscored: true,
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      unique: true,
      fields: ['clerk_id']
    },
    {
      fields: ['role']
    }
  ]
})

export default User
