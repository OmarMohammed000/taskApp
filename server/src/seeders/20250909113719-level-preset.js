'use strict';

/** @type {import('sequelize-cli').Migration} */
export default  {
  async up (queryInterface, Sequelize) {
    return queryInterface.bulkInsert('Levels', [
      { level_number: 1, required_xp: 0 },
      { level_number: 2, required_xp: 1000 },
      { level_number: 3, required_xp: 3000 },
      { level_number: 4, required_xp: 6000 },
      { level_number: 5, required_xp: 10000 },
      { level_number: 6, required_xp: 15000 },
    ]);
  },

  async down (queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Levels', null, {});
  }
};
