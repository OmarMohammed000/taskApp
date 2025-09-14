"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize
      .query(`ALTER TABLE "Task_tags" DROP CONSTRAINT "Task_tags_tag_id_fkey";

      ALTER TABLE "Task_tags"
      ADD CONSTRAINT "Task_tags_tag_id_fkey"
      FOREIGN KEY (tag_id)
      REFERENCES "Tags"(id)
      ON DELETE CASCADE;
    `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize
      .query(`ALTER TABLE "Task_tags" DROP CONSTRAINT "Task_tags_tag_id_fkey";

      ALTER TABLE "Task_tags"
      ADD CONSTRAINT "Task_tags_tag_id_fkey"
      FOREIGN KEY (tag_id)
      REFERENCES "Tags"(id);`);
  },
};