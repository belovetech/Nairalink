const Sequelize = require('sequelize');
const sequelize = require('../database/connection');

module.exports = sequelize.define('transaction', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  balance: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
});
