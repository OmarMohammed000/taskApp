"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
  CREATE TABLE Users(
  id serial primary key ,
  name varchar(50) not null ,
  email text unique not null, 
  password_hash text not null,
  xp int DEFAULT 0,
  level_id int  ,
  created_at timestamp DEFAULT NOW(),
  foreign key (level_id) REFERENCES Levels(id)  
  );
  CREATE INDEX idx_email on Users(email);
  `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS Users;
    `);
  },
};
