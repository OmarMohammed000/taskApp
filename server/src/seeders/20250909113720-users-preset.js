'use strict';
import bcrypt from 'bcryptjs';

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    const saltRounds = 10;
    
    return queryInterface.bulkInsert('Users', [
      {
        name: 'Admin',
        email: 'admin.admin@example.com',
        password_hash: await bcrypt.hash('admin', saltRounds),
        xp: 2500,
        isAdmin: true,
        level_id: 3
      },
      {
        name: 'Jane Smith',
        email: 'jane.smith@example.com',
        password_hash: await bcrypt.hash('password123', saltRounds),
        xp: 7500,
        isAdmin: false,
        level_id: 4
      },
      {
        name: 'Mike Johnson',
        email: 'mike.johnson@example.com',
        password_hash: await bcrypt.hash('password123', saltRounds),
        xp: 25,
        isAdmin: false,
        level_id: 1
      },
      {
        name: 'Sarah Wilson',
        email: 'sarah.wilson@example.com',
        password_hash: await bcrypt.hash('password123', saltRounds),
        xp: 12000,
        isAdmin: false,
        level_id: 5
      },
      {
        name: 'Alex Brown',
        email: 'alex.brown@example.com',
        password_hash: await bcrypt.hash('password123', saltRounds),
        xp: 18000,
        isAdmin: false,
        level_id: 6
      }
    ]);
  },

  async down(queryInterface, Sequelize) {
    return queryInterface.bulkDelete('Users', null, {});
  }
};
