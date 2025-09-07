"use strict";

/** @type {import('sequelize-cli').Migration} */
export default  {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
    CREATE TABLE Levels(
      id serial primary key ,
      level_number int unique not null,
      required_xp int unique not null default 1000 
    );
      `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS Levels;
    `);
  },
};
