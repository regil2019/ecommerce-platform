'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if images column already exists
    const tableDescription = await queryInterface.describeTable('products');
    if (!tableDescription.images) {
      // Add images (JSON) column to products table
      await queryInterface.addColumn('products', 'images', {
        type: Sequelize.JSON,
        allowNull: false,
        defaultValue: [],
      });
    }
  },

  async down(queryInterface, Sequelize) {
    // Remove images column from products table
    await queryInterface.removeColumn('products', 'images');
  }
};
