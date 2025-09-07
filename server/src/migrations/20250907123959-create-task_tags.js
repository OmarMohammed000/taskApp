'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      CREATE TABLE Task_tags(
        task_id int ,
        tag_id int,
        FOREIGN KEY (task_id) REFERENCES Tasks(id),
        FOREIGN KEY (tag_id) REFERENCES Tags(id),
        primary key (task_id,tag_id)
      );
    `)
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS Task_tags;
    `);
  }
};

  

