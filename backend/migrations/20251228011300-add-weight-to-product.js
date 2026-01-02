'use strict';

export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.addColumn('products', 'weight', {
      type: Sequelize.FLOAT,
      allowNull: false,
      defaultValue: 1.0 // kg
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn('products', 'weight');
  }
};