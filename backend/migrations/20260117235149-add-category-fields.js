'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Add slug column
    await queryInterface.addColumn('categories', 'slug', {
      type: Sequelize.STRING(150),
      allowNull: true,
      unique: true
    });

    // Add description column
    await queryInterface.addColumn('categories', 'description', {
      type: Sequelize.TEXT,
      allowNull: true
    });

    // Add image column
    await queryInterface.addColumn('categories', 'image', {
      type: Sequelize.STRING(500),
      allowNull: true
    });

    // Add parentId column for hierarchical categories
    await queryInterface.addColumn('categories', 'parentId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'categories',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });

    // Create indexes
    await queryInterface.addIndex('categories', ['slug'], {
      name: 'categories_slug'
    });

    await queryInterface.addIndex('categories', ['parentId'], {
      name: 'categories_parent_id'
    });

    await queryInterface.addIndex('categories', ['isActive'], {
      name: 'categories_is_active'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remove indexes first
    await queryInterface.removeIndex('categories', 'categories_is_active');
    await queryInterface.removeIndex('categories', 'categories_parent_id');
    await queryInterface.removeIndex('categories', 'categories_slug');

    // Remove columns
    await queryInterface.removeColumn('categories', 'parentId');
    await queryInterface.removeColumn('categories', 'image');
    await queryInterface.removeColumn('categories', 'description');
    await queryInterface.removeColumn('categories', 'slug');
  }
};
