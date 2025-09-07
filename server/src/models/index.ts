'use strict';

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Sequelize, DataTypes, Dialect } from 'sequelize';
import process from 'process';
import {config } from '../config/config.js';

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
  const modelModule = await import(filePath);
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

export default db;
