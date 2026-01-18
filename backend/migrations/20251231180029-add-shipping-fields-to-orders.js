'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Fix invalid datetime values in categories table
    await queryInterface.sequelize.query(`
      UPDATE categories
      SET created_at = NOW(), updated_at = NOW()
      WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL
    `);

    // Check if orders table exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('orders') || tables.includes('Orders')) {
      const tableName = tables.includes('orders') ? 'orders' : 'Orders';
      const tableDescription = await queryInterface.describeTable(tableName);

      // Add shippingCost column if not exists
      if (!tableDescription.shippingCost) {
        await queryInterface.addColumn(tableName, 'shippingCost', {
          type: Sequelize.FLOAT,
          allowNull: true,
          defaultValue: 0.0
        });
      }

      // Add shippingMethod column if not exists
      if (!tableDescription.shippingMethod) {
        await queryInterface.addColumn(tableName, 'shippingMethod', {
          type: Sequelize.ENUM('standard', 'express'),
          allowNull: true
        });
      }
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove shippingMethod column
    await queryInterface.removeColumn('orders', 'shippingMethod');

    // Remove shippingCost column
    await queryInterface.removeColumn('orders', 'shippingCost');
  }
};
