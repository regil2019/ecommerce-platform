'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add shippingCost column
    await queryInterface.addColumn('orders', 'shippingCost', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0.0
    });

    // Add shippingMethod column
    await queryInterface.addColumn('orders', 'shippingMethod', {
      type: Sequelize.ENUM('standard', 'express'),
      allowNull: true
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove shippingMethod column
    await queryInterface.removeColumn('orders', 'shippingMethod');

    // Remove shippingCost column
    await queryInterface.removeColumn('orders', 'shippingCost');
  }
};
