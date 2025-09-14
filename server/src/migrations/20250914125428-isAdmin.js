'use strict';

/** @type {import('sequelize-cli').Migration} */
export default  {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE "Users" ADD COLUMN "isAdmin" BOOLEAN DEFAULT false;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('ALTER TABLE "Users" DROP COLUMN "isAdmin";');
  }
};
