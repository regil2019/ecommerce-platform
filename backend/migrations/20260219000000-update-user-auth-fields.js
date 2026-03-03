'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        // 1. Alter password to allow NULL
        await queryInterface.changeColumn('customers', 'password', {
            type: Sequelize.STRING(255),
            allowNull: true
        });

        // 2. Ensure clerk_id is unique
        await queryInterface.addConstraint('customers', {
            fields: ['clerk_id'],
            type: 'unique',
            name: 'unique_clerk_id_constraint'
        });
    },

    async down(queryInterface, Sequelize) {
        // Revert password to NOT NULL (Dangerous if data exists without password)
        // We strictly won't revert this in this migration context for safety.

        // Remove constraint
        await queryInterface.removeConstraint('customers', 'unique_clerk_id_constraint');
    }
};
