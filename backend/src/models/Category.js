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
    set (value) {
      if (value) {
        this.setDataValue('description', validator.escape(value.trim()))
      }
    }
  },
  image: {
    type: DataTypes.STRING(500),
    allowNull: true,
    validate: {
      isUrl: {
        msg: 'Imagem deve ser uma URL válida'
      }
    }
  },
  parentId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'categories',
      key: 'id'
    }
  },
  isActive: {
    type: DataTypes.BOOLEAN,
    defaultValue: true,
    allowNull: false
  },
  productCount: {
    type: DataTypes.VIRTUAL,
    get () {
      // This will be populated by associations
      return this.getDataValue('productCount') || 0
    }
  }
}, {
  tableName: 'categories',
  timestamps: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})

// Self-referencing relationship for parent-child categories
Category.hasMany(Category, {
  foreignKey: 'parentId',
  as: 'subcategories'
})

Category.belongsTo(Category, {
  foreignKey: 'parentId',
  as: 'parent'
})

export default Category
