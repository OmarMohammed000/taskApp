"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Tasks"
      ADD COLUMN priority priority NOT NULL DEFAULT 'medium';
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      ALTER TABLE "Tasks"
      DROP COLUMN IF EXISTS priority;
    `);
  },
};
