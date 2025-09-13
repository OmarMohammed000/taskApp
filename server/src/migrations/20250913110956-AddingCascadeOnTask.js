'use strict';

/** @type {import('sequelize-cli').Migration} */
export default  {
  async up (queryInterface, Sequelize) {
    queryInterface.sequelize.query(`
      -- Adding ON DELETE CASCADE to Tasks.user_id foreign key
      ALTER TABLE "Tasks" DROP CONSTRAINT "Tasks_user_id_fkey";

      ALTER TABLE "Tasks"
      ADD CONSTRAINT "Tasks_user_id_fkey"
      FOREIGN KEY (user_id)
      REFERENCES "Users"(id)
      ON DELETE CASCADE;
    `);
  },

  async down (queryInterface, Sequelize) {
    queryInterface.sequelize.query(`
       AlTER TABLE "Tasks" DROP CONSTRAINT "Tasks_user_id_fkey";
       
       ALTER TABLE "Tasks"
        ADD CONSTRAINT "Tasks_user_id_fkey"
        FOREIGN KEY (user_id)
        REFERENCES "Users"(id);
      `)
  }
};
