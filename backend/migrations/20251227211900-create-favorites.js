'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Check if favorites table already exists
    const tables = await queryInterface.showAllTables();
    if (!tables.includes('favorites')) {
      await queryInterface.createTable('favorites', {
        id: {
          type: Sequelize.INTEGER,
          primaryKey: true,
          autoIncrement: true,
          allowNull: false,
        },
        userId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'customers',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        productId: {
          type: Sequelize.INTEGER,
          allowNull: false,
          references: {
            model: 'products',
            key: 'id',
          },
          onUpdate: 'CASCADE',
          onDelete: 'CASCADE',
        },
        createdAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
        updatedAt: {
          allowNull: false,
          type: Sequelize.DATE,
          defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
        },
      });

      // Add unique index to prevent duplicate favorites
      await queryInterface.addIndex('favorites', ['userId', 'productId'], {
        unique: true,
      });

      // Add indexes for better performance
      await queryInterface.addIndex('favorites', ['userId']);
      await queryInterface.addIndex('favorites', ['productId']);
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('favorites');
  }
};
