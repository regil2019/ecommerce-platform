'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('Orders', 'shippingCost', {
      type: Sequelize.FLOAT,
      allowNull: true,
      defaultValue: 0.0
    });

    await queryInterface.addColumn('Orders', 'shippingMethod', {
      type: Sequelize.ENUM('standard', 'express'),
      allowNull: true
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('Orders', 'shippingCost');
    await queryInterface.removeColumn('Orders', 'shippingMethod');
  }
};