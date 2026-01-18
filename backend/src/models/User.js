import { DataTypes } from 'sequelize'
import db from '../config/database.js'
import bcrypt from 'bcrypt'
import validator from 'validator'

const User = db.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O nome é obrigatório'
      },
      len: {
        args: [2, 100],
        msg: 'O nome deve ter entre 2 e 100 caracteres'
      },
      is: {
        args: /^[a-zA-ZÀ-ÿ\s]+$/i,
        msg: 'O nome deve conter apenas letras e espaços'
      }
    },
    set (value) {
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
      notEmpty: {
        msg: 'O email é obrigatório'
      },
      isEmail: {
        msg: 'Email inválido'
      },
      len: {
        args: [5, 255],
        msg: 'Email muito longo'
      }
    },
    set (value) {
      if (value) {
        this.setDataValue('email', validator.normalizeEmail(value.toLowerCase().trim()))
      }
    }
  },
  address: {
    type: DataTypes.TEXT,
    allowNull: true, // Agora opcional
    validate: {
      len: {
        args: [10, 500],
        msg: 'Endereço deve ter entre 10 e 500 caracteres'
      }
    },
    set (value) {
      if (value) {
        this.setDataValue('address', validator.escape(value.trim()))
      }
    }
  },
  password: {
    type: DataTypes.STRING(255),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'A senha é obrigatória'
      },
      len: {
        args: [8, 255], // Aumentado para 8 caracteres mínimo
        msg: 'A senha deve ter entre 8 e 255 caracteres'
      },
      isStrong (value) {
        if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/.test(value)) {
          throw new Error('A senha deve conter pelo menos uma letra minúscula, uma maiúscula, um número e um caractere especial')
        }
      }
    }
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
  createdAt: 'created_at',
  updatedAt: false,
  indexes: [
    {
      unique: true,
      fields: ['email']
    },
    {
      fields: ['role']
    }
  ]
})

// Método para comparar senhas
User.prototype.checkPassword = async function (password) {
  return await bcrypt.compare(password, this.password)
}

export default User

// Order.belongsTo(User, { foreignKey: 'userId' });
// User.hasMany(Order, { foreignKey: 'userId' });
