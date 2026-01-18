'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Check if orders table exists
    const tables = await queryInterface.showAllTables();
    if (tables.includes('orders') || tables.includes('Orders')) {
      const tableName = tables.includes('orders') ? 'orders' : 'Orders';
      // Add 'pending_payment' to the order status enum
      await queryInterface.changeColumn(tableName, 'status', {
        type: Sequelize.ENUM('pending', 'pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'),
        allowNull: false,
        defaultValue: 'pending'
      });
    }
  },

  async down (queryInterface, Sequelize) {
    // Remove 'pending_payment' from the order status enum
    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM('pending', 'processing', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });
  }
};
