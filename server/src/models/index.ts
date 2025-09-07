'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath, pathToFileURL } from 'url';
import { Sequelize, DataTypes, Dialect } from 'sequelize';
import process from 'process';
import {config } from '../config/config.js';
import Users from './Users.js';
import Tasks from './Tasks.js';
import Tags from './Tags.js';
import Levels from './Levels.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const basename = path.basename(__filename);
const env = process.env.NODE_ENV || 'development';

interface Db {
  [key: string]: any;
  sequelize: Sequelize;
  Sequelize: typeof Sequelize;
}

const db: Db = {} as Db;

const envConfig = (config)[env];

const sequelize = new Sequelize(
  envConfig.database!,
  envConfig.username!,
  envConfig.password!,
  {
    host: envConfig.host,
    dialect: envConfig.dialect as Dialect
  }
);


const files = fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      (file.slice(-3) === '.ts' || file.slice(-3) === '.js') &&
      file.indexOf('.test.') === -1
    );
  });

for (const file of files) {
  const filePath = path.join(__dirname, file);
  const modelModule = await import(pathToFileURL(filePath).toString());
  const define = modelModule.default ?? modelModule;
  const model = define(sequelize, DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

db.Users=Users(sequelize);
db.Tasks=Tasks(sequelize);
db.Tags=Tags(sequelize);
db.Levels=Levels(sequelize);

db.Users.hasMany(db.Tasks, { foreignKey: 'user_id', as: 'tasks' });
db.Tasks.belongsTo(db.Users, { foreignKey: 'user_id', as: 'user' });

db.Levels.hasMany(db.Users, { foreignKey: 'level_id', as: 'users' });
db.Users.belongsTo(db.Levels, { foreignKey: 'level_id', as: 'level' });

db.Tasks.belongsToMany(db.Tags, { through: 'Task_tags', foreignKey: 'task_id', otherKey: 'tag_id', as: 'tags' });
db.Tags.belongsToMany(db.Tasks, { through: 'Task_tags', foreignKey: 'tag_id', otherKey: 'task_id', as: 'tasks' });

export default db;
