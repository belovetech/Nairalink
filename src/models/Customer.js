const Sequelize = require('sequelize');
const sequelize = require('../database/connection');

module.exports = sequelize.define('customer', {
  id: {
    type: Sequelize.INTEGER(11),
    allowNull: false,
    autoIncrement: true,
    primaryKey: true,
  },
  username: {
    type: Sequelize.STRING(35),
    allowNull: false,
    unique: true,
  },
});
