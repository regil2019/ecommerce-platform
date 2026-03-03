import { DataTypes } from 'sequelize'
import sequelize from '../config/database.js'

const Promotion = sequelize.define('Promotion', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    code: {
        type: DataTypes.STRING(50),
        allowNull: false,
        unique: true,
        validate: {
            notEmpty: true,
            isUppercase: true,
            len: [3, 50]
        }
    },
    description: {
        type: DataTypes.STRING(255),
        allowNull: true
    },
    discount_type: {
        type: DataTypes.ENUM('percentage', 'fixed'),
        allowNull: false,
        defaultValue: 'percentage'
    },
    discount_value: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        validate: {
            min: 0
        }
    },
    min_purchase_amount: {
        type: DataTypes.DECIMAL(10, 2),
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    max_discount_amount: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: true,
        validate: {
            min: 0
        }
    },
    usage_limit: {
        type: DataTypes.INTEGER,
        allowNull: true,
        validate: {
            min: 1
        }
    },
    usage_count: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
            min: 0
        }
    },
    start_date: {
        type: DataTypes.DATE,
        allowNull: false
    },
    end_date: {
        type: DataTypes.DATE,
        allowNull: false,
        validate: {
            isAfterStartDate(value) {
                if (value <= this.start_date) {
                    throw new Error('End date must be after start date')
                }
            }
        }
    },
    is_active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    }
}, {
    tableName: 'promotions',
    timestamps: true,
    underscored: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at'
})

// Instance method to check if promotion is valid
Promotion.prototype.isValid = function () {
    const now = new Date()
    const isWithinDateRange = now >= this.start_date && now <= this.end_date
    const hasUsageLeft = !this.usage_limit || this.usage_count < this.usage_limit
    return this.is_active && isWithinDateRange && hasUsageLeft
}

// Instance method to calculate discount
Promotion.prototype.calculateDiscount = function (amount) {
    if (!this.isValid() || amount < this.min_purchase_amount) {
        return 0
    }

    let discount = 0
    if (this.discount_type === 'percentage') {
        discount = (amount * this.discount_value) / 100
    } else {
        discount = this.discount_value
    }

    // Apply max discount cap if set
    if (this.max_discount_amount && discount > this.max_discount_amount) {
        discount = this.max_discount_amount
    }

    return Math.round(discount * 100) / 100
}

export default Promotion
