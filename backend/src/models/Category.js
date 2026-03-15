import { DataTypes } from 'sequelize'
import db from '../config/database.js'
import validator from 'validator'

const Category = db.define('Category', {
  id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  name: {
    type: DataTypes.STRING(100),
    allowNull: false,
    validate: {
      notEmpty: {
        msg: 'O nome da categoria é obrigatório'
      },
      len: {
        args: [2, 100],
        msg: 'O nome deve ter entre 2 e 100 caracteres'
      }
    },
    set(value) {
      if (value) {
        this.setDataValue('name', value.trim())
      }
    }
  },
  slug: {
    type: DataTypes.STRING(150),
    unique: {
      msg: 'Este slug já está em uso'
    },
    allowNull: true,
    validate: {
      len: {
        args: [2, 150],
        msg: 'Slug deve ter entre 2 e 150 caracteres'
      },
      is: {
        args: /^[a-z0-9-]+$/i,
        msg: 'Slug deve conter apenas letras minúsculas, números e hífens'
      }
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true,
    validate: {
      len: {
        args: [0, 1000],
        msg: 'Descrição deve ter no máximo 1000 caracteres'
      }
    },
    set(value) {
      if (value) {
        this.setDataValue('description', validator.escape(value.trim()))
      }
    }
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      // isUrl removed to allow local paths
    },
    get() {
      const rawValue = this.getDataValue('image');
      if (!rawValue) return rawValue;
      if (rawValue.startsWith('http')) return rawValue;
      const baseUrl = process.env.BASE_URL || 'http://localhost:4000';
      return `${baseUrl}${rawValue.startsWith('/') ? '' : '/'}${rawValue}`;
    }
  },
//   parentId: {
//     type: DataTypes.INTEGER,
//     allowNull: true,
//     references: {
//       model: 'categories',
//       key: 'id'
//     }
//   },
//   isActive: {
//     type: DataTypes.BOOLEAN,
//     defaultValue: true,
//     allowNull: false
//   },
//   productCount: {
//     type: DataTypes.INTEGER,
//     defaultValue: 0,
//     allowNull: false
//   }
}, {
  tableName: 'categories',
  timestamps: true,
  underscored: true
})

// Self-referencing relationship for parent-child categories
// Category.hasMany(Category, {
//   foreignKey: 'parentId',
//   as: 'subcategories'
// })

// Category.belongsTo(Category, {
//   foreignKey: 'parentId',
//   as: 'parent'
// })

export default Category
// Fix for Koyeb deployment
