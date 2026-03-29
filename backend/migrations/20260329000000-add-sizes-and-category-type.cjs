'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    const productsDesc = await queryInterface.describeTable('products');
    const categoriesDesc = await queryInterface.describeTable('categories');

    if (!productsDesc['sizes']) {
      await queryInterface.addColumn('products', 'sizes', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: null,
      });
      console.log('Added column: sizes to products');
    }

    if (!categoriesDesc['category_type']) {
      await queryInterface.addColumn('categories', 'category_type', {
        type: Sequelize.STRING(50),
        allowNull: true,
        defaultValue: 'other',
      });
      console.log('Added column: category_type to categories');
    }
  },

  async down(queryInterface) {
    try {
      await queryInterface.removeColumn('products', 'sizes');
    } catch (e) {
      console.warn('Could not remove sizes column:', e.message);
    }
    try {
      await queryInterface.removeColumn('categories', 'category_type');
    } catch (e) {
      console.warn('Could not remove category_type column:', e.message);
    }
  },
};
