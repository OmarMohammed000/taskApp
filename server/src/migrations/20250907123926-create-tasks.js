"use strict";

/** @type {import('sequelize-cli').Migration} */
export default {
  async up(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
    --types for category , status , priority  
    CREATE TYPE task_category AS ENUM ('todo', 'habit');
    CREATE TYPE status_codes AS ENUM ('pending','in_progress','completed');
    CREATE TYPE priority AS ENUM ('high','medium','low');

    CREATE TABLE Tasks(
    id serial primary key ,
    user_id  int ,
    title text not null ,
    description text ,
    category task_category not null,
    xp_value int not null check (
      (category = 'todo' and xp_value=25) or (category='habit' and xp_value=50)
    ),
    status status_codes not null ,
    due_data timestamp ,
    created_at timestamp not null default NOW(),
    updated_at timestamp 
    );
     -- creating the function first then the trigger 
    CREATE OR REPLACE  FUNCTION update_timestamp() 
    RETURNS trigger AS $$
    BEGIN 
    NEW.updated_at = NOW();
    RETURN NEW;
    END;
    $$ LANGUAGE plpgsql;
    -- trigger
    CREATE TRIGGER set_updated_at
    BEFORE UPDATE ON Tasks
    FOR EACH ROW
    EXECUTE FUNCTION update_timestamp();
      `);
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.sequelize.query(`
      DROP TABLE IF EXISTS Tasks;
      DROP TYPE IF EXISTS task_category;
      DROP TYPE IF EXISTS status_codes;
      DROP TYPE IF EXISTS priority;
      DROP FUNCTION IF EXISTS update_timestamp;
      DROP TRIGGER IF EXISTS set_updated_at ON Tasks;
    `);
  },
};
