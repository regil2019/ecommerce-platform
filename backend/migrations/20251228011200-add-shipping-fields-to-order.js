'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if shippingCost column already exists
    const tableDescription = await queryInterface.describeTable('Orders');
    if (!tableDescription.shippingCost) {
      await queryInterface.addColumn('Orders', 'shippingCost', {
        type: Sequelize.FLOAT,
        allowNull: true,
        defaultValue: 0.0
      });
    }

    if (!tableDescription.shippingMethod) {
      await queryInterface.addColumn('Orders', 'shippingMethod', {
        type: Sequelize.ENUM('standard', 'express'),
        allowNull: true
      });
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'shippingCost');
    await queryInterface.removeColumn('Orders', 'shippingMethod');
  }
};
