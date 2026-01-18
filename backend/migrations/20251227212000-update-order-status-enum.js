'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    // Change the enum values for the status column in Orders table
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('pending', 'pending_payment', 'processing', 'shipped', 'delivered', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending'
    });
  },

  async down(queryInterface, Sequelize) {
    // Revert to the old enum values
    await queryInterface.changeColumn('Orders', 'status', {
      type: Sequelize.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false
    });
  }
};
