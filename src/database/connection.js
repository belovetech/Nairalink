const Sequelize = require('sequelize');

const dotenv = require('dotenv');
dotenv.config({ path: './config/.config.env' });

const sequelize = new Sequelize(
  process.env.DB_NAME,
  process.env.DB_USER,
  process.env.DB_PASS,
  {
    host: process.env.HOST,
    dialect: 'mysql',
  }
);
module.exports = sequelize;
global.sequelize = sequelize;
