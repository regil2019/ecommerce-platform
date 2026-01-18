'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    // Temporarily disable strict mode
    await queryInterface.sequelize.query("SET SESSION sql_mode = 'ALLOW_INVALID_DATES'");

    // Fix invalid datetime values in categories table specifically
    try {
      await queryInterface.sequelize.query(`
        UPDATE categories
        SET created_at = NOW()
        WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL
      `);

      await queryInterface.sequelize.query(`
        UPDATE categories
        SET updated_at = NOW()
        WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL
      `);
    } catch (error) {
      console.log(`Error fixing categories table: ${error.message}`);
    }

    // Fix other tables
    const tables = ['customers', 'password_resets'];

    for (const table of tables) {
      try {
        await queryInterface.sequelize.query(`
          UPDATE \`${table}\`
          SET created_at = NOW()
          WHERE created_at = '0000-00-00 00:00:00' OR created_at IS NULL
        `);

        await queryInterface.sequelize.query(`
          UPDATE \`${table}\`
          SET updated_at = NOW()
          WHERE updated_at = '0000-00-00 00:00:00' OR updated_at IS NULL
        `);
      } catch (error) {
        // Skip tables that don't have these columns
        console.log(`Skipping table ${table}: ${error.message}`);
      }
    }
  },

  async down (queryInterface, Sequelize) {
    // No rollback needed for data fixes
  }
};
