const Sequelize = require('sequelize');

const sequelize = new Sequelize('nairalink', 'nairalink', 'Nairalink', {
  host: '127.0.0.1',
  dialect: 'mysql',
});

module.exports = sequelize;
global.sequelize = sequelize;
