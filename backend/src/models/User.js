import { DataTypes } from 'sequelize';
import db from '../config/database.js';
import bcrypt from 'bcrypt';
import Order from './Order.js';

const User = db.define('User', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O nome é obrigatório'
      }
    }
  },
  email: {
    type: DataTypes.STRING,
    index: true,
    unique: {
      msg: 'Este email já está cadastrado'
    },
    allowNull: false,
    validate: {
      isEmail: {
        msg: 'Email inválido'
      }
    }
  },
  address: {
  type: DataTypes.STRING,
  allowNull: false,
  
  },
  password: {
    type: DataTypes.STRING,
    allowNull: false,
    validate: {
      len: {
        args: [6, 100],
        msg: 'A senha deve ter entre 6 e 100 caracteres'
      }
    }
  },
  role: {
    type: DataTypes.ENUM('user', 'admin'),
    defaultValue: 'user'
  }
}, {
  tableName: 'customers',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: false
});

// Método para comparar senhas
User.prototype.checkPassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

export default User;

Order.belongsTo(User, { foreignKey: 'userId' });
User.hasMany(Order, { foreignKey: 'userId' });