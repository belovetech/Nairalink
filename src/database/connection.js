/* eslint-disable comma-dangle */
import path from 'path';
import { Op, Sequelize } from 'sequelize';
import { config } from 'dotenv';

config({ path: path.join(__dirname, '/../config/.config.env') });

const operatorsAliases = {
  $gt: Op.gt,
  $gte: Op.gte,
  $lt: Op.lt,
  $lte: Op.lte,
  $eq: Op.eq,
};
const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.HOST || 'localhost',
    dialect: 'mysql',
  },
  { operatorsAliases }
);
export default sequelize;
// global.sequelize = sequelize;
