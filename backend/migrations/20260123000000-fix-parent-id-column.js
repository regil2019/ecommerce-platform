'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Rename parentId column to parent_id to match Sequelize conventions
    await queryInterface.renameColumn('categories', 'parentId', 'parent_id');
  },

  async down (queryInterface, Sequelize) {
    // Rename back to parentId if needed
    await queryInterface.renameColumn('categories', 'parent_id', 'parentId');
  }
};