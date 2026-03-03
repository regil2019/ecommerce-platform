/**
 * Migration: Add promo code fields to orders table
 * Run with: npx sequelize-cli db:migrate
 */

export async function up(queryInterface, Sequelize) {
    await queryInterface.addColumn('orders', 'promo_code', {
        type: Sequelize.STRING(50),
        allowNull: true,
        after: 'payment_status'
    })

    await queryInterface.addColumn('orders', 'discount_amount', {
        type: Sequelize.DECIMAL(10, 2),
        defaultValue: 0,
        after: 'promo_code'
    })

    // Add index for promo code lookups
    await queryInterface.addIndex('orders', ['promo_code'])
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('orders', 'discount_amount')
    await queryInterface.removeColumn('orders', 'promo_code')
}
