/* eslint-disable comma-dangle */
import path from 'path';
import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config({ path: path.join(__dirname, '/../../.config.env') });
console.log(process.env.DB_NAME);

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.DB_HOST || 'localhost',
    dialect: 'mysql',
  }
);
export default sequelize;
