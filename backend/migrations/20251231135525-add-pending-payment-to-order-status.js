'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Add 'pending_payment' to the order status enum
    await queryInterface.changeColumn('orders', 'status', {
      type: Sequelize.ENUM('pending', 'pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });
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
