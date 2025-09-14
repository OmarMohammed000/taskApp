'use strict';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Tags', [
      {
        name: 'Work', 
      },
      {
        name: 'Personal',
      },
      {
        name: 'Health',
      },
      {
        name: 'Fitness',
       
      },
      {
        name: 'Learning',
      },
      {
        name: 'Finance',
        
      },
      {
        name: 'Social',
       
      },
      {
        name: 'Hobby',
      },
      {
        name: 'Urgent',
      },
      {
        name: 'Important',
      },
      {
        name: 'Project',
      },
      {
        name: 'Daily',
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Tags', null, {});
  }
};
