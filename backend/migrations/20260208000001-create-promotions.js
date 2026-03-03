/**
 * Migration: Create promotions table
 * Run with: npx sequelize-cli db:migrate
 */

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('promotions', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        code: {
            type: Sequelize.STRING(50),
            allowNull: false,
            unique: true
        },
        description: {
            type: Sequelize.STRING(255),
            allowNull: true
        },
        discount_type: {
            type: Sequelize.ENUM('percentage', 'fixed'),
            allowNull: false,
            defaultValue: 'percentage'
        },
        discount_value: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: false
        },
        min_purchase_amount: {
            type: Sequelize.DECIMAL(10, 2),
            defaultValue: 0
        },
        max_discount_amount: {
            type: Sequelize.DECIMAL(10, 2),
            allowNull: true
        },
        usage_limit: {
            type: Sequelize.INTEGER,
            allowNull: true
        },
        usage_count: {
            type: Sequelize.INTEGER,
            defaultValue: 0
        },
        start_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        end_date: {
            type: Sequelize.DATE,
            allowNull: false
        },
        is_active: {
            type: Sequelize.BOOLEAN,
            defaultValue: true
        },
        created_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updated_at: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP')
        }
    })

    // Add indexes
    await queryInterface.addIndex('promotions', ['code'])
    await queryInterface.addIndex('promotions', ['is_active'])
    await queryInterface.addIndex('promotions', ['start_date', 'end_date'])
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('promotions')
}
